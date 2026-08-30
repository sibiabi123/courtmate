import { NextRequest, NextResponse } from 'next/server';
import { getActiveCampusConfig, updateActiveCampusConfig, Venue, HostelBlock } from '@/lib/campus-config';

export async function GET() {
  return NextResponse.json({ success: true, config: getActiveCampusConfig() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, data } = body;

    const current = getActiveCampusConfig();

    if (action === 'update_identity') {
      const updated = updateActiveCampusConfig({
        collegeName: data.collegeName || current.collegeName,
        shortName: data.shortName || current.shortName,
        emblem: data.emblem || current.emblem,
        announcement: data.announcement || current.announcement,
      });
      return NextResponse.json({ success: true, config: updated });
    }

    if (action === 'add_venue') {
      const newVenue: Venue = {
        id: `v-${Date.now()}`,
        name: data.name,
        sport: data.sport || 'Multi-Sports',
        type: data.type || 'outdoor',
        hasLighting: Boolean(data.hasLighting),
        active: true,
      };
      const updated = updateActiveCampusConfig({ venues: [newVenue, ...current.venues] });
      return NextResponse.json({ success: true, config: updated });
    }

    if (action === 'delete_venue') {
      const updated = updateActiveCampusConfig({
        venues: current.venues.filter(v => v.id !== data.id),
      });
      return NextResponse.json({ success: true, config: updated });
    }

    if (action === 'add_hostel') {
      const newHostel: HostelBlock = {
        id: `h-${Date.now()}`,
        name: data.name,
        gender: data.gender || 'mens',
        active: true,
      };
      const updated = updateActiveCampusConfig({ hostels: [newHostel, ...current.hostels] });
      return NextResponse.json({ success: true, config: updated });
    }

    if (action === 'delete_hostel') {
      const updated = updateActiveCampusConfig({
        hostels: current.hostels.filter(h => h.id !== data.id),
      });
      return NextResponse.json({ success: true, config: updated });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
