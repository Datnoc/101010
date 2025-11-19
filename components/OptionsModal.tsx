"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Info, Zap, Calendar, DollarSign, BarChart3, Activity, Target, Filter, AlertTriangle, CheckCircle2, TrendingUp as TrendingUpIcon, Award, Sparkles } from "lucide-react";

interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "buy" | "sell";
  accountId: string | null;
  accountData?: any; // Hesap bilgileri (bakiye kontrolü için)
  onSuccess?: () => void;
  existingOptionsPositions?: any[]; // Mevcut opsiyon pozisyonları
}

interface OptionData {
  symbol: string;
  underlying_symbol: string;
  option_type: "call" | "put";
  strike_price: number;
  expiration_date: string;
  last_price?: number;
  bid?: number;
  ask?: number;
  volume?: number;
  open_interest?: number;
  change?: number;
  change_percent?: number;
  implied_volatility?: number;
  delta?: number;
  gamma?: number;
  theta?: number;
  vega?: number;
  underlying_price?: number;
  qty?: number;
  market_value?: number;
  cost_basis?: number;
  unrealized_pl?: number;
}

export default function OptionsModal({ isOpen, onClose, type, accountId, accountData, onSuccess, existingOptionsPositions = [] }: OptionsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnderlying, setSelectedUnderlying] = useState<string>("");
  const [optionsChain, setOptionsChain] = useState<OptionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<OptionData | null>(null);
  const [quantity, setQuantity] = useState<string>("1");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [limitPrice, setLimitPrice] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"call" | "put" | "all">("all");
  const [topGainers, setTopGainers] = useState<OptionData[]>([]);
  const [selectedExpiration, setSelectedExpiration] = useState<string>("");
  const [selectedStrikeRange, setSelectedStrikeRange] = useState<[number, number]>([0, 1000]);
  const [underlyingPrice, setUnderlyingPrice] = useState<number>(0);
  const [showGreeks, setShowGreeks] = useState(true);
  const [quickQuantity, setQuickQuantity] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailOption, setDetailOption] = useState<OptionData | null>(null);
  const [showDetailTradeForm, setShowDetailTradeForm] = useState(false);
  const [detailTradeType, setDetailTradeType] = useState<"buy" | "sell">("buy");
  const [detailTradeQuantity, setDetailTradeQuantity] = useState<string>("1");
  const [detailTradeOrderType, setDetailTradeOrderType] = useState<"market" | "limit">("market");
  const [detailTradeLimitPrice, setDetailTradeLimitPrice] = useState<string>("");
  const [detailTradeSubmitting, setDetailTradeSubmitting] = useState(false);
  const [detailTradeError, setDetailTradeError] = useState<string | null>(null);
  const [detailTradeStatus, setDetailTradeStatus] = useState<"idle" | "loading" | "success">("idle");
  const [manualOptionSymbol, setManualOptionSymbol] = useState<string>("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualOptionData, setManualOptionData] = useState<OptionData | null>(null);
  const [loadingManualOption, setLoadingManualOption] = useState(false);
  const [recommendations, setRecommendations] = useState<{
    topGainers: OptionData[];
    highVolume: OptionData[];
    lowSpread: OptionData[];
    highIV: OptionData[];
    bestValue: OptionData[];
  }>({
    topGainers: [],
    highVolume: [],
    lowSpread: [],
    highIV: [],
    bestValue: [],
  });

  // Popüler hisse senetleri
  const popularStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "NFLX"];

  // Önerileri hesapla
  const calculateRecommendations = useCallback((options: OptionData[]) => {
    // En çok kazandıran
    const topGainers = options
      .filter(opt => opt.change_percent && opt.change_percent > 0)
      .sort((a, b) => (b.change_percent || 0) - (a.change_percent || 0))
      .slice(0, 5);

    // En yüksek hacim
    const highVolume = options
      .filter(opt => opt.volume && opt.volume > 0)
      .sort((a, b) => (b.volume || 0) - (a.volume || 0))
      .slice(0, 5);

    // En düşük spread
    const lowSpread = options
      .filter(opt => opt.bid && opt.ask)
      .map(opt => ({
        ...opt,
        spread: (opt.ask || 0) - (opt.bid || 0),
        spreadPercent: opt.last_price ? (((opt.ask || 0) - (opt.bid || 0)) / opt.last_price) * 100 : 0,
      }))
      .sort((a, b) => (a.spreadPercent || 0) - (b.spreadPercent || 0))
      .slice(0, 5);

    // En yüksek IV (volatilite fırsatları)
    const highIV = options
      .filter(opt => opt.implied_volatility && opt.implied_volatility > 0)
      .sort((a, b) => (b.implied_volatility || 0) - (a.implied_volatility || 0))
      .slice(0, 5);

    // En iyi değer (düşük fiyat, yüksek potansiyel)
    const bestValue = options
      .filter(opt => opt.last_price && opt.last_price > 0 && opt.change_percent)
      .map(opt => ({
        ...opt,
        valueScore: (opt.change_percent || 0) / (opt.last_price || 1),
      }))
      .sort((a, b) => (b.valueScore || 0) - (a.valueScore || 0))
      .slice(0, 5);

    setRecommendations({
      topGainers,
      highVolume,
      lowSpread,
      highIV,
      bestValue,
    });
  }, []);

  // Opsiyon chain verilerini çek
  const fetchOptionsChain = useCallback(async (underlying: string) => {
    if (!underlying || !accountId) return;

    setLoading(true);
    setError(null);

    try {
      // Önce mevcut pozisyonlardan opsiyonları kontrol et
      const positionsForUnderlying = existingOptionsPositions.filter((pos: any) => {
        const posSymbol = pos.symbol || '';
        const underlyingMatch = posSymbol.match(/^([A-Z]+)/);
        if (underlyingMatch) {
          return underlyingMatch[1] === underlying.toUpperCase();
        }
        return false;
      });

      // Eğer mevcut pozisyonlar varsa, onları kullan
      if (positionsForUnderlying.length > 0) {
        const optionsFromPositions: OptionData[] = positionsForUnderlying.flatMap((pos: any) => {
          const symbol = pos.symbol;
          const match = symbol.match(/^([A-Z]+)(\d{6})([CP])(\d+)$/);
          if (match) {
            const [, underlyingSym, dateStr, type, strikeStr] = match;
            const year = '20' + dateStr.substring(0, 2);
            const month = dateStr.substring(2, 4);
            const day = dateStr.substring(4, 6);
            const expirationDate = new Date(`${year}-${month}-${day}`);
            const strike = parseInt(strikeStr) / 1000;
            
            return [{
              symbol,
              underlying_symbol: underlyingSym,
              option_type: type === 'C' ? 'call' : 'put',
              strike_price: strike,
              expiration_date: expirationDate.toISOString().split('T')[0],
              last_price: parseFloat(pos.current_price || '0'),
              bid: parseFloat(pos.current_price || '0') * 0.99,
              ask: parseFloat(pos.current_price || '0') * 1.01,
              volume: 0,
              open_interest: 0,
              change: parseFloat(pos.change_today || '0'),
              change_percent: parseFloat(pos.unrealized_plpc || '0'),
              implied_volatility: 0,
              underlying_price: underlyingPrice,
              qty: parseFloat(pos.qty || '0'),
              market_value: parseFloat(pos.market_value || '0'),
              cost_basis: parseFloat(pos.cost_basis || '0'),
              unrealized_pl: parseFloat(pos.unrealized_pl || '0'),
            }];
          }
          return [];
        });

        if (optionsFromPositions.length > 0) {
          setOptionsChain(optionsFromPositions);
          calculateRecommendations(optionsFromPositions);
          setLoading(false);
          return;
        }
      }

      // Mevcut pozisyon yoksa API'den çek
      const response = await fetch(`/api/alpaca/options/chain?underlying=${underlying}&accountId=${accountId}`);
      
      if (!response.ok) {
        throw new Error("Opsiyon verileri alınamadı");
      }

      // Response'un boş olup olmadığını kontrol et
      const text = await response.text();
      if (!text || text.trim().length === 0) {
        throw new Error("Opsiyon verileri alınamadı: Boş response");
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error("Opsiyon verileri parse edilemedi");
      }
      
      if (data.success && data.options && data.options.length > 0) {
        // Underlying price'ı al (API'den geliyorsa kullan, yoksa 0)
        let currentUnderlyingPrice = underlyingPrice;
        if (data.options.length > 0 && data.options[0].underlying_price) {
          currentUnderlyingPrice = data.options[0].underlying_price;
        }
        
        // Underlying price'ı her opsiyona ekle
        const optionsWithPrice = data.options.map((opt: OptionData) => ({
          ...opt,
          underlying_price: opt.underlying_price || currentUnderlyingPrice,
        }));
        
        setOptionsChain(optionsWithPrice);
        setUnderlyingPrice(currentUnderlyingPrice);
        
        // En çok kazandıran opsiyonları hesapla
        const gainers = optionsWithPrice
          .filter((opt: OptionData) => opt.change_percent && opt.change_percent > 0)
          .sort((a: OptionData, b: OptionData) => (b.change_percent || 0) - (a.change_percent || 0))
          .slice(0, 10);
        setTopGainers(gainers);
        
        // Önerileri hesapla
        calculateRecommendations(optionsWithPrice);
      } else if (data.success && data.options && data.options.length === 0) {
        // Opsiyon bulunamadı - mevcut pozisyonları kontrol et
        if (existingOptionsPositions.length > 0) {
          // Mevcut pozisyonlardan underlying'leri göster
          const availableUnderlyings = Array.from(new Set(
            existingOptionsPositions
              .map((pos: any) => {
                const match = (pos.symbol || '').match(/^([A-Z]+)/);
                return match ? match[1] : null;
              })
              .filter((u: string | null) => u !== null)
          ));
          
          if (availableUnderlyings.length > 0) {
            setError(`Bu underlying symbol için opsiyon bulunamadı. Mevcut pozisyonlarınızda şu underlying'ler var: ${availableUnderlyings.join(', ')}. Lütfen bunlardan birini seçin veya opsiyon sembolünü manuel olarak girin.`);
          } else {
            setError("Bu underlying symbol için opsiyon bulunamadı. Lütfen opsiyon sembolünü manuel olarak girin.");
          }
        } else {
          setError("Bu underlying symbol için opsiyon bulunamadı. Lütfen opsiyon sembolünü manuel olarak girin.");
        }
        setOptionsChain([]);
      } else {
        setError("Opsiyon verileri alınamadı");
        setOptionsChain([]);
      }
    } catch (err: any) {
      console.error("Options chain fetch error:", err);
      setError(err.message || "Opsiyon verileri alınamadı");
      setOptionsChain([]);
    } finally {
      setLoading(false);
    }
  }, [accountId, calculateRecommendations, existingOptionsPositions, underlyingPrice]);


  // Moneyness hesapla
  const getMoneyness = (option: OptionData): "ITM" | "ATM" | "OTM" => {
    if (!option.underlying_price) return "OTM";
    const diff = option.underlying_price - option.strike_price;
    if (Math.abs(diff) < option.underlying_price * 0.02) return "ATM";
    if (option.option_type === "call") {
      return diff > 0 ? "ITM" : "OTM";
    } else {
      return diff < 0 ? "ITM" : "OTM";
    }
  };

  // Detay modal'ını aç
  const openDetailModal = (option: OptionData) => {
    setDetailOption(option);
    setDetailModalOpen(true);
  };

  // Kazanç/kayıp senaryoları hesapla
  const calculateProfitLossScenarios = (option: OptionData, quantity: number) => {
    if (!option.last_price || !option.underlying_price) return null;
    
    const contractCost = option.last_price * 100;
    const totalCost = contractCost * quantity;
    const strike = option.strike_price;
    const currentPrice = option.underlying_price;
    
    const scenarios = [];
    
    // Farklı fiyat senaryoları (%5, %10, %15, %20, %25 değişim)
    for (const changePercent of [-25, -15, -10, -5, 0, 5, 10, 15, 20, 25]) {
      const newPrice = currentPrice * (1 + changePercent / 100);
      let profit = 0;
      
      if (option.option_type === "call") {
        if (newPrice > strike) {
          profit = (newPrice - strike) * 100 * quantity - totalCost;
        } else {
          profit = -totalCost; // Tam kayıp
        }
      } else {
        if (newPrice < strike) {
          profit = (strike - newPrice) * 100 * quantity - totalCost;
        } else {
          profit = -totalCost; // Tam kayıp
        }
      }
      
      scenarios.push({
        priceChange: changePercent,
        newPrice,
        profit,
        profitPercent: (profit / totalCost) * 100,
      });
    }
    
    return scenarios;
  };

  // Underlying sembol seçildiğinde opsiyon chain'i çek
  useEffect(() => {
    if (selectedUnderlying && isOpen) {
      fetchOptionsChain(selectedUnderlying);
    }
  }, [selectedUnderlying, isOpen, fetchOptionsChain]);

  // Modal açıldığında temizle
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSelectedUnderlying("");
      setOptionsChain([]);
      setSelectedOption(null);
      setQuantity("1");
      setLimitPrice("");
      setError(null);
      setActiveTab("all");
      setSelectedExpiration("");
      setSelectedStrikeRange([0, 1000]);
      setUnderlyingPrice(0);
      setShowGreeks(true);
      setQuickQuantity(null);
      setDetailModalOpen(false);
      setDetailOption(null);
      setShowDetailTradeForm(false);
      setDetailTradeType("buy");
      setDetailTradeQuantity("1");
      setDetailTradeOrderType("market");
      setDetailTradeLimitPrice("");
      setDetailTradeError(null);
      setDetailTradeStatus("idle");
      setManualOptionSymbol("");
      setShowManualInput(false);
      setManualOptionData(null);
      setLoadingManualOption(false);
      setRecommendations({
        topGainers: [],
        highVolume: [],
        lowSpread: [],
        highIV: [],
        bestValue: [],
      });
    }
  }, [isOpen]);

  // Emir gönder
  const handleSubmit = async () => {
    if (!selectedOption || !accountId || !quantity) {
      setError("Lütfen tüm alanları doldurun");
      return;
    }

    // Seçili opsiyonun hala geçerli olduğunu kontrol et
    const validOption = optionsChain.find(opt => opt.symbol === selectedOption.symbol);
    if (!validOption && optionsChain.length > 0) {
      setError("Seçili opsiyon artık geçerli değil. Lütfen tekrar seçin.");
      setSelectedOption(null);
      return;
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      setError("Geçerli bir miktar girin");
      return;
    }

    // Geçerli opsiyonu kullan (chain'den bulunan veya seçili olan)
    const finalOption = validOption || selectedOption;
    
    // Market emri için fiyat kontrolü (manuel opsiyon sembolünde fiyat olmayabilir)
    if (orderType === "market" && !finalOption.last_price && !finalOption.ask && !finalOption.bid) {
      setError("Market emri için fiyat bilgisi bulunamadı. Lütfen limit emir kullanın ve fiyat girin.");
      return;
    }
    
    if (orderType === "limit" && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      setError("Limit fiyat girin");
      return;
    }

    if (type === "buy") {
      const estimatedCost = orderType === "limit" && limitPrice 
        ? parseFloat(limitPrice) * qty * 100 
        : (finalOption.last_price || finalOption.ask || finalOption.bid || 0) * qty * 100;

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
          latestAccountSnapshot.buying_power || latestAccountSnapshot.cash || '0'
        );
        if (estimatedCost > buyingPower) {
          setError(
            `Yetersiz bakiye! Gerekli: $${estimatedCost.toFixed(2)}, Mevcut: $${buyingPower.toFixed(2)}. Lütfen hesabınıza para yatırın.`
          );
          return;
        }
      }
    }

    setSubmitting(true);
    setError(null);

    try {
      const orderData: any = {
        accountId,
        symbol: finalOption.symbol,
        qty: Math.floor(qty),
        side: type,
        type: orderType,
        time_in_force: "day",
      };

      if (orderType === "limit") {
        orderData.limit_price = parseFloat(limitPrice);
      }

      const response = await fetch("/api/alpaca/options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      // Response'un boş olup olmadığını kontrol et
      const text = await response.text();
      if (!text || text.trim().length === 0) {
        throw new Error("Sunucudan yanıt alınamadı");
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error("Sunucu yanıtı parse edilemedi");
      }

      if (!response.ok || !data.success) {
        // Özel hata mesajı göster
        let errorMsg = data.error || data.message || "Emir verilemedi";
        
        // Options not authorized hatası için özel mesaj
        if (data.code === 'OPTIONS_NOT_AUTHORIZED' || 
            errorMsg.includes('not authorized to trade options') ||
            errorMsg.includes('opsiyon işlemleri için yetkilendirilmemiş')) {
          errorMsg = 'Hesabınız opsiyon işlemleri için yetkilendirilmemiş. Alpaca sandbox hesabınızın opsiyon trading için aktif edilmesi gerekiyor. Lütfen Alpaca Broker Dashboard\'dan hesap ayarlarınızı kontrol edin.';
        }
        // Insufficient buying power hatası için özel mesaj
        else if (data.code === 'INSUFFICIENT_BUYING_POWER' || 
                 errorMsg.includes('Yetersiz alım gücü') ||
                 errorMsg.includes('buying power')) {
          errorMsg = errorMsg; // Zaten açıklayıcı
        }
        
        throw new Error(errorMsg);
      }

      // Başarılı
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      console.error("Order submission error:", err);
      setError(err.message || "Emir verilemedi");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrelenmiş opsiyonlar
  const filteredOptions = optionsChain.filter(opt => {
    if (activeTab === "call" && opt.option_type !== "call") return false;
    if (activeTab === "put" && opt.option_type !== "put") return false;
    if (selectedExpiration && opt.expiration_date !== selectedExpiration) return false;
    if (opt.strike_price < selectedStrikeRange[0] || opt.strike_price > selectedStrikeRange[1]) return false;
    return true;
  });

  // Benzersiz expiration tarihleri
  const uniqueExpirations = Array.from(new Set(optionsChain.map(opt => opt.expiration_date))).sort();

  // Toplam maliyet hesapla
  const totalCost = selectedOption && quantity 
    ? (orderType === "limit" && limitPrice 
        ? parseFloat(limitPrice) * parseFloat(quantity) * 100 
        : (selectedOption.last_price || selectedOption.ask || selectedOption.bid || 0) * parseFloat(quantity) * 100)
    : 0;

  // Hızlı al/sat
  const handleQuickTrade = async (option: OptionData, qty: number) => {
    if (!accountId) {
      setError("Hesap ID bulunamadı");
      return;
    }

    // Opsiyon chain'den geçerli opsiyonu bul
    const validOption = optionsChain.find(opt => opt.symbol === option.symbol) || option;
    
    setSelectedOption(validOption);
    setQuantity(qty.toString());
    setOrderType("market");
    setError(null);
    setSubmitting(true);

    try {
      const orderData: any = {
        accountId,
        symbol: validOption.symbol,
        qty: Math.floor(qty),
        side: type,
        type: "market",
        time_in_force: "day",
      };

      const response = await fetch("/api/alpaca/options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      // Response'un boş olup olmadığını kontrol et
      const text = await response.text();
      if (!text || text.trim().length === 0) {
        throw new Error("Sunucudan yanıt alınamadı");
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error("Sunucu yanıtı parse edilemedi");
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Emir verilemedi");
      }

      // Başarılı
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      console.error("Quick trade error:", err);
      setError(err.message || "Emir verilemedi");
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold">
              {type === "buy" ? "Opsiyon Al" : "Opsiyon Sat"}
            </h2>
            <p className="text-sm opacity-90 mt-1">Opsiyon pozisyonu {type === "buy" ? "aç" : "kapat"}</p>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* En Çok Kazandıran Opsiyonlar */}
            {topGainers.length > 0 && !selectedUnderlying && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-lg font-bold text-gray-900">En Çok Kazandıran Opsiyonlar</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {topGainers.slice(0, 6).map((option, index) => (
                    <motion.button
                      key={option.symbol}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedUnderlying(option.underlying_symbol)}
                      className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 hover:shadow-lg transition-all text-left"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-900">{option.underlying_symbol}</span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          option.option_type === "call" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-700"
                        }`}>
                          {option.option_type === "call" ? "CALL" : "PUT"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        Strike: ${option.strike_price}
                      </div>
                      <div className="flex items-center gap-1 text-green-600 font-bold">
                        <TrendingUp className="w-4 h-4" />
                        <span>+{option.change_percent?.toFixed(2)}%</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Underlying Sembol Seçimi */}
            {!selectedUnderlying ? (
              <div>
                {/* Manuel Opsiyon Sembolü Girişi */}
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-600" />
                      <h3 className="text-sm font-bold text-blue-900">Manuel Opsiyon Sembolü</h3>
                    </div>
                    <button
                      onClick={() => setShowManualInput(!showManualInput)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      {showManualInput ? "Gizle" : "Göster"}
                    </button>
                  </div>
                  {showManualInput && (
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={manualOptionSymbol}
                          onChange={(e) => setManualOptionSymbol(e.target.value.toUpperCase().trim())}
                          placeholder="Opsiyon sembolü girin (örn: AAPL240315C00172500)"
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={async () => {
                          if (!manualOptionSymbol) return;
                          setLoadingManualOption(true);
                          try {
                            // Opsiyon sembolünden bilgileri parse et
                            const match = manualOptionSymbol.match(/^([A-Z]+)(\d{6})([CP])(\d+)$/);
                            if (!match) {
                              setError("Geçersiz opsiyon sembol formatı. Format: SYMBOL + YYMMDD + C/P + STRIKE (örn: AAPL240315C00172500)");
                              setLoadingManualOption(false);
                              return;
                            }
                            
                            const [, underlyingSym, dateStr, type, strikeStr] = match;
                            const year = '20' + dateStr.substring(0, 2);
                            const month = dateStr.substring(2, 4);
                            const day = dateStr.substring(4, 6);
                            const expirationDate = new Date(`${year}-${month}-${day}`);
                            const strike = parseInt(strikeStr) / 1000;
                            
                            // Underlying price'ı al
                            let underlyingPrice = 0;
                            try {
                              const response = await fetch(`/api/alpaca/market-data/latest?symbol=${underlyingSym}`);
                              if (response.ok) {
                                const data = await response.json();
                                if (data.trade?.p) {
                                  underlyingPrice = data.trade.p;
                                }
                              }
                            } catch (error) {
                              console.warn('Underlying price alınamadı:', error);
                            }
                            
                            // Opsiyon verisini oluştur
                            const optionData: OptionData = {
                              symbol: manualOptionSymbol,
                              underlying_symbol: underlyingSym,
                              option_type: type === 'C' ? 'call' : 'put',
                              strike_price: strike,
                              expiration_date: expirationDate.toISOString().split('T')[0],
                              last_price: 0,
                              bid: 0,
                              ask: 0,
                              volume: 0,
                              open_interest: 0,
                              change: 0,
                              change_percent: 0,
                              implied_volatility: 0,
                              underlying_price: underlyingPrice,
                            };
                            
                            setManualOptionData(optionData);
                            setSelectedOption(optionData);
                            setSelectedUnderlying(underlyingSym);
                            setUnderlyingPrice(underlyingPrice);
                            setOptionsChain([optionData]); // Tek opsiyon olarak ekle
                            setError(null);
                          } catch (err: any) {
                            setError(err.message || "Opsiyon sembolü işlenemedi");
                          } finally {
                            setLoadingManualOption(false);
                          }
                        }}
                        disabled={!manualOptionSymbol || loadingManualOption}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingManualOption ? "Yükleniyor..." : "Opsiyon Sembolünü Kullan"}
                      </button>
                      {manualOptionData && (
                        <div className="p-3 bg-white rounded-lg border border-blue-200">
                          <div className="text-xs text-gray-600 mb-1">Opsiyon Bilgileri:</div>
                          <div className="text-sm font-semibold text-gray-900">
                            {manualOptionData.underlying_symbol} {manualOptionData.option_type === 'call' ? 'CALL' : 'PUT'} 
                            ${manualOptionData.strike_price} | {new Date(manualOptionData.expiration_date).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                    placeholder="Hisse senedi sembolü ara (örn: AAPL, TSLA)..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Popüler Semboller */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Popüler Semboller</p>
                  <div className="flex flex-wrap gap-2">
                    {popularStocks.map((stock) => (
                      <button
                        key={stock}
                        onClick={() => setSelectedUnderlying(stock)}
                        className="px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg text-sm font-semibold text-purple-700 transition-colors"
                      >
                        {stock}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Arama Sonuçları */}
                {searchQuery && (
                  <div className="space-y-2">
                    {popularStocks
                      .filter((stock) => stock.includes(searchQuery))
                      .map((stock) => (
                        <button
                          key={stock}
                          onClick={() => setSelectedUnderlying(stock)}
                          className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <span className="font-semibold">{stock}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Seçili Underlying ve Filtreler */}
                <div className="mb-4 space-y-3">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl flex items-center justify-between border border-purple-200">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Seçili Sembol:</span>
                        <span className="ml-2 font-bold text-lg text-purple-700">{selectedUnderlying}</span>
                      </div>
                      {underlyingPrice > 0 && (
                        <div className="px-3 py-1 bg-white rounded-lg border border-purple-200">
                          <span className="text-xs text-gray-600">Fiyat: </span>
                          <span className="font-bold text-purple-700">${underlyingPrice.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedUnderlying("")}
                      className="text-sm text-purple-600 hover:text-purple-800 font-semibold"
                    >
                      Değiştir
                    </button>
                  </div>

                  {/* Filtreler */}
                  <div className="flex flex-wrap gap-2">
                    {uniqueExpirations.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <select
                          value={selectedExpiration}
                          onChange={(e) => setSelectedExpiration(e.target.value)}
                          className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Tüm Vade Tarihleri</option>
                          {uniqueExpirations.map(exp => (
                            <option key={exp} value={exp}>
                              {new Date(exp).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <button
                      onClick={() => setShowGreeks(!showGreeks)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        showGreeks 
                          ? "bg-purple-100 border-purple-300 text-purple-700" 
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <BarChart3 className="w-4 h-4 inline mr-1" />
                      {showGreeks ? "Greeks Gizle" : "Greeks Göster"}
                    </button>
                  </div>
                </div>

                {/* Öneriler Bölümü */}
                {(recommendations.topGainers.length > 0 || recommendations.highVolume.length > 0) && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                      <h3 className="text-lg font-bold text-gray-900">Öneriler</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* En Çok Kazandıran / Kapatılması Gerekenler */}
                      {recommendations.topGainers.length > 0 && (
                        <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUpIcon className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-bold text-gray-900">
                              {type === "buy" ? "En Çok Kazandıran" : "Kazançlı Pozisyonlar"}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {recommendations.topGainers.slice(0, 3).map((opt, idx) => (
                              <button
                                key={opt.symbol}
                                onClick={() => openDetailModal(opt)}
                                className="w-full p-2 bg-white rounded-lg border border-yellow-200 hover:border-yellow-300 hover:shadow-sm transition-all text-left"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="flex items-center gap-1">
                                      <span className="font-semibold text-sm text-gray-900">{opt.underlying_symbol}</span>
                                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                                        opt.option_type === "call" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                      }`}>
                                        {opt.option_type === "call" ? "C" : "P"}
                                      </span>
                                      <span className="text-xs text-gray-600">${opt.strike_price}</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs font-bold text-green-600">
                                      +{opt.change_percent?.toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      ${opt.last_price?.toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* En Yüksek Hacim */}
                      {recommendations.highVolume.length > 0 && (
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Activity className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-bold text-gray-900">En Yüksek Hacim</span>
                          </div>
                          <div className="space-y-2">
                            {recommendations.highVolume.slice(0, 3).map((opt) => (
                              <button
                                key={opt.symbol}
                                onClick={() => openDetailModal(opt)}
                                className="w-full p-2 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all text-left"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="flex items-center gap-1">
                                      <span className="font-semibold text-sm text-gray-900">{opt.underlying_symbol}</span>
                                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                                        opt.option_type === "call" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                      }`}>
                                        {opt.option_type === "call" ? "C" : "P"}
                                      </span>
                                      <span className="text-xs text-gray-600">${opt.strike_price}</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs font-bold text-blue-600">
                                      {opt.volume?.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      ${opt.last_price?.toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* En Düşük Spread */}
                      {recommendations.lowSpread.length > 0 && (
                        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Target className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-bold text-gray-900">En Düşük Spread</span>
                          </div>
                          <div className="space-y-2">
                            {recommendations.lowSpread.slice(0, 3).map((opt: any) => (
                              <button
                                key={opt.symbol}
                                onClick={() => openDetailModal(opt)}
                                className="w-full p-2 bg-white rounded-lg border border-green-200 hover:border-green-300 hover:shadow-sm transition-all text-left"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="flex items-center gap-1">
                                      <span className="font-semibold text-sm text-gray-900">{opt.underlying_symbol}</span>
                                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                                        opt.option_type === "call" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                      }`}>
                                        {opt.option_type === "call" ? "C" : "P"}
                                      </span>
                                      <span className="text-xs text-gray-600">${opt.strike_price}</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs font-bold text-green-600">
                                      ${opt.spread?.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      ${opt.last_price?.toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}


                {/* Call/Put Tabs */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      activeTab === "all"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Tümü
                  </button>
                  <button
                    onClick={() => setActiveTab("call")}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      activeTab === "call"
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    CALL
                  </button>
                  <button
                    onClick={() => setActiveTab("put")}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      activeTab === "put"
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    PUT
                  </button>
                </div>

                {/* Opsiyon Listesi */}
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <p className="mt-2 text-gray-600">Opsiyon verileri yükleniyor...</p>
                  </div>
                ) : error ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-yellow-800 mb-1">Opsiyon Bulunamadı</p>
                        <p className="text-xs text-yellow-700">{error}</p>
                        <p className="text-xs text-yellow-700 mt-2">
                          Alpaca Market Data API opsiyon sembolleri için stocks endpoint'ini desteklemiyor. 
                          Lütfen mevcut opsiyon pozisyonlarınızı kullanın veya opsiyon sembolünü manuel olarak girin.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : filteredOptions.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredOptions.map((option) => {
                      const moneyness = getMoneyness(option);
                      const spread = option.ask && option.bid ? option.ask - option.bid : 0;
                      return (
                        <motion.div
                          key={option.symbol}
                          onClick={() => setSelectedOption(option)}
                          className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                            selectedOption?.symbol === option.symbol
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 hover:border-purple-300 bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-gray-900">{option.underlying_symbol}</span>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                  option.option_type === "call"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}>
                                  {option.option_type === "call" ? "CALL" : "PUT"}
                                </span>
                                <span className="text-sm font-semibold text-gray-700">${option.strike_price}</span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                  moneyness === "ITM" ? "bg-green-100 text-green-700"
                                  : moneyness === "ATM" ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                                }`}>
                                  {moneyness}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                                <div>
                                  <span className="text-gray-500">Vade: </span>
                                  <span className="font-medium">{new Date(option.expiration_date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}</span>
                                </div>
                                {option.bid && option.ask && (
                                  <div>
                                    <span className="text-gray-500">Spread: </span>
                                    <span className="font-medium">${spread.toFixed(2)}</span>
                                  </div>
                                )}
                                {option.volume !== undefined && (
                                  <div>
                                    <span className="text-gray-500">Hacim: </span>
                                    <span className="font-medium">{option.volume.toLocaleString()}</span>
                                  </div>
                                )}
                                {option.open_interest !== undefined && (
                                  <div>
                                    <span className="text-gray-500">OI: </span>
                                    <span className="font-medium">{option.open_interest.toLocaleString()}</span>
                                  </div>
                                )}
                              </div>

                              {showGreeks && (option.delta !== undefined || option.theta !== undefined) && (
                                <div className="flex gap-3 text-xs pt-2 border-t border-gray-200">
                                  {option.delta !== undefined && (
                                    <div>
                                      <span className="text-gray-500">Δ: </span>
                                      <span className="font-semibold">{option.delta.toFixed(3)}</span>
                                    </div>
                                  )}
                                  {option.gamma !== undefined && (
                                    <div>
                                      <span className="text-gray-500">Γ: </span>
                                      <span className="font-semibold">{option.gamma.toFixed(4)}</span>
                                    </div>
                                  )}
                                  {option.theta !== undefined && (
                                    <div>
                                      <span className="text-gray-500">Θ: </span>
                                      <span className="font-semibold">{option.theta.toFixed(3)}</span>
                                    </div>
                                  )}
                                  {option.vega !== undefined && (
                                    <div>
                                      <span className="text-gray-500">ν: </span>
                                      <span className="font-semibold">{option.vega.toFixed(3)}</span>
                                    </div>
                                  )}
                                  {option.implied_volatility !== undefined && (
                                    <div>
                                      <span className="text-gray-500">IV: </span>
                                      <span className="font-semibold">{option.implied_volatility.toFixed(1)}%</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="text-right flex flex-col items-end gap-2">
                              <div>
                                {option.last_price && (
                                  <div className="font-bold text-lg text-gray-900">${option.last_price.toFixed(2)}</div>
                                )}
                                {option.bid && option.ask && (
                                  <div className="text-xs text-gray-500">
                                    ${option.bid.toFixed(2)} / ${option.ask.toFixed(2)}
                                  </div>
                                )}
                                {option.change_percent !== undefined && (
                                  <div className={`text-xs font-semibold mt-1 ${
                                    option.change_percent >= 0 ? "text-green-600" : "text-red-600"
                                  }`}>
                                    {option.change_percent >= 0 ? "+" : ""}{option.change_percent.toFixed(2)}%
                                  </div>
                                )}
                              </div>
                              
                              {/* Hızlı Al/Sat Butonları */}
                              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickTrade(option, 1);
                                  }}
                                  className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                                    type === "buy"
                                      ? "bg-green-500 hover:bg-green-600 text-white shadow-sm"
                                      : "bg-red-500 hover:bg-red-600 text-white shadow-sm"
                                  }`}
                                >
                                  {type === "buy" ? "Al" : "Sat"}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDetailModal(option);
                                  }}
                                  className="px-3 py-1.5 text-xs font-semibold rounded bg-purple-500 hover:bg-purple-600 text-white shadow-sm transition-colors"
                                >
                                  Detay
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : !selectedOption ? (
                  <div className="text-center py-12 text-gray-500">
                    {error ? (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 text-left">
                            <p className="text-sm font-semibold text-yellow-800 mb-1">Opsiyon Bulunamadı</p>
                            <p className="text-xs text-yellow-700">{error}</p>
                            <p className="text-xs text-yellow-700 mt-2">
                              Alpaca Market Data API opsiyon sembolleri için stocks endpoint'ini desteklemiyor. 
                              Lütfen yukarıdaki "Manuel Opsiyon Sembolü" bölümünü kullanarak opsiyon sembolünü girin.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      "Opsiyon bulunamadı"
                    )}
                  </div>
                ) : null}

                {/* Seçili Opsiyon Detayları ve Emir Formu */}
                {selectedOption && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg">Emir Detayları</h3>
                      <button
                        onClick={() => {
                          setSelectedOption(null);
                          setError(null);
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Kapat
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Opsiyon Detayları */}
                      <div className="p-4 bg-white rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-bold text-lg">{selectedOption.underlying_symbol}</span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            selectedOption.option_type === "call"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {selectedOption.option_type === "call" ? "CALL" : "PUT"}
                          </span>
                          <span className="text-sm font-semibold text-gray-700">${selectedOption.strike_price}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            getMoneyness(selectedOption) === "ITM" ? "bg-green-100 text-green-700"
                            : getMoneyness(selectedOption) === "ATM" ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                          }`}>
                            {getMoneyness(selectedOption)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Vade: </span>
                            <span className="font-medium">{new Date(selectedOption.expiration_date).toLocaleDateString('tr-TR')}</span>
                          </div>
                          {selectedOption.last_price && (
                            <div>
                              <span className="text-gray-500">Son Fiyat: </span>
                              <span className="font-bold">${selectedOption.last_price.toFixed(2)}</span>
                            </div>
                          )}
                          {selectedOption.bid && selectedOption.ask && (
                            <>
                              <div>
                                <span className="text-gray-500">Bid: </span>
                                <span className="font-medium">${selectedOption.bid.toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Ask: </span>
                                <span className="font-medium">${selectedOption.ask.toFixed(2)}</span>
                              </div>
                            </>
                          )}
                          {selectedOption.volume !== undefined && (
                            <div>
                              <span className="text-gray-500">Hacim: </span>
                              <span className="font-medium">{selectedOption.volume.toLocaleString()}</span>
                            </div>
                          )}
                          {selectedOption.open_interest !== undefined && (
                            <div>
                              <span className="text-gray-500">Open Interest: </span>
                              <span className="font-medium">{selectedOption.open_interest.toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        {/* Greeks */}
                        {(selectedOption.delta !== undefined || selectedOption.theta !== undefined) && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-xs font-semibold text-gray-600 mb-2">Greeks:</div>
                            <div className="grid grid-cols-4 gap-2 text-xs">
                              {selectedOption.delta !== undefined && (
                                <div>
                                  <span className="text-gray-500">Delta (Δ): </span>
                                  <span className="font-semibold">{selectedOption.delta.toFixed(3)}</span>
                                </div>
                              )}
                              {selectedOption.gamma !== undefined && (
                                <div>
                                  <span className="text-gray-500">Gamma (Γ): </span>
                                  <span className="font-semibold">{selectedOption.gamma.toFixed(4)}</span>
                                </div>
                              )}
                              {selectedOption.theta !== undefined && (
                                <div>
                                  <span className="text-gray-500">Theta (Θ): </span>
                                  <span className="font-semibold">{selectedOption.theta.toFixed(3)}</span>
                                </div>
                              )}
                              {selectedOption.vega !== undefined && (
                                <div>
                                  <span className="text-gray-500">Vega (ν): </span>
                                  <span className="font-semibold">{selectedOption.vega.toFixed(3)}</span>
                                </div>
                              )}
                            </div>
                            {selectedOption.implied_volatility !== undefined && (
                              <div className="mt-2 text-xs">
                                <span className="text-gray-500">Implied Volatility: </span>
                                <span className="font-semibold">{selectedOption.implied_volatility.toFixed(1)}%</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Miktar (Kontrat)
                        </label>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          min="1"
                          step="1"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-2 text-gray-900 bg-white"
                        />
                        {/* Hızlı Miktar Seçimi */}
                        <div className="flex gap-2">
                          {[1, 5, 10, 25, 100].map(qty => (
                            <button
                              key={qty}
                              onClick={() => setQuantity(qty.toString())}
                              className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                                quantity === qty.toString()
                                  ? "bg-purple-600 text-white border-purple-600"
                                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {qty}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Toplam Maliyet */}
                      {totalCost > 0 && (
                        <div className="p-3 bg-white rounded-lg border border-purple-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">Toplam Maliyet:</span>
                            <span className="text-lg font-bold text-purple-700">
                              ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {quantity} kontrat × ${(orderType === "limit" && limitPrice ? parseFloat(limitPrice) : selectedOption.last_price || selectedOption.ask || selectedOption.bid || 0).toFixed(2)} × 100
                          </div>
                          {type === "buy" && accountData && (() => {
                            const buyingPower = parseFloat(accountData.buying_power || accountData.cash || '0');
                            const isInsufficient = totalCost > buyingPower;
                            return isInsufficient ? (
                              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-xs font-semibold text-red-700">Yetersiz Bakiye</p>
                                  <p className="text-xs text-red-600 mt-0.5">
                                    Gerekli: ${totalCost.toFixed(2)} | Mevcut: ${buyingPower.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <p className="text-xs text-green-700">
                                  Yeterli bakiye mevcut (${buyingPower.toFixed(2)})
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Emir Tipi
                        </label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setOrderType("market")}
                            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                              orderType === "market"
                                ? "bg-purple-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            Piyasa
                          </button>
                          <button
                            onClick={() => setOrderType("limit")}
                            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                              orderType === "limit"
                                ? "bg-purple-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            Limit
                          </button>
                        </div>
                      </div>

                      {orderType === "limit" && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Limit Fiyat ($)
                          </label>
                          <input
                            type="number"
                            value={limitPrice}
                            onChange={(e) => setLimitPrice(e.target.value)}
                            step="0.01"
                            min="0"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                          />
                        </div>
                      )}

                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                          {error}
                        </div>
                      )}

                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                          type === "buy"
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                            : "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
                        } ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {submitting ? "İşleniyor..." : type === "buy" ? "Opsiyon Al" : "Opsiyon Sat"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Detay Modal */}
      <AnimatePresence>
        {detailModalOpen && detailOption && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setDetailModalOpen(false);
                setDetailOption(null);
                setShowDetailTradeForm(false);
                setDetailTradeError(null);
                setDetailTradeStatus("idle");
              }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Detay Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-6 text-white">
                <button
                  onClick={() => {
                    setDetailModalOpen(false);
                    setDetailOption(null);
                    setShowDetailTradeForm(false);
                    setDetailTradeError(null);
                    setDetailTradeStatus("idle");
                  }}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    detailOption.option_type === "call" ? "bg-green-500/20" : "bg-red-500/20"
                  }`}>
                    {detailOption.option_type === "call" ? (
                      <TrendingUp className="w-6 h-6" />
                    ) : (
                      <TrendingDown className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {detailOption.underlying_symbol} {detailOption.option_type === "call" ? "CALL" : "PUT"}
                    </h2>
                    <p className="text-sm opacity-90">Strike: ${detailOption.strike_price} | Vade: {new Date(detailOption.expiration_date).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Özet Bilgiler */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                    <div className="text-xs text-gray-600 mb-1">Son Fiyat</div>
                    <div className="text-xl font-bold text-gray-900">
                      ${detailOption.last_price?.toFixed(2) || "N/A"}
                    </div>
                  </div>
                  {detailOption.bid && detailOption.ask && (
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="text-xs text-gray-600 mb-1">Spread</div>
                      <div className="text-xl font-bold text-gray-900">
                        ${((detailOption.ask || 0) - (detailOption.bid || 0)).toFixed(2)}
                      </div>
                    </div>
                  )}
                  {detailOption.volume !== undefined && (
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="text-xs text-gray-600 mb-1">Hacim</div>
                      <div className="text-xl font-bold text-gray-900">
                        {detailOption.volume.toLocaleString()}
                      </div>
                    </div>
                  )}
                  {detailOption.implied_volatility !== undefined && (
                    <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
                      <div className="text-xs text-gray-600 mb-1">IV</div>
                      <div className="text-xl font-bold text-gray-900">
                        {detailOption.implied_volatility.toFixed(1)}%
                      </div>
                    </div>
                  )}
                </div>

                {/* Greeks Detayları */}
                {(detailOption.delta !== undefined || detailOption.theta !== undefined) && (
                  <div className="mb-6 p-5 bg-white rounded-xl border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      Greeks Analizi
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {detailOption.delta !== undefined && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">Delta (Δ)</div>
                          <div className="text-lg font-bold text-gray-900">{detailOption.delta.toFixed(3)}</div>
                          <div className="text-xs text-gray-500 mt-1">Fiyat hassasiyeti</div>
                        </div>
                      )}
                      {detailOption.gamma !== undefined && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">Gamma (Γ)</div>
                          <div className="text-lg font-bold text-gray-900">{detailOption.gamma.toFixed(4)}</div>
                          <div className="text-xs text-gray-500 mt-1">Delta değişimi</div>
                        </div>
                      )}
                      {detailOption.theta !== undefined && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">Theta (Θ)</div>
                          <div className="text-lg font-bold text-red-600">{detailOption.theta.toFixed(3)}</div>
                          <div className="text-xs text-gray-500 mt-1">Zaman erozyonu/gün</div>
                        </div>
                      )}
                      {detailOption.vega !== undefined && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">Vega (ν)</div>
                          <div className="text-lg font-bold text-gray-900">{detailOption.vega.toFixed(3)}</div>
                          <div className="text-xs text-gray-500 mt-1">Volatilite hassasiyeti</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Kazanç/Kayıp Senaryoları */}
                {detailOption.last_price && detailOption.underlying_price && (
                  <div className="mb-6 p-5 bg-white rounded-xl border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      Kazanç/Kayıp Senaryoları (1 Kontrat)
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-3 text-gray-700 font-semibold">Fiyat Değişimi</th>
                            <th className="text-left py-2 px-3 text-gray-700 font-semibold">Yeni Fiyat</th>
                            <th className="text-right py-2 px-3 text-gray-700 font-semibold">Kazanç/Kayıp</th>
                            <th className="text-right py-2 px-3 text-gray-700 font-semibold">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {calculateProfitLossScenarios(detailOption, 1)?.map((scenario, idx) => (
                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-2 px-3">
                                <span className={`font-medium ${
                                  scenario.priceChange >= 0 ? "text-green-600" : "text-red-600"
                                }`}>
                                  {scenario.priceChange >= 0 ? "+" : ""}{scenario.priceChange}%
                                </span>
                              </td>
                              <td className="py-2 px-3 text-gray-700">${scenario.newPrice.toFixed(2)}</td>
                              <td className={`py-2 px-3 text-right font-semibold ${
                                scenario.profit >= 0 ? "text-green-600" : "text-red-600"
                              }`}>
                                {scenario.profit >= 0 ? "+" : ""}${scenario.profit.toFixed(2)}
                              </td>
                              <td className={`py-2 px-3 text-right font-semibold ${
                                scenario.profitPercent >= 0 ? "text-green-600" : "text-red-600"
                              }`}>
                                {scenario.profitPercent >= 0 ? "+" : ""}{scenario.profitPercent.toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Risk Analizi */}
                <div className="mb-6 p-5 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Risk Analizi
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-sm text-gray-700">Maksimum Kayıp Potansiyeli</span>
                      <span className="font-bold text-red-600">
                        ${((detailOption.last_price || 0) * 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-sm text-gray-700">Maksimum Kazanç Potansiyeli</span>
                      <span className="font-bold text-green-600">Sınırsız</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-sm text-gray-700">Break-Even Fiyat</span>
                      <span className="font-bold text-gray-900">
                        ${detailOption.option_type === "call" 
                          ? (detailOption.strike_price + (detailOption.last_price || 0)).toFixed(2)
                          : (detailOption.strike_price - (detailOption.last_price || 0)).toFixed(2)
                        }
                      </span>
                    </div>
                    {detailOption.theta !== undefined && (
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-sm text-gray-700">Günlük Zaman Erozyonu</span>
                        <span className="font-bold text-red-600">
                          ${(Math.abs(detailOption.theta) * 100).toFixed(2)}/gün
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Al/Sat Butonları */}
                {!showDetailTradeForm ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setDetailTradeType("buy");
                        setShowDetailTradeForm(true);
                        setDetailTradeQuantity("1");
                        setDetailTradeOrderType("market");
                        setDetailTradeLimitPrice("");
                        setDetailTradeError(null);
                      }}
                      className="flex-1 py-3 rounded-xl font-bold text-white transition-all bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      Al
                    </button>
                    <button
                      onClick={() => {
                        setDetailTradeType("sell");
                        setShowDetailTradeForm(true);
                        setDetailTradeQuantity("1");
                        setDetailTradeOrderType("market");
                        setDetailTradeLimitPrice("");
                        setDetailTradeError(null);
                      }}
                      className="flex-1 py-3 rounded-xl font-bold text-white transition-all bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
                    >
                      Sat
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        {detailTradeType === "buy" ? "Opsiyon Al" : "Opsiyon Sat"}
                      </h3>
                      <button
                        onClick={() => {
                          setShowDetailTradeForm(false);
                          setDetailTradeError(null);
                          setDetailTradeStatus("idle");
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!detailOption || !accountId || !detailTradeQuantity) {
                          setDetailTradeError("Lütfen tüm alanları doldurun");
                          return;
                        }

                        const qty = parseFloat(detailTradeQuantity);
                        if (isNaN(qty) || qty <= 0) {
                          setDetailTradeError("Geçerli bir miktar girin");
                          return;
                        }

                        if (detailTradeOrderType === "limit" && (!detailTradeLimitPrice || parseFloat(detailTradeLimitPrice) <= 0)) {
                          setDetailTradeError("Limit fiyat girin");
                          return;
                        }

                        // Bakiye kontrolü (sadece alım işlemleri için)
                        if (detailTradeType === "buy") {
                          const estimatedCost = detailTradeOrderType === "limit" && detailTradeLimitPrice 
                            ? parseFloat(detailTradeLimitPrice) * qty * 100 
                            : (detailOption.last_price || 0) * qty * 100;
                          
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
                              latestAccountSnapshot.buying_power || latestAccountSnapshot.cash || '0'
                            );
                            
                            if (estimatedCost > buyingPower) {
                              setDetailTradeError(
                                `Yetersiz bakiye! Gerekli: $${estimatedCost.toFixed(2)}, Mevcut: $${buyingPower.toFixed(2)}. Lütfen hesabınıza para yatırın.`
                              );
                              return;
                            }
                          }
                        }

                        setDetailTradeSubmitting(true);
                        setDetailTradeError(null);
                        setDetailTradeStatus("loading");

                        try {
                          const orderData: any = {
                            accountId,
                            symbol: detailOption.symbol,
                            qty: Math.floor(qty),
                            side: detailTradeType,
                            type: detailTradeOrderType,
                            time_in_force: "day",
                          };

                          if (detailTradeOrderType === "limit") {
                            orderData.limit_price = parseFloat(detailTradeLimitPrice);
                          }

                          const response = await fetch("/api/alpaca/options", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify(orderData),
                          });

                          // Response'un boş olup olmadığını kontrol et
                          const text = await response.text();
                          if (!text || text.trim().length === 0) {
                            throw new Error("Sunucudan yanıt alınamadı");
                          }

                          let data;
                          try {
                            data = JSON.parse(text);
                          } catch (parseError) {
                            throw new Error("Sunucu yanıtı parse edilemedi");
                          }

                          if (!response.ok || !data.success) {
                            // Özel hata mesajı göster
                            let errorMsg = data.error || data.message || "Emir verilemedi";
                            
                            // Options not authorized hatası için özel mesaj
                            if (data.code === 'OPTIONS_NOT_AUTHORIZED' || 
                                errorMsg.includes('not authorized to trade options') ||
                                errorMsg.includes('opsiyon işlemleri için yetkilendirilmemiş')) {
                              errorMsg = 'Hesabınız opsiyon işlemleri için yetkilendirilmemiş. Alpaca sandbox hesabınızın opsiyon trading için aktif edilmesi gerekiyor. Lütfen Alpaca Broker Dashboard\'dan hesap ayarlarınızı kontrol edin.';
                            }
                            // Insufficient buying power hatası için özel mesaj
                            else if (data.code === 'INSUFFICIENT_BUYING_POWER' || 
                                     errorMsg.includes('Yetersiz alım gücü') ||
                                     errorMsg.includes('buying power')) {
                              errorMsg = errorMsg; // Zaten açıklayıcı
                            }
                            
                            throw new Error(errorMsg);
                          }

                          // Başarılı
                          setDetailTradeStatus("success");
                          setTimeout(() => {
                            setShowDetailTradeForm(false);
                            setDetailModalOpen(false);
                            setDetailOption(null);
                            setDetailTradeStatus("idle");
                            setDetailTradeQuantity("1");
                            setDetailTradeOrderType("market");
                            setDetailTradeLimitPrice("");
                            if (onSuccess) {
                              onSuccess();
                            }
                            window.location.reload();
                          }, 1500);
                        } catch (err: any) {
                          console.error("Order submission error:", err);
                          setDetailTradeError(err.message || "Emir verilemedi");
                          setDetailTradeStatus("idle");
                        } finally {
                          setDetailTradeSubmitting(false);
                        }
                      }}
                      className="space-y-4"
                    >
                      {/* Miktar */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Miktar (Kontrat)
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={detailTradeQuantity}
                          onChange={(e) => setDetailTradeQuantity(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                          required
                        />
                      </div>

                      {/* Emir Tipi */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Emir Tipi
                        </label>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setDetailTradeOrderType("market");
                              setDetailTradeLimitPrice("");
                            }}
                            className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                              detailTradeOrderType === "market"
                                ? "bg-purple-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            Piyasa
                          </button>
                          <button
                            type="button"
                            onClick={() => setDetailTradeOrderType("limit")}
                            className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                              detailTradeOrderType === "limit"
                                ? "bg-purple-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            Limit
                          </button>
                        </div>
                      </div>

                      {/* Limit Fiyat */}
                      {detailTradeOrderType === "limit" && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Limit Fiyat ($)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={detailTradeLimitPrice}
                            onChange={(e) => setDetailTradeLimitPrice(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                            required
                          />
                        </div>
                      )}

                      {/* Toplam Fiyat */}
                      {detailOption && detailTradeQuantity && (
                        <div className="p-4 bg-white rounded-xl border-2 border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">Toplam Maliyet</span>
                            <span className="text-lg font-bold text-gray-900">
                              $
                              {(
                                (detailTradeOrderType === "limit" && detailTradeLimitPrice
                                  ? parseFloat(detailTradeLimitPrice)
                                  : detailOption.last_price || 0) *
                                parseFloat(detailTradeQuantity || "0") *
                                100
                              ).toFixed(2)}
                            </span>
                          </div>
                          {detailTradeType === "buy" && accountData && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Mevcut Bakiye</span>
                                <span className="font-semibold text-gray-700">
                                  ${parseFloat(accountData.buying_power || accountData.cash || '0').toFixed(2)}
                                </span>
                              </div>
                              {(() => {
                                const estimatedCost =
                                  (detailTradeOrderType === "limit" && detailTradeLimitPrice
                                    ? parseFloat(detailTradeLimitPrice)
                                    : detailOption.last_price || 0) *
                                  parseFloat(detailTradeQuantity || "0") *
                                  100;
                                const buyingPower = parseFloat(accountData.buying_power || accountData.cash || '0');
                                const isSufficient = estimatedCost <= buyingPower;
                                return (
                                  <div className={`mt-2 p-2 rounded-lg ${
                                    isSufficient ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                                  }`}>
                                    <div className="flex items-center justify-between text-xs">
                                      <span className={isSufficient ? "text-green-700" : "text-red-700"}>
                                        {isSufficient ? "✓ Yeterli bakiye" : "✗ Yetersiz bakiye"}
                                      </span>
                                      <span className={`font-bold ${isSufficient ? "text-green-700" : "text-red-700"}`}>
                                        {isSufficient ? "" : "-"}
                                        ${Math.abs(estimatedCost - buyingPower).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Hata Mesajı */}
                      {detailTradeError && (
                        <div className={`p-4 rounded-xl text-sm ${
                          detailTradeError.includes('yetkilendirilmemiş') || detailTradeError.includes('not authorized')
                            ? 'bg-yellow-50 border-2 border-yellow-300 text-yellow-800'
                            : 'bg-red-50 border border-red-200 text-red-700'
                        }`}>
                          <div className="flex items-start gap-2">
                            {detailTradeError.includes('yetkilendirilmemiş') || detailTradeError.includes('not authorized') ? (
                              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="font-semibold mb-1">
                                {detailTradeError.includes('yetkilendirilmemiş') || detailTradeError.includes('not authorized')
                                  ? 'Opsiyon Trading Yetkilendirmesi Gerekli'
                                  : 'Hata'}
                              </p>
                              <p>{detailTradeError}</p>
                              {(detailTradeError.includes('yetkilendirilmemiş') || detailTradeError.includes('not authorized')) && (
                                <p className="mt-2 text-xs opacity-90">
                                  Not: Alpaca sandbox ortamında opsiyon trading bazı hesaplarda varsayılan olarak kapalı olabilir. 
                                  Hesap ayarlarınızdan opsiyon trading'i aktif etmeniz gerekmektedir.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Gönder Butonu */}
                      <button
                        type="submit"
                        disabled={detailTradeSubmitting || detailTradeStatus === "loading"}
                        className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                          detailTradeType === "buy"
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                            : "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
                        } ${detailTradeSubmitting || detailTradeStatus === "loading" ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {detailTradeStatus === "loading" ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            İşleniyor...
                          </span>
                        ) : detailTradeStatus === "success" ? (
                          <span className="flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            Başarılı!
                          </span>
                        ) : (
                          detailTradeType === "buy" ? "Opsiyon Al" : "Opsiyon Sat"
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}

