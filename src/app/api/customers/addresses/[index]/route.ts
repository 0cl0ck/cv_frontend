import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Route BFF pour supprimer une adresse spécifique
 * Proxy vers le backend avec le token HttpOnly cookie
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ index: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('payload-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { index } = await params;
    
    const response = await fetch(`${BACKEND_URL}/api/customers/addresses/${index}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('[BFF /api/customers/addresses/[index] DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}


