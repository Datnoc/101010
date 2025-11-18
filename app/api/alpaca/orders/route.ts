import { NextRequest, NextResponse } from 'next/server';
import { placeBuyOrder, placeSellOrder, cancelAlpacaOrder, isAlpacaConfigured } from '@/lib/alpaca';

export async function GET(request: NextRequest) {
  try {
    if (!isAlpacaConfigured()) {
      return NextResponse.json(
        { error: 'Alpaca yapılandırması eksik' },
        { status: 500 }
      );
    }

    const { getAlpacaOrders } = await import('@/lib/alpaca');
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const status = searchParams.get('status') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID gereklidir' },
        { status: 400 }
      );
    }

    const orders = await getAlpacaOrders({
      accountId,
      status,
      limit,
    });
    
    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error: any) {
    console.error('Alpaca orders error:', error);
    return NextResponse.json(
      { 
        error: 'Siparişler alınamadı',
        message: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Body'yi önce oku (stream bir kez okunabilir)
  const body = await request.json();
  const requestBody = body; // Catch bloğu için sakla
  
  try {
    if (!isAlpacaConfigured()) {
      return NextResponse.json(
        { error: 'Alpaca yapılandırması eksik' },
        { status: 500 }
      );
    }

    const { accountId, symbol, qty, notional, side, type, time_in_force, limit_price, stop_price } = body;

    // Validasyon
    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID gereklidir' },
        { status: 400 }
      );
    }

    if (!symbol || !side || !type || !time_in_force) {
      return NextResponse.json(
        { error: 'Eksik parametreler' },
        { status: 400 }
      );
    }

    if (!qty && !notional) {
      return NextResponse.json(
        { error: 'Miktar veya nominal değer gereklidir' },
        { status: 400 }
      );
    }

    const orderData: any = {
      accountId,
      symbol: symbol.toUpperCase(),
      side,
      type,
      time_in_force,
      ...(qty && { qty: parseFloat(qty.toString()) }),
      ...(notional && { notional: parseFloat(notional.toString()) }),
      ...(limit_price && { limit_price: parseFloat(limit_price.toString()) }),
      ...(stop_price && { stop_price: parseFloat(stop_price.toString()) }),
    };

    let order;
    if (side === 'buy') {
      order = await placeBuyOrder(orderData);
    } else {
      order = await placeSellOrder(orderData);
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error('Alpaca order error:', error);
    
    // Detaylı hata bilgilerini logla
    console.error('Order request details:', {
      accountId: requestBody?.accountId,
      symbol: requestBody?.symbol,
      side: requestBody?.side,
      type: requestBody?.type,
      qty: requestBody?.qty,
      notional: requestBody?.notional,
    });
    
    // Hata mesajını parse et (detaylı mesaj varsa)
    let errorMessage = error.message || 'Bilinmeyen hata';
    let errorDetails: any = null;
    
    if (error.message && error.message.includes('Detaylar:')) {
      try {
        const parts = error.message.split('\n\nDetaylar:\n');
        errorMessage = parts[0];
        if (parts[1]) {
          errorDetails = JSON.parse(parts[1]);
        }
      } catch (e) {
        // Parse edilemezse olduğu gibi bırak
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Sipariş gönderilemedi',
        message: errorMessage,
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isAlpacaConfigured()) {
      return NextResponse.json(
        { error: 'Alpaca yapılandırması eksik' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { accountId, orderId } = body || {};

    if (!accountId || !orderId) {
      return NextResponse.json(
        { error: 'Account ID ve order ID gereklidir' },
        { status: 400 }
      );
    }

    await cancelAlpacaOrder(accountId, orderId);

    return NextResponse.json({
      success: true,
      orderId,
    });
  } catch (error: any) {
    console.error('Alpaca order cancel error:', error);
    return NextResponse.json(
      {
        error: 'Emir iptal edilemedi',
        message: error.message || 'Bilinmeyen hata',
      },
      { status: 500 }
    );
  }
}
