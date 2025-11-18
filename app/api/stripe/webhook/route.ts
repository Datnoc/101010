import { NextRequest, NextResponse } from 'next/server';
import { createMambuDepositByEmail } from '@/lib/mambu';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * Stripe webhook endpoint'i
 * Ödeme başarılı olduğunda Mambu hesabına para yükler
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!STRIPE_WEBHOOK_SECRET || !signature) {
      // Development için webhook secret olmadan da çalışabilir
      // Production'da mutlaka webhook secret kullanılmalı
      console.warn('Stripe webhook secret yapılandırılmamış veya signature eksik');
    }

    // Stripe event'i parse et
    let event: any;
    try {
      // Webhook secret varsa doğrula
      if (STRIPE_WEBHOOK_SECRET && signature) {
        const stripe = require('stripe')(STRIPE_SECRET_KEY);
        event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
      } else {
        // Development için JSON olarak parse et
        event = JSON.parse(body);
      }
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Payment Intent başarılı olduğunda
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const amount = paymentIntent.amount / 100; // Cent'ten dolar'a çevir
      const email = paymentIntent.metadata?.email;
      const paymentIntentId = paymentIntent.id;

      if (!email) {
        console.error('Payment Intent metadata\'da email bulunamadı');
        return NextResponse.json(
          { error: 'Email bulunamadı' },
          { status: 400 }
        );
      }

      // Mambu hesabına para yükle
      try {
        const depositResult = await createMambuDepositByEmail(email, amount, {
          description: `Stripe ile para yükleme - Payment Intent: ${paymentIntentId}`,
          notes: `Stripe Payment Intent ID: ${paymentIntentId}`,
        });

        if (depositResult.success) {
          console.log(`Mambu deposit başarılı: ${email}, tutar: $${amount}`);
          return NextResponse.json({ 
            success: true, 
            message: 'Para yükleme başarılı',
            depositId: depositResult.depositId 
          });
        } else {
          console.error('Mambu deposit hatası:', depositResult.error);
          return NextResponse.json(
            { error: depositResult.error || 'Mambu deposit hatası' },
            { status: 500 }
          );
        }
      } catch (depositError: any) {
        console.error('Mambu deposit exception:', depositError);
        return NextResponse.json(
          { error: depositError.message || 'Mambu deposit exception' },
          { status: 500 }
        );
      }
    }

    // Diğer event'ler için başarılı yanıt döndür
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook işlenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

