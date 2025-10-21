/**
 * @deprecated Cette route n'est plus utilisée
 * Utiliser /api/customers/me à la place
 * 
 * PayloadCMS ne crée pas d'endpoint dédié pour /customers/addresses
 * Il faut passer par PATCH /customers/:id avec le tableau addresses complet
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { error: 'Cette route est dépréciée. Utiliser /api/customers/me' },
    { status: 410 } // Gone
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'Cette route est dépréciée. Utiliser PATCH /api/customers/me' },
    { status: 410 } // Gone
  );
}

