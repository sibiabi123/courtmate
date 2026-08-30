import { NextRequest, NextResponse } from 'next/server';

let _activeFlares: any[] = [];

export async function GET() {
  return NextResponse.json({ success: true, flares: _activeFlares });
}

export async function POST(req: NextRequest) {
  try {
    const flare = await req.json();
    _activeFlares = [flare, ..._activeFlares.slice(0, 19)];
    return NextResponse.json({ success: true, message: 'Flare broadcasted to campus!' });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
