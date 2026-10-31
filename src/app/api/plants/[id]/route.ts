import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const plant = serverStore.plants.find(p => p.id === id);

  if (!plant) {
    return NextResponse.json({ detail: 'O\'simlik topilmadi' }, { status: 404 });
  }

  return NextResponse.json(plant);
}
