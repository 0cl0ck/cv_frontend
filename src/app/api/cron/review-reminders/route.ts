import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.chanvre-vert.fr';

/**
 * Cron job pour envoyer des emails de demande d'avis 7 jours après livraison
 * Configuré dans vercel.json: "0 10 * * *" (tous les jours à 10h)
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier le secret cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.error('[Review Reminder] Unauthorized request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calculer la date il y a 7 jours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split('T')[0];

    // Trouver les commandes livrées il y a exactement 7 jours
    // qui n'ont pas encore reçu l'email de demande d'avis
    const ordersRes = await fetch(
      `${API_URL}/api/orders?where[status][equals]=delivered&where[deliveredAt][greater_than]=${dateStr}T00:00:00Z&where[deliveredAt][less_than]=${dateStr}T23:59:59Z&limit=50`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.PAYLOAD_API_TOKEN}`,
        },
      }
    );

    if (!ordersRes.ok) {
      console.error('[Review Reminder] Failed to fetch orders:', ordersRes.statusText);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    const { docs: orders } = await ordersRes.json();
    let emailsSent = 0;
    let errors = 0;

    for (const order of orders) {
      // Vérifier si l'email de demande d'avis a déjà été envoyé
      const alreadySent = order.statusHistory?.some(
        (e: { status: string; note?: string }) => 
          e.note?.includes('Email demande avis')
      );

      if (alreadySent) continue;

      try {
        // Envoyer email via endpoint backend
        const emailRes = await fetch(`${API_URL}/api/email/review-reminder`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PAYLOAD_API_TOKEN}`,
          },
          body: JSON.stringify({ orderId: order.id }),
        });

        if (emailRes.ok) {
          emailsSent++;
          
          // Marquer dans l'historique
          await fetch(`${API_URL}/api/orders/${order.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.PAYLOAD_API_TOKEN}`,
            },
            body: JSON.stringify({
              statusHistory: [
                ...(order.statusHistory || []),
                {
                  date: new Date().toISOString(),
                  status: 'delivered',
                  note: 'Email demande avis envoyé (J+7)',
                },
              ],
            }),
          });
        } else {
          errors++;
        }
      } catch (err) {
        console.error(`[Review Reminder] Error for order ${order.id}:`, err);
        errors++;
      }
    }

    console.log(`[Review Reminder] Processed ${orders.length} orders, sent ${emailsSent} emails, ${errors} errors`);

    return NextResponse.json({
      success: true,
      processed: orders.length,
      emailsSent,
      errors,
      date: dateStr,
    });
  } catch (error) {
    console.error('[Review Reminder] Cron error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
