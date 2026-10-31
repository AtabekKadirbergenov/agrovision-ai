import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';

export async function POST(request: Request) {
  try {
    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length < 500) {
      return NextResponse.json({ error: 'Kadr hajmi juda kichik' }, { status: 400 });
    }

    const base64 = buffer.toString('base64');
    serverStore.setLatestFrame(base64);

    return NextResponse.json({
      status: 'success',
      bytes: buffer.length,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
