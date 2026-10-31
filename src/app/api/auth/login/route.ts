import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Default system credentials
    const validUser = process.env.AGRO_ADMIN_USER || 'admin';
    const validPass = process.env.AGRO_ADMIN_PASSWORD || 'agrovision2026';

    const isUserValid = (username === validUser) || 
                        (username === 'admin@agrovision.uz') || 
                        (username === 'admin@gmail.com') ||
                        (typeof username === 'string' && username.trim().toLowerCase() === 'admin');

    if (isUserValid && password === validPass) {
      // In production/edge, create a base64 session token
      const token = Buffer.from(`${username}:${Date.now()}:agrovision_secret`).toString('base64');
      const response = NextResponse.json({
        success: true,
        token,
        user: {
          username: validUser,
          role: 'Agronom Administrator',
          loginTime: new Date().toISOString()
        }
      });

      // Set auth cookie
      response.cookies.set('agro_session', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Foydalanuvchi nomi yoki parol noto\'g\'ri!' },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Serverda xatolik yuz berdi: ' + (error?.message || String(error)) },
      { status: 500 }
    );
  }
}
