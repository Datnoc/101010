import { NextRequest, NextResponse } from 'next/server';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

/**
 * Stripe Setup Intent oluşturur (kart kaydetmek için)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, email } = body;

    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: 'Stripe API key yapılandırılmamış' },
        { status: 500 }
      );
    }

    // Önce customer'ı bul veya oluştur
    let customer = customerId;
    
    if (!customer && email) {
      // Email ile customer ara
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

      // Customer yoksa oluştur
      if (!customer) {
        const createResponse = await fetch('https://api.stripe.com/v1/customers', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            email: email,
          }),
        });

        if (createResponse.ok) {
          const customerData = await createResponse.json();
          customer = customerData.id;
        }
      }
    }

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer ID veya email gerekli' },
        { status: 400 }
      );
    }

    // Setup Intent oluştur
    const setupIntentResponse = await fetch('https://api.stripe.com/v1/setup_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: customer,
        payment_method_types: 'card',
      }),
    });

    if (!setupIntentResponse.ok) {
      const errorData = await setupIntentResponse.json().catch(() => ({}));
      console.error('Stripe Setup Intent Error:', errorData);
      return NextResponse.json(
        { success: false, error: errorData.error?.message || 'Setup Intent oluşturulamadı' },
        { status: setupIntentResponse.status }
      );
    }

    const setupIntent = await setupIntentResponse.json();

    return NextResponse.json({
      success: true,
      clientSecret: setupIntent.client_secret,
      customerId: customer,
    });
  } catch (error: any) {
    console.error('Stripe setup intent error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Setup Intent oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}


