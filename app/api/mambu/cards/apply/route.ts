import { NextRequest, NextResponse } from 'next/server';
import { findClientByEmail } from '@/lib/mambu';

const MAMBU_BASE_URL = process.env.MAMBU_BASE_URL || '';
const MAMBU_API_KEY = process.env.MAMBU_API_KEY || '';

/**
 * Mambu'da yeni kart başvurusu oluşturur
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      cardType, // 'DEBIT' | 'CREDIT'
      cardFeature, // 'VIRTUAL' | 'DRAKE' | 'METAL' | 'STANDARD'
      cardDesign, // 'gradient-blue' | 'gradient-purple' | 'gradient-black' | 'gradient-gold'
      cardIcon, // 'credit-card' | 'star' | 'diamond' | 'crown' | 'shield' | 'zap'
      isSingleUse, // boolean - Drake kart için
      address,
      city,
      state,
      zipCode,
      phoneNumber,
      deliveryAddress,
      deliveryCity,
      deliveryState,
      deliveryZipCode,
    } = body;

    if (!email || !cardType || !cardFeature) {
      return NextResponse.json(
        { success: false, error: 'Email, kart tipi ve kart özelliği gerekli' },
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

    // Deposit account'u bul
    const accountsUrl = `${MAMBU_BASE_URL}/api/deposits?clientId=${clientId}`;
    const accountsResponse = await fetch(accountsUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.mambu.v2+json',
        'apiKey': MAMBU_API_KEY,
      },
    });

    if (!accountsResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Hesap bulunamadı' },
        { status: 404 }
      );
    }

    const accounts = await accountsResponse.json();
    const account = Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null;

    if (!account) {
      return NextResponse.json(
        { success: false, error: 'Aktif hesap bulunamadı' },
        { status: 404 }
      );
    }

    // Mambu'da kart başvurusu oluştur
    // Not: Mambu API'sinde kart başvurusu genellikle custom fields veya ayrı bir endpoint ile yapılır
    // Bu örnekte, account'un custom fields'ına kart bilgilerini ekliyoruz
    
    const cardApplicationPayload: any = {
      customFields: [
        {
          fieldSetId: 'CARD_APPLICATION',
          customField: {
            id: 'cardType',
            value: cardType,
          },
        },
        {
          fieldSetId: 'CARD_APPLICATION',
          customField: {
            id: 'cardFeature',
            value: cardFeature,
          },
        },
        {
          fieldSetId: 'CARD_APPLICATION',
          customField: {
            id: 'applicationDate',
            value: new Date().toISOString(),
          },
        },
        {
          fieldSetId: 'CARD_APPLICATION',
          customField: {
            id: 'status',
            value: 'PENDING',
          },
        },
      ],
    };

    // Kart tasarım ve ikon bilgilerini ekle
    if (cardDesign) {
      cardApplicationPayload.customFields.push({
        fieldSetId: 'CARD_APPLICATION',
        customField: {
          id: 'cardDesign',
          value: cardDesign,
        },
      });
    }
    if (cardIcon) {
      cardApplicationPayload.customFields.push({
        fieldSetId: 'CARD_APPLICATION',
        customField: {
          id: 'cardIcon',
          value: cardIcon,
        },
      });
    }
    if (isSingleUse !== undefined) {
      cardApplicationPayload.customFields.push({
        fieldSetId: 'CARD_APPLICATION',
        customField: {
          id: 'isSingleUse',
          value: isSingleUse.toString(),
        },
      });
    }

    // Adres bilgilerini ekle
    if (address) {
      cardApplicationPayload.customFields.push({
        fieldSetId: 'CARD_APPLICATION',
        customField: {
          id: 'address',
          value: address,
        },
      });
    }
    if (city) {
      cardApplicationPayload.customFields.push({
        fieldSetId: 'CARD_APPLICATION',
        customField: {
          id: 'city',
          value: city,
        },
      });
    }
    if (state) {
      cardApplicationPayload.customFields.push({
        fieldSetId: 'CARD_APPLICATION',
        customField: {
          id: 'state',
          value: state,
        },
      });
    }
    if (zipCode) {
      cardApplicationPayload.customFields.push({
        fieldSetId: 'CARD_APPLICATION',
        customField: {
          id: 'zipCode',
          value: zipCode,
        },
      });
    }
    if (phoneNumber) {
      cardApplicationPayload.customFields.push({
        fieldSetId: 'CARD_APPLICATION',
        customField: {
          id: 'phoneNumber',
          value: phoneNumber,
        },
      });
    }
    if (deliveryAddress) {
      cardApplicationPayload.customFields.push({
        fieldSetId: 'CARD_APPLICATION',
        customField: {
          id: 'deliveryAddress',
          value: deliveryAddress,
        },
      });
    }
    if (deliveryCity) {
      cardApplicationPayload.customFields.push({
        fieldSetId: 'CARD_APPLICATION',
        customField: {
          id: 'deliveryCity',
          value: deliveryCity,
        },
      });
    }
    if (deliveryState) {
      cardApplicationPayload.customFields.push({
        fieldSetId: 'CARD_APPLICATION',
        customField: {
          id: 'deliveryState',
          value: deliveryState,
        },
      });
    }
    if (deliveryZipCode) {
      cardApplicationPayload.customFields.push({
        fieldSetId: 'CARD_APPLICATION',
        customField: {
          id: 'deliveryZipCode',
          value: deliveryZipCode,
        },
      });
    }

    // Account'u güncelle
    const updateUrl = `${MAMBU_BASE_URL}/api/deposits/${account.id || account.encodedKey}`;
    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.mambu.v2+json',
        'apiKey': MAMBU_API_KEY,
      },
      body: JSON.stringify(cardApplicationPayload),
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => ({ message: updateResponse.statusText }));
      return NextResponse.json(
        { success: false, error: errorData.message || 'Kart başvurusu oluşturulamadı' },
        { status: updateResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kart başvurunuz alındı. Onay süreci başlatıldı.',
      application: {
        id: `app-${Date.now()}`,
        cardType,
        cardFeature,
        cardDesign: cardDesign || 'gradient-blue',
        cardIcon: cardIcon || 'credit-card',
        isSingleUse: isSingleUse || false,
        status: 'PENDING',
        applicationDate: new Date().toISOString(),
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        phoneNumber: phoneNumber || null,
        deliveryAddress: deliveryAddress || null,
        deliveryCity: deliveryCity || null,
        deliveryState: deliveryState || null,
        deliveryZipCode: deliveryZipCode || null,
      },
    });
  } catch (error: any) {
    console.error('Mambu card application error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Kart başvurusu oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

