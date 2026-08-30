import { NextRequest, NextResponse } from 'next/server';

let _courtUpdates: Record<string, { status: string; updatedBy: string; timestamp: string }> = {};

export async function GET() {
  return NextResponse.json({ success: true, updates: _courtUpdates });
}

export async function POST(req: NextRequest) {
  try {
    const { courtId, status, updatedBy } = await req.json();
    _courtUpdates[courtId] = {
      status,
      updatedBy: updatedBy || 'Verified Athlete',
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json({ success: true, message: 'Court status updated!' });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
