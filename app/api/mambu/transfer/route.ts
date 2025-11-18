import { NextRequest, NextResponse } from 'next/server';
import { createMambuTransfer, findClientByEmail, isMambuConfigured } from '@/lib/mambu';

export async function POST(request: NextRequest) {
  try {
    if (!isMambuConfigured()) {
      return NextResponse.json(
        { error: 'Mambu yapılandırması eksik' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { email, recipientEmail, amount, description } = body;

    // Validasyon
    if (!email || !recipientEmail || !amount) {
      return NextResponse.json(
        { error: 'Email, alıcı email ve tutar gereklidir' },
        { status: 400 }
      );
    }

    if (parseFloat(amount.toString()) <= 0) {
      return NextResponse.json(
        { error: 'Tutar 0\'dan büyük olmalıdır' },
        { status: 400 }
      );
    }

    // Gönderen client'ı bul
    const senderClient = await findClientByEmail(email);
    if (!senderClient || !senderClient[0]) {
      return NextResponse.json(
        { error: 'Gönderen hesap bulunamadı' },
        { status: 404 }
      );
    }

    const senderId = senderClient[0].encodedKey || senderClient[0].id;

    // Gönderenin deposit account'unu bul
    const senderAccountsUrl = `${process.env.MAMBU_BASE_URL}/api/deposits?clientId=${senderId}`;
    const senderAccountsResponse = await fetch(senderAccountsUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.mambu.v2+json',
        'apiKey': process.env.MAMBU_API_KEY || '',
      },
    });

    let fromAccountId = null;
    if (senderAccountsResponse.ok) {
      const senderAccounts = await senderAccountsResponse.json();
      if (Array.isArray(senderAccounts) && senderAccounts.length > 0) {
        fromAccountId = senderAccounts[0].id || senderAccounts[0].encodedKey;
      }
    }

    if (!fromAccountId) {
      return NextResponse.json(
        { error: 'Gönderen hesap bulunamadı' },
        { status: 404 }
      );
    }

    // Transfer işlemini oluştur
    const transfer = await createMambuTransfer({
      fromAccountId: fromAccountId,
      toEmail: recipientEmail,
      amount: parseFloat(amount.toString()),
      currency: 'USD',
      notes: description || `Transfer to ${recipientEmail}`,
    });

    return NextResponse.json({
      success: true,
      transfer: transfer,
      message: 'Para transferi başarıyla tamamlandı',
    });
  } catch (error: any) {
    console.error('Mambu transfer error:', error);
    return NextResponse.json(
      { 
        error: 'Para transferi yapılamadı',
        message: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}


