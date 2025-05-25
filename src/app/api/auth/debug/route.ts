import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('payload-token')?.value;
    
    // Informations de debug côté serveur
    const debugInfo = {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'None',
      cookies: Object.fromEntries(
        Array.from(cookieStore.getAll().map(cookie => [cookie.name, !!cookie.value]))
      ),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      },
      timestamp: new Date().toISOString()
    };

    // Test de l'appel à /api/auth/me
    let authMeTest: {
      status?: number;
      statusText?: string;
      ok?: boolean;
      hasData?: boolean;
      userEmail?: string;
      error?: string;
    } | null = null;
    
    if (token) {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const authResponse = await fetch(`${backendUrl}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Cookie': `payload-token=${token}`
          },
          cache: 'no-store',
          credentials: 'include'
        });

        authMeTest = {
          status: authResponse.status,
          statusText: authResponse.statusText,
          ok: authResponse.ok,
          hasData: false
        };

        if (authResponse.ok) {
          try {
            const data = await authResponse.json();
            authMeTest.hasData = !!data.user;
            authMeTest.userEmail = data.user?.email || 'No email';
          } catch (e) {
            authMeTest.error = 'JSON parse error';
          }
        }
      } catch (error) {
        authMeTest = {
          error: (error as Error).message || 'Unknown error'
        };
      }
    }

    return NextResponse.json({
      success: true,
      debugInfo,
      authMeTest
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
