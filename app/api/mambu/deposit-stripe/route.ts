import { NextRequest, NextResponse } from 'next/server';
import { createMambuDepositByEmail } from '@/lib/mambu';

/**
 * Stripe ödeme başarılı olduktan sonra Mambu hesabına para yükler
 * Bu endpoint hem webhook'tan hem de client-side'dan çağrılabilir
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, amount, paymentIntentId } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email gerekli' },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Geçerli bir tutar gerekli' },
        { status: 400 }
      );
    }

    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'Payment Intent ID gerekli' },
        { status: 400 }
      );
    }

    // Mambu hesabına para yükle
    const depositResult = await createMambuDepositByEmail(email, amount, {
      description: `Stripe ile para yükleme - Payment Intent: ${paymentIntentId}`,
      notes: `Stripe Payment Intent ID: ${paymentIntentId}`,
    });

    if (depositResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Para başarıyla yüklendi',
        depositId: depositResult.depositId,
      });
    } else {
      return NextResponse.json(
        { success: false, error: depositResult.error || 'Para yükleme hatası' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Mambu deposit from Stripe error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Para yükleme işlenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

