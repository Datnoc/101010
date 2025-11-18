"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown, DollarSign, AlertCircle, CheckCircle, Loader2, Search, CheckCircle2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar, Cell } from "recharts";
import { searchSymbols, searchSymbolsFromAPI, SymbolOption } from "@/lib/symbols";

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "buy" | "sell";
  symbol?: string;
  assetType?: "stock" | "crypto"; // Yeni: varlık tipi
  accountData?: any; // Hesap bilgileri (bakiye kontrolü için)
  positions?: any[]; // Mevcut pozisyonlar (satış için)
  cryptoPositions?: any[]; // Mevcut kripto pozisyonları
  optionsPositions?: any[]; // Mevcut opsiyon pozisyonları
  onSuccess?: () => void; // İşlem başarılı olduğunda çağrılacak callback
}

export default function TradeModal({ isOpen, onClose, type, symbol: initialSymbol = "", assetType = "stock", accountData, positions = [], cryptoPositions = [], optionsPositions = [], onSuccess }: TradeModalProps) {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [quantity, setQuantity] = useState("");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Partial order (parçalı alım) states
  const [isPartialOrder, setIsPartialOrder] = useState(false);
  const [partialCount, setPartialCount] = useState("2");
  const [partialInterval, setPartialInterval] = useState("5"); // dakika
  
  // Chart states
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"1W" | "1M" | "3M" | "6M" | "1Y" | "all" | "LIVE">("1M");
  const [chartType, setChartType] = useState<"line" | "candlestick">("line");
  
  // Chart interaction states (same as dashboard)
  const [chartZoom, setChartZoom] = useState({ start: 0, end: 100 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingTool, setDrawingTool] = useState<'line' | 'marker' | null>(null);
  const [drawings, setDrawings] = useState<Array<{ type: 'line' | 'marker'; points: Array<{ x: number; y: number }>; color: string }>>([]);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  
  // Live price states
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [livePriceLoading, setLivePriceLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [previousLivePrice, setPreviousLivePrice] = useState<number | null>(null);
  const [priceChangeDirection, setPriceChangeDirection] = useState<'up' | 'down' | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  // Symbol autocomplete states
  const [symbolSuggestions, setSymbolSuggestions] = useState<SymbolOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [symbolInput, setSymbolInput] = useState(initialSymbol);
  const symbolInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sembolü temizle
    const cleanSymbol = symbol?.trim().toUpperCase() || '';
    
    if (!cleanSymbol || !quantity) {
      setStatus("error");
      setErrorMessage("Lütfen sembol ve miktar girin.");
      return;
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      setStatus("error");
      setErrorMessage("Geçerli bir miktar girin.");
      return;
    }

    let estimatedCost = 0;
    if (type === "buy") {
      if (orderType === "limit" && limitPrice) {
        estimatedCost = parseFloat(limitPrice) * qty;
      } else if (livePrice) {
        estimatedCost = livePrice * qty;
      } else {
        try {
          const priceRes = await fetch(
            `/api/alpaca/market-data/latest?symbol=${cleanSymbol}&assetType=${assetType}`,
            { cache: "no-store" }
          );
          if (priceRes.ok) {
            const priceData = await priceRes.json();
            const price = assetType === "crypto"
              ? parseFloat(priceData.price || priceData.last || "0")
              : parseFloat(priceData.last?.trade?.p || priceData.last?.price || "0");
            estimatedCost = price * qty;
          }
        } catch (e) {
          console.error("Price fetch error:", e);
        }
      }
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      // Kullanıcıya özel account ID'yi al (Dashboard ile aynı mantık)
      let accountId: string | null = null;
      
      // Önce kullanıcının account ID'sini kontrol et (Mambu'dan veya localStorage'dan)
      try {
        const savedUser = localStorage.getItem("mambu_user");
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          if (userData.alpacaAccountId) {
            accountId = userData.alpacaAccountId;
          }
        }
      } catch (error) {
        console.error('User data parse error:', error);
      }
      
      // Eğer account ID yoksa, Broker API'den hesapları al
      if (!accountId) {
        try {
          const accountsRes = await fetch('/api/alpaca/accounts');
          if (accountsRes.ok) {
            const accountsData = await accountsRes.json();
            const accounts = accountsData.accounts || [];
            
            if (accounts.length > 0) {
              // İlk hesabı kullan veya kullanıcıya özel hesabı bul
              const savedUser = localStorage.getItem("mambu_user");
              let userEmail = null;
              if (savedUser) {
                try {
                  const userData = JSON.parse(savedUser);
                  userEmail = userData.email;
                } catch (e) {
                  // ignore
                }
              }
              
              const userAccount = userEmail 
                ? accounts.find((acc: any) => 
                    acc.email === userEmail || 
                    acc.contact?.email === userEmail
                  )
                : null;
              
              accountId = userAccount?.id || 
                          userAccount?.account_number || 
                          userAccount?.encodedKey ||
                          accounts[0].id || 
                          accounts[0].account_number || 
                          accounts[0].encodedKey ||
                          null;
            }
          }
        } catch (error) {
          console.error('Accounts fetch error:', error);
        }
      }
      
      // Son çare: Demo hesap için default account ID
      if (!accountId) {
        accountId = 'd005ca65-a340-4373-b783-41a0ca3d13f9';
      }
      
      if (!accountId) {
        setStatus("error");
        setErrorMessage("Account ID bulunamadı");
        return;
      }

      // Güncel hesap verisini alıp bakiye kontrolü yap
      if (type === "buy") {
        let latestAccountSnapshot = accountData;
        try {
          const accountResponse = await fetch(
            `/api/alpaca/account?accountId=${accountId}&ts=${Date.now()}`,
            { cache: "no-store" }
          );
          if (accountResponse.ok) {
            const accountJson = await accountResponse.json();
            latestAccountSnapshot = accountJson.account;
          }
        } catch (refreshError) {
          console.warn("Latest account fetch error:", refreshError);
        }

        if (latestAccountSnapshot) {
          const buyingPower = parseFloat(
            latestAccountSnapshot.buying_power || latestAccountSnapshot.cash || "0"
          );
          if (estimatedCost > buyingPower) {
            setStatus("error");
            setErrorMessage(
              `Yetersiz bakiye! Gerekli: $${estimatedCost.toFixed(2)}, Mevcut: $${buyingPower.toFixed(2)}. Lütfen hesabınıza para yatırın.`
            );
            return;
          }
        }
      }

      // Parçalı alım kontrolü
      if (isPartialOrder) {
        const count = parseInt(partialCount);
        const interval = parseInt(partialInterval);
        const totalQty = parseFloat(quantity);
        
        if (isNaN(count) || count < 2 || count > 10) {
          setStatus("error");
          setErrorMessage("Parça sayısı 2-10 arasında olmalıdır.");
          return;
        }
        
        if (isNaN(interval) || interval < 1 || interval > 60) {
          setStatus("error");
          setErrorMessage("Parçalar arası süre 1-60 dakika arasında olmalıdır.");
          return;
        }
        
        const qtyPerPart = Math.floor(totalQty / count);
        const remainder = totalQty % count;
        
        // İlk emri hemen gönder
        const apiEndpoint = assetType === "crypto" ? "/api/alpaca/crypto" : "/api/alpaca/orders";
        const firstResponse = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accountId,
            symbol: cleanSymbol,
            qty: qtyPerPart + remainder, // Kalanı ilk parçaya ekle
            side: type,
            type: orderType,
            time_in_force: assetType === "crypto" ? "gtc" : "day", // Kripto için GTC
            ...(orderType === "limit" && limitPrice && { limit_price: parseFloat(limitPrice) }),
          }),
        });
        
        if (!firstResponse.ok) {
          const errorData = await firstResponse.json();
          setStatus("error");
          setErrorMessage(errorData.message || errorData.error || "İlk emir gönderilemedi");
          return;
        }
        
        // Diğer parçaları zamanlayarak gönder
        for (let i = 1; i < count; i++) {
          setTimeout(async () => {
            try {
              await fetch(apiEndpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  accountId,
                  symbol: cleanSymbol,
                  qty: qtyPerPart,
                  side: type,
                  type: orderType,
                  time_in_force: assetType === "crypto" ? "gtc" : "day",
                  ...(orderType === "limit" && limitPrice && { limit_price: parseFloat(limitPrice) }),
                }),
              });
            } catch (error) {
              console.error(`Parça ${i + 1} emir hatası:`, error);
            }
          }, i * interval * 60 * 1000); // dakika -> milisaniye
        }
        
        setStatus("success");
        setErrorMessage("");
        setShowSuccessToast(true);
        setTimeout(() => {
          setShowSuccessToast(false);
          handleClose();
          if (onSuccess) {
            onSuccess();
          }
        }, 3000);
        return;
      }

      // Normal tek emir
      const apiEndpoint = assetType === "crypto" ? "/api/alpaca/crypto" : "/api/alpaca/orders";
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId,
          symbol: cleanSymbol,
          qty: parseFloat(quantity),
          side: type,
          type: orderType,
          time_in_force: assetType === "crypto" ? "gtc" : "day", // Kripto için GTC
          ...(orderType === "limit" && limitPrice && { limit_price: parseFloat(limitPrice) }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(data.message || data.error || "İşlem başarısız.");
        return;
      }

      setStatus("success");
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        handleClose();
        if (onSuccess) {
          onSuccess();
        }
      }, 3000);
    } catch (error: any) {
      setStatus("error");
      setErrorMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
      console.error("Trade error:", error);
    }
  };

  // Symbol suggestions - API'den tüm hisseler veya kripto için
  useEffect(() => {
    let isCancelled = false;
    
    const fetchSuggestions = async () => {
      if (symbolInput.length >= 1) {
        try {
          if (assetType === "crypto") {
            // Kripto için popüler kripto paraları filtrele
            const cryptoSymbols: SymbolOption[] = [
              { symbol: 'BTCUSD', name: 'Bitcoin' },
              { symbol: 'ETHUSD', name: 'Ethereum' },
              { symbol: 'SOLUSD', name: 'Solana' },
              { symbol: 'ADAUSD', name: 'Cardano' },
              { symbol: 'DOTUSD', name: 'Polkadot' },
              { symbol: 'MATICUSD', name: 'Polygon' },
              { symbol: 'AVAXUSD', name: 'Avalanche' },
              { symbol: 'LINKUSD', name: 'Chainlink' },
              { symbol: 'UNIUSD', name: 'Uniswap' },
              { symbol: 'ATOMUSD', name: 'Cosmos' },
              { symbol: 'ALGOUSD', name: 'Algorand' },
              { symbol: 'FILUSD', name: 'Filecoin' },
              { symbol: 'AAVEUSD', name: 'Aave' },
              { symbol: 'COMPUSD', name: 'Compound' },
              { symbol: 'MKRUSD', name: 'Maker' },
            ];
            
            const filtered = cryptoSymbols.filter(c => 
              c.symbol.toLowerCase().includes(symbolInput.toLowerCase()) ||
              c.name.toLowerCase().includes(symbolInput.toLowerCase())
            );
            
            if (!isCancelled) {
              setSymbolSuggestions(filtered.slice(0, 10));
              setShowSuggestions(filtered.length > 0);
            }
          } else {
            // API'den tüm hisseler için arama yap
            const suggestions = await searchSymbolsFromAPI(symbolInput, 10);
            if (!isCancelled) {
              setSymbolSuggestions(suggestions);
              setShowSuggestions(suggestions.length > 0);
            }
          }
        } catch (error) {
          console.error('Symbol search error:', error);
          // Fallback to local
          if (!isCancelled) {
            if (assetType === "crypto") {
              const cryptoSymbols: SymbolOption[] = [
                { symbol: 'BTCUSD', name: 'Bitcoin' },
                { symbol: 'ETHUSD', name: 'Ethereum' },
                { symbol: 'SOLUSD', name: 'Solana' },
              ];
              const filtered = cryptoSymbols.filter(c => 
                c.symbol.toLowerCase().includes(symbolInput.toLowerCase()) ||
                c.name.toLowerCase().includes(symbolInput.toLowerCase())
              );
              setSymbolSuggestions(filtered);
              setShowSuggestions(filtered.length > 0);
            } else {
              const localSuggestions = searchSymbols(symbolInput, 8);
              setSymbolSuggestions(localSuggestions);
              setShowSuggestions(localSuggestions.length > 0);
            }
          }
        }
      } else {
        // Boşsa popüler sembolleri göster
        if (assetType === "crypto") {
          const popularCryptos: SymbolOption[] = [
            { symbol: 'BTCUSD', name: 'Bitcoin' },
            { symbol: 'ETHUSD', name: 'Ethereum' },
            { symbol: 'SOLUSD', name: 'Solana' },
            { symbol: 'ADAUSD', name: 'Cardano' },
            { symbol: 'DOTUSD', name: 'Polkadot' },
          ];
          setSymbolSuggestions(popularCryptos);
          setShowSuggestions(false);
        } else {
          const popular = searchSymbols('', 8);
          setSymbolSuggestions(popular);
          setShowSuggestions(false);
        }
      }
    };

    // Debounce
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [symbolInput, assetType]);

  // Modal açıldığında veya assetType değiştiğinde popüler sembolleri göster
  useEffect(() => {
    if (isOpen) {
      if (assetType === "crypto") {
        const popularCryptos: SymbolOption[] = [
          { symbol: 'BTCUSD', name: 'Bitcoin' },
          { symbol: 'ETHUSD', name: 'Ethereum' },
          { symbol: 'SOLUSD', name: 'Solana' },
          { symbol: 'ADAUSD', name: 'Cardano' },
          { symbol: 'DOTUSD', name: 'Polkadot' },
        ];
        setSymbolSuggestions(popularCryptos);
      } else {
        const popular = searchSymbols('', 8);
        setSymbolSuggestions(popular);
      }
    }
  }, [isOpen, assetType]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        symbolInputRef.current &&
        !symbolInputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch chart data function
  const fetchChartData = useCallback(async () => {
    if (!symbol) return;
    
    // Sembolü temizle (boşlukları kaldır)
    const cleanSymbol = symbol.trim().toUpperCase();
    if (!cleanSymbol) return;
    
    setChartLoading(true);
    try {
      // Period'a göre timeframe belirle
      let chartPeriod = '1M';
      let chartTimeframe = '1Day';
      
      if (selectedPeriod === 'LIVE') {
        // Canlı mod: 5 dakikalık veri, 1 haftalık period
        chartPeriod = '1W';
        chartTimeframe = '5Min';
      } else if (selectedPeriod === '1W') {
        chartPeriod = '1W';
        chartTimeframe = '1Hour';
      } else if (selectedPeriod === '1M') {
        chartPeriod = '1M';
        chartTimeframe = '1Day';
      } else if (selectedPeriod === '3M') {
        chartPeriod = '3M';
        chartTimeframe = '1Day';
      } else if (selectedPeriod === '6M') {
        chartPeriod = '6M';
        chartTimeframe = '1Day';
      } else if (selectedPeriod === '1Y') {
        chartPeriod = '1Y';
        chartTimeframe = '1Week';
      } else if (selectedPeriod === 'all') {
        chartPeriod = '2Y';
        chartTimeframe = '1Week';
      }
      
      // Kripto için farklı endpoint kullan
      const endpoint = assetType === "crypto" 
        ? `/api/alpaca/crypto/market-data?symbol=${encodeURIComponent(cleanSymbol)}&period=${chartPeriod}&timeframe=${chartTimeframe}`
        : `/api/alpaca/market-data?symbol=${encodeURIComponent(cleanSymbol)}&period=${chartPeriod}&timeframe=${chartTimeframe}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.success && data.bars) {
        let barsToProcess = data.bars;
        
        // LIVE modunda bugünün pre-market, regular market ve after-market verilerini göster (sadece borsa için)
        if (selectedPeriod === 'LIVE' && assetType !== 'crypto') {
          const now = new Date();
          const todayET = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
          todayET.setHours(9, 30, 0, 0); // Piyasa açılış saati: 09:30 ET
          
          // Pre-market başlangıcı: 04:00 ET (after-market 20:00 ET'de bitiyor)
          const preMarketStartET = new Date(todayET);
          preMarketStartET.setHours(4, 0, 0, 0);
          
          // Bugünün tarihini kontrol et
          const todayDate = todayET.toDateString();
          
          // Önce bugünün verilerini filtrele (pre-market, regular market ve after-market dahil)
          const todayBars = data.bars.filter((bar: any) => {
            const barDate = new Date(bar.t);
            const barDateET = new Date(barDate.toLocaleString('en-US', { timeZone: 'America/New_York' }));
            
            // Sadece bugünün verilerini al
            if (barDateET.toDateString() !== todayDate) {
              return false;
            }
            
            // Pre-market (04:00 ET), regular market (09:30 ET) ve after-market (16:00-20:00 ET) saatlerinden itibaren
            return barDateET >= preMarketStartET;
          });
          
          // Eğer bugünün verisi varsa onu kullan, yoksa son mevcut verileri göster
          if (todayBars.length > 0) {
            barsToProcess = todayBars;
          } else {
            // Bugünün verisi yoksa, en son mevcut verileri göster (en son 200 nokta)
            barsToProcess = data.bars.slice(-200);
          }
        }
        
        // Format data for Recharts
        const formattedData = barsToProcess.map((bar: any) => {
          // LIVE (5Min) için saat:dakika, diğerleri için tarih göster
          const timeStr = selectedPeriod === 'LIVE'
            ? new Date(bar.t).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
            : new Date(bar.t).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
          
          return {
            date: timeStr,
            time: timeStr,
            timestamp: new Date(bar.t).getTime(),
            price: parseFloat(bar.c), // Close price
            high: parseFloat(bar.h),
            low: parseFloat(bar.l),
            open: parseFloat(bar.o),
            close: parseFloat(bar.c),
            volume: parseFloat(bar.v),
          };
        }).sort((a: any, b: any) => a.timestamp - b.timestamp);
        setChartData(formattedData);
      }
    } catch (error) {
      console.error('Chart data error:', error);
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  }, [symbol, selectedPeriod, assetType]);

  // Fetch chart data when symbol or period changes
  useEffect(() => {
    if (isOpen && symbol && symbol.length >= 1) {
      // Debounce için kısa bir gecikme
      const timer = setTimeout(() => {
        fetchChartData();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [symbol, selectedPeriod, isOpen, assetType, fetchChartData]);

  // Fetch live price
  const fetchLivePrice = async () => {
    if (!symbol || symbol.length < 1) {
      setLivePrice(null);
      return;
    }

    const cleanSymbol = symbol.trim().toUpperCase();
    if (!cleanSymbol) return;

    setLivePriceLoading(true);
    try {
      // Kripto için farklı endpoint kullan
      if (assetType === "crypto") {
        // Kripto için bars endpoint'inden son fiyatı al
        const response = await fetch(`/api/alpaca/crypto/market-data?symbol=${encodeURIComponent(cleanSymbol)}&timeframe=1Day&period=1W`);
        const data = await response.json();
        
        if (data.success && data.bars && data.bars.length > 0) {
          const latestBar = data.bars[data.bars.length - 1];
          const newPrice = parseFloat(latestBar.c || latestBar.o || '0');
          
          // Önceki fiyatla karşılaştır ve animasyon için direction belirle
          setLivePrice(prevPrice => {
            if (prevPrice !== null && prevPrice !== newPrice) {
              const priceDiff = newPrice - prevPrice;
              if (priceDiff > 0.01) {
                setPriceChangeDirection('up');
                setTimeout(() => setPriceChangeDirection(null), 3000);
              } else if (priceDiff < -0.01) {
                setPriceChangeDirection('down');
                setTimeout(() => setPriceChangeDirection(null), 3000);
              }
            }
            setPreviousLivePrice(prevPrice);
            return newPrice;
          });
        }
      } else {
        const response = await fetch(`/api/alpaca/market-data/latest?symbol=${encodeURIComponent(cleanSymbol)}`);
        const data = await response.json();
        
        if (data.success && data.price) {
          const newPrice = parseFloat(data.price);
          
          // Önceki fiyatla karşılaştır ve animasyon için direction belirle
          setLivePrice(prevPrice => {
            if (prevPrice !== null && prevPrice !== newPrice) {
              const priceDiff = newPrice - prevPrice;
              if (priceDiff > 0.01) {
                setPriceChangeDirection('up');
                setTimeout(() => setPriceChangeDirection(null), 3000);
              } else if (priceDiff < -0.01) {
                setPriceChangeDirection('down');
                setTimeout(() => setPriceChangeDirection(null), 3000);
              }
            }
            setPreviousLivePrice(prevPrice);
            return newPrice;
          });
        }
      }
    } catch (error) {
      console.error('Live price error:', error);
    } finally {
      setLivePriceLoading(false);
    }
  };

  // initialSymbol prop'u değiştiğinde state'leri güncelle
  useEffect(() => {
    if (initialSymbol) {
      setSymbol(initialSymbol);
      setSymbolInput(initialSymbol);
    }
  }, [initialSymbol]);

  // Fetch live price when symbol changes
  useEffect(() => {
    if (isOpen && symbol && symbol.length >= 1) {
      fetchLivePrice();
      // Her 3 saniyede bir canlı fiyat güncelle (anlık fiyat güncellemesi için)
      const interval = setInterval(() => {
        fetchLivePrice();
      }, 3000);

      return () => clearInterval(interval);
    } else {
      setLivePrice(null);
      setPreviousLivePrice(null);
      setPriceChangeDirection(null);
    }
  }, [symbol, isOpen, assetType]);

  // Canlı fiyat güncellemesi ve grafik verisine ekleme (canlı mod seçiliyse)
  useEffect(() => {
    if (!isOpen || !symbol || symbol.length < 1 || selectedPeriod !== 'LIVE') return;

    const updateLivePriceAndChart = async () => {
      const cleanSymbol = symbol.trim().toUpperCase();
      if (!cleanSymbol) return;

      try {
        const latestEndpoint = assetType === "crypto"
          ? `/api/alpaca/crypto/latest?symbol=${cleanSymbol}`
          : `/api/alpaca/market-data/latest?symbol=${cleanSymbol}`;
        
        const latestResponse = await fetch(latestEndpoint);
        if (latestResponse.ok) {
          const latestData = await latestResponse.json();
          if (latestData.success && latestData.price) {
            const newPrice = parseFloat(latestData.price);
            setLivePrice(newPrice);
            
            // Grafik verisine yeni nokta ekle
            const now = new Date();
            const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
            
            setChartData(prev => {
              if (prev.length === 0) return prev;
              
              // Son noktayı kontrol et, eğer aynı 5 dakikalık periyottaysa güncelle, değilse yeni ekle
              const lastPoint = prev[prev.length - 1];
              const nowTime = now.getTime();
              const lastTime = lastPoint ? lastPoint.timestamp : 0;
              const timeDiff = nowTime - lastTime;
              
              // 5 dakika = 300000 ms, eğer 5 dakikadan az geçtiyse son noktayı güncelle
              if (lastPoint && timeDiff < 300000 && timeDiff > 0) {
                // Aynı 5 dakikalık periyot içindeyse son noktayı güncelle
                const updatedPoint = {
                  ...lastPoint,
                  price: newPrice,
                  close: newPrice, // Close değerini de güncelle
                  time: timeStr,
                  date: timeStr,
                  timestamp: nowTime,
                  high: Math.max(lastPoint.high || newPrice, newPrice),
                  low: Math.min(lastPoint.low || newPrice, newPrice),
                };
                // Sadece son noktayı güncelle, tüm array'i yeniden oluşturma
                const updated = [...prev];
                updated[updated.length - 1] = updatedPoint;
                return updated;
              } else if (timeDiff >= 300000) {
                // Yeni 5 dakikalık nokta ekle (son 200 noktayı tut)
                const newPoint = {
                  time: timeStr,
                  date: timeStr,
                  timestamp: nowTime,
                  price: newPrice,
                  high: newPrice,
                  low: newPrice,
                  open: lastPoint ? lastPoint.price : newPrice,
                  close: newPrice,
                  volume: 0,
                };
                return [...prev.slice(-199), newPoint];
              }
              return prev;
            });
          }
        }
      } catch (error) {
        console.error('Live price update error:', error);
      }
    };

    // İlk yükleme
    updateLivePriceAndChart();
    
    // Her 10 saniyede bir güncelle
    const interval = setInterval(updateLivePriceAndChart, 10000);
    
    return () => clearInterval(interval);
  }, [isOpen, symbol, selectedPeriod, assetType]);

  // Chart verisini periyodik olarak güncelle (canlı mod seçiliyse)
  useEffect(() => {
    if (!isOpen || !symbol || symbol.length < 1 || selectedPeriod !== 'LIVE') return;

    const updateChartData = async () => {
      await fetchChartData();
    };

    // Her 5 dakikada bir grafik verisini güncelle (5 dakikalık bar'lar için yeni bar eklendiğinde)
    const interval = setInterval(updateChartData, 300000);
    
    return () => clearInterval(interval);
  }, [isOpen, symbol, selectedPeriod, assetType, fetchChartData]);

  // Calculate total price when quantity or live price changes
  useEffect(() => {
    if (livePrice && quantity) {
      const qty = parseFloat(quantity);
      if (!isNaN(qty) && qty > 0) {
        setTotalPrice(qty * livePrice);
      } else {
        setTotalPrice(0);
      }
    } else {
      setTotalPrice(0);
    }
  }, [quantity, livePrice]);

  const handleSymbolSelect = (selectedSymbol: SymbolOption) => {
    const cleanSymbol = selectedSymbol.symbol.trim().toUpperCase();
    setSymbol(cleanSymbol);
    setSymbolInput(cleanSymbol);
    setShowSuggestions(false);
  };

  const handleSymbolInputChange = (value: string) => {
    const cleanValue = value.trim().toUpperCase();
    setSymbolInput(cleanValue);
    setSymbol(cleanValue);
  };

  const handleClose = () => {
    if (status !== "loading") {
      setSymbol(initialSymbol);
      setSymbolInput(initialSymbol);
      setQuantity("");
      setOrderType("market");
      setLimitPrice("");
      setStatus("idle");
      setErrorMessage("");
      setChartData([]);
      setSelectedPeriod("1M");
      setShowSuggestions(false);
      setIsPartialOrder(false);
      setPartialCount("2");
      setPartialInterval("5");
      setShowSuccessToast(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {/* Success Toast Notification */}
      {showSuccessToast && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-4 right-4 z-[100] bg-white rounded-xl shadow-2xl border border-green-200 p-4 min-w-[320px] max-w-md"
        >
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"
            >
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </motion.div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-sm mb-1">
                İşlem Başarılı!
              </h3>
              <p className="text-xs text-gray-600">
                {type === "buy" 
                  ? (assetType === "crypto" ? "Kripto alım emri" : "Hisse senedi alım emri")
                  : (assetType === "crypto" ? "Kripto satım emri" : "Hisse senedi satım emri")
                } başarıyla gönderildi.
              </p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </motion.div>
      )}

      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  {type === "buy" ? (
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    </div>
                  )}
                  <h2 className="text-2xl font-bold text-gray-900">
                    {type === "buy" 
                      ? (assetType === "crypto" ? "Kripto Al" : "Hisse Senedi Al")
                      : (assetType === "crypto" ? "Kripto Sat" : "Hisse Senedi Sat")
                    }
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  disabled={status === "loading"}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {status === "error" && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{errorMessage}</p>
                  </div>
                )}

                {status === "success" && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-green-700 text-sm">İşlem başarıyla gönderildi!</p>
                  </div>
                )}

                {/* Mevcut Pozisyonlar - Sadece Satış Modunda */}
                {type === "sell" && (() => {
                  const relevantPositions = assetType === "crypto" 
                    ? cryptoPositions.filter((p: any) => parseFloat(p.qty || '0') > 0)
                    : assetType === "stock"
                    ? positions.filter((p: any) => p.asset_class === 'us_equity' && parseFloat(p.qty || '0') > 0)
                    : [];
                  
                  if (relevantPositions.length === 0) return null;
                  
                  return (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Mevcut Pozisyonlarınız
                      </label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {relevantPositions.map((pos: any, index: number) => {
                          const qty = parseFloat(pos.qty || '0');
                          const costBasis = parseFloat(pos.cost_basis || '0');
                          const marketValue = parseFloat(pos.market_value || '0');
                          const unrealizedPL = parseFloat(pos.unrealized_pl || '0');
                          const avgPrice = qty > 0 ? costBasis / qty : 0;
                          const currentPrice = qty > 0 ? marketValue / qty : 0;
                          const symbolKey = pos.symbol || pos.asset_id || '';
                          
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                setSymbol(symbolKey);
                                setSymbolInput(symbolKey);
                                setQuantity(qty.toString());
                                setShowSuggestions(false);
                              }}
                              className="w-full p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-left"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-900 text-sm">{symbolKey}</span>
                                    <span className="text-xs text-gray-500">• {qty.toFixed(4)} adet</span>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-gray-600">
                                    <span>Ort. Fiyat: ${avgPrice.toFixed(2)}</span>
                                    <span>Güncel: ${currentPrice.toFixed(2)}</span>
                                    <span className={unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}>
                                      {unrealizedPL >= 0 ? '+' : ''}${unrealizedPL.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4 flex-shrink-0">
                                  <span className="text-xs text-primary-600 font-medium">Seç</span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Symbol with Autocomplete */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sembol
                  </label>
                  <div className="relative" ref={symbolInputRef}>
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={symbolInput}
                      onChange={(e) => handleSymbolInputChange(e.target.value)}
                      onFocus={() => {
                        if (symbolInput.length >= 1) {
                          setShowSuggestions(true);
                        } else {
                          // Boşsa popüler sembolleri göster
                          if (assetType === "crypto") {
                            const popularCryptos: SymbolOption[] = [
                              { symbol: 'BTCUSD', name: 'Bitcoin' },
                              { symbol: 'ETHUSD', name: 'Ethereum' },
                              { symbol: 'SOLUSD', name: 'Solana' },
                              { symbol: 'ADAUSD', name: 'Cardano' },
                              { symbol: 'DOTUSD', name: 'Polkadot' },
                            ];
                            setSymbolSuggestions(popularCryptos);
                          } else {
                            const popular = searchSymbols('', 8);
                            setSymbolSuggestions(popular);
                          }
                          setShowSuggestions(true);
                        }
                      }}
                      placeholder={assetType === "crypto" ? "Kripto ara (örn: BTC, ETH, SOL)" : "Sembol ara (örn: AAPL, TSLA, MSFT) - Tüm hisseler"}
                      required
                      disabled={status === "loading"}
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all disabled:opacity-50 text-gray-900 bg-white"
                    />
                    
                    {/* Suggestions Dropdown */}
                    {showSuggestions && symbolSuggestions.length > 0 && (
                      <div
                        ref={suggestionsRef}
                        className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto"
                      >
                        {symbolInput.length === 0 && (
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                            <p className="text-xs font-semibold text-gray-600">
                              {assetType === "crypto" ? "Popüler Kripto Paralar" : "Popüler Semboller"}
                            </p>
                          </div>
                        )}
                        {symbolSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.symbol}
                            type="button"
                            onClick={() => handleSymbolSelect(suggestion)}
                            className="w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-gray-900">{suggestion.symbol}</p>
                                  {suggestion.exchange && (
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                      {suggestion.exchange}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 mt-0.5">{suggestion.name}</p>
                              </div>
                              <TrendingUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            </div>
                          </button>
                        ))}
                        {symbolInput.length > 0 && symbolSuggestions.length >= 10 && (
                          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                            <p className="text-xs text-gray-500 text-center">
                              Daha fazla sonuç için arama yapın
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Chart Section */}
                {symbol && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900">
                          {symbol} Fiyat Grafiği
                        </h3>
                        {livePrice !== null && (
                          <motion.div 
                            className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-300 ${
                              priceChangeDirection === 'up' 
                                ? 'bg-green-200' 
                                : priceChangeDirection === 'down'
                                ? 'bg-red-200'
                                : 'bg-green-100'
                            }`}
                            animate={priceChangeDirection ? {
                              scale: [1, 1.05, 1],
                            } : {}}
                            transition={{ duration: 0.5 }}
                          >
                            <motion.div 
                              className={`w-2 h-2 rounded-full ${
                                priceChangeDirection === 'up' 
                                  ? 'bg-green-600' 
                                  : priceChangeDirection === 'down'
                                  ? 'bg-red-600'
                                  : 'bg-green-500'
                              }`}
                              animate={{ 
                                scale: [1, 1.3, 1],
                                opacity: [1, 0.7, 1]
                              }}
                              transition={{ 
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                            <motion.span 
                              key={livePrice}
                              initial={{ scale: 1 }}
                              animate={priceChangeDirection ? {
                                scale: [1, 1.1, 1],
                              } : {}}
                              transition={{ duration: 0.5 }}
                              className={`text-sm font-semibold transition-colors duration-300 ${
                                priceChangeDirection === 'up' 
                                  ? 'text-green-700' 
                                  : priceChangeDirection === 'down'
                                  ? 'text-red-700'
                                  : 'text-green-700'
                              }`}
                            >
                              Canlı: ${livePrice.toFixed(2)}
                            </motion.span>
                            {priceChangeDirection && (
                              <motion.span
                                key={priceChangeDirection}
                                initial={{ opacity: 0, scale: 0.5, x: -5 }}
                                animate={{ 
                                  opacity: 1, 
                                  scale: [0.5, 1.2, 1],
                                  x: 0
                                }}
                                exit={{ opacity: 0, scale: 0.5, x: 5 }}
                                transition={{ 
                                  duration: 0.4,
                                  ease: "easeOut"
                                }}
                                className={`text-lg font-bold ${
                                  priceChangeDirection === 'up' ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {priceChangeDirection === 'up' ? '↑' : '↓'}
                              </motion.span>
                            )}
                          </motion.div>
                        )}
                        {livePriceLoading && (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {chartLoading && (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Period Buttons */}
                    <div className="flex flex-wrap gap-2 mb-4 items-center">
                      {[
                        { label: "1 Hafta", value: "1W" },
                        { label: "1 Ay", value: "1M" },
                        { label: "3 Ay", value: "3M" },
                        { label: "6 Ay", value: "6M" },
                        { label: "1 Yıl", value: "1Y" },
                        { label: "Tümü", value: "all" },
                      ].map((period) => (
                        <button
                          key={period.value}
                          type="button"
                          onClick={() => setSelectedPeriod(period.value as any)}
                          disabled={chartLoading}
                          className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${
                            selectedPeriod === period.value
                              ? "bg-primary-500 text-white shadow-md"
                              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                          } disabled:opacity-50`}
                        >
                          {period.label}
                        </button>
                      ))}
                      <motion.button
                        type="button"
                        onClick={() => setSelectedPeriod(selectedPeriod === 'LIVE' ? '1M' : 'LIVE')}
                        disabled={chartLoading}
                        className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all flex items-center gap-2 ${
                          selectedPeriod === 'LIVE'
                            ? "bg-green-500 text-white shadow-md"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                        } disabled:opacity-50`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className={`w-2 h-2 rounded-full ${selectedPeriod === 'LIVE' ? 'bg-white animate-pulse' : 'bg-green-500'}`}></span>
                        Canlı
                      </motion.button>
                      {selectedPeriod === 'LIVE' && (
                        <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          5 Dakikalık Canlı Veri
                        </div>
                      )}
                    </div>

                    {/* Grafik Tipi Seçici ve Tools */}
                    <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 font-medium">Grafik Tipi:</span>
                        <div className="flex gap-2">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setChartType('line')}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                              chartType === 'line'
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                          >
                            Çizgi
                          </motion.button>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setChartType('candlestick')}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                              chartType === 'candlestick'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                          >
                            Mum
                          </motion.button>
                        </div>
                      </div>
                      
                      {/* Chart Tools - Only for candlestick */}
                      {chartType === 'candlestick' && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Zoom Controls */}
                          <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                const range = chartZoom.end - chartZoom.start;
                                const newRange = Math.max(10, range * 0.8);
                                const center = (chartZoom.start + chartZoom.end) / 2;
                                setChartZoom({ start: center - newRange / 2, end: center + newRange / 2 });
                              }}
                              className="p-2 hover:bg-gray-100 rounded transition-colors"
                              title="Yakınlaştır"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10V7m0 3v3m0-3H10m3 0h3" />
                              </svg>
                            </motion.button>
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                const range = chartZoom.end - chartZoom.start;
                                const newRange = Math.min(100, range * 1.2);
                                const center = (chartZoom.start + chartZoom.end) / 2;
                                setChartZoom({ start: Math.max(0, center - newRange / 2), end: Math.min(100, center + newRange / 2) });
                              }}
                              className="p-2 hover:bg-gray-100 rounded transition-colors"
                              title="Uzaklaştır"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10h-3m3 0h3m-3 0v-3m0 3v3" />
                              </svg>
                            </motion.button>
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setChartZoom({ start: 0, end: 100 })}
                              className="p-2 hover:bg-gray-100 rounded transition-colors text-xs px-3"
                              title="Sıfırla"
                            >
                              Reset
                            </motion.button>
                          </div>
                          
                          {/* Drawing Tools */}
                          <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setDrawingTool(drawingTool === 'line' ? null : 'line');
                                setIsDrawing(drawingTool !== 'line');
                              }}
                              className={`p-2 rounded transition-colors ${
                                drawingTool === 'line' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                              }`}
                              title="Çizgi Çiz"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </motion.button>
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setDrawingTool(drawingTool === 'marker' ? null : 'marker');
                                setIsDrawing(drawingTool !== 'marker');
                              }}
                              className={`p-2 rounded transition-colors ${
                                drawingTool === 'marker' ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'
                              }`}
                              title="Nokta İşaretle"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </motion.button>
                            {drawings.length > 0 && (
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setDrawings([]);
                                  setDrawingTool(null);
                                  setIsDrawing(false);
                                }}
                                className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
                                title="Çizimleri Temizle"
                              >
                                <X className="w-4 h-4" />
                              </motion.button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chart */}
                    {chartLoading ? (
                      <div className="h-64 flex items-center justify-center">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">Grafik yükleniyor...</p>
                        </div>
                      </div>
                    ) : chartData.length > 0 ? (
                      <div className="h-[600px] w-full relative">
                        {(() => {
                          // Slice edilmiş veriyi hesapla (zoom için - sadece candlestick için)
                          const startIndex = chartType === 'candlestick' 
                            ? Math.floor((chartZoom.start / 100) * chartData.length)
                            : 0;
                          const endIndex = chartType === 'candlestick'
                            ? Math.ceil((chartZoom.end / 100) * chartData.length)
                            : chartData.length;
                          const slicedData = chartData.slice(startIndex, endIndex);
                          
                          return (
                          <div 
                            className="w-full h-full relative"
                            onMouseDown={(e) => {
                              if (chartType === 'candlestick') {
                                if (isDrawing && drawingTool) {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                                  
                                  if (drawingTool === 'marker') {
                                    setDrawings([...drawings, { 
                                      type: 'marker', 
                                      points: [{ x, y }], 
                                      color: '#10b981' 
                                    }]);
                                    setIsDrawing(false);
                                    setDrawingTool(null);
                                  } else if (drawingTool === 'line') {
                                    setDrawings([...drawings, { 
                                      type: 'line', 
                                      points: [{ x, y }], 
                                      color: '#3b82f6' 
                                    }]);
                                  }
                                } else if (!isDrawing) {
                                  setIsPanning(true);
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setPanStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                                }
                              }
                            }}
                            onMouseMove={(e) => {
                              if (chartType === 'candlestick') {
                                if (isPanning && panStart) {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const deltaX = ((e.clientX - rect.left - panStart.x) / rect.width) * 100;
                                  const range = chartZoom.end - chartZoom.start;
                                  const newStart = Math.max(0, Math.min(100 - range, chartZoom.start - deltaX));
                                  const newEnd = newStart + range;
                                  if (newEnd <= 100) {
                                    setChartZoom({ start: newStart, end: newEnd });
                                  }
                                  setPanStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                                } else if (isDrawing && drawingTool === 'line' && drawings.length > 0) {
                                  const lastDrawing = drawings[drawings.length - 1];
                                  if (lastDrawing.type === 'line' && lastDrawing.points.length === 1) {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                                    setDrawings([
                                      ...drawings.slice(0, -1),
                                      { ...lastDrawing, points: [...lastDrawing.points, { x, y }] }
                                    ]);
                                  }
                                }
                              }
                            }}
                            onMouseUp={() => {
                              if (chartType === 'candlestick') {
                                setIsPanning(false);
                                setPanStart(null);
                                if (isDrawing && drawingTool === 'line' && drawings.length > 0) {
                                  const lastDrawing = drawings[drawings.length - 1];
                                  if (lastDrawing.type === 'line' && lastDrawing.points.length === 2) {
                                    setIsDrawing(false);
                                    setDrawingTool(null);
                                  }
                                }
                              }
                            }}
                            onMouseLeave={() => {
                              if (chartType === 'candlestick') {
                                setIsPanning(false);
                                setPanStart(null);
                              }
                            }}
                            style={{ cursor: chartType === 'candlestick' && isDrawing ? 'crosshair' : chartType === 'candlestick' && isPanning ? 'grabbing' : chartType === 'candlestick' ? 'grab' : 'default' }}
                          >
                            {/* Drawing Overlay */}
                            {chartType === 'candlestick' && drawings.length > 0 && (
                              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                                {drawings.map((drawing, idx) => (
                                  drawing.type === 'line' && drawing.points.length === 2 ? (
                                    <line
                                      key={idx}
                                      x1={`${drawing.points[0].x}%`}
                                      y1={`${drawing.points[0].y}%`}
                                      x2={`${drawing.points[1].x}%`}
                                      y2={`${drawing.points[1].y}%`}
                                      stroke={drawing.color}
                                      strokeWidth={2}
                                      strokeDasharray="5,5"
                                    />
                                  ) : drawing.type === 'marker' && drawing.points.length === 1 ? (
                                    <g key={idx}>
                                      <circle
                                        cx={`${drawing.points[0].x}%`}
                                        cy={`${drawing.points[0].y}%`}
                                        r="6"
                                        fill={drawing.color}
                                        stroke="white"
                                        strokeWidth={2}
                                      />
                                    </g>
                                  ) : null
                                ))}
                              </svg>
                            )}
                            <ResponsiveContainer width="100%" height="100%">
                            {chartType === "line" ? (
                              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                  dataKey={selectedPeriod === 'LIVE' ? 'time' : 'date'}
                                  stroke="#6b7280"
                                  fontSize={12}
                                  tick={{ fill: '#6b7280' }}
                                  interval="preserveStartEnd"
                                />
                                <YAxis 
                                  stroke="#6b7280"
                                  fontSize={12}
                                  tick={{ fill: '#6b7280' }}
                                  domain={['auto', 'auto']}
                                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '8px',
                                  }}
                                  formatter={(value: any) => [`$${value.toFixed(2)}`, 'Fiyat']}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="price"
                                  stroke={type === "buy" ? "#22c55e" : "#ef4444"}
                                  strokeWidth={2}
                                  dot={false}
                                  activeDot={{ r: 4 }}
                                  isAnimationActive={true}
                                  animationDuration={200}
                                  animationEasing="ease-out"
                                />
                              </LineChart>
                            ) : (
                              <ComposedChart 
                                data={slicedData} 
                                margin={{ top: 20, right: 30, left: 30, bottom: 40 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                  dataKey={selectedPeriod === 'LIVE' ? 'time' : 'date'}
                                  stroke="#6b7280"
                                  fontSize={10}
                                  tick={{ fill: '#6b7280' }}
                                  interval={0}
                                  tickFormatter={(value: string) => {
                                    const currentIndex = slicedData.findIndex((d: any) => (selectedPeriod === 'LIVE' ? d.time : d.date) === value);
                                    if (currentIndex === -1) return '';
                                    if (currentIndex === 0) return value;
                                    const prevEntry = slicedData[currentIndex - 1];
                                    if (!prevEntry) return value;
                                    const currentDay = value.match(/^(\d+)/)?.[1];
                                    const prevDay = (selectedPeriod === 'LIVE' ? prevEntry.time : prevEntry.date)?.match(/^(\d+)/)?.[1];
                                    return currentDay !== prevDay ? value : '';
                                  }}
                                  minTickGap={120}
                                  height={50}
                                />
                                <YAxis 
                                  stroke="#6b7280"
                                  fontSize={11}
                                  tick={{ fill: '#6b7280' }}
                                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                                  domain={['dataMin - 5%', 'dataMax + 5%']}
                                  allowDataOverflow={false}
                                  padding={{ top: 15, bottom: 15 }}
                                  width={80}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                  }}
                                  labelFormatter={(value: string) => {
                                    const entry = slicedData.find((d: any) => (selectedPeriod === 'LIVE' ? d.time : d.date) === value);
                                    if (entry && entry.timestamp) {
                                      const date = new Date(entry.timestamp);
                                      return date.toLocaleString('tr-TR', { 
                                        day: 'numeric', 
                                        month: 'short', 
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      });
                                    }
                                    return value;
                                  }}
                                  formatter={(value: any, name: string, props: any) => {
                                    if (props.payload) {
                                      const data = props.payload;
                                      const close = data.close !== undefined ? data.close : data.price;
                                      const open = data.open !== undefined ? data.open : data.price;
                                      const high = data.high !== undefined ? data.high : data.price;
                                      const low = data.low !== undefined ? data.low : data.price;
                                      
                                      const change = close - open;
                                      const changePercent = open > 0 ? ((change / open) * 100) : 0;
                                      const range = high - low;
                                      const rangePercent = low > 0 ? ((range / low) * 100) : 0;
                                      
                                      const bodySize = Math.abs(close - open);
                                      const totalRange = high - low;
                                      const buyRatio = totalRange > 0 ? ((close > open ? bodySize : 0) / totalRange) * 100 : 50;
                                      const sellRatio = 100 - buyRatio;
                                      const spread = range * 0.001;
                                      
                                      return [
                                        <div key="ohlc" className="text-xs space-y-2 min-w-[220px]">
                                          <div className="font-semibold text-sm border-b pb-1">OHLC Verileri</div>
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>
                                              <span className="text-gray-600">Açılış:</span>
                                              <span className="font-mono ml-1">${open?.toFixed(2) || 'N/A'}</span>
                                            </div>
                                            <div>
                                              <span className="text-gray-600">Yüksek:</span>
                                              <span className="font-mono ml-1 text-green-600">${high?.toFixed(2) || 'N/A'}</span>
                                            </div>
                                            <div>
                                              <span className="text-gray-600">Düşük:</span>
                                              <span className="font-mono ml-1 text-red-600">${low?.toFixed(2) || 'N/A'}</span>
                                            </div>
                                            <div>
                                              <span className="text-gray-600">Kapanış:</span>
                                              <span className={`font-mono ml-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                ${close?.toFixed(2) || 'N/A'}
                                              </span>
                                            </div>
                                          </div>
                                          
                                          <div className="pt-2 border-t space-y-1">
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Değişim:</span>
                                              <span className={`font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {change >= 0 ? '+' : ''}{change?.toFixed(2)} ({changePercent >= 0 ? '+' : ''}{changePercent?.toFixed(2)}%)
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Aralık:</span>
                                              <span className="font-mono">${range?.toFixed(2)} ({rangePercent?.toFixed(2)}%)</span>
                                            </div>
                                          </div>
                                          
                                          {data.volume && (
                                            <div className="pt-2 border-t">
                                              <div className="flex justify-between mb-1">
                                                <span className="text-gray-600">Hacim:</span>
                                                <span className="font-semibold">{data.volume.toLocaleString()}</span>
                                              </div>
                                            </div>
                                          )}
                                          
                                          <div className="pt-2 border-t space-y-1">
                                            <div className="text-xs font-semibold text-gray-700 mb-1">Alım/Satım Oranı</div>
                                            <div className="flex items-center gap-2">
                                              <div className="flex-1">
                                                <div className="flex justify-between text-xs mb-0.5">
                                                  <span className="text-green-600">Alım</span>
                                                  <span className="font-semibold">{buyRatio.toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                  <div 
                                                    className="bg-green-500 h-2 rounded-full transition-all" 
                                                    style={{ width: `${buyRatio}%` }}
                                                  />
                                                </div>
                                              </div>
                                              <div className="flex-1">
                                                <div className="flex justify-between text-xs mb-0.5">
                                                  <span className="text-red-600">Satım</span>
                                                  <span className="font-semibold">{sellRatio.toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                  <div 
                                                    className="bg-red-500 h-2 rounded-full transition-all" 
                                                    style={{ width: `${sellRatio}%` }}
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          
                                          <div className="pt-2 border-t">
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Spread (Tahmini):</span>
                                              <span className="font-mono">${spread.toFixed(4)}</span>
                                            </div>
                                          </div>
                                        </div>,
                                        ''
                                      ];
                                    }
                                    return [`$${value.toFixed(2)}`, name];
                                  }}
                                />
                                <Bar dataKey="high" fill="transparent" stroke="transparent" />
                                <Bar dataKey="low" fill="transparent" stroke="transparent" />
                                <defs>
                                  <clipPath id="tradeChartClip">
                                    <rect x="0" y="0" width="100%" height="100%" />
                                  </clipPath>
                                </defs>
                                <g clipPath="url(#tradeChartClip)">
                                  {slicedData.map((entry: any, index: number) => {
                                    const close = entry.close !== undefined ? entry.close : entry.price;
                                    const open = entry.open !== undefined ? entry.open : entry.price;
                                    const high = entry.high !== undefined ? entry.high : entry.price;
                                    const low = entry.low !== undefined ? entry.low : entry.price;
                                    
                                    if (!open || !close || !high || !low || isNaN(open) || isNaN(close) || isNaN(high) || isNaN(low)) {
                                      return null;
                                    }
                                    
                                    const isUp = close >= open;
                                    const color = isUp ? '#10b981' : '#ef4444';
                                    const strokeColor = isUp ? '#059669' : '#dc2626';
                                    
                                    const totalBars = slicedData.length;
                                    const xPadding = 15;
                                    const availableWidth = 100 - (xPadding * 2);
                                    const barSpacing = availableWidth / totalBars;
                                    
                                    const minCandleWidthPercent = 1.2;
                                    const maxCandleWidthPercent = 1.5;
                                    const candleWidthPercent = Math.max(
                                      minCandleWidthPercent,
                                      Math.min(maxCandleWidthPercent, (availableWidth / totalBars) * 0.4)
                                    );
                                    
                                    const xCenter = xPadding + (index + 0.5) * barSpacing;
                                    const candleWidth = candleWidthPercent;
                                    
                                    const minPrice = Math.min(...slicedData.map((d: any) => (d.low || d.price) || 0));
                                    const maxPrice = Math.max(...slicedData.map((d: any) => (d.high || d.price) || 0));
                                    const priceRange = maxPrice - minPrice || 1;
                                    
                                    const domainMin = minPrice - (priceRange * 0.05);
                                    const domainMax = maxPrice + (priceRange * 0.05);
                                    const domainRange = domainMax - domainMin || 1;
                                    
                                    const yPadding = 8;
                                    const availableHeight = 100 - (yPadding * 2);
                                    
                                    const highY = yPadding + ((domainMax - high) / domainRange) * availableHeight;
                                    const lowY = yPadding + ((domainMax - low) / domainRange) * availableHeight;
                                    const openY = yPadding + ((domainMax - open) / domainRange) * availableHeight;
                                    const closeY = yPadding + ((domainMax - close) / domainRange) * availableHeight;
                                    
                                    const bodyTop = Math.min(openY, closeY);
                                    const bodyBottom = Math.max(openY, closeY);
                                    const bodyHeight = Math.max(bodyBottom - bodyTop, 0.3);
                                    
                                    const clampMargin = 2;
                                    const clampedHighY = Math.max(yPadding + clampMargin, Math.min(100 - yPadding - clampMargin, highY));
                                    const clampedLowY = Math.max(yPadding + clampMargin, Math.min(100 - yPadding - clampMargin, lowY));
                                    const clampedBodyTop = Math.max(yPadding + clampMargin, Math.min(100 - yPadding - clampMargin, bodyTop));
                                    const clampedBodyHeight = Math.max(0.3, Math.min(100 - yPadding - clampedBodyTop - clampMargin, bodyHeight));
                                    
                                    return (
                                      <g key={`candle-${index}`}>
                                        <line
                                          x1={`${xCenter}%`}
                                          x2={`${xCenter}%`}
                                          y1={`${clampedHighY}%`}
                                          y2={`${clampedLowY}%`}
                                          stroke={color}
                                          strokeWidth={2}
                                          strokeLinecap="round"
                                        />
                                        <rect
                                          x={`${xCenter - candleWidth / 2}%`}
                                          y={`${clampedBodyTop}%`}
                                          width={`${candleWidth}%`}
                                          height={`${clampedBodyHeight}%`}
                                          fill={color}
                                          stroke={strokeColor}
                                          strokeWidth={2.5}
                                          rx={1.5}
                                          opacity={1}
                                        />
                                      </g>
                                    );
                                  })}
                                </g>
                              </ComposedChart>
                            )}
                            </ResponsiveContainer>
                          </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center bg-white rounded-lg border border-gray-200">
                        <p className="text-gray-500 text-sm">
                          {symbol ? "Grafik verisi yükleniyor..." : "Sembol girin"}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Miktar (Adet)
                    </label>
                    {livePrice !== null && quantity && parseFloat(quantity) > 0 && (
                      <span className="text-sm text-gray-600">
                        Toplam: <span className="font-bold text-gray-900">${totalPrice.toFixed(2)}</span>
                        {type === "buy" && accountData && totalPrice > 0 && (() => {
                          const buyingPower = parseFloat(accountData.buying_power || accountData.cash || '0');
                          const isInsufficient = totalPrice > buyingPower;
                          return isInsufficient ? (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-red-700">Yetersiz Bakiye</p>
                                <p className="text-xs text-red-600 mt-0.5">
                                  Gerekli: ${totalPrice.toFixed(2)} | Mevcut: ${buyingPower.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <p className="text-xs text-green-700">
                                Yeterli bakiye mevcut (${buyingPower.toFixed(2)})
                              </p>
                            </div>
                          );
                        })()}
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    min="1"
                    step="1"
                    required
                    disabled={status === "loading"}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all disabled:opacity-50 text-gray-900 bg-white"
                  />
                  {livePrice !== null && (
                    <p className="mt-2 text-xs text-gray-500">
                      Birim fiyat: ${livePrice.toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Order Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Emir Tipi
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setOrderType("market")}
                      disabled={status === "loading"}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        orderType === "market"
                          ? "border-primary-500 bg-primary-50 text-primary-700 font-semibold"
                          : "border-gray-300 hover:border-gray-400 text-gray-900 bg-white"
                      } disabled:opacity-50`}
                    >
                      Piyasa
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType("limit")}
                      disabled={status === "loading"}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        orderType === "limit"
                          ? "border-primary-500 bg-primary-50 text-primary-700 font-semibold"
                          : "border-gray-300 hover:border-gray-400 text-gray-900 bg-white"
                      } disabled:opacity-50`}
                    >
                      Limit
                    </button>
                  </div>
                </div>

                {/* Limit Price */}
                {orderType === "limit" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Limit Fiyat ($)
                    </label>
                    <input
                      type="number"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required={orderType === "limit"}
                      disabled={status === "loading"}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all disabled:opacity-50 text-gray-900 bg-white"
                    />
                  </div>
                )}

                {/* Partial Order (Parçalı Alım) */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      id="partialOrder"
                      checked={isPartialOrder}
                      onChange={(e) => setIsPartialOrder(e.target.checked)}
                      disabled={status === "loading"}
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="partialOrder" className="text-sm font-semibold text-gray-700 cursor-pointer">
                      Parçalı Alım (DCA - Dollar Cost Averaging)
                    </label>
                  </div>
                  
                  {isPartialOrder && (
                    <div className="space-y-4 mt-4 pl-8 border-l-2 border-primary-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Parça Sayısı
                          </label>
                          <input
                            type="number"
                            value={partialCount}
                            onChange={(e) => setPartialCount(e.target.value)}
                            min="2"
                            max="10"
                            step="1"
                            disabled={status === "loading"}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all disabled:opacity-50 text-sm text-gray-900 bg-white"
                          />
                          <p className="text-xs text-gray-500 mt-1">2-10 arası</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Parçalar Arası Süre (Dakika)
                          </label>
                          <input
                            type="number"
                            value={partialInterval}
                            onChange={(e) => setPartialInterval(e.target.value)}
                            min="1"
                            max="60"
                            step="1"
                            disabled={status === "loading"}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all disabled:opacity-50 text-sm text-gray-900 bg-white"
                          />
                          <p className="text-xs text-gray-500 mt-1">1-60 dakika</p>
                        </div>
                      </div>
                      
                      {quantity && partialCount && !isNaN(parseFloat(quantity)) && !isNaN(parseInt(partialCount)) && (
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-600 mb-2">Parçalı Alım Detayları:</p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Toplam Miktar:</span>
                              <span className="font-semibold">{parseFloat(quantity).toFixed(0)} adet</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Parça Sayısı:</span>
                              <span className="font-semibold">{partialCount} parça</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Her Parça:</span>
                              <span className="font-semibold">
                                {Math.floor(parseFloat(quantity) / parseInt(partialCount)).toFixed(0)} adet
                                {parseFloat(quantity) % parseInt(partialCount) > 0 && (
                                  <span className="text-primary-600 ml-1">
                                    (İlk parça: {Math.floor(parseFloat(quantity) / parseInt(partialCount)) + (parseFloat(quantity) % parseInt(partialCount))} adet)
                                  </span>
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Parçalar Arası:</span>
                              <span className="font-semibold">{partialInterval} dakika</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-200">
                              <span className="text-gray-600">Toplam Süre:</span>
                              <span className="font-semibold text-primary-600">
                                {(parseInt(partialCount) - 1) * parseInt(partialInterval)} dakika
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-700">
                          💡 <strong>Parçalı Alım:</strong> Toplam miktarınız {partialCount} parçaya bölünerek, 
                          her {partialInterval} dakikada bir otomatik olarak alınacaktır. Bu yöntem fiyat volatilitesini 
                          azaltır ve ortalama fiyat avantajı sağlar.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className={`w-full px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    type === "buy"
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg"
                      : "bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {status === "loading" ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>İşlem gönderiliyor...</span>
                    </>
                  ) : (
                    <>
                      {type === "buy" ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      <span>{type === "buy" ? "Al" : "Sat"}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

