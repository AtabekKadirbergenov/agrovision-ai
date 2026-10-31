import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const streamUrl = searchParams.get('stream_url');

  // 1. If streamUrl provided, try direct fetch from local/network ESP32
  if (streamUrl) {
    const cleanBase = streamUrl.replace('/stream', '').replace(':81', '');
    const captureUrl = `${cleanBase}/capture`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(captureUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        if (arrayBuf.byteLength > 1000) {
          return new NextResponse(arrayBuf, {
            headers: {
              'Content-Type': 'image/jpeg',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      }
    } catch {
      // Continue to cloud fallback
    }
  }

  // 2. Check if ESP32 pushed a frame to the cloud
  const cloudFrame = serverStore.getLatestFrame();
  if (cloudFrame) {
    const buf = Buffer.from(cloudFrame, 'base64');
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // 3. Fallback to default demo leaf
  return NextResponse.redirect(new URL('/static/leaf_healthy.jpg', request.url));
}
