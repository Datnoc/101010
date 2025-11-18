import { NextRequest, NextResponse } from 'next/server';
import { findClientByEmail } from '@/lib/mambu';

const MAMBU_BASE_URL = process.env.MAMBU_BASE_URL || '';
const MAMBU_API_KEY = process.env.MAMBU_API_KEY || '';

/**
 * Mambu'dan kullanıcının kartlarını getirir
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email gerekli' },
        { status: 400 }
      );
    }

    // Client'ı bul
    const client = await findClientByEmail(email);
    if (!client || !client[0]) {
      return NextResponse.json({
        success: true,
        cards: [],
      });
    }

    const clientData = client[0];
    const clientId = clientData.encodedKey || clientData.id;

    // Mambu'da kartlar genellikle deposit account'lara bağlıdır
    // Önce deposit account'ları al
    const accountsUrl = `${MAMBU_BASE_URL}/api/deposits?clientId=${clientId}`;
    const accountsResponse = await fetch(accountsUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.mambu.v2+json',
        'apiKey': MAMBU_API_KEY,
      },
    });

    let cards: any[] = [];

    if (accountsResponse.ok) {
      const accountsData = await accountsResponse.json();
      const accounts = Array.isArray(accountsData) ? accountsData : [];

      // Her account için kart bilgilerini al
      // Mambu'da kartlar genellikle custom fields veya ayrı bir endpoint ile yönetilir
      // Bu örnekte, account bilgilerinden kart bilgilerini çıkarıyoruz
      for (const account of accounts) {
        // Kart bilgileri genellikle account'un custom fields'ında veya ayrı bir endpoint'te olur
        // Mambu API yapısına göre bu kısım değişebilir
        
        // Örnek: Account'tan kart bilgilerini çıkar
        const cardNumber = account.cardNumber || account.customFields?.cardNumber;
        const cardType = account.cardType || account.customFields?.cardType || 'DEBIT';
        const cardStatus = account.cardStatus || account.customFields?.cardStatus || 'ACTIVE';
        const onlineEnabled = account.onlineEnabled !== undefined 
          ? account.onlineEnabled 
          : account.customFields?.onlineEnabled !== undefined
          ? account.customFields.onlineEnabled
          : true;
        const spendingLimit = account.spendingLimit || account.customFields?.spendingLimit || 0;
        const availableBalance = parseFloat(account.availableBalance || account.balance || '0');

        if (cardNumber || account.id) {
          cards.push({
            id: account.id || account.encodedKey,
            accountId: account.id || account.encodedKey,
            cardNumber: cardNumber || `****${account.id?.slice(-4) || '0000'}`,
            cardType: cardType,
            status: cardStatus,
            onlineEnabled: onlineEnabled,
            spendingLimit: spendingLimit,
            availableBalance: availableBalance,
            expiryMonth: account.expiryMonth || account.customFields?.expiryMonth || 12,
            expiryYear: account.expiryYear || account.customFields?.expiryYear || new Date().getFullYear() + 2,
            cardholderName: `${clientData.firstName || ''} ${clientData.lastName || ''}`.trim(),
            currency: account.currencyCode || 'USD',
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      cards: cards,
    });
  } catch (error: any) {
    console.error('Mambu cards fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Kartlar yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

/**
 * Kartın online alışveriş durumunu günceller
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardId, onlineEnabled } = body;

    if (!cardId || onlineEnabled === undefined) {
      return NextResponse.json(
        { success: false, error: 'cardId ve onlineEnabled gerekli' },
        { status: 400 }
      );
    }

    // Mambu'da kart durumunu güncelle
    // Bu genellikle account'un custom fields'ını güncellemekle yapılır
    const accountUrl = `${MAMBU_BASE_URL}/api/deposits/${cardId}`;
    const updateResponse = await fetch(accountUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.mambu.v2+json',
        'apiKey': MAMBU_API_KEY,
      },
      body: JSON.stringify({
        customFields: [
          {
            fieldSetId: 'CARD_SETTINGS',
            customField: {
              id: 'onlineEnabled',
              value: onlineEnabled.toString(),
            },
          },
        ],
      }),
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => ({ message: updateResponse.statusText }));
      return NextResponse.json(
        { success: false, error: errorData.message || 'Kart durumu güncellenemedi' },
        { status: updateResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kart durumu güncellendi',
    });
  } catch (error: any) {
    console.error('Mambu card update error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Kart durumu güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

