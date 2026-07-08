import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db-helper';
import path from 'path';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'courtmate-secret-2026';
const COOKIE_NAME = 'courtmate-session';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };

    const { postId } = await req.json();
    if (!postId) return NextResponse.json({ success: false, error: 'postId required' }, { status: 400 });

    const db = await getDb();

    const post = (await db.query('SELECT * FROM posts WHERE id = ?', [postId]))[0] as any;
    if (!post) {  return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 }); }
    if (post.user_id === payload.userId) {  return NextResponse.json({ success: false, error: 'Cannot join your own post' }, { status: 400 }); }
    if (post.current_players >= post.max_players) {  return NextResponse.json({ success: false, error: 'Match is full' }, { status: 400 }); }

    const existing = (await db.query('SELECT id FROM post_participants WHERE post_id = ? AND user_id = ?', [postId, payload.userId]))[0];
    if (existing) {  return NextResponse.json({ success: false, error: 'Already joined' }, { status: 400 }); }

    const newCount = post.current_players + 1;
    const newStatus = newCount >= post.max_players ? 'full' : 'open';

    db.prepare('INSERT INTO post_participants (id, post_id, user_id, joined_at) VALUES (?, ?, ?, ?)').run(crypto.randomUUID(), postId, payload.userId, new Date().toISOString());
    await db.execute('UPDATE posts SET current_players = ?, status = ? WHERE id = ?', [newCount, newStatus, postId]);

    
    return NextResponse.json({ success: true, currentPlayers: newCount, status: newStatus });
  } catch (e) {
    console.error('Join post error:', e);
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
