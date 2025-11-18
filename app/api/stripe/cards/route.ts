import { NextRequest, NextResponse } from 'next/server';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

/**
 * Stripe'dan kullanıcının kayıtlı kartlarını getirir
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const email = searchParams.get('email');

    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: 'Stripe API key yapılandırılmamış' },
        { status: 500 }
      );
    }

    // Customer ID yoksa email ile bul
    let customer = customerId;
    
    if (!customer && email) {
      const searchResponse = await fetch(`https://api.stripe.com/v1/customers?email=${encodeURIComponent(email)}&limit=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        },
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.data && searchData.data.length > 0) {
          customer = searchData.data[0].id;
        }
      }
    }

    if (!customer) {
      // Customer yoksa boş array döndür
      return NextResponse.json({
        success: true,
        cards: [],
      });
    }

    // Stripe API'den kartları çek
    const stripeResponse = await fetch(`https://api.stripe.com/v1/payment_methods?customer=${customer}&type=card`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.json().catch(() => ({}));
      console.error('Stripe API Error:', errorData);
      return NextResponse.json(
        { success: false, error: errorData.error?.message || 'Stripe API hatası' },
        { status: stripeResponse.status }
      );
    }

    const stripeData = await stripeResponse.json();
    const cards = stripeData.data || [];

    // Kartları formatla
    const formattedCards = cards.map((card: any) => ({
      id: card.id,
      last4: card.card?.last4 || '',
      brand: card.card?.brand || 'unknown',
      expiryMonth: card.card?.exp_month || 0,
      expiryYear: card.card?.exp_year || 0,
      isDefault: false, // Stripe'da default card ayrı bir alan olabilir
    }));

    return NextResponse.json({
      success: true,
      cards: formattedCards,
    });
  } catch (error: any) {
    console.error('Stripe cards fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Kartlar yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}


