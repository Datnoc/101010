import { NextRequest, NextResponse } from 'next/server';
import { getAlpacaAssets, isAlpacaConfigured } from '@/lib/alpaca';

// Cache için (5 dakika)
let cachedSymbols: any[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

export async function GET(request: NextRequest) {
  try {
    if (!isAlpacaConfigured()) {
      return NextResponse.json(
        { error: 'Alpaca yapılandırması eksik' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

    // Cache kontrolü
    const now = Date.now();
    if (cachedSymbols && (now - cacheTimestamp) < CACHE_DURATION) {
      // Cache'den filtrele
      const filtered = filterSymbols(cachedSymbols, query, limit);
      return NextResponse.json({
        success: true,
        symbols: filtered,
        cached: true,
      });
    }

    // Alpaca'dan tüm aktif varlıkları çek
    // Not: getAlpacaAssets Market Data API kullanıyor, bu yüzden fallback olarak local listeyi kullan
    let assets: any[] = [];
    try {
      assets = await getAlpacaAssets({
        status: 'active',
        asset_class: 'us_equity', // Sadece ABD hisse senetleri
      });
      
      // Eğer array değilse array'e çevir
      if (!Array.isArray(assets)) {
        assets = [assets];
      }
    } catch (error: any) {
      // Hata mesajını logla ama kullanıcıya gösterme (fallback kullanılacak)
      console.warn('Alpaca assets API hatası (fallback kullanılıyor):', error.message);
      // Fallback: Local popüler semboller listesini kullan
      const { popularSymbols } = await import('@/lib/symbols');
      assets = popularSymbols.map(s => ({
        symbol: s.symbol,
        name: s.name,
        exchange: s.exchange,
        tradable: true,
        class: 'us_equity',
      }));
    }

    // Format data
    const formattedSymbols = assets.map((asset: any) => ({
      symbol: asset.symbol,
      name: asset.name,
      exchange: asset.exchange,
      tradable: asset.tradable,
      class: asset.asset_class,
    }));

    // Cache'e kaydet
    cachedSymbols = formattedSymbols;
    cacheTimestamp = now;

    // Filtrele
    const filtered = filterSymbols(formattedSymbols, query, limit);

    return NextResponse.json({
      success: true,
      symbols: filtered,
      total: formattedSymbols.length,
      cached: false,
    });
  } catch (error: any) {
    console.error('Alpaca symbols error:', error);
    
    // Hata durumunda cache'den döndür
    if (cachedSymbols) {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get('q') || '';
      const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
      const filtered = filterSymbols(cachedSymbols, query, limit);
      
      return NextResponse.json({
        success: true,
        symbols: filtered,
        cached: true,
        error: 'Live data unavailable, showing cached results',
      });
    }

    return NextResponse.json(
      { 
        error: 'Semboller alınamadı',
        message: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

function filterSymbols(symbols: any[], query: string, limit: number): any[] {
  if (!query || query.length < 1) {
    return symbols.slice(0, limit);
  }

  const upperQuery = query.toUpperCase();
  
  return symbols
    .filter(symbol => 
      symbol.symbol.includes(upperQuery) || 
      symbol.name.toUpperCase().includes(upperQuery)
    )
    .slice(0, limit);
}

