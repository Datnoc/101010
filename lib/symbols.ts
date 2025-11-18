/**
 * Popüler hisse senedi sembolleri ve isimleri
 * Alpaca API'den veya başka bir kaynaktan güncellenebilir
 */

export interface SymbolOption {
  symbol: string;
  name: string;
  exchange?: string;
}

export const popularSymbols: SymbolOption[] = [
  // Technology
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'AMD', name: 'Advanced Micro Devices' },
  { symbol: 'INTC', name: 'Intel Corporation' },
  { symbol: 'ORCL', name: 'Oracle Corporation' },
  { symbol: 'CRM', name: 'Salesforce Inc.' },
  { symbol: 'ADBE', name: 'Adobe Inc.' },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.' },
  
  // Finance
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'BAC', name: 'Bank of America Corp.' },
  { symbol: 'WFC', name: 'Wells Fargo & Company' },
  { symbol: 'GS', name: 'Goldman Sachs Group Inc.' },
  { symbol: 'MS', name: 'Morgan Stanley' },
  { symbol: 'C', name: 'Citigroup Inc.' },
  
  // Consumer
  { symbol: 'WMT', name: 'Walmart Inc.' },
  { symbol: 'HD', name: 'The Home Depot Inc.' },
  { symbol: 'MCD', name: "McDonald's Corporation" },
  { symbol: 'NKE', name: 'Nike Inc.' },
  { symbol: 'SBUX', name: 'Starbucks Corporation' },
  { symbol: 'DIS', name: 'The Walt Disney Company' },
  
  // Healthcare
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
  { symbol: 'PFE', name: 'Pfizer Inc.' },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.' },
  { symbol: 'ABBV', name: 'AbbVie Inc.' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific Inc.' },
  
  // Energy
  { symbol: 'XOM', name: 'Exxon Mobil Corporation' },
  { symbol: 'CVX', name: 'Chevron Corporation' },
  { symbol: 'COP', name: 'ConocoPhillips' },
  
  // Industrial
  { symbol: 'BA', name: 'The Boeing Company' },
  { symbol: 'CAT', name: 'Caterpillar Inc.' },
  { symbol: 'GE', name: 'General Electric Company' },
  { symbol: 'HON', name: 'Honeywell International Inc.' },
  
  // Communication
  { symbol: 'VZ', name: 'Verizon Communications Inc.' },
  { symbol: 'T', name: 'AT&T Inc.' },
  { symbol: 'CMCSA', name: 'Comcast Corporation' },
  
  // Other Popular
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'MA', name: 'Mastercard Incorporated' },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.' },
  { symbol: 'COIN', name: 'Coinbase Global Inc.' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust' },
];

/**
 * Sembol arama fonksiyonu (local fallback)
 */
export function searchSymbols(query: string, limit: number = 10): SymbolOption[] {
  if (!query || query.length < 1) {
    return popularSymbols.slice(0, limit);
  }

  const upperQuery = query.toUpperCase();
  
  return popularSymbols
    .filter(symbol => 
      symbol.symbol.includes(upperQuery) || 
      symbol.name.toUpperCase().includes(upperQuery)
    )
    .slice(0, limit);
}

/**
 * API'den sembol arama (tüm hisseler için)
 */
export async function searchSymbolsFromAPI(query: string, limit: number = 20): Promise<SymbolOption[]> {
  try {
    const response = await fetch(`/api/alpaca/symbols?q=${encodeURIComponent(query)}&limit=${limit}`);
    const data = await response.json();
    
    if (data.success && data.symbols) {
      return data.symbols.map((s: any) => ({
        symbol: s.symbol,
        name: s.name,
        exchange: s.exchange,
      }));
    }
    
    // Fallback to local
    return searchSymbols(query, limit);
  } catch (error) {
    console.error('API symbol search error:', error);
    // Fallback to local
    return searchSymbols(query, limit);
  }
}

