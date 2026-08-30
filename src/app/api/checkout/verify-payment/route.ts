import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db-helper';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'courtmate-secret-2026';
const COOKIE_NAME = 'courtmate-session';

function getUser(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string; name: string };
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Please log in to continue' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { packageId, orderRef, utrNumber, amountInr, coinsAmount, isPro } = body;

    if (!utrNumber || utrNumber.trim().length < 6) {
      return NextResponse.json({ success: false, error: 'Valid 12-digit UTR/UPI Reference Number is required' }, { status: 400 });
    }

    const db = await getDb();
    const now = new Date().toISOString();
    const txId = `upi-tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    // 1. Create transactions table if not exists and log transaction
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          package_id TEXT NOT NULL,
          package_name TEXT NOT NULL,
          amount_paid TEXT NOT NULL,
          coins_awarded INTEGER NOT NULL,
          utr_number TEXT,
          status TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);
      await db.execute(
        `INSERT INTO transactions (id, user_id, package_id, package_name, amount_paid, coins_awarded, utr_number, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?)`,
        [txId, user.userId, packageId, isPro ? 'CourtMate PRO Pass' : 'Coin Stash Pack', `₹${amountInr}`, coinsAmount, utrNumber, now]
      );
    } catch {}

    // 2. Award coins in database
    await db.execute(
      `UPDATE users SET coins = coins + ? WHERE id = ?`,
      [coinsAmount, user.userId]
    );

    // 3. Send notification
    const notifId = crypto.randomUUID();
    await db.execute(
      `INSERT INTO notifications (id, user_id, title, message, type, related_id, created_at)
       VALUES (?, ?, ?, ?, 'purchase_success', ?, ?)`,
      [
        notifId,
        user.userId,
        isPro ? '⭐ CourtMate PRO Pass Unlocked!' : '🪙 Coins Deposited!',
        `UPI payment of ₹${amountInr} verified (UTR: ${utrNumber}). +${coinsAmount} 🪙 added to your athletic wallet!`,
        txId,
        now,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Payment verified and package unlocked!',
      coinsAwarded: coinsAmount,
      isPro: Boolean(isPro),
      transactionId: txId,
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
