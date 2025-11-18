import { NextRequest, NextResponse } from 'next/server';
import { findClientByEmail, isMambuConfigured } from '@/lib/mambu';

const MAMBU_BASE_URL = process.env.MAMBU_BASE_URL || '';
const MAMBU_API_KEY = process.env.MAMBU_API_KEY || '';

/**
 * Mambu'da yeni hesap oluşturur
 */
export async function POST(request: NextRequest) {
  try {
    if (!isMambuConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Mambu yapılandırması eksik' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { email, productTypeKey, accountName, currencyCode, notes } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email gerekli' },
        { status: 400 }
      );
    }

    // Client'ı bul
    const client = await findClientByEmail(email);
    if (!client || !client[0]) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const clientData = client[0];
    const clientId = clientData.encodedKey || clientData.id;

    // Mevcut hesapları kontrol et
    const existingAccountsUrl = `${MAMBU_BASE_URL}/api/deposits?clientId=${clientId}`;
    const existingAccountsResponse = await fetch(existingAccountsUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.mambu.v2+json',
        'apiKey': MAMBU_API_KEY,
      },
    });

    if (existingAccountsResponse.ok) {
      const existingAccounts = await existingAccountsResponse.json();
      if (Array.isArray(existingAccounts) && existingAccounts.length > 0) {
        // Aktif hesap varsa hata döndür
        const activeAccounts = existingAccounts.filter((acc: any) => 
          acc.accountState === 'ACTIVE' || acc.state === 'ACTIVE'
        );
        if (activeAccounts.length > 0) {
          return NextResponse.json(
            { success: false, error: 'Zaten aktif bir hesabınız bulunmaktadır' },
            { status: 400 }
          );
        }
      }
    }

    // Yeni hesap oluştur
    const accountPayload = {
      clientKey: clientId,
      productTypeKey: productTypeKey || 'DEFAULT_SAVINGS', // Varsayılan hesap tipi
      accountHolderType: 'CLIENT',
      accountHolderKey: clientId,
      assignedBranchKey: clientData.assignedBranchKey || null,
      accountName: accountName || `${clientData.firstName || ''} ${clientData.lastName || ''}`.trim() || 'Ana Hesap',
      accountState: 'ACTIVE',
      currencyCode: currencyCode || 'USD',
      notes: notes ? `${notes}\n\nHesap oluşturulma tarihi: ${new Date().toISOString()}` : `Hesap oluşturulma tarihi: ${new Date().toISOString()}`,
    };

    const createAccountUrl = `${MAMBU_BASE_URL}/api/deposits`;
    const createAccountResponse = await fetch(createAccountUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.mambu.v2+json',
        'apiKey': MAMBU_API_KEY,
      },
      body: JSON.stringify(accountPayload),
    });

    if (!createAccountResponse.ok) {
      const errorData = await createAccountResponse.json().catch(() => ({ 
        message: createAccountResponse.statusText 
      }));
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.message || errorData.errorMessage || 'Hesap oluşturulamadı' 
        },
        { status: createAccountResponse.status }
      );
    }

    const newAccount = await createAccountResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Hesap başarıyla oluşturuldu',
      account: {
        id: newAccount.id || newAccount.encodedKey,
        accountName: newAccount.accountName || accountPayload.accountName,
        accountNumber: newAccount.accountNumber || newAccount.id,
        balance: newAccount.balance || 0,
        currencyCode: newAccount.currencyCode || 'USD',
        accountState: newAccount.accountState || 'ACTIVE',
      },
    });
  } catch (error: any) {
    console.error('Mambu account creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Hesap oluşturulurken bir hata oluştu' 
      },
      { status: 500 }
    );
  }
}

