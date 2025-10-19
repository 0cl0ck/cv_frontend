import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function isObjectId(value: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(value);
}

export async function GET(_req: NextRequest, context: { params: { id: string } }): Promise<NextResponse> {
  try {
    const idOrSlug = decodeURIComponent(context.params.id || '');
    if (!idOrSlug) {
      return NextResponse.json({ error: 'Missing identifier' }, { status: 400 });
    }

    let url = '';
    if (isObjectId(idOrSlug)) {
      url = `${BACKEND}/api/products/${idOrSlug}`;
    } else {
      const qs = new URLSearchParams();
      qs.set('where[slug][equals]', idOrSlug);
      qs.set('depth', '0');
      url = `${BACKEND}/api/products?${qs.toString()}`;
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    const contentType = res.headers.get('content-type') || 'application/json';
    const text = await res.text();

    if (!res.ok) {
      return new NextResponse(text, { status: res.status, headers: { 'Content-Type': contentType } });
    }

    // If we queried by slug, the backend responds with a list. Return the first doc as the product shape.
    if (!isObjectId(idOrSlug)) {
      let data: unknown;
      try {
        data = JSON.parse(text) as unknown;
      } catch {
        return new NextResponse(text, { status: 200, headers: { 'Content-Type': contentType } });
      }

      const firstDoc = (() => {
        if (data && typeof data === 'object') {
          const maybe = data as { docs?: unknown };
          if (Array.isArray(maybe.docs) && maybe.docs.length > 0) return maybe.docs[0] as unknown;
        }
        return null as unknown;
      })();

      if (firstDoc === null) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(firstDoc as Record<string, unknown>);
    }

    return new NextResponse(text, { status: res.status, headers: { 'Content-Type': contentType } });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
