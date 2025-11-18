import { NextRequest, NextResponse } from 'next/server';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

/**
 * Stripe Payment Intent oluşturur (para yükleme için)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'usd', email, customerId } = body;

    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: 'Stripe API key yapılandırılmamış' },
        { status: 500 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Geçerli bir tutar gerekli' },
        { status: 400 }
      );
    }

    // Minimum tutar kontrolü (Stripe için $0.50)
    if (amount < 0.5) {
      return NextResponse.json(
        { success: false, error: 'Minimum tutar $0.50 olmalıdır' },
        { status: 400 }
      );
    }

    // Customer'ı bul veya oluştur
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

    // Payment Intent oluştur
    const paymentIntentParams: Record<string, string> = {
      amount: Math.round(amount * 100), // Stripe cent cinsinden çalışır
      currency: currency.toLowerCase(),
      payment_method_types: 'card',
      metadata: {
        email: email || '',
        type: 'mambu_deposit',
      },
    };

    if (customer) {
      paymentIntentParams.customer = customer;
    }

    const paymentIntentResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(paymentIntentParams),
    });

    if (!paymentIntentResponse.ok) {
      const errorData = await paymentIntentResponse.json().catch(() => ({}));
      console.error('Stripe Payment Intent Error:', errorData);
      return NextResponse.json(
        { success: false, error: errorData.error?.message || 'Payment Intent oluşturulamadı' },
        { status: paymentIntentResponse.status }
      );
    }

    const paymentIntent = await paymentIntentResponse.json();

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      customerId: customer,
    });
  } catch (error: any) {
    console.error('Stripe payment intent error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment Intent oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

