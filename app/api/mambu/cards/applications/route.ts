import { NextRequest, NextResponse } from 'next/server';
import { findClientByEmail } from '@/lib/mambu';

const MAMBU_BASE_URL = process.env.MAMBU_BASE_URL || '';
const MAMBU_API_KEY = process.env.MAMBU_API_KEY || '';

/**
 * Mambu'dan kart başvurularını getirir
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

    // Account'un custom fields'ından kart başvurularını çıkar
    const customFields = account.customFields || [];
    const cardApplicationFields = customFields.filter((field: any) => 
      field.fieldSetId === 'CARD_APPLICATION'
    );

    // Başvuruları parse et
    const applications: any[] = [];
    let currentApp: any = null;

    cardApplicationFields.forEach((field: any) => {
      const fieldId = field.customField?.id;
      const fieldValue = field.customField?.value;

      if (fieldId === 'cardType' || fieldId === 'cardFeature' || fieldId === 'applicationDate' || fieldId === 'status') {
        if (!currentApp) {
          currentApp = {
            id: `app-${Date.now()}-${Math.random()}`,
            applicationDate: new Date().toISOString(),
            status: 'PENDING',
          };
        }
        currentApp[fieldId] = fieldValue;
      } else if (fieldId === 'cardDesign' || fieldId === 'cardIcon' || fieldId === 'isSingleUse') {
        if (!currentApp) {
          currentApp = {
            id: `app-${Date.now()}-${Math.random()}`,
            applicationDate: new Date().toISOString(),
            status: 'PENDING',
          };
        }
        if (fieldId === 'isSingleUse') {
          currentApp[fieldId] = fieldValue === 'true';
        } else {
          currentApp[fieldId] = fieldValue;
        }
      } else if (fieldId === 'address' || fieldId === 'city' || fieldId === 'state' || 
                 fieldId === 'zipCode' || fieldId === 'phoneNumber') {
        if (!currentApp) {
          currentApp = {
            id: `app-${Date.now()}-${Math.random()}`,
            applicationDate: new Date().toISOString(),
            status: 'PENDING',
          };
        }
        currentApp[fieldId] = fieldValue;
      }

      // Eğer status alanına geldiysek, başvuruyu kaydet
      if (fieldId === 'status' && currentApp) {
        applications.push(currentApp);
        currentApp = null;
      }
    });

    // Son başvuruyu da ekle (eğer varsa)
    if (currentApp && currentApp.status) {
      applications.push(currentApp);
    }

    // Demo hesap için mock data
    if (email.toLowerCase() === 'demo@datpay.com' && applications.length === 0) {
      applications.push({
        id: 'demo-app-1',
        cardType: 'DEBIT',
        cardFeature: 'DRAKE',
        cardDesign: 'gradient-purple',
        cardIcon: 'crown',
        isSingleUse: true,
        status: 'IN_PRODUCTION',
        applicationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        city: 'İstanbul',
        phoneNumber: '+90 555 123 4567',
      });
      applications.push({
        id: 'demo-app-2',
        cardType: 'CREDIT',
        cardFeature: 'METAL',
        cardDesign: 'gradient-black',
        cardIcon: 'diamond',
        isSingleUse: false,
        status: 'APPROVED',
        applicationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        city: 'İstanbul',
        phoneNumber: '+90 555 123 4567',
      });
    }

    return NextResponse.json({
      success: true,
      applications: applications.sort((a, b) => 
        new Date(b.applicationDate || 0).getTime() - new Date(a.applicationDate || 0).getTime()
      ),
    });
  } catch (error: any) {
    console.error('Mambu card applications fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Başvurular getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

