import { NextRequest, NextResponse } from 'next/server';
import { createMambuDeposit, findClientByEmail, isMambuConfigured } from '@/lib/mambu';
import { withdrawFromAlpacaAccount, findAlpacaAccountByEmail, getAlpacaAccounts, isAlpacaConfigured } from '@/lib/alpaca';

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

    // Alpaca hesabını bul
    const alpacaAccount = await findAlpacaAccountByEmail(email);
    if (!alpacaAccount) {
      return NextResponse.json(
        { error: 'Yatırım hesabı bulunamadı. Lütfen önce yatırım hesabı oluşturun.' },
        { status: 404 }
      );
    }

    const alpacaAccountId = alpacaAccount.id || alpacaAccount.account_number || alpacaAccount.encodedKey;
    if (!alpacaAccountId) {
      return NextResponse.json(
        { error: 'Yatırım hesap ID\'si bulunamadı' },
        { status: 404 }
      );
    }

    // Alpaca hesap bakiyesini kontrol et
    const alpacaAccounts = await getAlpacaAccounts();
    const alpacaAccountData = Array.isArray(alpacaAccounts) 
      ? alpacaAccounts.find((acc: any) => 
          (acc.id || acc.account_number || acc.encodedKey) === alpacaAccountId
        )
      : null;
    
    if (!alpacaAccountData) {
      return NextResponse.json(
        { error: 'Yatırım hesap bilgileri alınamadı' },
        { status: 404 }
      );
    }

    const alpacaCash = parseFloat(alpacaAccountData.cash || alpacaAccountData.buying_power || '0');
    const transferAmount = parseFloat(amount.toString());

    if (alpacaCash < transferAmount) {
      return NextResponse.json(
        { 
          error: 'Yetersiz bakiye',
          message: `Yatırım hesabınızda yeterli bakiye yok. Mevcut bakiye: $${alpacaCash.toFixed(2)}, Gerekli: $${transferAmount.toFixed(2)}`
        },
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

    // 1. Alpaca'dan para çek
    try {
      const withdrawal = await withdrawFromAlpacaAccount({
        accountId: alpacaAccountId,
        amount: transferAmount,
        currency: 'USD',
        notes: description || `Withdrawal to Mambu account`,
      });

      // 2. Mambu'ya para yatır
      try {
        const deposit = await createMambuDeposit({
          accountId: mambuAccountId,
          amount: transferAmount,
          currency: 'USD',
          notes: description || `Deposit from Alpaca account`,
        });

        return NextResponse.json({
          success: true,
          transfer: {
            alpacaWithdrawal: withdrawal,
            mambuDeposit: deposit,
          },
          message: `$${transferAmount.toFixed(2)} başarıyla yatırım hesabından banka hesabına transfer edildi`,
        });
      } catch (mambuError: any) {
        // Mambu'ya yatırma başarısız olursa, Alpaca'dan çekilen parayı geri yatırmaya çalış
        console.error('Mambu deposit failed, attempting rollback:', mambuError);
        
        // Alpaca'ya geri yatırma işlemi (deposit)
        try {
          const { depositToAlpacaAccount } = await import('@/lib/alpaca');
          await depositToAlpacaAccount({
            accountId: alpacaAccountId,
            amount: transferAmount,
            currency: 'USD',
            notes: 'Rollback: Mambu deposit failed',
          });
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
        }

        return NextResponse.json(
          { 
            error: 'Banka\'ya para yatırılamadı',
            message: mambuError.message || 'Banka hesabına para yatırma işlemi başarısız oldu. Para yatırım hesabınıza geri yatırıldı.',
            details: mambuError.message
          },
          { status: 500 }
        );
      }
    } catch (alpacaError: any) {
      return NextResponse.json(
        { 
          error: 'Yatırım hesabından para çekilemedi',
          message: alpacaError.message || 'Yatırım hesabından para çekme işlemi başarısız oldu.',
          details: alpacaError.message
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Alpaca to Mambu transfer error:', error);
    return NextResponse.json(
      { 
        error: 'Transfer yapılamadı',
        message: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

