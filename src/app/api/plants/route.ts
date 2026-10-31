import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';

export async function GET() {
  const plants = serverStore.plants.map(p => ({
    id: p.id,
    name: p.name,
    variety: p.variety,
    grid_x: p.grid_x,
    grid_y: p.grid_y,
    row_label: p.row_label,
    col_label: p.col_label,
    health_status: p.health_status,
    created_at: p.created_at,
    last_scanned_at: p.last_scanned_at,
    latest_scan: p.latest_scan
  }));

  return NextResponse.json(plants);
}
