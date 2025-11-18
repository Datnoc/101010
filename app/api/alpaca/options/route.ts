import { NextRequest, NextResponse } from 'next/server';
import { getAlpacaOptionsPositions, placeOptionsOrder, isAlpacaConfigured } from '@/lib/alpaca';

export async function GET(request: NextRequest) {
  try {
    if (!isAlpacaConfigured()) {
      return NextResponse.json(
        { error: 'Alpaca yapılandırması eksik' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID gereklidir' },
        { status: 400 }
      );
    }

    const positions = await getAlpacaOptionsPositions(accountId);
    
    return NextResponse.json({
      success: true,
      positions: positions || [],
    });
  } catch (error: any) {
    // Options desteklenmiyorsa veya hata varsa boş array döndür (hata verme)
    console.warn('Alpaca options positions error (ignored):', error.message);
    return NextResponse.json({
      success: true,
      positions: [],
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAlpacaConfigured()) {
      return NextResponse.json(
        { error: 'Alpaca yapılandırması eksik' },
        { status: 500 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError: any) {
      return NextResponse.json(
        { 
          error: 'Geçersiz JSON formatı',
          message: parseError.message || 'Request body parse edilemedi'
        },
        { status: 400 }
      );
    }

    const { accountId, symbol, qty, side, type, time_in_force, limit_price, stop_price } = body;

    if (!accountId || !symbol || !qty || !side || !type || !time_in_force) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }

    const order = await placeOptionsOrder({
      accountId,
      symbol,
      qty,
      side,
      type,
      time_in_force,
      limit_price,
      stop_price,
    });
    
    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error('Alpaca options order error:', error);
    
    // Özel hata mesajları
    let errorMessage = error.message || 'Bilinmeyen hata';
    let userFriendlyMessage = 'Opsiyon emri verilemedi';
    let errorCode = 'UNKNOWN_ERROR';
    let statusCode = 500;
    
    // Detaylı hata mesajını parse et (JSON formatında olabilir)
    let parsedErrorDetails: any = null;
    try {
      // Error message içinde JSON detayları varsa parse et
      if (error.message?.includes('Detaylar:')) {
        const detailsMatch = error.message.match(/Detaylar:\s*(\{[\s\S]*\})/);
        if (detailsMatch) {
          parsedErrorDetails = JSON.parse(detailsMatch[1]);
        }
      }
    } catch (parseError) {
      // Parse hatası olursa devam et
    }
    
    // Önce apiResponse içindeki mesajı kontrol et (en güvenilir kaynak)
    const apiResponseMessage = parsedErrorDetails?.apiResponse?.message?.toLowerCase() || '';
    const apiResponseCode = parsedErrorDetails?.apiResponse?.code;
    const errorDetailsCode = parsedErrorDetails?.code;
    const errorMessageLower = error.message?.toLowerCase() || '';
    
    // Options not authorized hatası - öncelikli kontrol
    if (apiResponseMessage.includes('account not authorized to trade options') ||
        apiResponseMessage.includes('not authorized to trade options') ||
        errorMessageLower.includes('not authorized to trade options') ||
        errorMessageLower.includes('account not authorized to trade options') ||
        errorDetailsCode === 'OPTIONS_NOT_AUTHORIZED' ||
        (apiResponseCode === 40310000 && apiResponseMessage.includes('authorized'))) {
      userFriendlyMessage = 'Hesabınız opsiyon işlemleri için yetkilendirilmemiş. Alpaca sandbox hesabınızın opsiyon trading için aktif edilmesi gerekiyor.';
      errorMessage = 'Hesap opsiyon işlemleri için yetkilendirilmemiş. Lütfen Alpaca Broker Dashboard\'dan hesap ayarlarınızı kontrol edin.';
      errorCode = 'OPTIONS_NOT_AUTHORIZED';
      statusCode = 403;
    }
    // Insufficient buying power hatası - sadece yetkilendirme hatası değilse
    else if (errorMessageLower.includes('insufficient buying power') || 
             (errorMessageLower.includes('buying power') && !errorMessageLower.includes('authorized')) ||
             errorDetailsCode === 'INSUFFICIENT_BUYING_POWER') {
      userFriendlyMessage = 'Yetersiz alım gücü. Hesabınızda yeterli bakiye yok.';
      errorMessage = error.message;
      errorCode = 'INSUFFICIENT_BUYING_POWER';
      statusCode = 403;
    }
    // Asset not found hatası
    else if (errorMessageLower.includes('not found') || errorMessageLower.includes('asset')) {
      userFriendlyMessage = 'Bu opsiyon Alpaca\'da mevcut değil. Gösterilen opsiyonlar demo verileridir ve gerçek işlem yapılamaz. Gerçek opsiyon işlemleri için Alpaca\'dan geçerli opsiyon sembolleri kullanmanız gerekmektedir.';
      errorMessage = `Opsiyon sembolü bulunamadı: ${symbol}. Bu sembol Alpaca sandbox ortamında mevcut değil.`;
      errorCode = 'ASSET_NOT_FOUND';
    }
    
    return NextResponse.json(
      { 
        error: userFriendlyMessage,
        message: errorMessage,
        code: errorCode
      },
      { status: statusCode }
    );
  }
}

