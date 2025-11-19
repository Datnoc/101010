/**
 * Alpaca Markets API Client
 * Alpaca API ile iletişim için yardımcı fonksiyonlar
 */

// Trading API için key'ler (alım-satım, portföy, pozisyon, account data)
const ALPACA_API_KEY = process.env.ALPACA_API_KEY || '';
const ALPACA_SECRET_KEY = process.env.ALPACA_SECRET_KEY || '';
const ALPACA_BASE_URL = process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets'; // Paper trading default

// Broker API için ayrı key'ler (müşteri oluşturma, KYC, hesap açma)
const ALPACA_BROKER_API_URL = process.env.ALPACA_BROKER_API_URL || 'https://broker-api.sandbox.alpaca.markets';
const ALPACA_BROKER_API_KEY = process.env.ALPACA_BROKER_API_KEY || process.env.ALPACA_API_KEY || '';
const ALPACA_BROKER_SECRET_KEY = process.env.ALPACA_BROKER_SECRET_KEY || process.env.ALPACA_SECRET_KEY || '';

// Market Data API için ayrı key'ler ve URL
// Not: Trading API key'leri Market Data API için de kullanılabilir
// Market Data API URL'i her zaman https://data.alpaca.markets olmalı
const ALPACA_MARKET_DATA_URL = process.env.ALPACA_MARKET_DATA_URL || process.env.NEXT_PUBLIC_ALPACA_DATA_API_URL || 'https://data.alpaca.markets';
// Key'ler için fallback: Önce Market Data API key'leri, yoksa Trading API key'leri
const ALPACA_MARKET_DATA_API_KEY = process.env.ALPACA_MARKET_API_KEY || process.env.NEXT_PUBLIC_ALPACA_MARKET_API_KEY || process.env.ALPACA_API_KEY || '';
const ALPACA_MARKET_DATA_SECRET_KEY = process.env.ALPACA_MARKET_SECRET_KEY || process.env.NEXT_PUBLIC_ALPACA_MARKET_SECRET_KEY || process.env.ALPACA_SECRET_KEY || '';

interface AlpacaAccount {
  id?: string; // UUID formatında account ID (Broker API için)
  account_number: string; // Sayısal account number
  status: string;
  currency: string;
  buying_power: string;
  cash: string;
  portfolio_value: string;
  pattern_day_trader: boolean;
  trading_blocked: boolean;
  transfers_blocked: boolean;
  account_blocked: boolean;
  created_at: string;
  trade_suspended_by_user: boolean;
  multiplier: string;
  shorting_enabled: boolean;
  equity: string;
  last_equity: string;
  long_market_value: string;
  short_market_value: string;
  initial_margin: string;
  maintenance_margin: string;
  sma: string;
  daytrade_count: number;
  trade_cash?: string;
  regt_buying_power?: string;
  daytrade_buying_power?: string;
  pending_transfer_in?: string;
  pending_transfer_out?: string;
  real_time_snapshot?: Record<string, any>;
}

interface AlpacaPosition {
  asset_id: string;
  symbol: string;
  exchange: string;
  asset_class: string;
  qty: string;
  side: string;
  market_value: string;
  cost_basis: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  unrealized_intraday_pl: string;
  unrealized_intraday_plpc: string;
  current_price: string;
  lastday_price: string;
  change_today: string;
}

interface AlpacaOrder {
  id: string;
  client_order_id: string;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  filled_at: string | null;
  expired_at: string | null;
  canceled_at: string | null;
  failed_at: string | null;
  replaced_at: string | null;
  replaced_by: string | null;
  replaces: string | null;
  asset_id: string;
  symbol: string;
  asset_class: string;
  notional: string | null;
  qty: string | null;
  filled_qty: string;
  filled_avg_price: string | null;
  order_class: string;
  order_type: string;
  type: string;
  side: string;
  time_in_force: string;
  limit_price: string | null;
  stop_price: string | null;
  status: string;
  extended_hours: boolean;
  legs: any[] | null;
  trail_percent: string | null;
  trail_price: string | null;
  hwm: string | null;
}

/**
 * Alpaca API'ye istek gönderir
 */
