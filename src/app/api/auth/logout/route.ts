import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Tizimdan chiqildi' });
  response.cookies.delete('agro_session');
  return response;
}
