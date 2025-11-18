import { NextRequest, NextResponse } from 'next/server';
import { closeMambuClient, closeMambuAccount, findClientByEmail } from '@/lib/mambu';
import { closeAlpacaAccount } from '@/lib/alpaca';

/**
 * Kullanıcının Mambu ve Alpaca hesaplarını kapatır
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, accountId, agreementAccepted, consentAccepted } = body;

    // Validasyon
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email gerekli' },
        { status: 400 }
      );
    }

    if (!agreementAccepted || !consentAccepted) {
      return NextResponse.json(
        { success: false, error: 'Sözleşme ve rıza metni onayı gerekli' },
        { status: 400 }
      );
    }

    const results: any = {
      mambu: { success: false, error: null },
      alpaca: { success: false, error: null },
    };

    // Mambu hesabını kapat
    try {
      const client = await findClientByEmail(email);
      if (client && client[0]) {
        const clientId = client[0].encodedKey || client[0].id;
        
        // Client'ı kapat
        await closeMambuClient(clientId);
        
        // Deposit account'ları kapat
        const accountsUrl = `${process.env.MAMBU_BASE_URL}/api/deposits?clientId=${clientId}`;
        const accountsResponse = await fetch(accountsUrl, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.mambu.v2+json',
            'apiKey': process.env.MAMBU_API_KEY || '',
          },
        });
        
        if (accountsResponse.ok) {
          const accounts = await accountsResponse.json();
          if (Array.isArray(accounts)) {
            for (const account of accounts) {
              try {
                await closeMambuAccount(account.id || account.encodedKey);
              } catch (error) {
                console.error('Mambu account close error:', error);
              }
            }
          }
        }
        
        results.mambu.success = true;
      } else {
        results.mambu.error = 'Mambu client bulunamadı';
      }
    } catch (error: any) {
      console.error('Mambu close error:', error);
      results.mambu.error = error.message || 'Mambu hesap kapatma hatası';
    }

    // Alpaca hesabını kapat
    if (accountId) {
      try {
        await closeAlpacaAccount(accountId);
        results.alpaca.success = true;
      } catch (error: any) {
        console.error('Alpaca close error:', error);
        results.alpaca.error = error.message || 'Alpaca hesap kapatma hatası';
      }
    } else {
      results.alpaca.error = 'Alpaca account ID bulunamadı';
    }

    // Her iki hesap da kapatıldıysa başarılı
    const allSuccess = results.mambu.success && results.alpaca.success;
    
    return NextResponse.json({
      success: allSuccess,
      results,
      message: allSuccess 
        ? 'Hesaplarınız başarıyla kapatıldı' 
        : 'Hesap kapatma işlemi kısmen başarısız oldu',
    });
  } catch (error: any) {
    console.error('Account close error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Hesap kapatma sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}