async function alpacaRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  body?: any,
  useBrokerAPI: boolean = false,
  accountId?: string // Opsiyonel: Belirli bir account ID için
): Promise<any> {
  // Trading API için v2, Broker API için v1 kullan
  const baseUrl = useBrokerAPI ? ALPACA_BROKER_API_URL : ALPACA_BASE_URL;
  const apiKey = useBrokerAPI ? ALPACA_BROKER_API_KEY : ALPACA_API_KEY;
  const secretKey = useBrokerAPI ? ALPACA_BROKER_SECRET_KEY : ALPACA_SECRET_KEY;
  const version = useBrokerAPI ? 'v1' : 'v2';
  
  // Eğer account ID verilmişse ve broker API kullanılıyorsa, endpoint'e ekle
  let finalEndpoint = endpoint;
  if (useBrokerAPI) {
    // Broker API için endpoint yapısı: trading/accounts/{accountId}/...
    // Eğer endpoint zaten trading/accounts/ ile başlıyorsa, accountId zaten içinde var demektir
    if (endpoint.startsWith('trading/accounts/')) {
      // Zaten trading/accounts/{accountId}/ formatında, değiştirme
      finalEndpoint = endpoint;
    } else if (accountId) {
      // trading/accounts/{accountId}/ prefix'i ekle
      finalEndpoint = `trading/accounts/${accountId}/${endpoint}`;
    }
  }
  
  const url = `${baseUrl}/${version}/${finalEndpoint}`;
  
  const headers: Record<string, string> = {
    'APCA-API-KEY-ID': apiKey,
    'APCA-API-SECRET-KEY': secretKey,
    'Content-Type': 'application/json',
  };

  // Retry mekanizması ile fetch
  const fetchWithRetry = async (retries = 3, delay = 1000): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });
        return response;
      } catch (error: any) {
        // Network hataları için retry yap (ECONNRESET, fetch failed, vb.)
        const isNetworkError = error.code === 'ECONNRESET' || 
                              error.message?.includes('fetch failed') || 
                              error.message?.includes('ECONNRESET') ||
                              error.message?.includes('network') ||
                              error.message?.includes('timeout');
        
        if (isNetworkError && i < retries - 1) {
          console.warn(`Alpaca API network hatası (deneme ${i + 1}/${retries}), ${delay}ms sonra tekrar deneniyor...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retry limit reached');
  };

  try {
    const response = await fetchWithRetry();

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      
      // Daha açıklayıcı hata mesajları ve detaylı loglama
      let errorMessage = '';
      let errorDetails: any = {
        status: response.status,
        statusText: response.statusText,
        url: url,
        endpoint: endpoint,
        method: method,
        apiType: useBrokerAPI ? 'Broker API' : 'Trading API',
        apiKeyPrefix: apiKey ? `${apiKey.substring(0, 8)}...` : 'MISSING',
      };

      if (response.status === 401) {
        errorMessage = 'Alpaca API kimlik doğrulama hatası. Lütfen API key\'lerinizi kontrol edin.';
        errorDetails.error = 'Authentication failed';
        errorDetails.suggestion = 'API key ve secret key\'lerin doğru olduğundan emin olun.';
      } else if (response.status === 403) {
        // 403 hatası için özel kontrol: PDT > options authorization > buying power > permissions
        const errorMessageLower = errorData.message?.toLowerCase() || '';
        const errorCode = errorData.code;
        
        // 1. Önce PDT (Pattern Day Trading) kontrolü - en öncelikli
        if (errorCode === 40310100 || errorMessageLower.includes('pattern day trading') || errorMessageLower.includes('pdt') || errorMessageLower.includes('trade denied due to pattern day trading')) {
          errorMessage = 'Pattern Day Trading (PDT) Koruması: İşlem reddedildi.';
          errorDetails.error = 'Pattern Day Trading Protection';
          errorDetails.suggestion = 'Hesabınızda $25,000\'den az bakiye varsa ve 5 iş günü içinde 4 veya daha fazla gün-trade yaptıysanız, hesabınız 90 gün boyunca kısıtlanır. Hesabınıza $25,000 veya daha fazla para yatırarak bu kısıtlamayı kaldırabilirsiniz.';
          errorDetails.pdtInfo = {
            reason: 'Pattern Day Trading koruması aktif',
            solution: 'Hesabınıza $25,000 veya daha fazla para yatırın',
            restriction: '90 gün boyunca gün-trade yapamazsınız',
          };
        }
        // 2. Opsiyon yetkilendirme kontrolü
        else if (
          errorMessageLower.includes('not authorized to trade options') ||
          errorMessageLower.includes('account not authorized to trade options') ||
          (errorCode === 40310000 && errorMessageLower.includes('options')) ||
          (errorCode === 40310000 && errorMessageLower.includes('authorized'))
        ) {
          errorMessage = 'Hesabınız opsiyon işlemleri için yetkilendirilmemiş.';
          errorDetails.error = 'Account not authorized to trade options';
          errorDetails.suggestion = 'Alpaca sandbox hesabınızın opsiyon işlemleri için yetkilendirilmesi gerekiyor. Lütfen Alpaca Broker Dashboard\'dan hesap ayarlarınızı kontrol edin ve opsiyon trading\'i aktif edin. Sandbox ortamında opsiyon trading bazı hesaplarda varsayılan olarak kapalı olabilir.';
          errorDetails.code = 'OPTIONS_NOT_AUTHORIZED';
        }
        // 3. Buying power kontrolü
        else if (
          errorMessageLower.includes('buying power') ||
          errorMessageLower.includes('insufficient') ||
          (errorCode === 40310000 && !errorMessageLower.includes('authorized'))
        ) {
          errorMessage = `Yetersiz alım gücü: ${errorData.message || 'Hesabınızda yeterli bakiye yok'}`;
          errorDetails.error = 'Insufficient buying power';
          errorDetails.buyingPower = errorData.buying_power || '0';
          errorDetails.costBasis = errorData.cost_basis || '0';
          errorDetails.suggestion = `Hesabınızda ${errorData.buying_power || '0'} USD alım gücü var. İşlem için ${errorData.cost_basis || '0'} USD gerekiyor. Lütfen hesabınıza para yükleyin.`;
        }
        // 4. Genel izin hatası
        else if (errorMessageLower.includes('insufficient permissions') || errorMessageLower.includes('permission')) {
          errorMessage = 'Alpaca API erişim izni yok. API key\'lerinizin gerekli izinlere sahip olduğundan emin olun.';
          errorDetails.error = 'Forbidden - Insufficient permissions';
          errorDetails.suggestion = 'Broker API key\'inizde trading izinlerinin aktif olduğundan emin olun. Alpaca Broker Dashboard\'dan kontrol edin.';
        }
        // 5. Diğer 403 hataları
        else {
          errorMessage = `Alpaca API erişim hatası: ${errorData.message || 'İşlem reddedildi'}`;
          errorDetails.error = errorData.error || 'Forbidden';
          errorDetails.suggestion = 'Lütfen hesap ayarlarınızı ve API key izinlerinizi kontrol edin.';
        }
        
        errorDetails.accountId = accountId || 'Not provided';
        errorDetails.body = body ? JSON.stringify(body).substring(0, 200) : 'No body';
        errorDetails.apiResponse = errorData; // API'den gelen tam response
      } else if (response.status === 404) {
        errorMessage = `Alpaca API endpoint bulunamadı. URL: ${url}, Endpoint: ${endpoint}`;
        errorDetails.error = 'Endpoint not found';
        errorDetails.suggestion = 'Endpoint URL\'ini ve account ID\'yi kontrol edin.';
      } else {
        errorMessage = errorData.message || errorData.error || `Alpaca API error: ${response.status} - URL: ${url}`;
        errorDetails.error = errorData.error || errorData.message || 'Unknown error';
      }

      // Detaylı hata bilgilerini logla
      console.error('Alpaca API Error Details:', JSON.stringify(errorDetails, null, 2));
      console.error('Alpaca API Error Response:', errorData);
      
      // Hata mesajına detayları ekle
      const detailedMessage = `${errorMessage}\n\nDetaylar:\n${JSON.stringify(errorDetails, null, 2)}`;
      throw new Error(detailedMessage);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Alpaca API Error:', error);
    throw error;
  }
}

/**
 * Alpaca hesap bilgilerini getirir (Broker API - account ID ile)
 */
export async function getAlpacaAccount(accountId: string): Promise<AlpacaAccount> {
  // Broker API kullan (v1/accounts/{accountId}) + Trading snapshot (v1/trading/accounts/{accountId})
  const [accountResult, tradingResult] = await Promise.allSettled([
    alpacaRequest(`accounts/${accountId}`, 'GET', undefined, true),
    alpacaRequest(`trading/accounts/${accountId}/account`, 'GET', undefined, true),
  ]);

  if (accountResult.status !== 'fulfilled' && tradingResult.status !== 'fulfilled') {
    throw accountResult.reason || tradingResult.reason || new Error('Alpaca account bilgisi alınamadı');
  }

  const baseAccount = accountResult.status === 'fulfilled' ? accountResult.value : null;
  const tradingAccount = tradingResult.status === 'fulfilled' ? tradingResult.value : null;

  if (!tradingAccount) {
    return baseAccount as AlpacaAccount;
  }

  const mergedAccount: any = {
    ...(baseAccount || {}),
    real_time_snapshot: tradingAccount,
  };

  const realtimeFields = [
    'cash',
    'buying_power',
    'equity',
    'portfolio_value',
    'long_market_value',
    'short_market_value',
    'initial_margin',
    'maintenance_margin',
    'last_equity',
    'multiplier',
    'pattern_day_trader',
    'daytrade_count',
    'sma',
    'trade_cash',
    'regt_buying_power',
    'daytrade_buying_power',
    'pending_transfer_in',
    'pending_transfer_out',
    'accrued_fees',
  ];

  realtimeFields.forEach((field) => {
    if (tradingAccount[field] !== undefined) {
      mergedAccount[field] = tradingAccount[field];
    }
  });

  return mergedAccount as AlpacaAccount;
}

/**
 * Alpaca pozisyonları getirir (Broker API - account ID ile)
 */
export async function getAlpacaPositions(accountId: string): Promise<AlpacaPosition[]> {
  // Broker API kullan (v1/trading/accounts/{accountId}/positions)
  return alpacaRequest(`trading/accounts/${accountId}/positions`, 'GET', undefined, true);
}

/**
 * Alpaca siparişleri getirir
 */
export async function getAlpacaOrders(params: {
  accountId: string; // Zorunlu: Müşteri account ID'si
  status?: string;
  limit?: number;
  after?: string;
  until?: string;
  direction?: string;
  nested?: boolean;
}): Promise<AlpacaOrder[]> {
  const { accountId, ...queryParams } = params;
  
  const queryString = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && key !== 'accountId') {
      queryString.append(key, value.toString());
    }
  });
  
  // Broker API kullan (v1/trading/accounts/{accountId}/orders)
  const endpoint = `trading/accounts/${accountId}/orders${queryString.toString() ? '?' + queryString.toString() : ''}`;
  return alpacaRequest(endpoint, 'GET', undefined, true);
}

/**
 * Alpaca portföy geçmişi getirir
 * Not: Broker API'de portfolio history endpoint'i yok
 * Bu yüzden account bilgilerinden portfolio history oluşturuluyor
 * Account bilgileri equity, portfolio_value, last_equity içerir
 */
export async function getAlpacaPortfolioHistory(params: {
  accountId: string; // Broker API account ID
  period?: string;
  timeframe?: string;
  end_date?: string;
}): Promise<any> {
  const { accountId, period = '1M' } = params;
  
  // Broker API'de portfolio history endpoint'i yok
  // Bu yüzden account bilgilerinden ve pozisyonlardan portfolio history oluşturuyoruz
  try {
    // Account bilgisini al (equity, portfolio_value, last_equity içerir)
    const account = await getAlpacaAccount(accountId);
    
    // Pozisyonları al (kar/zarar hesaplamak için)
    const positions = await getAlpacaPositions(accountId);
    
    const equity = parseFloat(account.equity || '0');
    const lastEquity = parseFloat(account.last_equity || '0');
    const portfolioValue = parseFloat(account.portfolio_value || '0');
    const cash = parseFloat(account.cash || account.trade_cash || '0');
    
    // Period'a göre gün sayısını hesapla
    const today = new Date();
    let daysBack = 30; // Default 1M
    if (period === '1d' || period === '1D') daysBack = 1;
    else if (period === '1W') daysBack = 7;
    else if (period === '1M') daysBack = 30;
    else if (period === '3M') daysBack = 90;
    else if (period === '6M') daysBack = 180;
    else if (period === '1Y') daysBack = 365;
    
    // Geçmiş verileri oluştur (simüle edilmiş)
    const history: any[] = [];
    
    // Başlangıç değeri (last_equity veya equity'den tahmin)
    const startEquity = lastEquity > 0 ? lastEquity : equity * 0.95; // %5 düşüş varsayımı
    
    // Her gün için bir kayıt oluştur
    for (let i = daysBack; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(16, 0, 0, 0); // Market close time
      
      // Basit bir trend oluştur (gerçek veri yoksa)
      // Equity'den başlayıp, günlük küçük değişimlerle ilerle
      const progress = (daysBack - i) / daysBack; // 0'dan 1'e
      const dailyChange = (equity - startEquity) / daysBack; // Günlük ortalama değişim
      const variance = (Math.random() - 0.5) * (equity * 0.02); // %2 varyans
      const estimatedEquity = startEquity + (dailyChange * (daysBack - i)) + variance;
      
      // Pozisyonlardan toplam kar/zarar hesapla (tahmini)
      const totalPnL = positions.reduce((sum: number, pos: any) => {
        const unrealizedPL = parseFloat(pos.unrealized_pl || '0');
        return sum + unrealizedPL;
      }, 0);
      
      // Günlük kar/zarar tahmini
      const dailyPnL = totalPnL / daysBack;
      const estimatedPnL = dailyPnL * (daysBack - i);
      
      history.push({
        timestamp: date.toISOString(),
        equity: Math.max(0, estimatedEquity),
        profit_loss: estimatedPnL,
        profit_loss_pct: startEquity > 0 ? ((estimatedPnL / startEquity) * 100) : 0,
      });
    }
    
    // Son kayıt gerçek değerlerle güncellenir
    if (history.length > 0) {
      const lastRecord = history[history.length - 1];
      lastRecord.equity = equity;
      lastRecord.profit_loss = equity - startEquity;
      lastRecord.profit_loss_pct = startEquity > 0 ? (((equity - startEquity) / startEquity) * 100) : 0;
    }
    
    const profitLoss = equity - lastEquity;
    const profitLossPct = lastEquity > 0 ? ((profitLoss / lastEquity) * 100) : 0;
    
    return {
      equity: equity,
      profit_loss: profitLoss,
      profit_loss_pct: profitLossPct,
      history: history,
    };
  } catch (error: any) {
    console.error('Portfolio history oluşturma hatası:', error);
    // Hata durumunda boş history döndür
    return {
      equity: 0,
      profit_loss: 0,
      profit_loss_pct: 0,
      history: [],
    };
  }
}

/**
 * Alpaca'da hisse senedi alım emri verir (Broker API - account ID ile)
 */
export async function placeBuyOrder(data: {
  accountId: string; // Zorunlu: Müşteri account ID'si
  symbol: string;
  qty?: number;
  notional?: number;
  side: 'buy';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  time_in_force: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
  limit_price?: number;
  stop_price?: number;
}): Promise<AlpacaOrder> {
  const { accountId, ...orderData } = data;
  // Broker API kullan (v1/trading/accounts/{accountId}/orders)
  return alpacaRequest(`trading/accounts/${accountId}/orders`, 'POST', orderData, true);
}

/**
 * Alpaca'da hisse senedi satım emri verir (Broker API - account ID ile)
 */
export async function placeSellOrder(data: {
  accountId: string; // Zorunlu: Müşteri account ID'si
  symbol: string;
  qty?: number;
  notional?: number;
  side: 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  time_in_force: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
  limit_price?: number;
  stop_price?: number;
}): Promise<AlpacaOrder> {
  const { accountId, ...orderData } = data;
  // Broker API kullan (v1/trading/accounts/{accountId}/orders)
  return alpacaRequest(`trading/accounts/${accountId}/orders`, 'POST', orderData, true);
}

/**
 * Alpaca siparişi iptal eder (Broker API - account ID ile)
 */
export async function cancelAlpacaOrder(accountId: string, orderId: string): Promise<void> {
  // Broker API kullan (v1/trading/accounts/{accountId}/orders/{orderId})
  return alpacaRequest(`trading/accounts/${accountId}/orders/${orderId}`, 'DELETE', undefined, true);
}

/**
 * Alpaca'da opsiyon pozisyonları getirir (Broker API - account ID ile)
 */
export async function getAlpacaOptionsPositions(accountId: string): Promise<any[]> {
  try {
    // Broker API'de options için asset_class parametresi desteklenmiyor
    // Tüm positions'ı al ve options'ları filtrele
    const allPositions = await alpacaRequest(`trading/accounts/${accountId}/positions`, 'GET', undefined, true);
    
    // Options pozisyonlarını filtrele
    // Options genellikle asset_class='option' veya uzun sembol formatında olur
    const optionsPositions = Array.isArray(allPositions) 
      ? allPositions.filter((pos: any) => {
          // asset_class kontrolü
          if (pos.asset_class === 'option') {
            return true;
          }
          // Symbol formatı kontrolü (options genellikle uzun format: AAPL240119C00150000)
          if (pos.symbol && pos.symbol.length > 10) {
            // Options sembolleri genellikle tarih ve strike price içerir
            // Format: SYMBOL + YYMMDD + C/P + STRIKE (örn: AAPL240119C00150000)
            const optionPattern = /^[A-Z]+\d{6}[CP]\d+$/;
            if (optionPattern.test(pos.symbol)) {
              return true;
            }
          }
          return false;
        })
      : [];
    
    return optionsPositions;
  } catch (error: any) {
    // Options desteklenmiyorsa veya hata varsa boş array döndür (sessizce handle et)
    if (error.message?.includes('invalid asset_class') || 
        error.message?.includes('404') || 
        error.message?.includes('not found')) {
      console.warn('Options positions alınamadı, boş array döndürülüyor:', error.message);
      return [];
    }
    // Diğer hatalar için de boş array döndür (options opsiyonel bir özellik)
    console.warn('Options positions hatası (ignored):', error.message);
    return [];
  }
}

/**
 * Alpaca'da opsiyon emri verir (Broker API - account ID ile)
 */
export async function placeOptionsOrder(data: {
  accountId: string; // Zorunlu: Müşteri account ID'si (UUID formatında olmalı)
  symbol: string; // Opsiyon sembolü (örn: AAPL240119C00150000)
  qty: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  time_in_force: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
  limit_price?: number;
  stop_price?: number;
}): Promise<any> {
  const { accountId, ...orderData } = data;
  
  // Account ID doğrulama: UUID formatında olmalı (örn: d005ca65-a340-4373-b783-41a0ca3d13f9)
  // Eğer sayısal bir değerse (account_number), hata ver
  if (accountId && /^\d+$/.test(accountId)) {
    throw new Error(`Geçersiz account ID formatı. UUID formatında bir account ID gereklidir (örn: d005ca65-a340-4373-b783-41a0ca3d13f9). Alınan değer: ${accountId}. Lütfen account ID yerine account UUID kullanın.`);
  }
  
  // Broker API kullan (v1/trading/accounts/{accountId}/orders)
  return alpacaRequest(`trading/accounts/${accountId}/orders`, 'POST', orderData, true);
}

/**
 * Alpaca'da kripto pozisyonları getirir (Broker API - account ID ile)
 */
export async function getAlpacaCryptoPositions(accountId: string): Promise<any[]> {
  // Broker API kullan (v1/trading/accounts/{accountId}/positions?asset_class=crypto)
  return alpacaRequest(`trading/accounts/${accountId}/positions?asset_class=crypto`, 'GET', undefined, true);
}

/**
 * Alpaca'da kripto emri verir (Broker API - account ID ile)
 */
export async function placeCryptoOrder(data: {
  accountId: string; // Zorunlu: Müşteri account ID'si
  symbol: string; // Kripto sembolü (örn: BTCUSD, ETHUSD)
  qty?: number;
  notional?: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  time_in_force: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
  limit_price?: number;
  stop_price?: number;
}): Promise<any> {
  const { accountId, ...orderData } = data;
  // Broker API kullan (v1/trading/accounts/{accountId}/orders)
  return alpacaRequest(`trading/accounts/${accountId}/orders`, 'POST', orderData, true);
}

/**
 * Alpaca'da sembol fiyat bilgisi getirir (Market Data API)
 */
export async function getAlpacaQuote(symbol: string): Promise<any> {
  // Market Data API için direkt fetch yap
  const endpoint = `v2/stocks/${symbol}/quotes/latest`;
  const url = `${ALPACA_MARKET_DATA_URL}/${endpoint}`;
  
  const headers: Record<string, string> = {
    'APCA-API-KEY-ID': ALPACA_MARKET_DATA_API_KEY,
    'APCA-API-SECRET-KEY': ALPACA_MARKET_DATA_SECRET_KEY,
  };

  // Retry mekanizması
  const fetchWithRetry = async (retries = 3, delay = 500): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers,
        });
        return response;
      } catch (error: any) {
        const isNetworkError = error.code === 'ECONNRESET' || 
                              error.message?.includes('fetch failed') || 
                              error.message?.includes('ECONNRESET') ||
                              error.message?.includes('network');
        if (isNetworkError && i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retry limit reached');
  };

  try {
    const response = await fetchWithRetry();

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Market Data API error: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Alpaca Quote API Error:', error);
    throw error;
  }
}

/**
 * Alpaca'da sembol son fiyat bilgisi getirir (Market Data API)
 */
export async function getAlpacaLatestTrade(symbol: string): Promise<any> {
  // Market Data API için direkt fetch yap
  const endpoint = `v2/stocks/${symbol}/trades/latest`;
  const url = `${ALPACA_MARKET_DATA_URL}/${endpoint}`;
  
  const headers: Record<string, string> = {
    'APCA-API-KEY-ID': ALPACA_MARKET_DATA_API_KEY,
    'APCA-API-SECRET-KEY': ALPACA_MARKET_DATA_SECRET_KEY,
  };

  // Retry mekanizması
  const fetchWithRetry = async (retries = 3, delay = 500): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers,
        });
        return response;
      } catch (error: any) {
        const isNetworkError = error.code === 'ECONNRESET' || 
                              error.message?.includes('fetch failed') || 
                              error.message?.includes('ECONNRESET') ||
                              error.message?.includes('network');
        if (isNetworkError && i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retry limit reached');
  };

  try {
    const response = await fetchWithRetry();

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Market Data API error: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Alpaca Latest Trade API Error:', error);
    throw error;
  }
}

/**
 * Alpaca'da kripto için en son trade verisini getirir (Market Data API)
 */
export async function getAlpacaCryptoLatestTrade(symbol: string): Promise<any> {
  // Market Data API için direkt fetch yap
  const endpoint = `v1beta3/crypto/${symbol}/trades/latest`;
  const url = `${ALPACA_MARKET_DATA_URL}/${endpoint}`;
  
  const headers: Record<string, string> = {
    'APCA-API-KEY-ID': ALPACA_MARKET_DATA_API_KEY,
    'APCA-API-SECRET-KEY': ALPACA_MARKET_DATA_SECRET_KEY,
  };

  // Retry mekanizması
  const fetchWithRetry = async (retries = 3, delay = 500): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers,
        });
        return response;
      } catch (error: any) {
        const isNetworkError = error.code === 'ECONNRESET' || 
                              error.message?.includes('fetch failed') || 
                              error.message?.includes('ECONNRESET') ||
                              error.message?.includes('network');
        if (isNetworkError && i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retry limit reached');
  };

  try {
    const response = await fetchWithRetry();

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Crypto Market Data API error: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Alpaca Crypto Latest Trade API Error:', error);
    throw error;
  }
}

/**
 * Alpaca'da opsiyon sembolü için quote verisini getirir (Market Data API - Historical Option Data)
 * Alpaca'nın Historical Option Data API'sini kullanır
 */
export async function getAlpacaOptionQuote(optionSymbol: string): Promise<any> {
  // Alpaca Historical Option Data API endpoint
  // v1beta1/options/quotes/latest endpoint'ini kullan
  const endpoint = `v1beta1/options/quotes/latest?symbols=${optionSymbol}`;
  const url = `${ALPACA_MARKET_DATA_URL}/${endpoint}`;
  
  const headers: Record<string, string> = {
    'APCA-API-KEY-ID': ALPACA_MARKET_DATA_API_KEY,
    'APCA-API-SECRET-KEY': ALPACA_MARKET_DATA_SECRET_KEY,
  };

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      // 404 veya 400 (invalid symbol) hataları için null döndür (opsiyon mevcut değil veya geçersiz format)
      if (response.status === 404 || response.status === 400) {
        return null;
      }
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      // Invalid symbol hatası için null döndür
      if (errorData.message?.includes('invalid symbol') || errorData.code === 400) {
        return null;
      }
      throw new Error(errorData.message || `Option Quote API error: ${response.status}`);
    }

    const data = await response.json();
    // Response format: { quotes: { SYMBOL: {...} } }
    if (data.quotes && data.quotes[optionSymbol]) {
      return { quote: data.quotes[optionSymbol] };
    }
    return null;
  } catch (error: any) {
    // 404, 400 veya invalid symbol hataları opsiyonun mevcut olmadığı veya geçersiz format olduğu anlamına gelir
    if (error.message?.includes('404') || 
        error.message?.includes('Not Found') ||
        error.message?.includes('invalid symbol') ||
        error.message?.includes('code=400')) {
      return null;
    }
    console.error('Alpaca Option Quote API Error:', error);
    throw error;
  }
}

/**
 * Alpaca'da opsiyon sembolü için trade verisini getirir (Market Data API - Historical Option Data)
 * Alpaca'nın Historical Option Data API'sini kullanır
 */
export async function getAlpacaOptionTrade(optionSymbol: string): Promise<any> {
  // Alpaca Historical Option Data API endpoint
  // v1beta1/options/trades/latest endpoint'ini kullan
  const endpoint = `v1beta1/options/trades/latest?symbols=${optionSymbol}`;
  const url = `${ALPACA_MARKET_DATA_URL}/${endpoint}`;
  
  const headers: Record<string, string> = {
    'APCA-API-KEY-ID': ALPACA_MARKET_DATA_API_KEY,
    'APCA-API-SECRET-KEY': ALPACA_MARKET_DATA_SECRET_KEY,
  };

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      // 404 veya 400 (invalid symbol) hataları için null döndür (opsiyon mevcut değil veya geçersiz format)
      if (response.status === 404 || response.status === 400) {
        return null;
      }
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      // Invalid symbol hatası için null döndür
      if (errorData.message?.includes('invalid symbol') || errorData.code === 400) {
        return null;
      }
      throw new Error(errorData.message || `Option Trade API error: ${response.status}`);
    }

    const data = await response.json();
    // Response format: { trades: { SYMBOL: {...} } }
    if (data.trades && data.trades[optionSymbol]) {
      return { trade: data.trades[optionSymbol] };
    }
    return null;
  } catch (error: any) {
    // 404, 400 veya invalid symbol hataları opsiyonun mevcut olmadığı veya geçersiz format olduğu anlamına gelir
    if (error.message?.includes('404') || 
        error.message?.includes('Not Found') ||
        error.message?.includes('invalid symbol') ||
        error.message?.includes('code=400')) {
      return null;
    }
    console.error('Alpaca Option Trade API Error:', error);
    throw error;
  }
}

/**
 * Alpaca'da kripto için geçmiş fiyat verilerini (bars) getirir (Market Data API)
 */
export async function getAlpacaCryptoBars(
  symbol: string,
  params?: {
    start?: string;
    end?: string;
    timeframe?: '1Min' | '5Min' | '15Min' | '30Min' | '1Hour' | '1Day' | '1Week' | '1Month';
    limit?: number;
  }
): Promise<any> {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }
  
  // Alpaca Market Data API - Crypto
  // Crypto için endpoint: v1beta3/crypto/bars?symbols={symbol}
  // symbols parametresi zorunludur ve tek bir sembol olarak gönderilir
  const timeframe = params?.timeframe || '1Day';
  
  // Query parametrelerini hazırla - symbols parametresi her zaman ilk sırada olmalı
  queryParams.set('symbols', symbol); // symbols parametresi zorunlu
  queryParams.set('timeframe', timeframe);
  
  if (params?.start) {
    queryParams.set('start', params.start);
  }
  if (params?.end) {
    queryParams.set('end', params.end);
  }
  if (params?.limit) {
    queryParams.set('limit', params.limit.toString());
  }
  
  // v1beta3/crypto/bars endpoint'ini kullan
  const endpoint = `v1beta3/crypto/bars?${queryParams.toString()}`;
  
  // Market data için özel URL ve key'ler
  const url = `${ALPACA_MARKET_DATA_URL}/${endpoint}`;
  
  const headers: Record<string, string> = {
    'APCA-API-KEY-ID': ALPACA_MARKET_DATA_API_KEY,
    'APCA-API-SECRET-KEY': ALPACA_MARKET_DATA_SECRET_KEY,
  };

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      
      // Crypto için de subscription hatası olabilir
      if (errorData.message?.includes('subscription') || errorData.message?.includes('SIP')) {
        console.warn('Crypto subscription hatası:', errorData.message);
      }
      
      // Detaylı hata mesajı
      const errorMsg = errorData.message || `Alpaca Market Data API error: ${response.status}`;
      if (response.status === 404 || errorMsg.includes('Not Found') || errorMsg.includes('endpoint not found')) {
        throw new Error(`Crypto bars endpoint bulunamadı (${endpoint}). Alpaca crypto market data subscription'ınızın aktif olduğundan ve API key'lerinizin crypto market data erişimine sahip olduğundan emin olun.`);
      }
      if (errorMsg.includes('symbols') && errorMsg.includes('required')) {
        throw new Error(`Crypto bars API hatası: symbols parametresi gerekli. Endpoint: ${endpoint}, Symbol: ${symbol}`);
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    
    // v1beta3 endpoint'i { bars: { SYMBOL: [...] } } formatında döner
    if (data.bars && typeof data.bars === 'object' && !Array.isArray(data.bars)) {
      // v1beta3 multi-symbol format: { bars: { SYMBOL: [...] } }
      const symbolBars = data.bars[symbol] || [];
      return { bars: symbolBars };
    } else if (data.bars && Array.isArray(data.bars)) {
      // Array format: { bars: [...] }
    return data;
    } else {
      // Fallback: direkt bars array'i döndür
      return { bars: data.bars || [] };
    }
  } catch (error: any) {
    console.error('Alpaca Crypto Bars API Error:', error);
    console.error('Endpoint URL:', url);
    console.error('Symbol:', symbol);
    throw error;
  }
}

/**
 * Alpaca'da sembol için geçmiş fiyat verilerini (bars) getirir (Market Data API - Stocks)
 */
export async function getAlpacaBars(
  symbol: string,
  params?: {
    start?: string;
    end?: string;
    timeframe?: '1Min' | '5Min' | '15Min' | '30Min' | '1Hour' | '1Day' | '1Week' | '1Month';
    limit?: number;
  }
): Promise<any> {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }
  
  // Alpaca Market Data API v2 endpoint
  // IEX feed kullan (ücretsiz, 15 dakika gecikmeli) - SIP subscription gerektirmez
  const timeframe = params?.timeframe || '1Day';
  queryParams.set('timeframe', timeframe);
  queryParams.set('feed', 'iex'); // IEX feed kullan (SIP yerine)
  
  const endpoint = `v2/stocks/${symbol}/bars${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  // Market data için özel URL ve key'ler
  const url = `${ALPACA_MARKET_DATA_URL}/${endpoint}`;
  
  const headers: Record<string, string> = {
    'APCA-API-KEY-ID': ALPACA_MARKET_DATA_API_KEY,
    'APCA-API-SECRET-KEY': ALPACA_MARKET_DATA_SECRET_KEY,
  };

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      
      // Daha açıklayıcı hata mesajları
      if (response.status === 401) {
        throw new Error(`Market Data API kimlik doğrulama hatası. API key'lerinizi kontrol edin. URL: ${url}, Key: ${ALPACA_MARKET_DATA_API_KEY?.substring(0, 10)}...`);
      } else if (response.status === 403) {
        throw new Error(`Market Data API erişim izni yok. API key'lerinizin gerekli izinlere sahip olduğundan emin olun.`);
      }
      
      // Eğer SIP hatası varsa, IEX feed ile tekrar dene
      if (errorData.message?.includes('SIP') || errorData.message?.includes('subscription')) {
        // IEX feed zaten eklenmiş, başka bir hata olabilir
        // Veya daha eski veriler için farklı bir yaklaşım dene
        console.warn('SIP subscription hatası, IEX feed kullanılıyor');
      }
      
      throw new Error(errorData.message || `Alpaca Market Data API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Alpaca Bars API Error:', error);
    throw error;
  }
}

/**
 * Broker API'den tüm hesapları getirir
 */
/**
 * Alpaca'dan market clock bilgisini getirir (piyasa açık/kapalı durumu ve saatler)
 */
export async function getAlpacaMarketClock(): Promise<any> {
  try {
    const endpoint = 'v2/clock';
    const url = `${ALPACA_BASE_URL}/${endpoint}`;
    
    const headers: Record<string, string> = {
      'APCA-API-KEY-ID': ALPACA_API_KEY,
      'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
    };

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Alpaca Market Clock API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Alpaca market clock error:', error);
    throw error;
  }
}

/**
 * Alpaca'dan market calendar bilgisini getirir (piyasa takvimi)
 */
export async function getAlpacaMarketCalendar(params?: {
  start?: string;
  end?: string;
}): Promise<any> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.start) {
      queryParams.append('start', params.start);
    }
    if (params?.end) {
      queryParams.append('end', params.end);
    }
    
    // Market Calendar Data API'de olabilir, önce Data API'yi dene
    const endpoint = `v1/calendar${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    // Önce Data API'yi dene
    let url = `${ALPACA_MARKET_DATA_URL}/${endpoint}`;
    let headers: Record<string, string> = {
      'APCA-API-KEY-ID': ALPACA_MARKET_DATA_API_KEY,
      'APCA-API-SECRET-KEY': ALPACA_MARKET_DATA_SECRET_KEY,
    };

    let response = await fetch(url, {
      method: 'GET',
      headers,
    });

    // Eğer Data API'de yoksa, Trading API'yi dene
    if (!response.ok && response.status === 404) {
      url = `${ALPACA_BASE_URL}/${endpoint}`;
      headers = {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
      };

      response = await fetch(url, {
        method: 'GET',
        headers,
      });
    }

    if (!response.ok) {
      // 404 hatası durumunda sessizce null döndür (fallback kullanılacak)
      if (response.status === 404) {
        return null;
      }
      const errorText = await response.text();
      throw new Error(`Alpaca Market Calendar API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    // 404 hatası durumunda sessizce null döndür (fallback kullanılacak)
    if (error.message && error.message.includes('404')) {
      return null;
    }
    // Diğer hatalar için sadece debug modunda logla
    if (process.env.NODE_ENV === 'development') {
      console.warn('Alpaca market calendar error (fallback will be used):', error.message);
    }
    return null;
  }
}

export async function getAlpacaAccounts(): Promise<any[]> {
  // Broker API kullan (v1/accounts)
  return alpacaRequest('accounts', 'GET', undefined, true);
}

/**
 * Alpaca'da tüm aktif varlıkları (assets) getirir
 * Not: Assets endpoint'i Trading API'de olabilir, ancak Market Data API key'leri ile çalışmayabilir
 * Bu yüzden önce Trading API'yi dene, hata olursa Market Data API'yi dene
 */
export async function getAlpacaAssets(params?: {
  status?: string;
  asset_class?: string;
  exchange?: string;
}): Promise<any> {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }
  
  // Endpoint'te v2/ olmamalı, alpacaRequest zaten v2/ ekliyor
  const endpoint = `assets${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  // Önce Trading API'yi dene
  try {
    return await alpacaRequest(endpoint, 'GET', undefined, false);
  } catch (error: any) {
    // Trading API başarısız olursa, Market Data API'yi dene
    console.warn('Trading API assets endpoint failed, trying Market Data API:', error.message);
    
    // Market Data API için direkt fetch yap
    // Market Data API'de endpoint'e v2/ eklenmeli
    const marketDataEndpoint = `v2/${endpoint}`;
    const url = `${ALPACA_MARKET_DATA_URL}/${marketDataEndpoint}`;
    const headers: Record<string, string> = {
      'APCA-API-KEY-ID': ALPACA_MARKET_DATA_API_KEY,
      'APCA-API-SECRET-KEY': ALPACA_MARKET_DATA_SECRET_KEY,
    };
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Market Data API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (marketDataError: any) {
      // Her iki API de başarısız olursa hatayı fırlat
      console.error('Both Trading API and Market Data API failed for assets:', marketDataError);
      throw new Error(`Assets endpoint mevcut değil veya API key'ler yanlış yapılandırılmış. Trading API: ${error.message}, Market Data API: ${marketDataError.message}`);
    }
  }
}

/**
 * Alpaca'da hesabı kapatır (CLOSED durumuna alır)
 */
export async function closeAlpacaAccount(accountId: string): Promise<any> {
  try {
    const closePayload = {
      status: 'CLOSED',
      reason: 'Hesap kullanıcı talebi üzerine kapatıldı',
    };
    
    // Broker API kullanarak hesabı kapat
    return alpacaRequest(
      `trading/accounts/${accountId}`,
      'PATCH',
      closePayload,
      true, // useBrokerAPI
      accountId
    );
  } catch (error: any) {
    console.error('Alpaca close account error:', error);
    throw error;
  }
}

/**
 * Alpaca'da yeni trading hesabı oluşturur (Broker API)
 */
export async function createAlpacaAccount(data: {
  contact: {
    email_address: string;
    phone_number?: string;
    street_address?: string[];
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  identity: {
    given_name: string;
    family_name: string;
    date_of_birth?: string;
    tax_id?: string;
    tax_id_type?: 'USA_SSN' | 'USA_ITIN' | 'USA_EIN' | 'NON_USA';
    country_of_citizenship?: string;
    country_of_birth?: string;
    country_of_tax_residence?: string;
    funding_source?: string[];
  };
  disclosures?: {
    is_control_person?: boolean;
    is_affiliated_exchange_or_finra?: boolean;
    is_politically_exposed?: boolean;
    immediate_family_exposed?: boolean;
  };
  agreements?: Array<{
    agreement: string;
    signed_at?: string;
    ip_address?: string;
  }>;
  trusted_contact?: {
    given_name?: string;
    family_name?: string;
    email_address?: string;
    phone_number?: string;
    street_address?: string[];
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  enabled_assets?: string[]; // ['us_equity', 'us_option', 'crypto']
}): Promise<any> {
  const accountPayload = {
    contact: data.contact,
    identity: data.identity,
    ...(data.disclosures && { disclosures: data.disclosures }),
    ...(data.agreements && { agreements: data.agreements }),
    ...(data.trusted_contact && { trusted_contact: data.trusted_contact }),
    ...(data.enabled_assets && { enabled_assets: data.enabled_assets }),
  };
  
  // Broker API kullan (v1/accounts)
  return alpacaRequest('accounts', 'POST', accountPayload, true);
}

/**
 * Alpaca hesabına para yatırır (funding/deposit)
 * Not: Sandbox ortamında bu işlem sınırlı olabilir
 */
export async function depositToAlpacaAccount(data: {
  accountId: string;
  amount: number;
  currency?: string;
  notes?: string;
}): Promise<any> {
  try {
    // Alpaca Broker API'de funding endpoint'i
    // Not: Sandbox'ta bu endpoint sınırlı olabilir, gerçek ortamda kullanılmalı
    const fundingPayload = {
      amount: data.amount.toString(),
      currency: data.currency || 'USD',
      notes: data.notes || `Deposit from Mambu account`,
    };
    
    // Broker API kullan (v1/accounts/{accountId}/funding veya benzeri)
    // Not: Alpaca'nın gerçek funding endpoint'i dokümantasyondan kontrol edilmeli
    // Şimdilik accounts/{accountId} endpoint'ine POST yapıyoruz
    return alpacaRequest(`accounts/${data.accountId}/funding`, 'POST', fundingPayload, true);
  } catch (error: any) {
    console.error('Alpaca deposit error:', error);
    throw error;
  }
}

/**
 * Alpaca hesabından para çeker (withdrawal)
 * Not: Sandbox ortamında bu işlem sınırlı olabilir
 */
export async function withdrawFromAlpacaAccount(data: {
  accountId: string;
  amount: number;
  currency?: string;
  notes?: string;
}): Promise<any> {
  try {
    // Alpaca Broker API'de withdrawal endpoint'i
    // Not: Sandbox'ta bu endpoint sınırlı olabilir, gerçek ortamda kullanılmalı
    const withdrawalPayload = {
      amount: data.amount.toString(),
      currency: data.currency || 'USD',
      notes: data.notes || `Withdrawal to Mambu account`,
    };
    
    // Broker API kullan (v1/accounts/{accountId}/withdrawal veya benzeri)
    // Not: Alpaca'nın gerçek withdrawal endpoint'i dokümantasyondan kontrol edilmeli
    return alpacaRequest(`accounts/${data.accountId}/withdrawal`, 'POST', withdrawalPayload, true);
  } catch (error: any) {
    console.error('Alpaca withdrawal error:', error);
    throw error;
  }
}

/**
 * Email ile Alpaca hesabı bulur
 */
export async function findAlpacaAccountByEmail(email: string): Promise<any | null> {
  try {
    const accounts = await getAlpacaAccounts();
    if (!Array.isArray(accounts)) {
      return null;
    }
    
    const account = accounts.find((acc: any) => 
      acc.contact?.email_address === email || 
      acc.email === email ||
      acc.email_address === email
    );
    
    return account || null;
  } catch (error: any) {
    console.error('Find Alpaca account by email error:', error);
    return null;
  }
}

/**
 * Alpaca'da hesap izinlerini günceller (opsiyon ve kripto)
 */
export async function updateAlpacaAccountPermissions(
  accountId: string,
  permissions: {
    options_enabled?: boolean;
    crypto_enabled?: boolean;
  }
): Promise<any> {
  try {
    // Alpaca'da izin güncelleme için PATCH endpoint'i kullanılır
    // enabled_assets array'i ile kontrol edilir
    const currentAccount = await getAlpacaAccount(accountId);
    const currentAssets = currentAccount?.enabled_assets || [];
    
    const updatedAssets = [...currentAssets];
    
    // Opsiyon izni
    if (permissions.options_enabled !== undefined) {
      if (permissions.options_enabled && !updatedAssets.includes('us_option')) {
        updatedAssets.push('us_option');
      } else if (!permissions.options_enabled && updatedAssets.includes('us_option')) {
        updatedAssets.splice(updatedAssets.indexOf('us_option'), 1);
      }
    }
    
    // Kripto izni
    if (permissions.crypto_enabled !== undefined) {
      if (permissions.crypto_enabled && !updatedAssets.includes('crypto')) {
        updatedAssets.push('crypto');
      } else if (!permissions.crypto_enabled && updatedAssets.includes('crypto')) {
        updatedAssets.splice(updatedAssets.indexOf('crypto'), 1);
      }
    }
    
    const updatePayload = {
      enabled_assets: updatedAssets,
    };
    
    // Broker API kullan (v1/accounts/{accountId})
    return alpacaRequest(`accounts/${accountId}`, 'PATCH', updatePayload, true);
  } catch (error: any) {
    console.error('Update Alpaca account permissions error:', error);
    throw error;
  }
}

/**
 * Alpaca API yapılandırmasını kontrol eder
 */
export function isAlpacaConfigured(): boolean {
  return !!(ALPACA_API_KEY && ALPACA_SECRET_KEY);
}
