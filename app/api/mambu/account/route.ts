import { NextRequest, NextResponse } from 'next/server';
import { findClientByEmail, isMambuConfigured } from '@/lib/mambu';

export async function GET(request: NextRequest) {
  try {
    if (!isMambuConfigured()) {
      return NextResponse.json(
        { error: 'Mambu yapılandırması eksik' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email gereklidir' },
        { status: 400 }
      );
    }

    // Client'ı bul
    const client = await findClientByEmail(email);
    
      // Client bulunamazsa sessizce boş data döndür (404 hatası verme)
      if (!client || !client[0]) {
        return NextResponse.json({
          success: true,
          account: {
            clientId: null,
            totalBalance: 0,
            cashBalance: 0,
            accounts: [],
            loans: [],
            totalLoanBalance: 0,
            creditCardDebt: 0,
          },
        });
      }

    const clientData = client[0];
    const clientId = clientData.encodedKey || clientData.id;

    // Client'ın account'larını al (deposit accounts, savings accounts, etc.)
    // Mambu API'den account bilgilerini çek
    try {
      const accountsUrl = `${process.env.MAMBU_BASE_URL}/api/deposits?clientId=${clientId}`;
      const accountsResponse = await fetch(accountsUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.mambu.v2+json',
          'apiKey': process.env.MAMBU_API_KEY || '',
        },
      });

      let accounts: any[] = [];
      let totalBalance = 0;
      let cashBalance = 0;

      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        const rawAccounts = Array.isArray(accountsData) ? accountsData : [];
        
        // Accounts array'ini map et ve accountNumber field'ını ekle
        accounts = rawAccounts.map((acc: any) => ({
          id: acc.id || acc.encodedKey || '',
          accountNumber: acc.accountNumber || acc.id || acc.encodedKey || '',
          accountType: acc.accountType || acc.productTypeKey || 'DEPOSIT',
          currencyCode: acc.currencyCode || 'USD',
          balance: parseFloat(acc.balance || acc.availableBalance || '0'),
          availableBalance: parseFloat(acc.availableBalance || acc.balance || '0'),
          accountState: acc.accountState || acc.state || 'ACTIVE',
        }));
        
        // Toplam bakiyeyi hesapla
        accounts.forEach((acc: any) => {
          const balance = parseFloat(acc.balance || acc.availableBalance || '0');
          totalBalance += balance;
          cashBalance += balance; // Mambu'dan gelen nakit
        });
      }

      // Loan (kredi) verilerini al
      let loans = [];
      let totalLoanBalance = 0;
      try {
        const loansUrl = `${process.env.MAMBU_BASE_URL}/api/loans?clientId=${clientId}`;
        const loansResponse = await fetch(loansUrl, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.mambu.v2+json',
            'apiKey': process.env.MAMBU_API_KEY || '',
          },
        });

        if (loansResponse.ok) {
          const loansData = await loansResponse.json();
          loans = Array.isArray(loansData) ? loansData : [];
          
          // Toplam kredi bakiyesini hesapla (borç)
          loans.forEach((loan: any) => {
            const principalBalance = parseFloat(loan.principalBalance || loan.balance || '0');
            totalLoanBalance += principalBalance;
          });
        }
      } catch (error) {
        console.warn('Mambu loans fetch error:', error);
      }

      // Kredi kartı borcu verilerini al (credit arrangements veya credit card loans)
      let creditCardDebt = 0;
      try {
        // Kredi kartları genellikle loan product type'ı CREDIT_CARD olan loan'lar olabilir
        const creditCardsUrl = `${process.env.MAMBU_BASE_URL}/api/loans?clientId=${clientId}&loanProductType=CREDIT_CARD`;
        const creditCardsResponse = await fetch(creditCardsUrl, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.mambu.v2+json',
            'apiKey': process.env.MAMBU_API_KEY || '',
          },
        });

        if (creditCardsResponse.ok) {
          const creditCardsData = await creditCardsResponse.json();
          const creditCardLoans = Array.isArray(creditCardsData) ? creditCardsData : [];
          
          creditCardLoans.forEach((card: any) => {
            const balance = parseFloat(card.principalBalance || card.balance || card.availableCredit || '0');
            creditCardDebt += balance;
          });
        }
      } catch (error) {
        console.warn('Mambu credit cards fetch error:', error);
      }

      return NextResponse.json({
        success: true,
        account: {
          clientId: clientId,
          totalBalance: totalBalance,
          cashBalance: cashBalance,
          accounts: accounts,
          loans: loans,
          totalLoanBalance: totalLoanBalance,
          creditCardDebt: creditCardDebt,
        },
      });
    } catch (error: any) {
      console.error('Mambu account error:', error);
      // Hata durumunda da client bilgisini döndür
      return NextResponse.json({
        success: true,
        account: {
          clientId: clientId,
          totalBalance: 0,
          cashBalance: 0,
          accounts: [],
          loans: [],
          totalLoanBalance: 0,
          creditCardDebt: 0,
        },
      });
    }
  } catch (error: any) {
    console.error('Mambu account error:', error);
    return NextResponse.json(
      { 
        error: 'Hesap bilgileri alınamadı',
        message: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

