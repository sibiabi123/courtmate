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

const PACKAGES: Record<string, { type: 'coins' | 'pro'; coins: number; name: string; price: string }> = {
  'starter_coins': { type: 'coins', coins: 250, name: 'Starter Coin Pack', price: '$0.99' },
  'challenger_coins': { type: 'coins', coins: 1000, name: 'Challenger Coin Stash', price: '$2.99' },
  'godmode_coins': { type: 'coins', coins: 5000, name: 'Godmode Coin Vault', price: '$9.99' },
  'pro_monthly': { type: 'pro', coins: 500, name: 'CourtMate PRO (1 Month)', price: '$3.99' },
  'pro_annual': { type: 'pro', coins: 2500, name: 'CourtMate PRO (Annual Pass)', price: '$29.99' },
};

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { packageId } = body;

    const pkg = PACKAGES[packageId];
    if (!pkg) {
      return NextResponse.json({ success: false, error: 'Invalid package selection' }, { status: 400 });
    }

    const db = await getDb();
    const now = new Date().toISOString();

    // 1. Award coins in database
    await db.execute(
      `UPDATE users SET coins = coins + ? WHERE id = ?`,
      [pkg.coins, user.userId]
    );

    // 2. Record transaction
    const txId = `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          package_id TEXT NOT NULL,
          package_name TEXT NOT NULL,
          amount_paid TEXT NOT NULL,
          coins_awarded INTEGER NOT NULL,
          status TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);
      await db.execute(
        `INSERT INTO transactions (id, user_id, package_id, package_name, amount_paid, coins_awarded, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'completed', ?)`,
        [txId, user.userId, packageId, pkg.name, pkg.price, pkg.coins, now]
      );
    } catch {}

    // 3. Send confirmation notification
    const notifId = crypto.randomUUID();
    await db.execute(
      `INSERT INTO notifications (id, user_id, title, message, type, related_id, created_at)
       VALUES (?, ?, ?, ?, 'purchase_success', ?, ?)`,
      [
        notifId,
        user.userId,
        pkg.type === 'pro' ? '⭐ CourtMate PRO Unlocked!' : '🪙 Coins Deposited!',
        `Successfully purchased ${pkg.name}. +${pkg.coins} 🪙 added to your athletic wallet.`,
        txId,
        now,
      ]
    );

    return NextResponse.json({
      success: true,
      message: `Successfully unlocked ${pkg.name}!`,
      coinsAdded: pkg.coins,
      isPro: pkg.type === 'pro',
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
