import { NextRequest, NextResponse } from 'next/server';
import { createMambuWithdrawal, findClientByEmail, isMambuConfigured } from '@/lib/mambu';
import { depositToAlpacaAccount, findAlpacaAccountByEmail, isAlpacaConfigured } from '@/lib/alpaca';

export async function POST(request: NextRequest) {
  try {
    if (!isMambuConfigured()) {
      return NextResponse.json(
        { error: 'Mambu yapılandırması eksik' },
        { status: 500 }
      );
    }

    if (!isAlpacaConfigured()) {
      return NextResponse.json(
        { error: 'Alpaca yapılandırması eksik' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { email, amount, description } = body;

    // Validasyon
    if (!email || !amount) {
      return NextResponse.json(
        { error: 'Email ve tutar gereklidir' },
        { status: 400 }
      );
    }

    if (parseFloat(amount.toString()) <= 0) {
      return NextResponse.json(
        { error: 'Tutar 0\'dan büyük olmalıdır' },
        { status: 400 }
      );
    }

    // Mambu client'ı bul
    const mambuClient = await findClientByEmail(email);
    if (!mambuClient || !mambuClient[0]) {
      return NextResponse.json(
        { error: 'Banka hesabı bulunamadı' },
        { status: 404 }
      );
    }

    const clientId = mambuClient[0].encodedKey || mambuClient[0].id;

    // Mambu deposit account'unu bul
    const mambuAccountsUrl = `${process.env.MAMBU_BASE_URL}/api/deposits?clientId=${clientId}`;
    const mambuAccountsResponse = await fetch(mambuAccountsUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.mambu.v2+json',
        'apiKey': process.env.MAMBU_API_KEY || '',
      },
    });

    let mambuAccountId = null;
    if (mambuAccountsResponse.ok) {
      const mambuAccounts = await mambuAccountsResponse.json();
      if (Array.isArray(mambuAccounts) && mambuAccounts.length > 0) {
        mambuAccountId = mambuAccounts[0].id || mambuAccounts[0].encodedKey;
      }
    }

    if (!mambuAccountId) {
      return NextResponse.json(
        { error: 'Banka hesabı bulunamadı' },
        { status: 404 }
      );
    }

    // Mambu hesap bakiyesini kontrol et
    const mambuAccountUrl = `${process.env.MAMBU_BASE_URL}/api/deposits/${mambuAccountId}`;
    const mambuAccountResponse = await fetch(mambuAccountUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.mambu.v2+json',
        'apiKey': process.env.MAMBU_API_KEY || '',
      },
    });

    let mambuBalance = 0;
    if (mambuAccountResponse.ok) {
      const mambuAccount = await mambuAccountResponse.json();
      mambuBalance = parseFloat(mambuAccount.balance || mambuAccount.availableBalance || '0');
    }

    const transferAmount = parseFloat(amount.toString());

    if (mambuBalance < transferAmount) {
      return NextResponse.json(
        { 
          error: 'Yetersiz bakiye',
          message: `Banka hesabınızda yeterli bakiye yok. Mevcut bakiye: $${mambuBalance.toFixed(2)}, Gerekli: $${transferAmount.toFixed(2)}`
        },
        { status: 400 }
      );
    }

    // Alpaca hesabını bul
    const alpacaAccount = await findAlpacaAccountByEmail(email);
    if (!alpacaAccount) {
      return NextResponse.json(
        { error: 'Alpaca hesabı bulunamadı. Lütfen önce yatırım hesabı oluşturun.' },
        { status: 404 }
      );
    }

    const alpacaAccountId = alpacaAccount.id || alpacaAccount.account_number || alpacaAccount.encodedKey;
    if (!alpacaAccountId) {
      return NextResponse.json(
        { error: 'Alpaca hesap ID\'si bulunamadı' },
        { status: 404 }
      );
    }

    // 1. Mambu'dan para çek
    const withdrawal = await createMambuWithdrawal({
      accountId: mambuAccountId,
      amount: transferAmount,
      currency: 'USD',
      notes: description || `Transfer to Alpaca account ${alpacaAccountId}`,
    });

    // 2. Alpaca'ya para yatır
    try {
      const deposit = await depositToAlpacaAccount({
        accountId: alpacaAccountId,
        amount: transferAmount,
        currency: 'USD',
        notes: description || `Deposit from Mambu account`,
      });

      return NextResponse.json({
        success: true,
        transfer: {
          mambuWithdrawal: withdrawal,
          alpacaDeposit: deposit,
        },
        message: `$${transferAmount.toFixed(2)} başarıyla banka hesabından yatırım hesabına transfer edildi`,
      });
    } catch (alpacaError: any) {
      // Alpaca'ya yatırma başarısız olursa, Mambu'dan çekilen parayı geri yatırmaya çalış
      // Not: Gerçek uygulamada bu işlem için rollback mekanizması olmalı
      console.error('Alpaca deposit failed, attempting rollback:', alpacaError);
      
      // Mambu'ya geri yatırma işlemi (deposit)
      try {
        const { createMambuDeposit } = await import('@/lib/mambu');
        await createMambuDeposit({
          accountId: mambuAccountId,
          amount: transferAmount,
          currency: 'USD',
          notes: 'Rollback: Alpaca deposit failed',
        });
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }

      return NextResponse.json(
        { 
          error: 'Alpaca\'ya para yatırılamadı',
            message: alpacaError.message || 'Yatırım hesabına para yatırma işlemi başarısız oldu. Para banka hesabınıza geri yatırıldı.',
          details: alpacaError.message
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Mambu to Alpaca transfer error:', error);
    return NextResponse.json(
      { 
        error: 'Transfer yapılamadı',
        message: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

