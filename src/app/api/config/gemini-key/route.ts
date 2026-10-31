import { NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';

export async function GET() {
  const key = serverStore.geminiApiKey || process.env.GEMINI_API_KEY || '';
  const masked = key ? `${key.slice(0, 6)}...${key.slice(-4)}` : '';
  return NextResponse.json({
    has_key: Boolean(key),
    masked_key: masked,
    engine: Boolean(key)
      ? 'Google Gemini 1.5 Flash (Multimodal Live Vision)'
      : 'Vizual barg tekshiruvi va Qoidalar Dvigateli'
  });
}

export async function POST(request: Request) {
  try {
    const { key } = await request.json();
    serverStore.geminiApiKey = (key || '').trim();
    const hasKey = Boolean(serverStore.geminiApiKey);
    return NextResponse.json({
      success: true,
      has_key: hasKey,
      engine: hasKey
        ? 'Google Gemini 1.5 Flash (Multimodal Live Vision)'
        : 'Vizual barg tekshiruvi va Qoidalar Dvigateli'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
