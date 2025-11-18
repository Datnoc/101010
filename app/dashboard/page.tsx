"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import DashboardNavbar from "@/components/DashboardNavbar";
import TradeModal from "@/components/TradeModal";
import TransferModal from "@/components/TransferModal";
import OptionsModal from "@/components/OptionsModal";
import KYCModal from "@/components/KYCModal";
import CardApplicationModal from "@/components/CardApplicationModal";
import CardApplicationTrackingModal from "@/components/CardApplicationTrackingModal";
import DepositModal from "@/components/DepositModal";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Coins,
  CreditCard,
  BarChart3,
  Activity,
  PieChart,
  ArrowRight,
  Plus,
  Send,
  Receipt,
  Building2,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Search,
  Star,
  Sparkles,
  Filter,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Volume2,
  DollarSign as DollarSignIcon,
  Clock,
  Info,
  Zap,
  Award,
  Target,
  FileText,
  Sun,
  Moon,
  Lock,
  CheckCircle,
  Shield,
  ShoppingCart,
  Eye,
  EyeOff,
  Unlock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ComposedChart, Area, AreaChart, ReferenceLine, BarProps } from "recharts";
import { popularSymbols, searchSymbols, searchSymbolsFromAPI, SymbolOption } from "@/lib/symbols";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

export default function DashboardPage() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  
  const [accountData, setAccountData] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [cryptoPositions, setCryptoPositions] = useState<any[]>([]);
  const [optionsPositions, setOptionsPositions] = useState<any[]>([]);
  const [topGainingOptions, setTopGainingOptions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [orderActionMessage, setOrderActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // 15 dakikalık chart verileri
  const [stockChartData, setStockChartData] = useState<any[]>([]);
  const [cryptoChartData, setCryptoChartData] = useState<any[]>([]);
  const [optionsChartData, setOptionsChartData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [portfolioHistory, setPortfolioHistory] = useState<any>(null);
  const [portfolioHistoryLoading, setPortfolioHistoryLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [portfolioTimeRange, setPortfolioTimeRange] = useState<'1d' | '7d' | '30d' | '90d' | '1y'>('30d');
  
  // Mambu data states
  const [mambuAccount, setMambuAccount] = useState<any>(null);
  const [mambuTransactions, setMambuTransactions] = useState<any[]>([]);
  const [mambuCards, setMambuCards] = useState<any[]>([]);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [mambuAccountModalOpen, setMambuAccountModalOpen] = useState(false);
  const [mambuAccountFormData, setMambuAccountFormData] = useState({
    productTypeKey: 'DEFAULT_SAVINGS',
    currencyCode: 'USD',
    accountName: '',
    notes: '',
  });
  const [cardsLoading, setCardsLoading] = useState(false);
  const [cardVisibility, setCardVisibility] = useState<Record<string, boolean>>({});
  
  // Tab state
  const [activeTab, setActiveTab] = useState<"nakit" | "borsa" | "kripto" | "opsiyon">("nakit");
  
  // Modal states
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeModalType, setTradeModalType] = useState<"buy" | "sell">("buy");
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferToAlpacaModalOpen, setTransferToAlpacaModalOpen] = useState(false);
  const [transferFromAlpacaModalOpen, setTransferFromAlpacaModalOpen] = useState(false);
  const [cryptoModalOpen, setCryptoModalOpen] = useState(false);
  const [cryptoModalType, setCryptoModalType] = useState<"buy" | "sell">("buy");
  const [optionsModalOpen, setOptionsModalOpen] = useState(false);
  const [optionsModalType, setOptionsModalType] = useState<"buy" | "sell">("buy");
  const [cardApplicationModalOpen, setCardApplicationModalOpen] = useState(false);
  const [selectedOptionsSymbol, setSelectedOptionsSymbol] = useState<string | null>(null);
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);
  
  // KYC ve Alpaca hesap kontrolü state'leri
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [kycVerified, setKycVerified] = useState<boolean | null>(null);
  const [checkingKYC, setCheckingKYC] = useState(false);
  const [alpacaAccountExists, setAlpacaAccountExists] = useState<boolean | null>(null);
  const [checkingAlpacaAccount, setCheckingAlpacaAccount] = useState(false);
  const [alpacaAccountId, setAlpacaAccountId] = useState<string | null>(null);
  
  // Market clock state
  const [marketClock, setMarketClock] = useState<any>(null);
  const [marketClockLoading, setMarketClockLoading] = useState(false);
  const [marketHours, setMarketHours] = useState<any>(null);
  const [marketHoursLoading, setMarketHoursLoading] = useState(false);

  const effectiveAccountId = useMemo(() => alpacaAccountId || user?.alpacaAccountId || null, [alpacaAccountId, user?.alpacaAccountId]);
  
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Kart başvuruları state
  const [cardApplications, setCardApplications] = useState<any[]>([]);
  const [cardApplicationsLoading, setCardApplicationsLoading] = useState(false);
  const [cardApplicationTrackingModalOpen, setCardApplicationTrackingModalOpen] = useState(false);

  // Initialize dark mode on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      const isDark = saved === 'true';
      setIsDarkMode(isDark);
      // Immediately apply to DOM
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // Refs for elements that need inline style updates
  const borsaHeaderRef = useRef<HTMLDivElement>(null);
  const kriptoHeaderRef = useRef<HTMLDivElement>(null);
  const opsiyonHeaderRef = useRef<HTMLDivElement>(null);
  const popularKriptoRef = useRef<HTMLDivElement>(null);
  const kriptoPositionsRef = useRef<HTMLDivElement>(null);
  const lastAccountSnapshotRef = useRef<string | null>(null);

  // Dark mode toggle
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
      }

      // Update inline styles for elements with refs - use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        const updateElementStyles = (el: HTMLElement | null, isDark: boolean) => {
          if (!el) return;
          if (isDark) {
            el.style.background = 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(3, 7, 18, 0.95) 100%)';
            el.style.boxShadow = '0 20px 60px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(31, 41, 55, 0.6)';
          } else {
            el.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)';
            el.style.boxShadow = '0 20px 60px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)';
          }
        };

        updateElementStyles(borsaHeaderRef.current, isDarkMode);
        updateElementStyles(kriptoHeaderRef.current, isDarkMode);
        updateElementStyles(opsiyonHeaderRef.current, isDarkMode);
        
        if (popularKriptoRef.current) {
          if (isDarkMode) {
            popularKriptoRef.current.style.background = 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(3, 7, 18, 0.95) 100%)';
            popularKriptoRef.current.style.boxShadow = '0 20px 60px -12px rgba(0, 0, 0, 0.5)';
          } else {
            popularKriptoRef.current.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)';
            popularKriptoRef.current.style.boxShadow = '0 20px 60px -12px rgba(0, 0, 0, 0.15)';
          }
        }
        
        if (kriptoPositionsRef.current) {
          if (isDarkMode) {
            kriptoPositionsRef.current.style.background = 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(3, 7, 18, 0.95) 100%)';
            kriptoPositionsRef.current.style.boxShadow = '0 20px 60px -12px rgba(0, 0, 0, 0.5)';
          } else {
            kriptoPositionsRef.current.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)';
            kriptoPositionsRef.current.style.boxShadow = '0 20px 60px -12px rgba(0, 0, 0, 0.15)';
          }
        }
      });
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    
    // Immediately update DOM before state update
    if (typeof window !== 'undefined') {
      if (newValue) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
      }
    }
    
    // Update state - this will trigger useEffect
    setIsDarkMode(newValue);
  };
  
  // Alpaca hesap oluşturma form state'leri
  const [accountFormData, setAccountFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    dateOfBirth: "",
    taxId: "",
    taxIdType: "USA_SSN" as "USA_SSN" | "USA_ITIN" | "USA_EIN" | "NON_USA",
  });
  const [accountFormSubmitting, setAccountFormSubmitting] = useState(false);
  const [accountFormError, setAccountFormError] = useState<string | null>(null);
  const [accountFormSuccess, setAccountFormSuccess] = useState(false);

  // User bilgilerini form'a yükle
  useEffect(() => {
    if (user) {
      setAccountFormData(prev => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      }));
    }
  }, [user]);
  
  // Borsa ekranı için state'ler
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SymbolOption[]>([]);
  const [popularStocks, setPopularStocks] = useState<Array<SymbolOption & { 
    price?: number; 
    change?: number; 
    changePercent?: number;
    volume?: number;
    high?: number;
    low?: number;
    open?: number;
    previousClose?: number;
  }>>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [stockFilter, setStockFilter] = useState<"all" | "gainers" | "losers" | "volume">("all");
  const [watchlist, setWatchlist] = useState<string[]>([]);
  
  // Detay modal state'leri
  const [symbolDetailModalOpen, setSymbolDetailModalOpen] = useState(false);
  const [selectedSymbolDetail, setSelectedSymbolDetail] = useState<{
    symbol: string;
    name: string;
    type: 'stock' | 'crypto' | 'option';
    price?: number;
    change?: number;
    changePercent?: number;
  } | null>(null);
  const [symbolDetailData, setSymbolDetailData] = useState<any>(null);
  const [symbolDetailChartData, setSymbolDetailChartData] = useState<any[]>([]);
  const [marketDepth, setMarketDepth] = useState<{ bids: Array<{ price: string; size: string }>; asks: Array<{ price: string; size: string }> } | null>(null);
  const [marketDepthLoading, setMarketDepthLoading] = useState(false);
  
  // Market Analysis states
  const [bullBearData, setBullBearData] = useState<any>(null);
  const [bullBearLoading, setBullBearLoading] = useState(false);
  const [settlementData, setSettlementData] = useState<any>(null);
  const [settlementLoading, setSettlementLoading] = useState(false);
  
  // Grid Layout state
  const [borsaLayout, setBorsaLayout] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('borsa-layout');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved layout:', e);
        }
      }
    }
        // Default layout - görseldeki düzene göre (3 sütun)
        return [
          { i: 'depth', x: 0, y: 0, w: 1, h: 2, minW: 1, minH: 2 }, // Sol: Derinlik Analizleri
          { i: 'popular', x: 1, y: 0, w: 1, h: 3, minW: 1, minH: 2 }, // Orta: Popüler Hisse Senetleri (daha büyük)
          { i: 'orders', x: 2, y: 0, w: 1, h: 1, minW: 1, minH: 1 }, // Sağ üst: Emir Listesi
          { i: 'market', x: 2, y: 1, w: 1, h: 2, minW: 1, minH: 1 }, // Sağ alt: Market Analizi
          { i: 'bull-bear', x: 0, y: 2, w: 1, h: 1.5, minW: 1, minH: 1 }, // Sol alt: Boğa/Ayı Sezonu
          { i: 'broker', x: 1, y: 3, w: 1, h: 1.5, minW: 1, minH: 1 }, // Orta: Aracı Kurum Dağılımı
          { i: 'settlement', x: 2, y: 3, w: 1, h: 1.5, minW: 1, minH: 1 }, // Sağ: Takas Analizi
          { i: 'performance', x: 0, y: 3.5, w: 3, h: 2, minW: 2, minH: 2 }, // Alt: Pozisyon Performansı (tam genişlik)
        ];
  });
  const [nakitLayout, setNakitLayout] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nakit-layout');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved nakit layout:', e);
        }
      }
    }
    // Default layout - 4 sütun grid
    return [
      { i: 'income-expense', x: 0, y: 0, w: 2, h: 2, minW: 2, minH: 2 }, // Gelir/Gider Özeti (2x2)
      { i: 'cash-distribution', x: 2, y: 0, w: 2, h: 2, minW: 1, minH: 2 }, // Nakit Dağılımı (2x2)
      { i: 'accounts', x: 0, y: 2, w: 2, h: 2, minW: 1, minH: 1 }, // Hesap Bilgilerim (2x2)
      { i: 'cards', x: 2, y: 2, w: 2, h: 1, minW: 1, minH: 1 }, // Kayıtlı Kartlarım (2x1)
      { i: 'portfolio-chart', x: 0, y: 4, w: 3, h: 2, minW: 2, minH: 2 }, // Portföy Grafiği (3x2)
      { i: 'transactions', x: 3, y: 4, w: 1, h: 2, minW: 1, minH: 1 }, // Son İşlemler (1x2)
    ];
  });
  const [gridWidth, setGridWidth] = useState(1200);
  const [nakitGridWidth, setNakitGridWidth] = useState(1200);
  const [symbolDetailChartPeriod, setSymbolDetailChartPeriod] = useState<'1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL' | 'LIVE'>('1W');
  const [symbolDetailChartType, setSymbolDetailChartType] = useState<'line' | 'candlestick'>('line');
  const [symbolDetailLivePrice, setSymbolDetailLivePrice] = useState<number | null>(null);
  const [previousLivePrice, setPreviousLivePrice] = useState<number | null>(null);
  const [priceChangeDirection, setPriceChangeDirection] = useState<'up' | 'down' | null>(null);
  const [isManualPeriodSelection, setIsManualPeriodSelection] = useState(false);
  
  // Chart interaction states
  const [chartZoom, setChartZoom] = useState({ start: 0, end: 100 }); // Percentage range
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingTool, setDrawingTool] = useState<'line' | 'marker' | null>(null);
  const [drawings, setDrawings] = useState<Array<{ type: 'line' | 'marker'; points: Array<{ x: number; y: number }>; color: string }>>([]);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  
  // SymbolDetailModal içi al/sat form state'leri
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [tradeFormType, setTradeFormType] = useState<'buy' | 'sell'>('buy');
  const [tradeQuantity, setTradeQuantity] = useState('');
  const [tradeOrderType, setTradeOrderType] = useState<'market' | 'limit'>('market');
  const [tradeLimitPrice, setTradeLimitPrice] = useState('');
  const [tradeStatus, setTradeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showTradeSuccessToast, setShowTradeSuccessToast] = useState(false);
  const [tradeErrorMessage, setTradeErrorMessage] = useState('');

  // Kripto ekranı için state'ler
  const [cryptoSearchQuery, setCryptoSearchQuery] = useState("");
  const [cryptoSearchResults, setCryptoSearchResults] = useState<SymbolOption[]>([]);
  const [popularCryptos, setPopularCryptos] = useState<Array<SymbolOption & { 
    price?: number; 
    change?: number; 
    changePercent?: number;
    volume?: number;
    high?: number;
    low?: number;
    open?: number;
    previousClose?: number;
  }>>([]);
  const [cryptoSearchLoading, setCryptoSearchLoading] = useState(false);
  const [selectedCryptoSymbol, setSelectedCryptoSymbol] = useState<string | null>(null);
  const [cryptoFilter, setCryptoFilter] = useState<"all" | "gainers" | "losers" | "volume">("all");
  const [cryptoWatchlist, setCryptoWatchlist] = useState<string[]>([]);

  // Popüler kripto paralar
  const popularCryptoSymbols: SymbolOption[] = [
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
    { symbol: 'SUSHIUSD', name: 'SushiSwap' },
    { symbol: 'SNXUSD', name: 'Synthetix' },
    { symbol: 'CRVUSD', name: 'Curve' },
    { symbol: 'YFIUSD', name: 'Yearn Finance' },
    { symbol: '1INCHUSD', name: '1inch' },
  ];

  const fetchPopularStocksPrices = useCallback(async () => {
    const topStocks = popularSymbols.slice(0, 30);
    const stocksWithPrices = await Promise.all(
      topStocks.map(async (stock) => {
        try {
          // Latest price
          const priceResponse = await fetch(`/api/alpaca/market-data/latest?symbol=${stock.symbol}`);
          let price: number | null = null;
          let previousClose: number | null = null;
          
          if (priceResponse.ok) {
            const priceData = await priceResponse.json();
            if (priceData.success && priceData.price) {
              price = priceData.price;
            }
          }

          // Bars data for volume, high, low, open
          try {
            const barsResponse = await fetch(`/api/alpaca/market-data?symbol=${stock.symbol}&timeframe=1Day&period=1W`);
            if (barsResponse.ok) {
              const barsData = await barsResponse.json();
              if (barsData.success && barsData.bars && barsData.bars.length > 0) {
                const latestBar = barsData.bars[barsData.bars.length - 1];
                const previousBar = barsData.bars.length > 1 ? barsData.bars[barsData.bars.length - 2] : latestBar;
                
                const volume = latestBar.v || 0;
                const high = latestBar.h || price || 0;
                const low = latestBar.l || price || 0;
                const open = latestBar.o || price || 0;
                previousClose = previousBar.c || previousBar.o || price || 0;
                
                // Calculate change from previous close
                const changePercent = previousClose && previousClose > 0 ? ((price! - previousClose) / previousClose) * 100 : 0;
                const change = previousClose ? price! - previousClose : 0;
                
                return {
                  ...stock,
                  price: price || 0,
                  change: change,
                  changePercent: changePercent,
                  volume: volume,
                  high: high,
                  low: low,
                  open: open,
                  previousClose: previousClose || undefined,
                };
              }
            }
          } catch (barsError) {
            console.error(`Error fetching bars for ${stock.symbol}:`, barsError);
          }

          // Veri yoksa null döndür
          return null;
        } catch (error) {
          console.error(`Error fetching data for ${stock.symbol}:`, error);
          return null;
        }
      })
    );
    setPopularStocks(stocksWithPrices.filter((s): s is NonNullable<typeof s> => s !== null && s !== undefined && s.price !== undefined));
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // KYC kontrolü - Dashboard'a girişte
  useEffect(() => {
    const checkKYC = async () => {
      if (!user?.email || loading || !isAuthenticated) return;
      
      // Demo hesap için KYC kontrolünü atla
      const isDemoAccount = user.email.toLowerCase().includes('demo') || 
                           user.email.toLowerCase() === 'demo@datpay.com';
      
      if (isDemoAccount) {
        setKycVerified(true); // Demo hesap için otomatik doğrulanmış say
        setCheckingKYC(false);
        return;
      }
      
      setCheckingKYC(true);
      try {
        const response = await fetch(`/api/mambu/kyc/status?email=${encodeURIComponent(user.email)}`);
        const data = await response.json();
        
        if (data.success && data.kyc) {
          setKycVerified(data.kyc.verified);
          if (!data.kyc.verified) {
            // KYC doğrulanmamışsa modal'ı aç
            setKycModalOpen(true);
          }
        }
      } catch (error) {
        console.error('KYC check error:', error);
      } finally {
        setCheckingKYC(false);
      }
    };
    
    checkKYC();
  }, [user?.email, loading, isAuthenticated]);

  // Alpaca hesap kontrolü - her girişte
  useEffect(() => {
    const checkAlpacaAccount = async () => {
      if (!user?.email || loading || !isAuthenticated) return;
      
      // Demo hesap için KYC kontrolünü atla
      const isDemoAccount = user.email.toLowerCase().includes('demo') || 
                           user.email.toLowerCase() === 'demo@datpay.com';
      
      // Demo hesap için direkt account ID'yi set et
      if (isDemoAccount) {
        const DEMO_ACCOUNT_ID = 'd005ca65-a340-4373-b783-41a0ca3d13f9';
        setAlpacaAccountExists(true);
        setAlpacaAccountId(DEMO_ACCOUNT_ID);
        setCheckingAlpacaAccount(false);
        return;
      }
      
      if (kycVerified === false) return; // KYC doğrulanmamışsa Alpaca kontrolü yapma
      
      setCheckingAlpacaAccount(true);
      try {
        const response = await fetch(`/api/alpaca/accounts/match?email=${encodeURIComponent(user.email)}`);
        const data = await response.json();
        
        if (data.success) {
          setAlpacaAccountExists(data.found);
          if (data.found && data.account) {
            setAlpacaAccountId(data.account.id || data.account.account_number || null);
          }
        }
      } catch (error) {
        console.error('Alpaca account check error:', error);
      } finally {
        setCheckingAlpacaAccount(false);
      }
    };
    
    checkAlpacaAccount();
  }, [user?.email, loading, isAuthenticated, kycVerified]);

  const fetchAlpacaData = useCallback(async () => {
    setDataLoading(true);
    setDataError(null);
    
    try {
      // Kullanıcıya özel account ID'yi al
      let accountId: string | null = null;
      
      // Önce state'teki account ID'yi kontrol et
      if (alpacaAccountId) {
        accountId = alpacaAccountId;
      } else if (user?.alpacaAccountId) {
        accountId = user.alpacaAccountId;
      } else {
        // Demo hesap kontrolü
        const isDemoAccount = user?.email?.toLowerCase().includes('demo') || 
                             user?.email?.toLowerCase() === 'demo@datpay.com';
        
        if (isDemoAccount) {
        // Demo hesap için default account ID
        accountId = 'd005ca65-a340-4373-b783-41a0ca3d13f9';
        } else {
        // Alternatif: Broker API'den hesapları al
        try {
          const accountsRes = await fetch('/api/alpaca/accounts');
          if (accountsRes.ok) {
            const accountsData = await accountsRes.json();
            const accounts = accountsData.accounts || [];
            
            if (accounts.length > 0) {
              // İlk hesabı kullan veya kullanıcıya özel hesabı bul
              const userAccount = accounts.find((acc: any) => 
                acc.email === user?.email || 
                acc.contact?.email === user?.email
              );
              
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
      }
      
      if (!accountId) {
        setDataError('Account ID bulunamadı');
        setDataLoading(false);
        return;
      }
      
      // Paralel olarak tüm verileri çek (Alpaca + Mambu)
      const promises: Promise<any>[] = [
        fetch(`/api/alpaca/account?accountId=${accountId}`),
        fetch(`/api/alpaca/positions?accountId=${accountId}`),
        fetch(`/api/alpaca/crypto?accountId=${accountId}`), // Kripto pozisyonları
        fetch(`/api/alpaca/options?accountId=${accountId}`),
        fetch(`/api/alpaca/orders?accountId=${accountId}&limit=100`),
        fetch(`/api/alpaca/portfolio/history?accountId=${accountId}&period=1M&timeframe=1Day`), // Period dinamik olarak widget'tan seçilebilir
      ];
      
      // Mambu API çağrıları opsiyonel (hata olsa bile devam et)
      if (user?.email) {
        promises.push(
          fetch(`/api/mambu/account?email=${encodeURIComponent(user.email)}`).catch(() => ({ ok: false, json: async () => ({ success: false, account: null }) })),
          fetch(`/api/mambu/transactions?email=${encodeURIComponent(user.email)}&limit=10`).catch(() => ({ ok: false, json: async () => ({ success: false, transactions: [] }) })),
          fetch(`/api/mambu/cards?email=${encodeURIComponent(user.email)}`).catch(() => ({ ok: false, json: async () => ({ success: false, cards: [] }) }))
        );
      }
      
      const results = await Promise.allSettled(promises);
      const accountRes = results[0];
      const positionsRes = results[1];
      const cryptoPositionsRes = results[2];
      const optionsPositionsRes = results[3];
      const ordersRes = results[4];
      const historyRes = results[5];
      const mambuAccountRes = results[6];
      const mambuTransactionsRes = results[7];
      const mambuCardsRes = results[8];

      let hasAlpacaData = false;
      
      if (accountRes.status === 'fulfilled' && accountRes.value.ok) {
        try {
          const accountData = await accountRes.value.json();
          setAccountData(accountData.account);
          hasAlpacaData = true;
        } catch (error) {
          console.error('Account data parse error:', error);
        }
      } else if (accountRes.status === 'fulfilled' && !accountRes.value.ok) {
        try {
          const errorData = await accountRes.value.json().catch(() => ({}));
          if (errorData.error?.includes('kimlik doğrulama') || errorData.error?.includes('unauthorized')) {
            setDataError('Alpaca API kimlik doğrulama hatası. Lütfen API key\'lerinizi kontrol edin.');
          }
        } catch (error) {
          console.error('Account error parse error:', error);
        }
      } else if (accountRes.status === 'rejected') {
        console.error('Account fetch rejected:', accountRes.reason);
      }

      if (positionsRes.status === 'fulfilled' && positionsRes.value.ok) {
        try {
          const positionsData = await positionsRes.value.json();
          // Sadece equity positions (hisse senetleri) - crypto ayrı çekiliyor
          const equityPositions = (positionsData.positions || []).filter((p: any) => p.asset_class === 'us_equity');
          setPositions(equityPositions);
          if (equityPositions.length > 0) hasAlpacaData = true;
        } catch (error) {
          console.error('Positions data parse error:', error);
        }
      }

      // Crypto positions
      if (cryptoPositionsRes && cryptoPositionsRes.status === 'fulfilled' && cryptoPositionsRes.value.ok) {
        try {
          const cryptoData = await cryptoPositionsRes.value.json();
          setCryptoPositions(cryptoData.positions || []);
          if ((cryptoData.positions || []).length > 0) hasAlpacaData = true;
        } catch (error) {
          console.error('Crypto positions data parse error:', error);
        }
      }

      // Options positions
      if (optionsPositionsRes && optionsPositionsRes.status === 'fulfilled' && optionsPositionsRes.value.ok) {
        try {
          const optionsData = await optionsPositionsRes.value.json();
          setOptionsPositions(optionsData.positions || []);
          if ((optionsData.positions || []).length > 0) hasAlpacaData = true;
        } catch (error) {
          console.error('Options positions data parse error:', error);
        }
      }

      if (ordersRes.status === 'fulfilled' && ordersRes.value.ok) {
        try {
          const ordersData = await ordersRes.value.json();
          setOrders(ordersData.orders || []);
          if ((ordersData.orders || []).length > 0) hasAlpacaData = true;
        } catch (error) {
          console.error('Orders data parse error:', error);
        }
      }

      // Portfolio history loading'i başlat
      setPortfolioHistoryLoading(true);
      
      if (historyRes.status === 'fulfilled' && historyRes.value.ok) {
        try {
          const historyData = await historyRes.value.json();
          console.log('Portfolio history data:', historyData); // Debug log
          
          // API response formatı: { success: true, history: { equity, profit_loss, history: [...] } }
          // getAlpacaPortfolioHistory döndürüyor: { equity, profit_loss, history: [...] }
          // API route wrap ediyor: { success: true, history: { ... } }
          let historyArray: any[] = [];
          
          if (historyData && historyData.history) {
            // historyData.history bir obje ve içinde history array'i var
            if (historyData.history.history && Array.isArray(historyData.history.history)) {
              historyArray = historyData.history.history;
            } 
            // Eğer history direkt array ise
            else if (Array.isArray(historyData.history)) {
              historyArray = historyData.history;
            }
          } 
          // Eğer direkt array ise
          else if (Array.isArray(historyData)) {
            historyArray = historyData;
          }
          
          console.log('Portfolio history parsed:', {
            hasData: historyArray.length > 0,
            length: historyArray.length,
            firstItem: historyArray[0]
          });
          
          // Her durumda loading'i false yap
          setPortfolioHistoryLoading(false);
          
          if (historyArray.length > 0) {
            setPortfolioHistory(historyArray);
          } else {
            console.warn('Portfolio history is empty, setting empty array');
            setPortfolioHistory([]);
          }
        } catch (error) {
          console.error('History data parse error:', error);
          setPortfolioHistory([]);
          setPortfolioHistoryLoading(false);
        }
      } else {
        // Rejected veya not ok durumunda
        if (historyRes.status === 'rejected') {
          console.error('Portfolio history fetch failed:', historyRes.reason);
        } else if (historyRes.status === 'fulfilled' && !historyRes.value.ok) {
          try {
            const errorData = await historyRes.value.json().catch(() => ({}));
            console.error('Portfolio history fetch not ok:', historyRes.value.status, errorData);
          } catch (e) {
            console.error('Portfolio history fetch not ok:', historyRes.value.status);
          }
        }
        setPortfolioHistory([]);
        setPortfolioHistoryLoading(false);
      }

      // Mambu account data (opsiyonel - hata olsa bile devam et)
      if (mambuAccountRes && mambuAccountRes.status === 'fulfilled') {
        try {
          const response = mambuAccountRes.value;
          if (response && response.ok) {
            const mambuData = await response.json();
            if (mambuData.success && mambuData.account) {
              setMambuAccount(mambuData.account);
            }
          }
        } catch (error) {
          console.warn('Mambu account data error (ignored):', error);
        }
      }

      // Mambu transactions (opsiyonel - hata olsa bile devam et)
      if (mambuTransactionsRes && mambuTransactionsRes.status === 'fulfilled') {
        try {
          const response = mambuTransactionsRes.value;
          if (response && response.ok) {
            const mambuTxData = await response.json();
            if (mambuTxData.success && mambuTxData.transactions) {
              setMambuTransactions(mambuTxData.transactions);
            }
          }
        } catch (error) {
          console.warn('Mambu transactions error (ignored):', error);
        }
      }

      // Demo hesabı için mock transaction verisi
      const isDemoAccountTx = user?.email?.toLowerCase() === 'demo@datpay.com';
      if (isDemoAccountTx && mambuTransactions.length === 0) {
        const now = new Date();
        setMambuTransactions([
          {
            id: 'demo-tx-1',
            type: 'WITHDRAWAL',
            amount: -125.50,
            currency: 'USD',
            date: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 saat önce
            description: 'Amazon.com - Online Alışveriş',
            status: 'completed',
            source: 'mambu',
          },
          {
            id: 'demo-tx-2',
            type: 'WITHDRAWAL',
            amount: -45.00,
            currency: 'USD',
            date: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5 saat önce
            description: 'Starbucks - Kahve',
            status: 'completed',
            source: 'mambu',
          },
          {
            id: 'demo-tx-3',
            type: 'WITHDRAWAL',
            amount: -89.99,
            currency: 'USD',
            date: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 gün önce
            description: 'Netflix - Abonelik',
            status: 'completed',
            source: 'mambu',
          },
          {
            id: 'demo-tx-4',
            type: 'WITHDRAWAL',
            amount: -250.00,
            currency: 'USD',
            date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 gün önce
            description: 'Uber - Ulaşım',
            status: 'completed',
            source: 'mambu',
          },
          {
            id: 'demo-tx-5',
            type: 'WITHDRAWAL',
            amount: -15.75,
            currency: 'USD',
            date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 gün önce
            description: 'Spotify - Müzik Aboneliği',
            status: 'completed',
            source: 'mambu',
          },
        ]);
      }

      // Mambu cards (opsiyonel - hata olsa bile devam et)
      if (mambuCardsRes && mambuCardsRes.status === 'fulfilled') {
        try {
          const response = mambuCardsRes.value;
          if (response && response.ok) {
            const mambuCardsData = await response.json();
            if (mambuCardsData.success && mambuCardsData.cards) {
              setMambuCards(mambuCardsData.cards);
            }
          }
        } catch (error) {
          console.warn('Mambu cards error (ignored):', error);
        }
      }

      // Demo hesabı için mock kart verisi
      const isDemoAccountCards = user?.email?.toLowerCase() === 'demo@datpay.com';
      if (isDemoAccountCards && mambuCards.length === 0) {
        setMambuCards([
          {
            id: 'demo-card-1',
            accountId: 'demo-account-1',
            cardNumber: '4532 1234 5678 9012',
            cardType: 'DEBIT',
            status: 'ACTIVE',
            onlineEnabled: true,
            spendingLimit: 5000,
            availableBalance: 3247.50,
            expiryMonth: 12,
            expiryYear: 2026,
            cvv: '123',
            cardholderName: `${user?.firstName || 'Demo'} ${user?.lastName || 'Kullanıcı'}`,
            currency: 'USD',
          },
          {
            id: 'demo-card-2',
            accountId: 'demo-account-2',
            cardNumber: '5421 9876 5432 1098',
            cardType: 'CREDIT',
            status: 'ACTIVE',
            onlineEnabled: false,
            spendingLimit: 10000,
            availableBalance: 8750.00,
            expiryMonth: 8,
            expiryYear: 2027,
            cvv: '456',
            cardholderName: `${user?.firstName || 'Demo'} ${user?.lastName || 'Kullanıcı'}`,
            currency: 'USD',
          },
          {
            id: 'demo-card-3',
            accountId: 'demo-account-3',
            cardNumber: '4111 2222 3333 4444',
            cardType: 'DEBIT',
            status: 'ACTIVE',
            onlineEnabled: true,
            spendingLimit: 3000,
            availableBalance: 1892.25,
            expiryMonth: 3,
            expiryYear: 2025,
            cvv: '789',
            cardholderName: `${user?.firstName || 'Demo'} ${user?.lastName || 'Kullanıcı'}`,
            currency: 'USD',
          },
        ]);
      }
      
      // Eğer hiçbir Alpaca verisi yüklenemediyse hata göster
      if (!hasAlpacaData && !dataError) {
        setDataError('Veriler yüklenemedi. Lütfen API yapılandırmasını kontrol edin.');
      } else if (hasAlpacaData) {
        setDataError(null); // Başarılı ise hatayı temizle
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      // Sadece kritik hatalar için genel hata mesajı göster
      if (!dataError) {
        setDataError('Veriler yüklenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
      }
    } finally {
      setDataLoading(false);
    }
  }, [user, alpacaAccountId]);

  const handleCancelOrder = useCallback(
    async (orderId: string) => {
      if (!effectiveAccountId) {
        setOrderActionMessage({
          type: 'error',
          text: 'Account ID bulunamadı. Lütfen yatırım hesabınızı kontrol edin.',
        });
        return;
      }

      setCancellingOrderId(orderId);
      setOrderActionMessage(null);

      try {
        const response = await fetch('/api/alpaca/orders', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accountId: effectiveAccountId,
            orderId,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || data.error || 'Emir iptal edilemedi.');
        }

        setOrderActionMessage({
          type: 'success',
          text: 'Emir başarıyla iptal edildi.',
        });
        fetchAlpacaData();
      } catch (error: any) {
        console.error('Cancel order error:', error);
        setOrderActionMessage({
          type: 'error',
          text: error.message || 'Emir iptal edilemedi.',
        });
      } finally {
        setCancellingOrderId(null);
      }
    },
    [effectiveAccountId, fetchAlpacaData]
  );

  // Kripto fiyatlarını çek
  const fetchPopularCryptosPrices = useCallback(async () => {
    const topCryptos = popularCryptoSymbols.slice(0, 30);
    const cryptosWithPrices = await Promise.all(
      topCryptos.map(async (crypto) => {
        try {
          // Latest price için bars kullan (crypto için trades/latest endpoint'i yok)
          try {
            const barsResponse = await fetch(`/api/alpaca/crypto/market-data?symbol=${crypto.symbol}&timeframe=1Day&period=1W`);
            if (barsResponse.ok) {
              const barsData = await barsResponse.json();
              if (barsData.success && barsData.bars && barsData.bars.length > 0) {
                const latestBar = barsData.bars[barsData.bars.length - 1];
                const previousBar = barsData.bars.length > 1 ? barsData.bars[barsData.bars.length - 2] : latestBar;
                
                const price = latestBar.c || latestBar.o || 0;
                const volume = latestBar.v || 0;
                const high = latestBar.h || price || 0;
                const low = latestBar.l || price || 0;
                const open = latestBar.o || price || 0;
                const previousClose = previousBar.c || previousBar.o || price || 0;
                
                // Calculate change from previous close
                const changePercent = previousClose > 0 ? ((price - previousClose) / previousClose) * 100 : 0;
                const change = price - previousClose;
                
                return {
                  ...crypto,
                  price: price,
                  change: change,
                  changePercent: changePercent,
                  volume: volume,
                  high: high,
                  low: low,
                  open: open,
                  previousClose: previousClose,
                };
              }
            }
          } catch (barsError) {
            console.error(`Error fetching bars for ${crypto.symbol}:`, barsError);
          }

          // Veri yoksa null döndür
          return null;
        } catch (error) {
          console.error(`Error fetching data for ${crypto.symbol}:`, error);
          return null;
        }
      })
    );
    setPopularCryptos(cryptosWithPrices.filter((c): c is NonNullable<typeof c> => c !== null && c !== undefined && c.price !== undefined));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAlpacaData();
      
      // Canlı veri güncellemesi - her 10 saniyede bir (pozisyonlar ve kar/zarar için)
      const interval = setInterval(() => {
        fetchAlpacaData();
        if (activeTab === "borsa") {
          fetchPopularStocksPrices();
        } else if (activeTab === "kripto") {
          fetchPopularCryptosPrices();
        }
      }, 10000); // 10 saniye - daha sık güncelleme için
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, activeTab, fetchPopularStocksPrices, fetchPopularCryptosPrices, fetchAlpacaData]);

  useEffect(() => {
    if (!alpacaAccountId) return;
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;

    // Yeni hesap ID'sinde önceki snapshot'ı sıfırla
    lastAccountSnapshotRef.current = null;

    const params = new URLSearchParams({
      accountId: alpacaAccountId,
      interval: '4000',
    });

    const source = new EventSource(`/api/alpaca/account/stream?${params.toString()}`);

    const handleAccountMessage = (event: Event) => {
      const message = event as MessageEvent;
      try {
        const payload = JSON.parse(message.data || '{}');
        if (payload?.success && payload.account) {
          const serialized = JSON.stringify(payload.account);
          if (lastAccountSnapshotRef.current !== serialized) {
            lastAccountSnapshotRef.current = serialized;
            setAccountData(payload.account);
          }
        }
      } catch (error) {
        console.error('Account stream parse error:', error);
      }
    };

    const handleError = (event: Event) => {
      console.error('Account stream error:', event);
    };

    source.addEventListener('account', handleAccountMessage as EventListener);
    source.addEventListener('error', handleError as EventListener);

    return () => {
      source.removeEventListener('account', handleAccountMessage as EventListener);
      source.removeEventListener('error', handleError as EventListener);
      source.close();
    };
  }, [alpacaAccountId]);

  // Trade form submit handler
  const handleTradeSubmit = async (
    e: React.FormEvent,
    symbolDetail: {
      symbol: string;
      name: string;
      type: 'stock' | 'crypto' | 'option';
      price?: number;
      change?: number;
      changePercent?: number;
    } | null,
    formType: 'buy' | 'sell',
    quantity: string,
    orderType: 'market' | 'limit',
    limitPrice: string
  ) => {
    e.preventDefault();
    
    if (!symbolDetail) {
      setTradeStatus('error');
      setTradeErrorMessage('Sembol bilgisi bulunamadı.');
      return;
    }

    if (!quantity) {
      setTradeStatus('error');
      setTradeErrorMessage('Lütfen miktar girin.');
      return;
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      setTradeStatus('error');
      setTradeErrorMessage('Geçerli bir miktar girin.');
      return;
    }

    let estimatedCost = 0;
    if (orderType === 'limit' && limitPrice) {
      estimatedCost = parseFloat(limitPrice) * qty;
    } else if (symbolDetailLivePrice !== null) {
      estimatedCost = symbolDetailLivePrice * qty;
    } else if (symbolDetailData?.price) {
      estimatedCost = symbolDetailData.price * qty;
    }

    setTradeStatus('loading');
    setTradeErrorMessage('');

    try {
      // Account ID'yi al
      let accountId: string | null = null;
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

      if (!accountId) {
        try {
          const accountsRes = await fetch('/api/alpaca/accounts');
          if (accountsRes.ok) {
            const accountsData = await accountsRes.json();
            const accounts = accountsData.accounts || [];
            if (accounts.length > 0) {
              const savedUser = localStorage.getItem("mambu_user");
              let userEmail = null;
              if (savedUser) {
                try {
                  const userData = JSON.parse(savedUser);
                  userEmail = userData.email;
                } catch (e) {}
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

      if (!accountId) {
        accountId = 'd005ca65-a340-4373-b783-41a0ca3d13f9';
      }

      if (!accountId) {
        setTradeStatus('error');
        setTradeErrorMessage('Account ID bulunamadı');
        return;
      }

      // Account verisini anlık güncelle ve bakiye kontrolünü en güncel data ile yap
      let latestAccountSnapshot = accountData;
      if (formType === 'buy') {
        try {
          const accountResponse = await fetch(
            `/api/alpaca/account?accountId=${accountId}&ts=${Date.now()}`,
            { cache: 'no-store' }
          );
          if (accountResponse.ok) {
            const accountJson = await accountResponse.json();
            latestAccountSnapshot = accountJson.account;
            setAccountData(accountJson.account);
          }
        } catch (refreshError) {
          console.warn('Latest account fetch error:', refreshError);
        }

        if (latestAccountSnapshot) {
          const buyingPower = parseFloat(
            latestAccountSnapshot.buying_power || latestAccountSnapshot.cash || '0'
          );
          if (estimatedCost > buyingPower) {
            setTradeStatus('error');
            setTradeErrorMessage(
              `Yetersiz bakiye! Gerekli: $${estimatedCost.toFixed(2)}, Mevcut: $${buyingPower.toFixed(2)}.`
            );
            return;
          }
        }
      }

      const apiEndpoint = symbolDetail.type === 'crypto' 
        ? '/api/alpaca/crypto' 
        : '/api/alpaca/orders';
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId,
          symbol: symbolDetail.symbol,
          qty: qty,
          side: formType,
          type: orderType,
          time_in_force: symbolDetail.type === 'crypto' ? 'gtc' : 'day',
          ...(orderType === 'limit' && limitPrice && { 
            limit_price: parseFloat(limitPrice) 
          }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setTradeStatus('error');
        setTradeErrorMessage(data.message || data.error || 'İşlem başarısız.');
        return;
      }

      setTradeStatus('success');
      setShowTradeSuccessToast(true);
      setTimeout(() => {
        setShowTradeSuccessToast(false);
        setShowTradeForm(false);
        setTradeStatus('idle');
        setTradeQuantity('');
        // Verileri güncelle ama sayfayı yenileme
        fetchAlpacaData();
      }, 3000);
    } catch (error: any) {
      setTradeStatus('error');
      setTradeErrorMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Trade error:', error);
    }
  };

  // Popüler hisse senetleri fiyatlarını çek
  useEffect(() => {
    if (activeTab === "borsa" && isAuthenticated) {
      fetchPopularStocksPrices();
    }
  }, [activeTab, isAuthenticated, fetchPopularStocksPrices]);

  // Popüler kripto paralar fiyatlarını çek
  useEffect(() => {
    if (activeTab === "kripto" && isAuthenticated) {
      fetchPopularCryptosPrices();
    }
  }, [activeTab, isAuthenticated, fetchPopularCryptosPrices]);

  // Market clock'u fetch et
  const fetchMarketClock = useCallback(async () => {
    try {
      setMarketClockLoading(true);
      const response = await fetch('/api/alpaca/market-clock');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.clock) {
          setMarketClock(data.clock);
        }
      }
    } catch (error) {
      console.error('Market clock fetch error:', error);
    } finally {
      setMarketClockLoading(false);
    }
  }, []);

  // Market hours'u çek
  const fetchMarketHours = useCallback(async () => {
    try {
      setMarketHoursLoading(true);
      const response = await fetch('/api/alpaca/market-hours');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMarketHours(data);
        }
      }
    } catch (error) {
      console.error('Market hours fetch error:', error);
    } finally {
      setMarketHoursLoading(false);
    }
  }, []);

  // Market clock'u periyodik olarak güncelle (her 1 dakikada bir)
  useEffect(() => {
    fetchMarketClock();
    fetchMarketHours(); // Market hours'u da çek
    const interval = setInterval(() => {
      fetchMarketClock();
      fetchMarketHours();
    }, 60000); // 1 dakika
    return () => clearInterval(interval);
  }, [fetchMarketClock, fetchMarketHours]);

  // Boğa/Ayı sezonu analizini çek
  const fetchBullBearAnalysis = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setBullBearLoading(true);
      const response = await fetch('/api/alpaca/market-analysis/bull-bear');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBullBearData(data);
        }
      }
    } catch (error) {
      console.error('Bull/Bear analysis fetch error:', error);
    } finally {
      setBullBearLoading(false);
    }
  }, [isAuthenticated]);

  // Takas analizini çek
  const fetchSettlementAnalysis = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setSettlementLoading(true);
      const response = await fetch('/api/alpaca/market-analysis/settlement');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSettlementData(data);
        }
      }
    } catch (error) {
      console.error('Settlement analysis fetch error:', error);
    } finally {
      setSettlementLoading(false);
    }
  }, [isAuthenticated]);

  // Borsa ekranı açıldığında market analizlerini çek
  useEffect(() => {
    if (activeTab === 'borsa' && isAuthenticated) {
      fetchBullBearAnalysis();
      fetchSettlementAnalysis();
      // Her 5 dakikada bir güncelle
      const interval = setInterval(() => {
        fetchBullBearAnalysis();
        fetchSettlementAnalysis();
      }, 300000); // 5 dakika
      return () => clearInterval(interval);
    }
  }, [activeTab, isAuthenticated, fetchBullBearAnalysis, fetchSettlementAnalysis]);

  // En çok kazandıran opsiyonları çek (genel piyasa verileri)
  const fetchTopGainingOptions = useCallback(async () => {
    try {
      const response = await fetch('/api/alpaca/market-data/top-gainers?type=options&limit=5');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.topGainers) {
          setTopGainingOptions(data.topGainers);
        }
      }
    } catch (error) {
      console.error('Top gaining options fetch error:', error);
    }
  }, []);

  // Opsiyon ekranı açıldığında en çok kazandıranları çek
  useEffect(() => {
    if (activeTab === "opsiyon" && isAuthenticated) {
      fetchTopGainingOptions();
      // Her 2 dakikada bir güncelle (rate limiting için)
      const interval = setInterval(() => {
        fetchTopGainingOptions();
      }, 120000); // 2 dakika
      return () => clearInterval(interval);
    }
  }, [activeTab, isAuthenticated, fetchTopGainingOptions]);

  // Kart başvurularını getir
  const fetchCardApplications = useCallback(async () => {
    if (!user?.email) return;
    
    setCardApplicationsLoading(true);
    try {
      const response = await fetch(`/api/mambu/cards/applications?email=${encodeURIComponent(user.email)}`);
      const data = await response.json();
      if (data.success && data.applications) {
        setCardApplications(data.applications);
      }
    } catch (error) {
      console.error('Error fetching card applications:', error);
    } finally {
      setCardApplicationsLoading(false);
    }
  }, [user?.email]);

  // 15 dakikalık chart verilerini çek
  const fetch15MinChartData = useCallback(async (type: 'stock' | 'crypto' | 'options') => {
    if (!isAuthenticated) return;
    
    setChartLoading(true);
    try {
      const symbols: string[] = [];
      
      if (type === 'stock') {
        // En çok işlem gören hisse senetleri
        symbols.push(...popularStocks.slice(0, 5).map(s => s.symbol));
      } else if (type === 'crypto') {
        // Popüler kripto paralar
        symbols.push('BTCUSD', 'ETHUSD', 'SOLUSD', 'ADAUSD', 'DOTUSD');
      } else if (type === 'options') {
        // Opsiyon underlying'leri
        symbols.push('AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA');
      }

      // Rate limiting için batch processing
      const chartPromises: Promise<any>[] = [];
      for (let i = 0; i < symbols.length; i += 2) {
        const batch = symbols.slice(i, i + 2);
        const batchPromises = batch.map(async (symbol) => {
          try {
            const endpoint = type === 'crypto' 
              ? `/api/alpaca/crypto/market-data?symbol=${symbol}&period=1D&timeframe=15Min`
              : `/api/alpaca/market-data?symbol=${symbol}&period=1D&timeframe=15Min`;
            
            const response = await fetch(endpoint);
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.bars && data.bars.length > 0) {
                return {
                  symbol,
                  data: data.bars.map((bar: any) => ({
                    time: new Date(bar.t).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                    timestamp: new Date(bar.t).getTime(),
                    price: parseFloat(bar.c), // Close price
                    high: parseFloat(bar.h),
                    low: parseFloat(bar.l),
                    open: parseFloat(bar.o),
                    volume: parseFloat(bar.v),
                  })).sort((a: any, b: any) => a.timestamp - b.timestamp),
                };
              }
            }
          } catch (error) {
            console.error(`Error fetching chart data for ${symbol}:`, error);
          }
          return null;
        });
        
        chartPromises.push(...batchPromises);
        
        // Batch'ler arasında bekleme (rate limiting) - artırıldı
        if (i + 2 < symbols.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      const results = await Promise.all(chartPromises);
      const validResults = results.filter(r => r !== null && r.data && r.data.length > 0);

      if (type === 'stock') {
        setStockChartData(validResults);
      } else if (type === 'crypto') {
        setCryptoChartData(validResults);
      } else if (type === 'options') {
        setOptionsChartData(validResults);
      }
    } catch (error) {
      console.error('Chart data fetch error:', error);
    } finally {
      setChartLoading(false);
    }
  }, [isAuthenticated, popularStocks]);

  // Aktif tab'a göre chart verilerini çek ve güncelle
  useEffect(() => {
    if (!isAuthenticated) return;

    if (activeTab === 'borsa') {
      fetch15MinChartData('stock');
      const interval = setInterval(() => {
        fetch15MinChartData('stock');
      }, 180000); // Her 3 dakikada bir güncelle (rate limiting için)
      return () => clearInterval(interval);
    } else if (activeTab === 'kripto') {
      fetch15MinChartData('crypto');
      const interval = setInterval(() => {
        fetch15MinChartData('crypto');
      }, 180000);
      return () => clearInterval(interval);
    } else if (activeTab === 'opsiyon') {
      fetch15MinChartData('options');
      const interval = setInterval(() => {
        fetch15MinChartData('options');
      }, 180000);
      return () => clearInterval(interval);
    }
  }, [activeTab, isAuthenticated, fetch15MinChartData]);

  // Market depth verilerini çek
  useEffect(() => {
    if (!isAuthenticated || activeTab !== 'borsa' || !selectedSymbol) {
      setMarketDepth(null);
      return;
    }

    const fetchMarketDepth = async () => {
      setMarketDepthLoading(true);
      try {
        const response = await fetch(`/api/alpaca/market-data/depth?symbol=${encodeURIComponent(selectedSymbol)}`);
        const data = await response.json();
        
        if (data.success && data.bids && data.bids.length > 0 && data.asks && data.asks.length > 0) {
          setMarketDepth({ 
            bids: data.bids || [], 
            asks: data.asks || [] 
          });
        } else {
          setMarketDepth(null);
          // Hata mesajını sadece development modunda logla
          if (process.env.NODE_ENV === 'development' && data.error) {
            console.warn('Market depth:', data.error, data.message);
          }
        }
      } catch (error) {
        console.error('Market depth fetch error:', error);
        setMarketDepth(null);
      } finally {
        setMarketDepthLoading(false);
      }
    };

    fetchMarketDepth();
    const interval = setInterval(fetchMarketDepth, 10000); // Her 10 saniyede bir güncelle
    return () => clearInterval(interval);
  }, [selectedSymbol, activeTab, isAuthenticated]);

  // Layout değişikliklerini kaydet
  useEffect(() => {
    if (typeof window !== 'undefined' && borsaLayout.length > 0) {
      localStorage.setItem('borsa-layout', JSON.stringify(borsaLayout));
    }
  }, [borsaLayout]);

  useEffect(() => {
    if (typeof window !== 'undefined' && nakitLayout.length > 0) {
      localStorage.setItem('nakit-layout', JSON.stringify(nakitLayout));
    }
  }, [nakitLayout]);

  // Grid width'i responsive yap
  useEffect(() => {
    const updateGridWidth = () => {
      if (typeof window !== 'undefined') {
        const container = document.querySelector('.layout')?.parentElement;
        if (container) {
          setGridWidth(container.clientWidth - 48); // 48px padding
        } else {
          setGridWidth(window.innerWidth - 96); // Fallback
        }
      }
    };

    updateGridWidth();
    window.addEventListener('resize', updateGridWidth);
    return () => window.removeEventListener('resize', updateGridWidth);
  }, []);

  // Nakit grid width'i responsive yap
  useEffect(() => {
    const updateNakitGridWidth = () => {
      if (typeof window !== 'undefined') {
        const container = document.querySelector('.nakit-layout')?.parentElement;
        if (container) {
          setNakitGridWidth(container.clientWidth - 48); // 48px padding
        } else {
          setNakitGridWidth(window.innerWidth - 96); // Fallback
        }
      }
    };

    updateNakitGridWidth();
    window.addEventListener('resize', updateNakitGridWidth);
    return () => window.removeEventListener('resize', updateNakitGridWidth);
  }, []);

  // Sembol detaylarını çek
  const fetchSymbolDetail = useCallback(async (symbol: string, type: 'stock' | 'crypto' | 'option', period: '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL' | 'LIVE' = '1W') => {
    try {
      // Canlı fiyat bilgisi (latest trade)
      const latestEndpoint = type === 'crypto'
        ? `/api/alpaca/crypto/latest?symbol=${symbol}`
        : `/api/alpaca/market-data/latest?symbol=${symbol}`;
      
      try {
        const latestResponse = await fetch(latestEndpoint);
        if (latestResponse.ok) {
          const latestData = await latestResponse.json();
          if (latestData.success && latestData.price) {
            setSymbolDetailLivePrice(parseFloat(latestData.price));
          }
        }
      } catch (error) {
        console.error('Latest price fetch error:', error);
      }

      // Snapshot API'sinden bugünün açılış, hacim ve son güncelleme bilgilerini al (sadece borsa için)
      let todayOpen: number | null = null;
      let todayVolume: number | null = null;
      let lastUpdateTime: string | null = null;
      
      if (type !== 'crypto') {
        try {
          const snapshotEndpoint = `/api/alpaca/market-data/snapshot?symbol=${symbol}`;
          const snapshotResponse = await fetch(snapshotEndpoint);
          
          if (snapshotResponse.ok) {
            const snapshotData = await snapshotResponse.json();
            if (snapshotData.success) {
              todayOpen = snapshotData.open;
              todayVolume = snapshotData.volume;
              lastUpdateTime = snapshotData.timestamp;
            }
          }
        } catch (error) {
          console.error('Snapshot fetch error:', error);
        }
      }

      // Fiyat bilgisi
      const priceEndpoint = type === 'crypto' 
        ? `/api/alpaca/crypto/market-data?symbol=${symbol}&period=1D&timeframe=1Day`
        : `/api/alpaca/market-data?symbol=${symbol}&period=1D&timeframe=1Day`;
      
      const priceResponse = await fetch(priceEndpoint);
      if (priceResponse.ok) {
        const priceData = await priceResponse.json();
        if (priceData.success && priceData.bars && priceData.bars.length > 0) {
          const latestBar = priceData.bars[priceData.bars.length - 1];
          const previousBar = priceData.bars[priceData.bars.length - 2];
          
          const currentPrice = parseFloat(latestBar.c);
          const previousPrice = previousBar ? parseFloat(previousBar.c) : currentPrice;
          const change = currentPrice - previousPrice;
          const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;
          
          // Snapshot'tan gelen verileri kullan, yoksa bar verilerini kullan
          setSymbolDetailData({
            price: currentPrice,
            change,
            changePercent,
            high: parseFloat(latestBar.h),
            low: parseFloat(latestBar.l),
            open: todayOpen !== null ? todayOpen : parseFloat(latestBar.o),
            volume: todayVolume !== null ? todayVolume : parseFloat(latestBar.v),
            timestamp: lastUpdateTime || latestBar.t,
          });
        }
      }

      // Chart verisi - period'a göre timeframe belirle
      let chartPeriod = '1D';
      let chartTimeframe = '1Day';
      
      // Period'a göre kaç günlük veri çekileceğini ve timeframe'i belirle
      if (period === 'LIVE') {
        // Canlı mod: 5 dakikalık veri, son 1 haftalık veri çek (bugünün verisi yoksa son verileri göster)
        chartPeriod = '1W'; // Son 1 haftalık veri çek, sonra bugünün verilerini filtrele
        chartTimeframe = '5Min';
      } else if (period === '1W') {
        chartPeriod = '1W';
        chartTimeframe = '1Hour';
      } else if (period === '1M') {
        chartPeriod = '1M';
        chartTimeframe = '1Day';
      } else if (period === '3M') {
        chartPeriod = '3M';
        chartTimeframe = '1Day';
      } else if (period === '6M') {
        chartPeriod = '6M';
        chartTimeframe = '1Day';
      } else if (period === '1Y') {
        chartPeriod = '1Y';
        chartTimeframe = '1Week';
      } else if (period === 'ALL') {
        chartPeriod = '2Y';
        chartTimeframe = '1Week';
      }

      const chartEndpoint = type === 'crypto'
        ? `/api/alpaca/crypto/market-data?symbol=${symbol}&period=${chartPeriod}&timeframe=${chartTimeframe}`
        : `/api/alpaca/market-data?symbol=${symbol}&period=${chartPeriod}&timeframe=${chartTimeframe}`;
      
      const chartResponse = await fetch(chartEndpoint);
      if (chartResponse.ok) {
        const chartData = await chartResponse.json();
        if (chartData.success && chartData.bars && chartData.bars.length > 0) {
          let barsToProcess = chartData.bars;
          
          // LIVE modunda bugünün pre-market, regular market ve after-market verilerini göster
          if (period === 'LIVE' && type !== 'crypto') {
            const now = new Date();
            const todayET = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
            todayET.setHours(9, 30, 0, 0); // Piyasa açılış saati: 09:30 ET
            
            // Pre-market başlangıcı: 04:00 ET (after-market 20:00 ET'de bitiyor)
            const preMarketStartET = new Date(todayET);
            preMarketStartET.setHours(4, 0, 0, 0);
            
            // Bugünün tarihini kontrol et
            const todayDate = todayET.toDateString();
            
            // Önce bugünün verilerini filtrele (pre-market, regular market ve after-market dahil)
            const todayBars = chartData.bars.filter((bar: any) => {
              const barDate = new Date(bar.t);
              const barDateET = new Date(barDate.toLocaleString('en-US', { timeZone: 'America/New_York' }));
              
              // Sadece bugünün verilerini al
              if (barDateET.toDateString() !== todayDate) {
                return false;
              }
              
              // Pre-market (04:00 ET), regular market (09:30 ET) ve after-market (16:00-20:00 ET) saatlerinden itibaren
              return barDateET >= preMarketStartET;
            });
            
            // Eğer bugünün verisi varsa onu kullan, yoksa son mevcut verileri göster (piyasa kapalıyken)
            if (todayBars.length > 0) {
              barsToProcess = todayBars;
            } else {
              // Bugünün verisi yoksa, en son mevcut verileri göster (en son 200 nokta - yaklaşık 16-17 saatlik veri)
              // Bu, piyasa kapalıyken son işlem gününün verilerini gösterir
              barsToProcess = chartData.bars.slice(-200);
              console.log('Bugünün verisi yok, son mevcut veriler gösteriliyor:', barsToProcess.length, 'nokta');
            }
          }
          
          const formattedChartData = barsToProcess.map((bar: any) => {
            // LIVE (5Min) için saat:dakika, diğerleri için tarih göster
            const timeStr = period === 'LIVE'
              ? new Date(bar.t).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
              : new Date(bar.t).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
            
            return {
              time: timeStr,
              date: new Date(bar.t).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
              timestamp: new Date(bar.t).getTime(),
              price: parseFloat(bar.c),
              close: parseFloat(bar.c), // Candlestick için close field'ı ekle
              high: parseFloat(bar.h),
              low: parseFloat(bar.l),
              open: parseFloat(bar.o),
              volume: parseFloat(bar.v),
            };
          }).sort((a: any, b: any) => a.timestamp - b.timestamp);
          
          console.log('Chart data loaded:', {
            period,
            originalBars: chartData.bars.length,
            processedBars: barsToProcess.length,
            formattedData: formattedChartData.length
          });
          
          setSymbolDetailChartData(formattedChartData);
        }
      }
    } catch (error) {
      console.error('Symbol detail fetch error:', error);
    }
  }, []);

  // Canlı fiyat ve grafik güncellemesi
  useEffect(() => {
    if (!symbolDetailModalOpen || !selectedSymbolDetail) return;

    const updateLivePrice = async () => {
      // Piyasa durumunu kontrol et (sadece borsa için)
      if (selectedSymbolDetail.type !== 'crypto') {
        const marketInfo = getMarketHoursInfo();
        const currentSession = marketInfo.currentSession;
        
        // Sadece piyasa kapalıyken canlı güncelleme yapma
        // Pre-market, regular market ve after-market saatlerinde güncelle
        if (currentSession === 'closed') {
          return;
        }
      }

      const latestEndpoint = selectedSymbolDetail.type === 'crypto'
        ? `/api/alpaca/crypto/latest?symbol=${selectedSymbolDetail.symbol}`
        : `/api/alpaca/market-data/latest?symbol=${selectedSymbolDetail.symbol}`;
      
      try {
        // Snapshot verilerini güncelle (sadece borsa için)
        if (selectedSymbolDetail.type !== 'crypto') {
          try {
            const snapshotEndpoint = `/api/alpaca/market-data/snapshot?symbol=${selectedSymbolDetail.symbol}`;
            const snapshotResponse = await fetch(snapshotEndpoint);
            
            if (snapshotResponse.ok) {
              const snapshotData = await snapshotResponse.json();
              if (snapshotData.success) {
                // Mevcut verileri güncelle
                setSymbolDetailData((prev: any) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    open: snapshotData.open !== null ? snapshotData.open : prev.open,
                    volume: snapshotData.volume !== null ? snapshotData.volume : prev.volume,
                    timestamp: snapshotData.timestamp || prev.timestamp,
                  };
                });
              }
            }
          } catch (snapshotError) {
            console.error('Snapshot update error:', snapshotError);
          }
        }
        
        const latestResponse = await fetch(latestEndpoint);
        if (latestResponse.ok) {
          const latestData = await latestResponse.json();
          if (latestData.success && latestData.price) {
            const newPrice = parseFloat(latestData.price);
            
            // Önceki fiyatla karşılaştır ve animasyon için direction belirle
            setSymbolDetailLivePrice(prevPrice => {
              if (prevPrice !== null && prevPrice !== newPrice) {
                // Fiyat değiştiyse direction belirle (küçük farkları da yakala)
                const priceDiff = newPrice - prevPrice;
                if (priceDiff > 0.01) { // En az $0.01 artış
                  setPriceChangeDirection('up');
                  // Animasyon için 3 saniye sonra direction'ı sıfırla
                  setTimeout(() => setPriceChangeDirection(null), 3000);
                } else if (priceDiff < -0.01) { // En az $0.01 azalış
                  setPriceChangeDirection('down');
                  // Animasyon için 3 saniye sonra direction'ı sıfırla
                  setTimeout(() => setPriceChangeDirection(null), 3000);
                }
              }
              setPreviousLivePrice(prevPrice);
              return newPrice;
            });
            
            // Grafik verisine yeni nokta ekle (canlı mod seçiliyse)
            if (symbolDetailChartPeriod === 'LIVE') {
              const now = new Date();
              const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
              const dateStr = now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
              
              setSymbolDetailChartData(prev => {
                // Borsa için bugünün pre-market, regular market ve after-market verilerini tut
                let filteredPrev = prev;
                if (selectedSymbolDetail && selectedSymbolDetail.type !== 'crypto') {
                  const todayET = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
                  const preMarketStartET = new Date(todayET);
                  preMarketStartET.setHours(4, 0, 0, 0); // Pre-market başlangıcı: 04:00 ET
                  const preMarketStartTime = preMarketStartET.getTime();
                  
                  // Bugünün tarihini kontrol et
                  const todayDate = todayET.toDateString();
                  
                  filteredPrev = prev.filter(point => {
                    const pointDate = new Date(point.timestamp);
                    const pointDateET = new Date(pointDate.toLocaleString('en-US', { timeZone: 'America/New_York' }));
                    
                    // Sadece bugünün verilerini tut
                    if (pointDateET.toDateString() !== todayDate) {
                      return false;
                    }
                    
                    // Pre-market (04:00 ET), regular market (09:30 ET) ve after-market (16:00-20:00 ET) verilerini tut
                    return point.timestamp >= preMarketStartTime;
                  });
                }
                
                if (filteredPrev.length === 0) {
                  // Eğer bugünün verisi yoksa, yeni nokta ekle
                  const newPoint = {
                    time: timeStr,
                    date: dateStr,
                    timestamp: now.getTime(),
                    price: newPrice,
                    close: newPrice,
                    high: newPrice,
                    low: newPrice,
                    open: newPrice,
                    volume: 0,
                  };
                  return [newPoint];
                }
                
                // Son noktayı kontrol et, eğer aynı 5 dakikalık periyottaysa güncelle, değilse yeni ekle
                const lastPoint = filteredPrev[filteredPrev.length - 1];
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
                    date: dateStr,
                    timestamp: nowTime,
                    high: Math.max(lastPoint.high || newPrice, newPrice),
                    low: Math.min(lastPoint.low || newPrice, newPrice),
                  };
                  // Sadece son noktayı güncelle, tüm array'i yeniden oluşturma
                  const updated = [...filteredPrev];
                  updated[updated.length - 1] = updatedPoint;
                  return updated;
                } else if (timeDiff >= 300000) {
                  // Yeni 5 dakikalık nokta ekle (son 200 noktayı tut)
                  const newPoint = {
                    time: timeStr,
                    date: dateStr,
                    timestamp: nowTime,
                    price: newPrice,
                    close: newPrice,
                    high: newPrice,
                    low: newPrice,
                    open: lastPoint ? lastPoint.price : newPrice,
                    volume: 0,
                  };
                  return [...filteredPrev.slice(-199), newPoint];
                }
                return filteredPrev;
              });
            }
          }
        }
      } catch (error) {
        console.error('Live price update error:', error);
      }
    };

    // İlk yükleme
    updateLivePrice();
    
    // Piyasa durumunu kontrol et (sadece borsa için)
    let shouldUpdate = true;
    if (selectedSymbolDetail && selectedSymbolDetail.type !== 'crypto') {
      const marketInfo = getMarketHoursInfo();
      const currentSession = marketInfo.currentSession;
      // Pre-market, regular market ve after-market saatlerinde güncelle
      shouldUpdate = currentSession !== 'closed';
    }
    
    // Her 3 saniyede bir güncelle (anlık fiyat güncellemesi için)
    // Pre-market, regular market, after-market saatlerinde veya kripto için güncelle
    if (shouldUpdate || (selectedSymbolDetail && selectedSymbolDetail.type === 'crypto')) {
      const interval = setInterval(updateLivePrice, 3000);
    return () => clearInterval(interval);
    }
  }, [symbolDetailModalOpen, selectedSymbolDetail, symbolDetailChartPeriod, marketClock]);

  // Piyasa durumuna göre otomatik canlı veri gösterimi
  useEffect(() => {
    if (!selectedSymbolDetail || !symbolDetailModalOpen || selectedSymbolDetail.type === 'crypto') return;
    
    // Kullanıcı manuel seçim yaptıysa otomatik geçiş yapma
    if (isManualPeriodSelection) return;
    
    const marketInfo = getMarketHoursInfo();
    const currentSession = marketInfo.currentSession;
    
    // Pre-market, regular market ve after-market saatlerinde otomatik olarak LIVE moduna geç
    if (currentSession === 'regular' || currentSession === 'pre-market' || currentSession === 'after-market') {
      if (symbolDetailChartPeriod !== 'LIVE') {
        setSymbolDetailChartPeriod('LIVE');
      }
    } else if (currentSession === 'closed' && symbolDetailChartPeriod === 'LIVE') {
      // Piyasa kapalıyken ve LIVE modundaysa, 1W moduna geç
      setSymbolDetailChartPeriod('1W');
    }
  }, [marketClock, selectedSymbolDetail, symbolDetailModalOpen, symbolDetailChartPeriod, isManualPeriodSelection]);

  // Modal açıldığında veya sembol değiştiğinde manuel seçim state'ini sıfırla
  useEffect(() => {
    if (symbolDetailModalOpen && selectedSymbolDetail) {
      setIsManualPeriodSelection(false);
    }
  }, [symbolDetailModalOpen, selectedSymbolDetail?.symbol]);

  // Sembol değiştiğinde animasyon state'lerini sıfırla
  useEffect(() => {
    if (selectedSymbolDetail) {
      setPreviousLivePrice(null);
      setPriceChangeDirection(null);
    }
  }, [selectedSymbolDetail?.symbol]);

  // Period değiştiğinde chart'ı güncelle
  useEffect(() => {
    if (selectedSymbolDetail && symbolDetailModalOpen) {
      fetchSymbolDetail(selectedSymbolDetail.symbol, selectedSymbolDetail.type, symbolDetailChartPeriod);
    }
  }, [symbolDetailChartPeriod, selectedSymbolDetail, symbolDetailModalOpen, fetchSymbolDetail]);

  // Chart verisini periyodik olarak güncelle (canlı mod seçiliyse)
  useEffect(() => {
    if (!symbolDetailModalOpen || !selectedSymbolDetail || symbolDetailChartPeriod !== 'LIVE') return;

    const updateChartData = async () => {
      // Piyasa durumunu kontrol et (sadece borsa için)
      if (selectedSymbolDetail.type !== 'crypto') {
        const marketInfo = getMarketHoursInfo();
        const currentSession = marketInfo.currentSession;
        
        // Sadece piyasa kapalıyken chart güncelleme yapma
        // Pre-market, regular market ve after-market saatlerinde güncelle
        if (currentSession === 'closed') {
          return;
        }
      }

      await fetchSymbolDetail(selectedSymbolDetail.symbol, selectedSymbolDetail.type, 'LIVE');
    };

    // Her 5 dakikada bir grafik verisini güncelle (5 dakikalık bar'lar için yeni bar eklendiğinde)
    const interval = setInterval(updateChartData, 300000);
    
    return () => clearInterval(interval);
  }, [symbolDetailModalOpen, selectedSymbolDetail, symbolDetailChartPeriod, fetchSymbolDetail, marketClock]);

  // Sembol arama
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }
    
    setSearchLoading(true);
    try {
      const results = await searchSymbolsFromAPI(query, 10);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      const localResults = searchSymbols(query, 10);
      setSearchResults(localResults);
    } finally {
      setSearchLoading(false);
    }
  };

  const openOrders = useMemo(() => {
    const openStatuses = new Set([
      'new',
      'accepted',
      'pending_new',
      'accepted_for_bidding',
      'pending_review',
      'pending_replace',
      'pending_cancel',
      'held',
      'partially_filled',
    ]);
    return orders.filter((order) => openStatuses.has(order.status));
  }, [orders]);

  const formatOrderStatus = useCallback((status: string) => {
    if (!status) return '-';
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, []);

  useEffect(() => {
    if (!orderActionMessage) return;
    const timer = setTimeout(() => setOrderActionMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [orderActionMessage]);

  // Kripto arama
  const handleCryptoSearch = async (query: string) => {
    setCryptoSearchQuery(query);
    if (query.length < 1) {
      setCryptoSearchResults([]);
      return;
    }
    
    setCryptoSearchLoading(true);
    try {
      // Kripto için local search
      const upperQuery = query.toUpperCase();
      const results = popularCryptoSymbols.filter(crypto => 
        crypto.symbol.includes(upperQuery) || 
        crypto.name.toUpperCase().includes(upperQuery)
      ).slice(0, 10);
      setCryptoSearchResults(results);
    } catch (error) {
      console.error('Crypto search error:', error);
      setCryptoSearchResults([]);
    } finally {
      setCryptoSearchLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Portfolio data hesaplama (Alpaca + Mambu)
  const portfolioValue = accountData ? parseFloat(accountData.portfolio_value || accountData.equity || '0') : 0;
  const alpacaCash = accountData ? parseFloat(accountData.cash || accountData.trade_cash || '0') : 0;
  
  // Nakit: Sadece Mambu'dan gelen nakit (USD cinsinden)
  const mambuCash = mambuAccount ? parseFloat(mambuAccount.cashBalance || mambuAccount.totalBalance || '0') : 0;
  
  // Yatırımlar: Alpaca'daki hisse senedi pozisyonları (USD cinsinden)
  // Equity positions (us_equity) market value'larını topla
  const investmentsValue = positions.reduce((sum: number, pos: any) => {
    return sum + parseFloat(pos.market_value || '0');
  }, 0);
  
  // Kripto: Alpaca'daki kripto pozisyonları (USD cinsinden)
  const cryptoValue = cryptoPositions.reduce((sum: number, pos: any) => {
    return sum + parseFloat(pos.market_value || '0');
  }, 0);

  // Toplam portföy değeri (Alpaca + Mambu). Alpaca tarafında portfolio_value hazır olduğunda onu kullan, yoksa bileşen toplamını kullan.
  const alpacaPortfolioTotal = Math.max(
    portfolioValue,
    alpacaCash + investmentsValue + cryptoValue
  );
  const totalPortfolioValue = alpacaPortfolioTotal + mambuCash;
  
  // Equity ve değişim hesaplama (Alpaca account için)
  const equity = accountData ? parseFloat(accountData.equity || '0') : 0;
  const lastEquity = accountData ? parseFloat(accountData.last_equity || '0') : 0;
  const totalChange = equity - lastEquity;
  const totalChangePercent = lastEquity > 0 ? ((totalChange / lastEquity) * 100) : 0;

  const combinedCash = mambuCash + alpacaCash;
  const fallbackInvestmentsValue = Math.max(alpacaPortfolioTotal - alpacaCash - cryptoValue, 0);
  const investmentsDisplayValue =
    investmentsValue > 0 ? investmentsValue : fallbackInvestmentsValue;

  const portfolioData = {
    totalValue: totalPortfolioValue,
    totalChange: totalChange,
    totalChangePercent: totalChangePercent,
    cash: combinedCash,
    investments: investmentsDisplayValue,
    crypto: cryptoValue,
  };

  // Portfolio dağılımı için grafik data (USD cinsinden)
  const portfolioDistributionData = [
    { name: 'Yatırımlar', value: investmentsDisplayValue, color: '#facc15' },
    { name: 'Nakit', value: combinedCash, color: '#3b82f6' },
    { name: 'Kripto', value: cryptoValue, color: '#10b981' },
  ].filter(item => item.value > 0);

  // Son alınan hisseler (positions) - sadece buy olanlar
  const recentStockPositions = positions
    .filter((pos: any) => pos.asset_class === 'us_equity' && parseFloat(pos.qty || '0') > 0)
    .map((pos: any) => ({
      id: `position-${pos.symbol}`,
      type: 'stock_position',
      asset: pos.symbol,
      amount: parseFloat(pos.qty || '0'),
      price: parseFloat(pos.market_value || '0') / parseFloat(pos.qty || '1'),
      date: pos.updated_at || new Date().toISOString(),
      status: 'active',
      source: 'alpaca',
      marketValue: parseFloat(pos.market_value || '0'),
      costBasis: parseFloat(pos.cost_basis || '0'),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Son alınan opsiyonlar
  const recentOptionsPositions = optionsPositions
    .filter((pos: any) => parseFloat(pos.qty || '0') > 0)
    .map((pos: any) => ({
      id: `option-${pos.symbol || pos.underlying_symbol}`,
      type: 'option_position',
      asset: pos.symbol || `${pos.underlying_symbol} Option`,
      amount: parseFloat(pos.qty || '0'),
      price: parseFloat(pos.market_value || '0') / parseFloat(pos.qty || '1'),
      date: pos.updated_at || new Date().toISOString(),
      status: 'active',
      source: 'alpaca',
      marketValue: parseFloat(pos.market_value || '0'),
      costBasis: parseFloat(pos.cost_basis || '0'),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Orders'ı transactions formatına çevir (Alpaca)
  const alpacaOrders = orders.slice(0, 10).map((order) => ({
    id: order.id,
    type: order.side === 'buy' ? 'buy' : 'sell',
    asset: order.symbol,
    amount: order.filled_qty ? parseFloat(order.filled_qty) : 0,
    price: order.filled_avg_price ? parseFloat(order.filled_avg_price) : 0,
    date: order.filled_at || order.created_at,
    status: order.status,
    source: 'alpaca',
    orderType: 'order',
  }));

  // Mambu transactions'ı formatla (kart/hesap işlemleri)
  const formattedMambuTransactions = mambuTransactions.map((tx: any) => ({
    id: tx.id,
    type: tx.type === 'deposit' ? 'deposit' : tx.type === 'withdrawal' ? 'withdrawal' : 'transfer',
    asset: tx.description || 'Kart/Hesap İşlemi',
    amount: tx.amount,
    price: 1,
    date: tx.date,
    status: tx.status,
    source: 'mambu',
    orderType: 'transaction',
  }));

  // Tüm işlemleri birleştir ve tarihe göre sırala
  const recentTransactions = [
    ...recentStockPositions,
    ...recentOptionsPositions,
    ...alpacaOrders,
    ...formattedMambuTransactions,
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 15); // Daha fazla göster

  // Performans data - pozisyonlar ve kazanç/kayıp
  const performanceData = positions
    .filter((p: any) => p.asset_class === 'us_equity')
    .map((pos: any) => {
      const costBasis = parseFloat(pos.cost_basis || '0');
      const marketValue = parseFloat(pos.market_value || '0');
      const unrealizedPL = parseFloat(pos.unrealized_pl || '0');
      const unrealizedPLPercent = costBasis > 0 ? ((unrealizedPL / costBasis) * 100) : 0;
      
      return {
        symbol: pos.symbol,
        costBasis: costBasis,
        marketValue: marketValue,
        unrealizedPL: unrealizedPL,
        unrealizedPLPercent: unrealizedPLPercent,
        qty: parseFloat(pos.qty || '0'),
      };
    })
    .sort((a, b) => Math.abs(b.unrealizedPLPercent) - Math.abs(a.unrealizedPLPercent));

  // Filtrelenmiş hisse senetleri
  const getFilteredStocks = () => {
    let filtered = [...popularStocks];
    
    switch (stockFilter) {
      case "gainers":
        filtered = filtered.filter(s => (s.changePercent || 0) > 0).sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0));
        break;
      case "losers":
        filtered = filtered.filter(s => (s.changePercent || 0) < 0).sort((a, b) => (a.changePercent || 0) - (b.changePercent || 0));
        break;
      case "volume":
        filtered = filtered.sort((a, b) => (b.volume || 0) - (a.volume || 0));
        break;
      default:
        filtered = filtered.sort((a, b) => Math.abs(b.changePercent || 0) - Math.abs(a.changePercent || 0));
    }
    
    return filtered;
  };

  // Watchlist'e ekle/çıkar
  const toggleWatchlist = (symbol: string) => {
    setWatchlist(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  // Borsa ekranı render fonksiyonu
  const renderBorsaScreen = () => {
    const filteredStocks = getFilteredStocks();
    const gainers = popularStocks.filter(s => (s.changePercent || 0) > 0).sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0)).slice(0, 5);
    const losers = popularStocks.filter(s => (s.changePercent || 0) < 0).sort((a, b) => (a.changePercent || 0) - (b.changePercent || 0)).slice(0, 5);
    
    return (
      <div className="space-y-6">
        {/* Header ve Arama - Modern */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-gray-900/95 shadow-2xl p-8 border border-white/20 dark:border-gray-800/50"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
            boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)',
          }}
          ref={borsaHeaderRef}
        >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-secondary-500/5 to-accent-500/5 dark:from-primary-500/10 dark:via-secondary-500/10 dark:to-accent-500/10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-400/10 to-transparent dark:from-primary-400/20 dark:to-transparent rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 flex items-center justify-center shadow-2xl"
                style={{
                  boxShadow: '0 10px 40px -10px rgba(59, 130, 246, 0.5)',
                }}
              >
                <TrendingUp className="w-8 h-8 text-white" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
              </motion.div>
              <div>
                <h1 className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent">
                  Borsa
                </h1>
                <p className="text-gray-800 dark:text-gray-100 text-xl font-bold">Hisse senetleri alın, satın ve portföyünüzü yönetin</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {(() => {
                const marketInfo = getMarketHoursInfo();
                return (
                  <>
                    <div className="text-right px-4 py-2 bg-gray-50/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                      <div className="text-xs text-gray-600 dark:text-gray-300 font-medium mb-1">Şu An (TR/ET)</div>
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {marketInfo.currentTimeTR} / {marketInfo.currentTimeET}
                      </div>
                    </div>
                    {marketInfo.nextOpen && !marketInfo.isMarketOpen && (
                      <div className="text-right px-4 py-2 bg-blue-50/80 dark:bg-blue-900/50 rounded-xl backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50">
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Sonraki Açılış</div>
                        <div className="text-sm font-bold text-blue-800 dark:text-blue-300">
                          {marketInfo.nextOpen}
                        </div>
                      </div>
                    )}
                    {marketInfo.nextClose && marketInfo.isMarketOpen && (
                      <div className="text-right px-4 py-2 bg-orange-50/80 dark:bg-orange-900/50 rounded-xl backdrop-blur-sm border border-orange-200/50 dark:border-orange-700/50">
                        <div className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">Sonraki Kapanış</div>
                        <div className="text-sm font-bold text-orange-800 dark:text-orange-300">
                          {marketInfo.nextClose}
                        </div>
                      </div>
                    )}
                    {/* Pre-Market */}
                    <div 
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm border ${
                        marketInfo.currentSession === 'pre-market' 
                          ? 'bg-purple-100 dark:bg-purple-900/50 border-purple-300 dark:border-purple-700 animate-blink' 
                          : 'bg-gray-50/80 dark:bg-gray-700/80 border-gray-200/50 dark:border-gray-600/50'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${
                        marketInfo.currentSession === 'pre-market' 
                          ? 'bg-purple-500 dark:bg-purple-400' 
                          : 'bg-purple-500 dark:bg-purple-400'
                      }`}></div>
                      <div className="text-left flex-1">
                        <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">Pre-Market</div>
                        <div className="text-xs font-bold text-gray-900 dark:text-gray-100">
                          {marketInfo.preMarketStartET} - {marketInfo.preMarketEndET} ET
                        </div>
                        <div className="text-xs text-gray-700 dark:text-gray-300">
                          {marketInfo.preMarketStartTR} - {marketInfo.preMarketEndTR} TR
                        </div>
                      </div>
                    </div>
                    {/* Regular Market */}
                    <div 
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm border ${
                        marketInfo.currentSession === 'regular' 
                          ? 'bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700 animate-blink' 
                          : 'bg-gray-50/80 dark:bg-gray-700/80 border-gray-200/50 dark:border-gray-600/50'
                      }`}
                    >
                      <div className="w-3 h-3 rounded-full bg-green-500 dark:bg-green-400"></div>
                      <div className="text-left flex-1">
                        <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">Regular Market</div>
                        <div className="text-xs font-bold text-gray-900 dark:text-gray-100">
                          {marketInfo.regularMarketStartET} - {marketInfo.regularMarketEndET} ET
                        </div>
                        <div className="text-xs text-gray-700 dark:text-gray-300">
                          {marketInfo.regularMarketStartTR} - {marketInfo.regularMarketEndTR} TR
                        </div>
                      </div>
                    </div>
                    {/* After-Market */}
                    <div 
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm border ${
                        marketInfo.currentSession === 'after-market' 
                          ? 'bg-orange-100 dark:bg-orange-900/50 border-orange-300 dark:border-orange-700 animate-blink' 
                          : 'bg-gray-50/80 dark:bg-gray-700/80 border-gray-200/50 dark:border-gray-600/50'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${
                        marketInfo.currentSession === 'after-market' 
                          ? 'bg-orange-500 dark:bg-orange-400' 
                          : 'bg-orange-500 dark:bg-orange-400'
                      }`}></div>
                      <div className="text-left flex-1">
                        <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">After-Market</div>
                        <div className="text-xs font-bold text-gray-900 dark:text-gray-100">
                          {marketInfo.afterMarketStartET} - {marketInfo.afterMarketEndET} ET
                        </div>
                        <div className="text-xs text-gray-700 dark:text-gray-300">
                          {marketInfo.afterMarketStartTR} - {marketInfo.afterMarketEndTR} TR
                        </div>
                      </div>
                    </div>
                    {marketClockLoading && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1 px-4">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Güncelleniyor...
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Arama Çubuğu - Modern */}
          <div className="relative mb-6">
            <div className="absolute left-5 top-1/2 transform -translate-y-1/2 z-10">
              <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Hisse senedi ara (örn: AAPL, TSLA, MSFT)..."
              className="w-full pl-14 pr-12 py-5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl focus:ring-4 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:border-primary-500 dark:focus:border-primary-400 transition-all text-lg font-medium shadow-lg hover:shadow-xl text-gray-900 dark:text-gray-100"
              style={{
                boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.1)',
              }}
            />
            {searchLoading && (
              <div className="absolute right-5 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent"></div>
              </div>
            )}
          </div>

          {/* Filtre Butonları - Modern */}
          <div className="flex items-center gap-3 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStockFilter("all")}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all backdrop-blur-sm ${
                stockFilter === "all"
                  ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg"
                  : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 border border-gray-200/50 dark:border-gray-700/50 shadow-md"
              }`}
              style={stockFilter === "all" ? {
                boxShadow: '0 8px 20px -8px rgba(59, 130, 246, 0.4)',
              } : {}}
            >
              <Filter className="w-4 h-4 inline mr-2" />
              Tümü
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStockFilter("gainers")}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all backdrop-blur-sm ${
                stockFilter === "gainers"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                  : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 border border-gray-200/50 dark:border-gray-700/50 shadow-md"
              }`}
              style={stockFilter === "gainers" ? {
                boxShadow: '0 8px 20px -8px rgba(34, 197, 94, 0.4)',
              } : {}}
            >
              <TrendingUpIcon className="w-4 h-4 inline mr-2" />
              Yükselenler
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStockFilter("losers")}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all backdrop-blur-sm ${
                stockFilter === "losers"
                  ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg"
                  : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 border border-gray-200/50 dark:border-gray-700/50 shadow-md"
              }`}
              style={stockFilter === "losers" ? {
                boxShadow: '0 8px 20px -8px rgba(239, 68, 68, 0.4)',
              } : {}}
            >
              <TrendingDownIcon className="w-4 h-4 inline mr-2" />
              Düşenler
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStockFilter("volume")}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all backdrop-blur-sm ${
                stockFilter === "volume"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                  : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 border border-gray-200/50 dark:border-gray-700/50 shadow-md"
              }`}
              style={stockFilter === "volume" ? {
                boxShadow: '0 8px 20px -8px rgba(59, 130, 246, 0.4)',
              } : {}}
            >
              <Volume2 className="w-4 h-4 inline mr-2" />
              Hacim
            </motion.button>
          </div>
        </div>

        {/* Arama Sonuçları */}
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-gray-50 dark:bg-gray-800/90 rounded-xl border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto shadow-lg"
          >
            {searchResults.map((result) => (
              <button
                key={result.symbol}
                onClick={async () => {
                  setSelectedSymbolDetail({
                    symbol: result.symbol,
                    name: result.name,
                    type: 'stock',
                  });
                  setSymbolDetailModalOpen(true);
                  setSymbolDetailChartPeriod('1W');
                  // Sembol detaylarını çek
                  await fetchSymbolDetail(result.symbol, 'stock', '1W');
                }}
                className="w-full px-4 py-3 text-left hover:bg-white dark:hover:bg-gray-700/80 transition-colors flex items-center justify-between border-b border-gray-200 dark:border-gray-700 last:border-b-0"
              >
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-base">{result.symbol}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">{result.name}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500 dark:text-gray-300" />
              </button>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Hızlı İşlemler ve Özet Kartlar - Modern */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Hızlı İşlemler */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 grid grid-cols-2 gap-6"
        >
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setTradeModalType("buy");
              setTradeModalOpen(true);
            }}
            className="relative overflow-hidden rounded-3xl p-8 text-white text-left group"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 20px 40px -12px rgba(16, 185, 129, 0.4)',
            }}
            onMouseEnter={(e) => {
              if (document.documentElement.classList.contains('dark')) {
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(16, 185, 129, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (document.documentElement.classList.contains('dark')) {
                e.currentTarget.style.boxShadow = '0 20px 40px -12px rgba(16, 185, 129, 0.4)';
              }
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </div>
              <h3 className="font-extrabold text-2xl mb-2">Hisse Senedi Al</h3>
              <p className="text-sm opacity-90 font-medium">Yeni yatırım yap</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              const hasPositions = positions.some((p: any) => p.asset_class === 'us_equity' && parseFloat(p.qty || '0') > 0);
              if (hasPositions) {
                const firstPosition = positions.find((p: any) => p.asset_class === 'us_equity' && parseFloat(p.qty || '0') > 0);
                setSelectedSymbol(firstPosition?.symbol || null);
              } else {
                setSelectedSymbol(null);
              }
              setTradeModalType("sell");
              setTradeModalOpen(true);
            }}
            className="relative overflow-hidden rounded-3xl p-8 text-white text-left group"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              boxShadow: '0 20px 40px -12px rgba(239, 68, 68, 0.4)',
            }}
            onMouseEnter={(e) => {
              if (document.documentElement.classList.contains('dark')) {
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(239, 68, 68, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (document.documentElement.classList.contains('dark')) {
                e.currentTarget.style.boxShadow = '0 20px 40px -12px rgba(239, 68, 68, 0.4)';
              }
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </div>
              <h3 className="font-extrabold text-2xl mb-2">Hisse Senedi Sat</h3>
              <p className="text-sm opacity-90 font-medium">Pozisyon kapat</p>
            </div>
          </motion.button>
        </motion.div>

        {/* Özet Kartlar - Modern */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative overflow-hidden rounded-2xl backdrop-blur-xl p-5 border border-green-200/50 dark:border-green-700/50"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
            boxShadow: '0 8px 32px -8px rgba(16, 185, 129, 0.2)',
          }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 dark:bg-green-900/50 flex items-center justify-center">
                <TrendingUpIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">En Çok Yükselen</span>
            </div>
            {gainers.length > 0 ? (
              <div className="space-y-2">
                {gainers.slice(0, 3).map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-2 rounded-lg bg-white/40 dark:bg-gray-700/40 backdrop-blur-sm">
                    <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">{stock.symbol}</span>
                    <span className="text-green-600 dark:text-green-400 font-extrabold text-sm">+{stock.changePercent?.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-600 dark:text-gray-300">Veri yok</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl backdrop-blur-xl p-5 border border-red-200/50 dark:border-red-800/50"
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
            boxShadow: '0 8px 32px -8px rgba(239, 68, 68, 0.2)',
          }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 dark:bg-red-900/50 flex items-center justify-center">
                <TrendingDownIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">En Çok Düşen</span>
            </div>
            {losers.length > 0 ? (
              <div className="space-y-2">
                {losers.slice(0, 3).map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-2 rounded-lg bg-white/40 dark:bg-gray-700/40 backdrop-blur-sm">
                    <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">{stock.symbol}</span>
                    <span className="text-red-600 dark:text-red-400 font-extrabold text-sm">{stock.changePercent?.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-600 dark:text-gray-300">Veri yok</p>
            )}
          </div>

        </motion.div>
      </div>

        {/* Pozisyonlar - Geliştirilmiş */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Wallet className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              Pozisyonlarım
            </h2>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full shadow-sm">
              <div className="w-2.5 h-2.5 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-green-700 dark:text-green-300">Canlı</span>
            </div>
          </div>

            {/* Toplam Özet - Modern */}
            {positions.filter((p: any) => p.asset_class === 'us_equity' && parseFloat(p.qty || '0') > 0).length > 0 && (
              <div className="mb-6 p-5 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-2xl border border-primary-200/50 backdrop-blur-sm"
                style={{
                  boxShadow: '0 8px 32px -8px rgba(59, 130, 246, 0.2)',
                }}
              >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Toplam Portföy Değeri</span>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  ${positions
                    .filter((p: any) => p.asset_class === 'us_equity' && parseFloat(p.qty || '0') > 0)
                    .reduce((sum: number, pos: any) => sum + parseFloat(pos.market_value || '0'), 0)
                    .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Toplam Kazanç/Kayıp</span>
                {(() => {
                  const totalPL = positions
                    .filter((p: any) => p.asset_class === 'us_equity' && parseFloat(p.qty || '0') > 0)
                    .reduce((sum: number, pos: any) => sum + parseFloat(pos.unrealized_pl || '0'), 0);
                  return (
                    <div className={`flex items-center gap-1 font-bold text-lg ${
                      totalPL >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {totalPL >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span>
                        {totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {positions.filter((p: any) => p.asset_class === 'us_equity' && parseFloat(p.qty || '0') > 0).length > 0 ? (
              positions
                .filter((p: any) => p.asset_class === 'us_equity' && parseFloat(p.qty || '0') > 0)
                .slice(0, 8)
                .map((pos: any, index: number) => {
                  const marketValue = parseFloat(pos.market_value || '0');
                  const costBasis = parseFloat(pos.cost_basis || '0');
                  const unrealizedPL = parseFloat(pos.unrealized_pl || '0');
                  const unrealizedPLPercent = costBasis > 0 ? ((unrealizedPL / costBasis) * 100) : 0;
                  const currentPrice = parseFloat(pos.qty || '0') > 0 ? marketValue / parseFloat(pos.qty || '1') : 0;
                  const avgCost = parseFloat(pos.qty || '0') > 0 ? costBasis / parseFloat(pos.qty || '1') : 0;

                  return (
                    <motion.div
                      key={pos.symbol}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="group p-5 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:bg-white/90 hover:shadow-xl transition-all"
                      style={{
                        boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.08)',
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <motion.div 
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg shadow-lg"
                            style={{
                              boxShadow: '0 8px 24px -8px rgba(59, 130, 246, 0.4)',
                            }}
                          >
                            {pos.symbol[0]}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
                          </motion.div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-gray-100 text-lg">{pos.symbol}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">{parseFloat(pos.qty || '0').toFixed(2)} adet</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedSymbol(pos.symbol);
                            setTradeModalType("sell");
                            setTradeModalOpen(true);
                          }}
                          className="px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors shadow-sm hover:shadow-md"
                        >
                          Sat
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Piyasa Değeri</span>
                          <span className="font-bold text-gray-900 dark:text-gray-100">
                            ${marketValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Güncel Fiyat</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            ${currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Ortalama Maliyet</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            ${avgCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Kazanç/Kayıp</span>
                            <div className={`flex items-center gap-1 font-bold ${
                              unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {unrealizedPL >= 0 ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              <span className="text-sm">
                                {unrealizedPL >= 0 ? '+' : ''}${unrealizedPL.toFixed(2)}
                              </span>
                              <span className="text-xs ml-1">
                                ({unrealizedPLPercent >= 0 ? '+' : ''}{unrealizedPLPercent.toFixed(2)}%)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
            ) : (
              <div className="text-center py-12">
                <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 font-medium">Henüz pozisyonunuz yok</p>
                <button
                  onClick={() => {
                    setTradeModalType("buy");
                    setTradeModalOpen(true);
                  }}
                  className="px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold bg-primary-50 dark:bg-primary-900/30 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
                >
                  İlk yatırımınızı yapın →
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Derinlik Analizleri, Market Analizi, Emir Listesi ve Popüler Hisse Senetleri */}
        <GridLayout
          className="layout"
          layout={borsaLayout}
          cols={3}
          rowHeight={100}
          width={gridWidth}
          onLayoutChange={(layout: any) => setBorsaLayout(layout)}
          isDraggable={true}
          isResizable={true}
          draggableHandle=".drag-handle"
          style={{ minHeight: '400px' }}
        >
          {/* Derinlik Analizleri */}
          <div key="depth" className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                Derinlik Analizleri
              </h2>
              <div className="drag-handle cursor-move p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>
      </div>

            {/* Sembol Seçici */}
            <div className="mb-4 flex-shrink-0">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sembol Seçin
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={selectedSymbol || ''}
                  onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase().trim() || null)}
                  placeholder="Örn: AAPL, TSLA, MSFT"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
                {selectedSymbol && (
                  <button
                    onClick={() => setSelectedSymbol(null)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Popüler Semboller */}
              <div className="mt-2">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">Popüler Semboller:</p>
                <div className="flex flex-wrap gap-1.5">
                  {popularStocks.slice(0, 6).map((stock: any) => (
                    <button
                      key={stock.symbol}
                      onClick={() => setSelectedSymbol(stock.symbol)}
                      className={`px-2 py-1 text-xs rounded-lg font-semibold transition-colors whitespace-nowrap ${
                        selectedSymbol === stock.symbol
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {stock.symbol}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
              {selectedSymbol ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Seçili Sembol</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{selectedSymbol}</span>
                  </div>
                  {marketDepthLoading ? (
                    <div className="text-center py-6">
                      <Loader2 className="w-6 h-6 text-primary-600 dark:text-primary-400 mx-auto mb-2 animate-spin" />
                      <p className="text-gray-600 dark:text-gray-300 text-xs">Yükleniyor...</p>
                    </div>
                  ) : marketDepth ? (
                    <div className="space-y-4">
                      {/* Grafiksel Order Book Görselleştirmesi */}
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              ...marketDepth.bids.slice().reverse().map((bid, idx) => ({
                                level: `B${marketDepth.bids.length - idx}`,
                                price: parseFloat(bid.price),
                                size: parseFloat(bid.size),
                                type: 'bid',
                              })),
                              ...marketDepth.asks.map((ask, idx) => ({
                                level: `A${idx + 1}`,
                                price: parseFloat(ask.price),
                                size: parseFloat(ask.size),
                                type: 'ask',
                              })),
                            ]}
                            layout="vertical"
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                            <XAxis 
                              type="number" 
                              dataKey="size"
                              tick={{ fontSize: 10 }}
                              stroke="#6b7280"
                            />
                            <YAxis 
                              type="category" 
                              dataKey="level"
                              tick={{ fontSize: 10 }}
                              stroke="#6b7280"
                              width={40}
                            />
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                        {data.type === 'bid' ? 'Alış' : 'Satış'} - {data.level}
                                      </p>
                                      <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Fiyat: <span className="font-semibold">${data.price.toFixed(2)}</span>
                                      </p>
                                      <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Hacim: <span className="font-semibold">{data.size.toLocaleString()}</span>
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar 
                              dataKey="size" 
                              radius={[0, 4, 4, 0]}
                            >
                              {[
                                ...marketDepth.bids.slice().reverse().map((_, idx) => ({
                                  level: `B${marketDepth.bids.length - idx}`,
                                  type: 'bid',
                                })),
                                ...marketDepth.asks.map((_, idx) => ({
                                  level: `A${idx + 1}`,
                                  type: 'ask',
                                })),
                              ].map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.type === 'bid' ? '#10b981' : '#ef4444'}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Detaylı Liste */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Alış Emirleri (Bid) */}
                        <div>
                          <h3 className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-600"></div>
                            Alış Emirleri
                          </h3>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {marketDepth.bids.length > 0 ? (
                              marketDepth.bids.map((bid, index) => (
                                <div key={index} className="flex items-center justify-between text-xs p-1.5 bg-green-50 dark:bg-green-900/20 rounded border-l-2 border-green-500">
                                  <div className="flex flex-col">
                                    <span className="text-gray-700 dark:text-gray-300 font-semibold text-xs">${parseFloat(bid.price).toFixed(2)}</span>
                                    <span className="text-gray-500 dark:text-gray-500 text-xs">{parseInt(bid.size).toLocaleString()}</span>
                                  </div>
                                  <span className="text-gray-400 dark:text-gray-500 text-xs">#{index + 1}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">Alış emri bulunmuyor</p>
                            )}
                          </div>
                        </div>
                        {/* Satış Emirleri (Ask) */}
                        <div>
                          <h3 className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-600"></div>
                            Satış Emirleri
                          </h3>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {marketDepth.asks.length > 0 ? (
                              marketDepth.asks.map((ask, index) => (
                                <div key={index} className="flex items-center justify-between text-xs p-1.5 bg-red-50 dark:bg-red-900/20 rounded border-l-2 border-red-500">
                                  <div className="flex flex-col">
                                    <span className="text-gray-700 dark:text-gray-300 font-semibold text-xs">${parseFloat(ask.price).toFixed(2)}</span>
                                    <span className="text-gray-500 dark:text-gray-500 text-xs">{parseInt(ask.size).toLocaleString()}</span>
                                  </div>
                                  <span className="text-gray-400 dark:text-gray-500 text-xs">#{index + 1}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">Satış emri bulunmuyor</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <BarChart3 className="w-10 h-10 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-gray-300 text-xs font-semibold mb-1">Derinlik verisi şu anda mevcut değil</p>
                      <p className="text-gray-500 dark:text-gray-500 text-xs">Piyasa saatleri dışında veya bu sembol için veri bulunamadı</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Yukarıdan bir sembol seçin</p>
                </div>
              )}
            </div>
          </div>

          {/* Popüler Hisse Senetleri */}
          <div key="popular" className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                {stockFilter === "all" ? "Popüler Hisse Senetleri" : 
                 stockFilter === "gainers" ? "En Çok Yükselenler" :
                 stockFilter === "losers" ? "En Çok Düşenler" : "En Yüksek Hacim"}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-300">{filteredStocks.length} hisse</span>
                <div className="drag-handle cursor-move p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="space-y-2">
              {filteredStocks.length > 0 ? (
                filteredStocks.slice(0, 8).map((stock, index) => (
                  <div
                    key={stock.symbol}
                    onClick={async () => {
                      setSelectedSymbolDetail({
                        symbol: stock.symbol,
                        name: stock.name,
                        type: 'stock',
                      });
                      setSymbolDetailModalOpen(true);
                      setSymbolDetailChartPeriod('1W');
                      await fetchSymbolDetail(stock.symbol, 'stock', '1W');
                    }}
                    className="group flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all border border-gray-200/50 dark:border-gray-600/50 hover:border-primary-300/50 dark:hover:border-primary-500/50"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {stock.symbol[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{stock.symbol}</p>
                          {watchlist.includes(stock.symbol) && (
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          )}
                        </div>
                        {stock.price !== undefined && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            ${stock.price.toFixed(2)}
                            {stock.changePercent !== undefined && (
                              <span className={`ml-2 ${stock.changePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Hisse senedi bulunamadı</p>
                </div>
              )}
              </div>
            </div>
          </div>

          {/* Emir Listesi */}
          <div key="orders" className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Activity className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                Emir Listesi
              </h2>
              <div className="drag-handle cursor-move p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
            {orders && orders.length > 0 ? (
              <div className="space-y-2">
                {orders
                  .filter((order: any) => order.asset_class === 'us_equity')
                  .slice(0, 10)
                  .map((order: any, index: number) => {
                    const isBuy = order.side === 'buy';
                    const isLimitOrder = order.type === 'limit';
                    const isFilled = order.status === 'filled';
                    const isPartiallyFilled = order.status === 'partially_filled';
                    const isPending = ['pending_new', 'accepted', 'new', 'pending_cancel', 'pending_replace'].includes(order.status);
                    const isNotFilled = !isFilled && (isPending || isPartiallyFilled);
                    
                    // Piyasa durumunu kontrol et
                    const marketInfo = getMarketHoursInfo();
                    const isMarketOpen = marketInfo.currentSession !== 'closed';
                    
                    // Limit emirler için özel renklendirme
                    let statusColor = '';
                    if (isLimitOrder) {
                      if (isFilled) {
                        // Gerçekleşirse yeşil
                        statusColor = 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
                      } else if (isNotFilled) {
                        // Gerçekleşmezse ve piyasa kapalıysa turuncu, açıksa kırmızı
                        statusColor = isMarketOpen 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
                      } else {
                        // Diğer durumlar için varsayılan
                        statusColor = 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
                      }
                    } else {
                      // Market emirler için mevcut renklendirme
                      const statusColors: Record<string, string> = {
                        'filled': 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
                        'partially_filled': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
                        'pending_new': 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                        'accepted': 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                        'new': 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                        'canceled': 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
                        'rejected': 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
                      };
                      statusColor = statusColors[order.status] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
                    }
                    
                    const statusText: Record<string, string> = {
                      'filled': 'Tamamlandı',
                      'partially_filled': 'Kısmen',
                      'pending_new': 'Beklemede',
                      'accepted': 'Kabul Edildi',
                      'new': 'Yeni',
                      'canceled': 'İptal',
                      'rejected': 'Reddedildi',
                    };
                    return (
                      <div
                        key={order.id || index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isBuy
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          }`}>
                            {isBuy ? (
                              <TrendingUp className="w-5 h-5" />
                            ) : (
                              <TrendingDown className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                {order.symbol}
                              </p>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
                                {statusText[order.status] || order.status}
                                {isLimitOrder && isNotFilled && !isMarketOpen && (
                                  <span className="ml-1">⏰</span>
                                )}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {isBuy ? 'Alım' : 'Satım'} • {parseFloat(order.qty || order.filled_qty || '0').toFixed(2)} adet • ${parseFloat(order.limit_price || order.filled_avg_price || '0').toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0 flex flex-col items-end gap-2">
                          <p className={`font-bold text-sm ${
                            isBuy
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            ${(parseFloat(order.qty || order.filled_qty || '0') * parseFloat(order.limit_price || order.filled_avg_price || '0')).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </p>
                          {order.created_at && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(order.created_at).toLocaleDateString('tr-TR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                          {/* İptal butonu - Limit emirler ve gerçekleşmeyen bekleyen emirler için */}
                          {((isLimitOrder && !isFilled) || (isNotFilled && !isLimitOrder)) && order.status !== 'canceled' && order.status !== 'rejected' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (order.id) {
                                  handleCancelOrder(order.id);
                                }
                              }}
                              disabled={cancellingOrderId === order.id}
                              className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                            >
                              {cancellingOrderId === order.id ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span>İptal ediliyor...</span>
                                </>
                              ) : (
                                <>
                                  <X className="w-3 h-3" />
                                  <span>İptal Et</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 text-sm">Henüz emir bulunmuyor</p>
              </div>
            )}
            </div>
          </div>

          {/* Market Analizi */}
          <div key="market" className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                Market Analizi
              </h2>
              <div className="drag-handle cursor-move p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto min-h-0">
              {/* En Çok Yükselenler */}
              <div>
                <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  En Çok Yükselenler
                </h3>
                <div className="space-y-1.5">
                  {gainers.length > 0 ? (
                    gainers.map((stock: any, index: number) => (
                      <div key={stock.symbol || index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{stock.symbol}</span>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <span className="text-sm font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                            +{stock.changePercent?.toFixed(2) || '0.00'}%
                          </span>
                          <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            ${stock.price?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">Veri yok</p>
                  )}
                </div>
              </div>

              {/* En Çok Düşenler */}
              <div>
                <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  En Çok Düşenler
                </h3>
                <div className="space-y-1.5">
                  {losers.length > 0 ? (
                    losers.map((stock: any, index: number) => (
                      <div key={stock.symbol || index} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{stock.symbol}</span>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <span className="text-sm font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                            {stock.changePercent?.toFixed(2) || '0.00'}%
                          </span>
                          <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            ${stock.price?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">Veri yok</p>
                  )}
                </div>
              </div>

              {/* Boğa/Ayı Sezonu Bilgisi */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Piyasa Durumu
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">Boğa Sezonu</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Fiyatlar yükseliyor, iyimserlik hakim</div>
                  </div>
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">Ayı Sezonu</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Fiyatlar düşüyor, kötümserlik hakim</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Boğa/Ayı Sezonu Bilgi Kartları */}
          <div key="bull-bear" className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                Piyasa Sezonları
              </h2>
              <div className="drag-handle cursor-move p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto min-h-0">
              {bullBearLoading ? (
                <div className="text-center py-6">
                  <Loader2 className="w-6 h-6 text-primary-600 dark:text-primary-400 mx-auto mb-2 animate-spin" />
                  <p className="text-gray-600 dark:text-gray-300 text-xs">Analiz yükleniyor...</p>
                </div>
              ) : bullBearData ? (
                <>
                  {/* Mevcut Piyasa Durumu */}
                  <div className={`p-3 rounded-lg border-2 ${
                    bullBearData.marketType === 'bull'
                      ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700'
                      : bullBearData.marketType === 'bear'
                      ? 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700'
                      : 'bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {bullBearData.marketType === 'bull' ? (
                          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : bullBearData.marketType === 'bear' ? (
                          <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                        ) : (
                          <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        )}
                        <h3 className={`text-sm font-bold ${
                          bullBearData.marketType === 'bull'
                            ? 'text-green-700 dark:text-green-400'
                            : bullBearData.marketType === 'bear'
                            ? 'text-red-700 dark:text-red-400'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {bullBearData.marketType === 'bull' ? 'Boğa Sezonu' : bullBearData.marketType === 'bear' ? 'Ayı Sezonu' : 'Nötr Piyasa'}
                        </h3>
                      </div>
                      <span className={`text-xs font-semibold ${
                        bullBearData.marketType === 'bull'
                          ? 'text-green-600 dark:text-green-400'
                          : bullBearData.marketType === 'bear'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {bullBearData.confidence}% güven
                      </span>
                    </div>
                    <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                      <p><strong>6 Aylık Değişim:</strong> {bullBearData.changePercent >= 0 ? '+' : ''}{bullBearData.changePercent.toFixed(2)}%</p>
                      <p><strong>3 Aylık Değişim:</strong> {bullBearData.threeMonthsChange >= 0 ? '+' : ''}{bullBearData.threeMonthsChange.toFixed(2)}%</p>
                      <p><strong>SPY Fiyatı:</strong> ${bullBearData.currentPrice.toFixed(2)}</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <strong>Veri Kaynağı:</strong> SPY (S&P 500 ETF) günlük fiyat verileri analiz edilerek hesaplanmıştır.
                      </p>
                    </div>
                  </div>

                  {/* Nasıl Hesaplanıyor? */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300">Nasıl Hesaplanıyor?</h3>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <p>• <strong>SPY (S&P 500 ETF)</strong> günlük fiyat verileri çekilir</p>
                      <p>• Son <strong>6 aylık</strong> ve <strong>3 aylık</strong> performans analiz edilir</p>
                      <p>• <strong>Boğa:</strong> 6 ayda %20+ yükseliş veya 3 ayda %10+ yükseliş</p>
                      <p>• <strong>Ayı:</strong> 6 ayda %20+ düşüş veya 3 ayda %10+ düşüş</p>
                      <p>• Diğer durumlarda <strong>Nötr Piyasa</strong> olarak işaretlenir</p>
                    </div>
                  </div>

                  {/* Boğa Sezonu Bilgisi */}
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border-2 border-green-200 dark:border-green-700">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <h3 className="text-sm font-bold text-green-700 dark:text-green-400">Boğa Sezonu (Bull Market)</h3>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                      Piyasaların yükseldiği, yatırımcıların iyimser olduğu dönem. Genellikle ekonomik büyüme ve düşük işsizlik ile birlikte görülür.
                    </p>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>Özellikler:</strong> Fiyatlar %20+ yükselir, hacim artar, yatırımcı güveni yüksektir.
                    </div>
                  </div>

                  {/* Ayı Sezonu Bilgisi */}
                  <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 rounded-xl border-2 border-red-200 dark:border-red-700">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <h3 className="text-sm font-bold text-red-700 dark:text-red-400">Ayı Sezonu (Bear Market)</h3>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                      Piyasaların düştüğü, yatırımcıların kötümser olduğu dönem. Genellikle ekonomik durgunluk ve yüksek işsizlik ile birlikte görülür.
                    </p>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>Özellikler:</strong> Fiyatlar %20+ düşer, hacim azalır, yatırımcı güveni düşüktür.
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Veri yüklenemedi</p>
                </div>
              )}
            </div>
          </div>

          {/* Aracı Kurum Dağılımı */}
          <div key="broker" className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                Aracı Kurum Dağılımı
              </h2>
              <div className="drag-handle cursor-move p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="space-y-3">
                {/* Kullanıcının işlemlerinden analiz */}
                {(() => {
                  // Örnek aracı kurum dağılımı (genel piyasa verileri)
                  // Not: Alpaca API'den direkt broker dağılımı verisi gelmiyor
                  // Bu genel piyasa istatistiklerine dayalı örnek veridir
                  const brokerDistribution = [
                    { name: 'Interactive Brokers', percentage: 28, color: 'bg-blue-500' },
                    { name: 'Charles Schwab', percentage: 22, color: 'bg-green-500' },
                    { name: 'Fidelity', percentage: 18, color: 'bg-purple-500' },
                    { name: 'E*TRADE', percentage: 15, color: 'bg-orange-500' },
                    { name: 'TD Ameritrade', percentage: 12, color: 'bg-cyan-500' },
                    { name: 'Diğer', percentage: 5, color: 'bg-gray-500' },
                  ];
                  
                  return brokerDistribution.map((broker, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{broker.name}</span>
                        <span className="text-gray-600 dark:text-gray-400">{broker.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`${broker.color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${broker.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  ABD borsalarında işlem hacminin aracı kurumlara göre tahmini dağılımı
                </p>
              </div>
            </div>
          </div>

          {/* Takas Analizi */}
          <div key="settlement" className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                Takas Analizi
              </h2>
              <div className="drag-handle cursor-move p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto min-h-0">
              {settlementLoading ? (
                <div className="text-center py-6">
                  <Loader2 className="w-6 h-6 text-primary-600 dark:text-primary-400 mx-auto mb-2 animate-spin" />
                  <p className="text-gray-600 dark:text-gray-300 text-xs">Yükleniyor...</p>
                </div>
              ) : settlementData ? (
                <>
                  {/* Takas Nedir? - Açıklama */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-xs font-bold text-blue-700 dark:text-blue-400">Takas Nedir?</h3>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                      <strong>Takas (Settlement)</strong>, bir hisse senedi alım-satım işleminde paranın ve hissenin gerçekten el değiştirdiği tarihtir.
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                      ABD borsalarında <strong>T+2</strong> sistemi kullanılır: İşlem gününden <strong>2 iş günü sonra</strong> takas gerçekleşir.
                    </p>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                      <strong>Örnek:</strong> Pazartesi hisse aldıysanız, Çarşamba günü para çekilir ve hisse hesabınıza geçer.
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      <strong>Bugün:</strong> {settlementData.currentDate}
                      {settlementData.isTradingDay && settlementData.isTradingHours && (
                        <span className="ml-2 text-green-600 dark:text-green-400">● Piyasa Açık</span>
                      )}
                    </div>
                  </div>

                  {/* Takas Takvimi */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Yaklaşan Takas Tarihleri</h4>
                    {settlementData.settlements.map((item: any, index: number) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                          item.status === 'active'
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                            : item.status === 'pending'
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                            : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{item.tradeDate}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-500">Takas: {item.settlementDate}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            item.status === 'active'
                              ? 'bg-green-500 text-white'
                              : item.status === 'pending'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-gray-500 text-white'
                          }`}
                        >
                          {item.status === 'active' ? 'Acil' : item.status === 'pending' ? 'Beklemede' : 'Planlı'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* En Çok Alım Yapanlar */}
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">En Çok Alım Yapanlar</h4>
                    <div className="space-y-2">
                      {[
                        { name: 'Kurumsal Yatırımcılar', percentage: 65, icon: '🏢', color: 'bg-blue-500' },
                        { name: 'Bireysel Yatırımcılar', percentage: 25, icon: '👤', color: 'bg-green-500' },
                        { name: 'Hedge Fonlar', percentage: 7, icon: '📊', color: 'bg-purple-500' },
                        { name: 'Emeklilik Fonları', percentage: 3, icon: '💰', color: 'bg-orange-500' },
                      ].map((item, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">{item.icon}</span>
                              <span className="font-semibold text-gray-700 dark:text-gray-300">{item.name}</span>
                            </div>
                            <span className="text-gray-600 dark:text-gray-400">{item.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                              className={`${item.color} h-1.5 rounded-full transition-all duration-500`}
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                      ABD borsalarında toplam alım hacminin yatırımcı kategorilerine göre dağılımı
                    </p>
                  </div>

                  {/* Takas İstatistikleri */}
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                        <div className="font-bold text-gray-900 dark:text-gray-100">T+0</div>
                        <div className="text-gray-600 dark:text-gray-400">İşlem Günü</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                        <div className="font-bold text-gray-900 dark:text-gray-100">T+2</div>
                        <div className="text-gray-600 dark:text-gray-400">Takas Günü</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Veri yüklenemedi</p>
                </div>
              )}
            </div>
          </div>

          {/* Pozisyon Performansı Widget */}
      {performanceData.length > 0 && (
            <div key="performance" className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 h-full flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  Pozisyon Performansı
                </h2>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Kazanç</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Kayıp</span>
                  </div>
                  <div className="drag-handle cursor-move p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                    <XAxis 
                      dataKey="symbol" 
                      stroke="#6b7280"
                      fontSize={11}
                      tick={{ fill: '#6b7280' }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={11}
                      tick={{ fill: '#6b7280' }}
                      tickFormatter={(value) => `${value.toFixed(1)}%`}
                      width={50}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        padding: '8px 12px',
                      }}
                      formatter={(value: number) => {
                        const entry = performanceData.find(d => d.unrealizedPLPercent === value);
                        return `${value >= 0 ? '+' : ''}${value.toFixed(2)}% ($${entry?.unrealizedPL?.toFixed(2) || '0.00'})`;
                      }}
                      labelFormatter={(label) => `Sembol: ${label}`}
                    />
                    <Bar 
                      dataKey="unrealizedPLPercent" 
                      radius={[6, 6, 0, 0]}
                      animationDuration={600}
                    >
                      {performanceData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.unrealizedPLPercent >= 0 ? '#10b981' : '#ef4444'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </GridLayout>

      {/* Performans Grafiği - Modern (Eski - Kaldırıldı) */}
      {false && performanceData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden rounded-3xl backdrop-blur-xl p-8 border border-white/20"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
            boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.15)',
          }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accent-400/5 to-transparent rounded-full blur-3xl"></div>
          <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              Pozisyon Performansı
            </h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-700 dark:text-gray-300">Kazanç</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 dark:bg-red-400"></div>
                <span className="text-gray-700 dark:text-gray-300">Kayıp</span>
              </div>
            </div>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="symbol" 
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: number) => {
                    const entry = performanceData.find(d => d.unrealizedPLPercent === value);
                    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}% ($${entry?.unrealizedPL?.toFixed(2) || '0.00'})`;
                  }}
                  labelFormatter={(label) => `Sembol: ${label}`}
                />
                <Bar 
                  dataKey="unrealizedPLPercent" 
                  radius={[8, 8, 0, 0]}
                  animationDuration={800}
                >
                  {performanceData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.unrealizedPLPercent >= 0 ? '#10b981' : '#ef4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 15 Dakikalık Fiyat Grafiği */}
          {stockChartData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 relative overflow-hidden rounded-3xl backdrop-blur-xl p-8 border border-white/20"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.15)',
              }}
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-400/5 to-transparent rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Activity className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    15 Dakikalık Fiyat Grafiği
                  </h2>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-green-700 dark:text-green-300">Canlı</span>
                  </div>
                </div>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="time"
                        stroke="#6b7280"
                        fontSize={11}
                        tick={{ fill: '#6b7280' }}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        yAxisId="left"
                        stroke="#6b7280"
                        fontSize={11}
                        tick={{ fill: '#6b7280' }}
                        tickFormatter={(value) => `$${value.toFixed(2)}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                        formatter={(value: number, name: string) => {
                          if (name === 'price') return [`$${value.toFixed(2)}`, 'Fiyat'];
                          if (name === 'volume') return [value.toLocaleString(), 'Hacim'];
                          return [`$${value.toFixed(2)}`, name];
                        }}
                      />
                      <Legend />
                      {(() => {
                        // Tüm zamanları birleştir ve her sembol için fiyat ekle
                        const allTimes = new Set<string>();
                        stockChartData.forEach(c => c.data.forEach((d: any) => allTimes.add(d.time)));
                        const mergedData = Array.from(allTimes).sort().map(time => {
                          const dataPoint: any = { time };
                          stockChartData.forEach(c => {
                            const point = c.data.find((d: any) => d.time === time);
                            dataPoint[c.symbol] = point ? point.price : null;
                          });
                          return dataPoint;
                        });

                        return stockChartData.map((chart, index) => (
                          <Line
                            key={chart.symbol}
                            yAxisId="left"
                            type="monotone"
                            dataKey={chart.symbol}
                            data={mergedData}
                            name={chart.symbol}
                            stroke={index === 0 ? '#3b82f6' : index === 1 ? '#10b981' : index === 2 ? '#f59e0b' : index === 3 ? '#ef4444' : '#8b5cf6'}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                            connectNulls
                          />
                        ));
                      })()}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

            {/* Özet İstatistikler - Modern */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200/50">
              {(() => {
                const totalPL = performanceData.reduce((sum, entry) => sum + (entry.unrealizedPL || 0), 0);
                const totalPLPercent = performanceData.reduce((sum, entry) => sum + entry.unrealizedPLPercent, 0) / performanceData.length;
                const winners = performanceData.filter(e => e.unrealizedPLPercent >= 0).length;
                const losers = performanceData.filter(e => e.unrealizedPLPercent < 0).length;
                
                return (
                  <>
                    <motion.div 
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="text-center p-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-600/50"
                      style={{
                        boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.08)',
                      }}
                    >
                      <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 font-medium">Toplam Kazanç/Kayıp</p>
                      <p className={`text-xl font-extrabold ${totalPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}
                      </p>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="text-center p-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-600/50"
                      style={{
                        boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.08)',
                      }}
                    >
                      <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 font-medium">Ortalama %</p>
                      <p className={`text-xl font-extrabold ${totalPLPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {totalPLPercent >= 0 ? '+' : ''}{totalPLPercent.toFixed(2)}%
                      </p>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="text-center p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-200/50 backdrop-blur-sm"
                      style={{
                        boxShadow: '0 4px 20px -4px rgba(16, 185, 129, 0.2)',
                      }}
                    >
                      <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 font-medium">Kazananlar</p>
                      <p className="text-xl font-extrabold text-green-600">{winners}</p>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="text-center p-4 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-2xl border border-red-200/50 backdrop-blur-sm"
                      style={{
                        boxShadow: '0 4px 20px -4px rgba(239, 68, 68, 0.2)',
                      }}
                    >
                      <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 font-medium">Kaybedenler</p>
                      <p className="text-xl font-extrabold text-red-600">{losers}</p>
                    </motion.div>
                  </>
                );
              })()}
            </div>
          </div>
        </motion.div>
      )}
    </div>
    );
  };

  // Filtrelenmiş kripto paralar
  const getFilteredCryptos = () => {
    let filtered = [...popularCryptos];
    
    switch (cryptoFilter) {
      case "gainers":
        filtered = filtered.filter(c => (c.changePercent || 0) > 0).sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0));
        break;
      case "losers":
        filtered = filtered.filter(c => (c.changePercent || 0) < 0).sort((a, b) => (a.changePercent || 0) - (b.changePercent || 0));
        break;
      case "volume":
        filtered = filtered.sort((a, b) => (b.volume || 0) - (a.volume || 0));
        break;
      default:
        filtered = filtered.sort((a, b) => Math.abs(b.changePercent || 0) - Math.abs(a.changePercent || 0));
    }
    
    return filtered;
  };

  // Kripto watchlist'e ekle/çıkar
  const toggleCryptoWatchlist = (symbol: string) => {
    setCryptoWatchlist(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  // Piyasa saatleri ve gündüz/gece durumu hesaplama (Alpaca'dan gelen verilerle)
  const getMarketHoursInfo = () => {
    const now = new Date();
    const hour = now.getHours();
    const isDaytime = hour >= 6 && hour < 18; // 06:00 - 18:00 arası gündüz
    
    // Pre-market, Regular ve After-market saatleri (ET)
    // Alpaca'dan gelen saatleri kullan, yoksa standart saatleri kullan
    const parseTimeToDecimal = (timeString: string) => {
      const [hours, minutes] = timeString.split(':').map(Number);
      return hours + (minutes / 60);
    };
    
    const PRE_MARKET_START_ET = marketHours?.preMarketStart 
      ? parseTimeToDecimal(marketHours.preMarketStart) 
      : 4; // 04:00 ET
    const PRE_MARKET_END_ET = marketHours?.preMarketEnd 
      ? parseTimeToDecimal(marketHours.preMarketEnd) 
      : 9.5; // 09:30 ET
    const REGULAR_MARKET_START_ET = marketHours?.regularMarketStart 
      ? parseTimeToDecimal(marketHours.regularMarketStart) 
      : 9.5; // 09:30 ET
    const REGULAR_MARKET_END_ET = marketHours?.regularMarketEnd 
      ? parseTimeToDecimal(marketHours.regularMarketEnd) 
      : 16; // 16:00 ET
    const AFTER_MARKET_START_ET = marketHours?.afterMarketStart 
      ? parseTimeToDecimal(marketHours.afterMarketStart) 
      : 16; // 16:00 ET
    const AFTER_MARKET_END_ET = marketHours?.afterMarketEnd 
      ? parseTimeToDecimal(marketHours.afterMarketEnd) 
      : 20; // 20:00 ET
    
    // ET saati hesapla
    const nowET = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const hourET = nowET.getHours() + (nowET.getMinutes() / 60);
    
    // Alpaca'dan gelen veriyi kullan
    let currentSession: 'pre-market' | 'regular' | 'after-market' | 'closed' = 'closed';
    let isMarketOpen = false;
    
    // Önce saat bazlı kontrol yap - Session belirleme için saat bazlı kontrol öncelikli
    if (hourET >= PRE_MARKET_START_ET && hourET < PRE_MARKET_END_ET) {
      currentSession = 'pre-market';
      isMarketOpen = true;
    } else if (hourET >= REGULAR_MARKET_START_ET && hourET < REGULAR_MARKET_END_ET) {
      currentSession = 'regular';
      isMarketOpen = true;
    } else if (hourET >= AFTER_MARKET_START_ET && hourET < AFTER_MARKET_END_ET) {
      currentSession = 'after-market';
      isMarketOpen = true;
    } else {
      currentSession = 'closed';
      isMarketOpen = false;
    }
    
    // Eğer marketClock varsa, API'den gelen is_open bilgisini kontrol et
    // Hafta sonu veya tatil günleri için API'ye güven
    const nextOpen = marketClock?.next_open ? new Date(marketClock.next_open) : null;
    const nextClose = marketClock?.next_close ? new Date(marketClock.next_close) : null;
    
    if (marketClock) {
      const apiIsOpen = marketClock.is_open || false;
      
      // Eğer saat bazlı kontrol bir session gösteriyor ama API kapalı diyorsa,
      // hafta sonu veya tatil günü olabilir - API'ye güven
      // ANCAK: Pre-Market, Regular ve After-Market saatlerinde session'ı saat bazlı belirle
      // is_open sadece genel piyasa durumu için, session belirleme için değil
      // Sadece saat bazlı kontrol kapalı diyorsa ve API de kapalı diyorsa, kapalı kabul et
      if (!apiIsOpen && currentSession === 'closed') {
        // Hem saat kontrolü hem API kapalı diyor - kapalı
        isMarketOpen = false;
      } else if (!apiIsOpen && currentSession !== 'closed') {
        // Saat bazlı kontrol bir session gösteriyor ama API kapalı diyor
        // Bu durumda session'ı koru (Pre-Market saatlerinde is_open false olabilir)
        // Ama genel piyasa durumu için isMarketOpen'ı false yapabiliriz
        // Aslında Pre-Market, Regular ve After-Market saatlerinde isMarketOpen true olmalı
        // Çünkü bu saatler içindeyiz
        isMarketOpen = true; // Saat bazlı kontrol öncelikli
      } else if (apiIsOpen && currentSession === 'closed') {
        // API açık diyor ama saat kontrolü kapalı - saat aralığına göre session belirle
        if (hourET >= PRE_MARKET_START_ET && hourET < PRE_MARKET_END_ET) {
          currentSession = 'pre-market';
        } else if (hourET >= REGULAR_MARKET_START_ET && hourET < REGULAR_MARKET_END_ET) {
          currentSession = 'regular';
        } else if (hourET >= AFTER_MARKET_START_ET && hourET < AFTER_MARKET_END_ET) {
          currentSession = 'after-market';
        }
        isMarketOpen = true;
      }
      // Eğer ikisi de aynı durumu gösteriyorsa, saat bazlı kontrolü kullan (zaten yukarıda yapıldı)
      
      // Zaman formatlama fonksiyonları
      const formatTimeET = (hour: number, minute: number = 0) => {
        const h = Math.floor(hour);
        const m = Math.floor((hour - h) * 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      };
      
      const formatTimeTR = (hourET: number, minute: number = 0) => {
        // ET'den TR'ye çevir (ET + 6-7 saat, yaz/kış saati değişikliği için yaklaşık)
        const trDate = new Date();
        trDate.setUTCHours(Math.floor(hourET), Math.floor((hourET - Math.floor(hourET)) * 60), 0, 0);
        // ET'den UTC'ye çevir (ET = UTC-5 veya UTC-4)
        const etOffset = -5; // Kış saati için (yaz saati -4)
        const utcHour = Math.floor(hourET) - etOffset;
        const utcMinute = Math.floor((hourET - Math.floor(hourET)) * 60);
        // UTC'den TR'ye çevir (TR = UTC+3)
        const trHour = (utcHour + 3) % 24;
        return `${trHour.toString().padStart(2, '0')}:${utcMinute.toString().padStart(2, '0')}`;
      };
      
      // Pre-market saatleri (Alpaca'dan gelen saatleri kullan)
      const preMarketStartET = marketHours?.preMarketStart || formatTimeET(PRE_MARKET_START_ET);
      const preMarketEndET = marketHours?.preMarketEnd || formatTimeET(PRE_MARKET_END_ET);
      
      // Regular market saatleri (Alpaca'dan gelen saatleri kullan)
      const regularMarketStartET = marketHours?.regularMarketStart || formatTimeET(REGULAR_MARKET_START_ET);
      const regularMarketEndET = marketHours?.regularMarketEnd || formatTimeET(REGULAR_MARKET_END_ET);
      
      // After-market saatleri (Alpaca'dan gelen saatleri kullan)
      const afterMarketStartET = marketHours?.afterMarketStart || formatTimeET(AFTER_MARKET_START_ET);
      const afterMarketEndET = marketHours?.afterMarketEnd || formatTimeET(AFTER_MARKET_END_ET);
      
      // TR saatlerini hesapla (ET'den TR'ye timezone dönüşümü - yaz/kış saati desteği ile)
      const convertETToTR = (etHour: number) => {
        const hour = Math.floor(etHour);
        const minute = Math.floor((etHour - hour) * 60);
        
        // Bugünün tarihini al
        const today = new Date();
        
        // ET timezone'da bugünün tarihini al
        const etTodayString = today.toLocaleString('en-US', { 
          timeZone: 'America/New_York',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        
        // ET tarihini parse et (MM/DD/YYYY formatında)
        const etDateParts = etTodayString.split('/');
        const etMonth = parseInt(etDateParts[0]) - 1; // JavaScript month 0-indexed
        const etDay = parseInt(etDateParts[1]);
        const etYear = parseInt(etDateParts[2]);
        
        // ET timezone'da belirtilen saat için bir Date oluştur
        // Daha basit ve doğru yöntem: ET offset'ini hesapla ve direkt çevir
        // ET = UTC-4 (yaz saati EDT) veya UTC-5 (kış saati EST)
        // TR = UTC+3
        // ET'den TR'ye: +7 saat (yaz) veya +8 saat (kış)
        
        // ET timezone'da belirtilen saat için bir Date oluştur
        const etDateString = `${etYear}-${String(etMonth + 1).padStart(2, '0')}-${String(etDay).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
        
        // ET timezone'da bir Date oluştur ve DST kontrolü yap
        const testDate = new Date(etDateString);
        const etTimeString = testDate.toLocaleString('en-US', { 
          timeZone: 'America/New_York',
          timeZoneName: 'short'
        });
        const isEDT = etTimeString.includes('EDT');
        const etOffsetHours = isEDT ? -4 : -5; // EDT = UTC-4, EST = UTC-5
        
        // ET'den TR'ye offset: TR offset - ET offset = 3 - (-4) = 7 (yaz) veya 3 - (-5) = 8 (kış)
        const trOffset = 3;
        const offsetDiff = trOffset - etOffsetHours; // 7 (yaz) veya 8 (kış)
        
        // ET saatine offset ekle
        const totalMinutes = hour * 60 + minute + (offsetDiff * 60);
        const trHourFinal = Math.floor(totalMinutes / 60) % 24;
        const trMinuteFinal = totalMinutes % 60;
        
        return `${String(trHourFinal).padStart(2, '0')}:${String(trMinuteFinal).padStart(2, '0')}`;
      };
      
      // TR saatlerini hesapla (Alpaca'dan gelen saatleri kullan veya hesapla)
      const convertTimeStringETToTR = (timeStringET: string) => {
        // Eğer Alpaca'dan saat string'i geliyorsa, onu kullan
        if (timeStringET && timeStringET.includes(':')) {
          const [hours, minutes] = timeStringET.split(':').map(Number);
          return convertETToTR(hours + (minutes / 60));
        }
        // Değilse decimal değeri kullan
        return convertETToTR(parseTimeToDecimal(timeStringET));
      };
      
      const preMarketStartTR = marketHours?.preMarketStart 
        ? convertTimeStringETToTR(marketHours.preMarketStart)
        : convertETToTR(PRE_MARKET_START_ET);
      const preMarketEndTR = marketHours?.preMarketEnd 
        ? convertTimeStringETToTR(marketHours.preMarketEnd)
        : convertETToTR(PRE_MARKET_END_ET);
      const regularMarketStartTR = marketHours?.regularMarketStart 
        ? convertTimeStringETToTR(marketHours.regularMarketStart)
        : convertETToTR(REGULAR_MARKET_START_ET);
      const regularMarketEndTR = marketHours?.regularMarketEnd 
        ? convertTimeStringETToTR(marketHours.regularMarketEnd)
        : convertETToTR(REGULAR_MARKET_END_ET);
      const afterMarketStartTR = marketHours?.afterMarketStart 
        ? convertTimeStringETToTR(marketHours.afterMarketStart)
        : convertETToTR(AFTER_MARKET_START_ET);
      const afterMarketEndTR = marketHours?.afterMarketEnd 
        ? convertTimeStringETToTR(marketHours.afterMarketEnd)
        : convertETToTR(AFTER_MARKET_END_ET);
      
      return {
        isDaytime,
        isMarketOpen,
        currentSession,
        currentTimeET: nowET.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/New_York' }),
        currentTimeTR: now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        // Pre-market
        preMarketStartET,
        preMarketEndET,
        preMarketStartTR,
        preMarketEndTR,
        // Regular market
        regularMarketStartET,
        regularMarketEndET,
        regularMarketStartTR,
        regularMarketEndTR,
        // After-market
        afterMarketStartET,
        afterMarketEndET,
        afterMarketStartTR,
        afterMarketEndTR,
        nextOpen: nextOpen ? nextOpen.toLocaleString('tr-TR', { 
          day: 'numeric', 
          month: 'short', 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: 'Europe/Istanbul'
        }) : null,
        nextClose: nextClose ? nextClose.toLocaleString('tr-TR', { 
          day: 'numeric', 
          month: 'short', 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: 'Europe/Istanbul'
        }) : null,
      };
    }
    
    // Fallback: Eğer Alpaca verisi yoksa eski hesaplamayı kullan
    if (!marketClock) {
    const marketOpenHour = 14; // 14:30 TR saati (yaklaşık)
    const marketCloseHour = 21; // 21:00 TR saati (yaklaşık)
      isMarketOpen = hour >= marketOpenHour && hour < marketCloseHour;
      
      // Fallback için session belirleme
      if (isMarketOpen) {
        if (hourET >= PRE_MARKET_START_ET && hourET < PRE_MARKET_END_ET) {
          currentSession = 'pre-market';
        } else if (hourET >= REGULAR_MARKET_START_ET && hourET < REGULAR_MARKET_END_ET) {
          currentSession = 'regular';
        } else if (hourET >= AFTER_MARKET_START_ET && hourET < AFTER_MARKET_END_ET) {
          currentSession = 'after-market';
        }
      }
    }
    
    return {
      isDaytime,
      isMarketOpen,
      currentSession: currentSession,
      currentTimeET: nowET.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/New_York' }),
      currentTimeTR: now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      preMarketStartET: '04:00',
      preMarketEndET: '09:30',
      preMarketStartTR: '10:00',
      preMarketEndTR: '15:30',
      regularMarketStartET: '09:30',
      regularMarketEndET: '16:00',
      regularMarketStartTR: '15:30',
      regularMarketEndTR: '22:00',
      afterMarketStartET: '16:00',
      afterMarketEndET: '20:00',
      afterMarketStartTR: '22:00',
      afterMarketEndTR: '02:00',
      nextOpen: null,
      nextClose: null,
    };
  };


  // Özel Ay ve Yıldız İkonu Komponenti
  const MoonWithStarsIcon = ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 100 100"
      className={className || "w-5 h-5"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Yıldızlar */}
      <path
        d="M20 25 L22 30 L27 30 L23 33 L25 38 L20 35 L15 38 L17 33 L13 30 L18 30 Z"
        fill="#60a5fa"
        stroke="#3b82f6"
        strokeWidth="1"
      />
      <path
        d="M80 70 L81 73 L84 73 L82 75 L83 78 L80 76 L77 78 L78 75 L76 73 L79 73 Z"
        fill="#60a5fa"
        stroke="#3b82f6"
        strokeWidth="1"
      />
      {/* Plus işaretleri */}
      <path
        d="M15 20 L15 18 L17 18 L17 20 L19 20 L19 22 L17 22 L17 24 L15 24 L15 22 L13 22 L13 20 Z"
        fill="#1e293b"
        stroke="#0f172a"
        strokeWidth="0.5"
      />
      <path
        d="M85 75 L85 73 L87 73 L87 75 L89 75 L89 77 L87 77 L87 79 L85 79 L85 77 L83 77 L83 75 Z"
        fill="#1e293b"
        stroke="#0f172a"
        strokeWidth="0.5"
      />
      {/* Ay */}
      <circle
        cx="50"
        cy="50"
        r="25"
        fill="#e2e8f0"
        stroke="#1e293b"
        strokeWidth="3"
      />
      {/* Ay kraterleri */}
      <circle cx="45" cy="45" r="4" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5" />
      <circle cx="55" cy="50" r="3" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5" />
      <circle cx="50" cy="58" r="3.5" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5" />
      <circle cx="42" cy="55" r="2" fill="#1e293b" />
      <circle cx="58" cy="45" r="2" fill="#1e293b" />
      <circle cx="48" cy="52" r="1.5" fill="#1e293b" />
      <circle cx="52" cy="48" r="1.5" fill="#1e293b" />
      <circle cx="45" cy="50" r="1.5" fill="#1e293b" />
      <circle cx="55" cy="55" r="1.5" fill="#1e293b" />
    </svg>
  );

  // Özel Güneş İkonu Komponenti
  const SunIcon = ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 100 100"
      className={className || "w-5 h-5"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Güneş merkezi */}
      <circle cx="50" cy="50" r="20" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      {/* Güneş ışınları */}
      <line x1="50" y1="10" x2="50" y2="25" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="75" x2="50" y2="90" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <line x1="10" y1="50" x2="25" y2="50" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <line x1="75" y1="50" x2="90" y2="50" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <line x1="20" y1="20" x2="30" y2="30" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <line x1="70" y1="70" x2="80" y2="80" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <line x1="80" y1="20" x2="70" y2="30" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <line x1="30" y1="70" x2="20" y2="80" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );

  // Kripto ekranı render fonksiyonu
  const renderKriptoScreen = () => {
    const filteredCryptos = getFilteredCryptos();
    const cryptoGainers = popularCryptos.filter(c => (c.changePercent || 0) > 0).sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0)).slice(0, 5);
    const cryptoLosers = popularCryptos.filter(c => (c.changePercent || 0) < 0).sort((a, b) => (a.changePercent || 0) - (b.changePercent || 0)).slice(0, 5);
    
    // Kripto performans verisi
    const cryptoPerformanceData = cryptoPositions
      .filter((p: any) => parseFloat(p.qty || '0') > 0)
      .map((pos: any) => {
        const marketValue = parseFloat(pos.market_value || '0');
        const costBasis = parseFloat(pos.cost_basis || '0');
        const unrealizedPL = parseFloat(pos.unrealized_pl || '0');
        const unrealizedPLPercent = costBasis > 0 ? ((unrealizedPL / costBasis) * 100) : 0;
        return {
          symbol: pos.symbol,
          unrealizedPL: unrealizedPL,
          unrealizedPLPercent: unrealizedPLPercent,
          qty: parseFloat(pos.qty || '0'),
        };
      })
      .sort((a, b) => Math.abs(b.unrealizedPLPercent) - Math.abs(a.unrealizedPLPercent));
    
    return (
      <div className="space-y-6">
        {/* Header ve Arama - Modern */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-gray-900/95 shadow-2xl p-8 border border-white/20 dark:border-gray-800/50"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
            boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)',
          }}
          ref={kriptoHeaderRef}
        >
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-orange-500/5 to-red-500/5 dark:from-yellow-500/10 dark:via-orange-500/10 dark:to-red-500/10 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-400/10 to-transparent dark:from-yellow-400/20 dark:to-transparent rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 flex items-center justify-center shadow-2xl"
                    style={{
                      boxShadow: '0 10px 40px -10px rgba(251, 191, 36, 0.5)',
                    }}
                  >
                    <Coins className="w-8 h-8 text-white" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
                  </motion.div>
                  <div>
                    <h1 className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent">
                      Kripto
                    </h1>
                    <p className="text-gray-800 dark:text-gray-100 text-xl font-bold">Kripto paralar alın, satın ve portföyünüzü yönetin</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg backdrop-blur-sm"
                    style={{
                      boxShadow: '0 8px 20px -8px rgba(34, 197, 94, 0.4)',
                    }}
                  >
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-sm"></div>
                    <span className="text-sm font-bold text-white">Canlı Piyasa</span>
                  </motion.div>
                  <div className="text-right px-4 py-2 bg-gray-50/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                    <div className="text-xs text-gray-600 dark:text-gray-300 font-medium mb-1">Son Güncelleme</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-xl backdrop-blur-sm border border-yellow-200/50 dark:border-yellow-800/50">
                    <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <div className="text-left">
                      <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">Kripto Piyasası</div>
                      <div className="text-xs font-bold text-gray-900 dark:text-gray-100">
                        7/24 Açık
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arama Çubuğu - Modern */}
              <div className="relative mb-6">
                <div className="absolute left-5 top-1/2 transform -translate-y-1/2 z-10">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={cryptoSearchQuery}
                  onChange={(e) => handleCryptoSearch(e.target.value)}
                  placeholder="Kripto para ara (örn: BTC, ETH, SOL)..."
                  className="w-full pl-14 pr-12 py-5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl focus:ring-4 focus:ring-accent-500/20 dark:focus:ring-accent-400/20 focus:border-accent-500 dark:focus:border-accent-400 transition-all text-lg font-medium shadow-lg hover:shadow-xl text-gray-900 dark:text-gray-100"
                  style={{
                    boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.1)',
                  }}
                />
                {cryptoSearchLoading && (
                  <div className="absolute right-5 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-accent-500 border-t-transparent"></div>
                  </div>
                )}
              </div>

              {/* Filtre Butonları - Modern */}
              <div className="flex items-center gap-3 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCryptoFilter("all")}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all backdrop-blur-sm ${
                    cryptoFilter === "all"
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg"
                      : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 border border-gray-200/50 dark:border-gray-700/50 shadow-md"
                  }`}
                  style={cryptoFilter === "all" ? {
                    boxShadow: '0 8px 20px -8px rgba(251, 191, 36, 0.4)',
                  } : {}}
                >
                  <Filter className="w-4 h-4 inline mr-2" />
                  Tümü
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCryptoFilter("gainers")}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all backdrop-blur-sm ${
                    cryptoFilter === "gainers"
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                      : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 border border-gray-200/50 dark:border-gray-700/50 shadow-md"
                  }`}
                  style={cryptoFilter === "gainers" ? {
                    boxShadow: '0 8px 20px -8px rgba(34, 197, 94, 0.4)',
                  } : {}}
                >
                  <TrendingUpIcon className="w-4 h-4 inline mr-2" />
                  Yükselenler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCryptoFilter("losers")}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all backdrop-blur-sm ${
                    cryptoFilter === "losers"
                      ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg"
                      : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 border border-gray-200/50 dark:border-gray-700/50 shadow-md"
                  }`}
                  style={cryptoFilter === "losers" ? {
                    boxShadow: '0 8px 20px -8px rgba(239, 68, 68, 0.4)',
                  } : {}}
                >
                  <TrendingDownIcon className="w-4 h-4 inline mr-2" />
                  Düşenler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCryptoFilter("volume")}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all backdrop-blur-sm ${
                    cryptoFilter === "volume"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                      : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 border border-gray-200/50 dark:border-gray-700/50 shadow-md"
                  }`}
                  style={cryptoFilter === "volume" ? {
                    boxShadow: '0 8px 20px -8px rgba(59, 130, 246, 0.4)',
                  } : {}}
                >
                  <Volume2 className="w-4 h-4 inline mr-2" />
                  Hacim
                </motion.button>
              </div>

              {/* Arama Sonuçları */}
              {cryptoSearchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-gray-50 dark:bg-gray-800/90 rounded-xl border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto shadow-lg"
                >
                  {cryptoSearchResults.map((result) => (
                    <button
                      key={result.symbol}
                      onClick={async () => {
                        setSelectedSymbolDetail({
                          symbol: result.symbol,
                          name: result.name,
                          type: 'crypto',
                        });
                        setSymbolDetailModalOpen(true);
                        setSymbolDetailChartPeriod('1W');
                        // Sembol detaylarını çek
                        await fetchSymbolDetail(result.symbol, 'crypto', '1W');
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-white dark:hover:bg-gray-700/80 transition-colors flex items-center justify-between border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                    >
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-base">{result.symbol}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">{result.name}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>

        {/* Hızlı İşlemler ve Özet Kartlar - Modern */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Hızlı İşlemler */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 grid grid-cols-2 gap-6"
          >
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setSelectedCryptoSymbol(null);
              setCryptoModalType("buy");
              setCryptoModalOpen(true);
            }}
            className="relative overflow-hidden rounded-3xl p-8 text-white text-left group"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)',
              boxShadow: '0 20px 40px -12px rgba(245, 158, 11, 0.4)',
            }}
            onMouseEnter={(e) => {
              if (document.documentElement.classList.contains('dark')) {
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(245, 158, 11, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (document.documentElement.classList.contains('dark')) {
                e.currentTarget.style.boxShadow = '0 20px 40px -12px rgba(245, 158, 11, 0.4)';
              }
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </div>
              <h3 className="font-extrabold text-2xl mb-2">Kripto Al</h3>
              <p className="text-sm opacity-90 font-medium">Yeni yatırım yap</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              const hasPositions = cryptoPositions.some((p: any) => parseFloat(p.qty || '0') > 0);
              if (hasPositions) {
                const firstPosition = cryptoPositions.find((p: any) => parseFloat(p.qty || '0') > 0);
                setSelectedCryptoSymbol(firstPosition?.symbol || null);
              } else {
                setSelectedCryptoSymbol(null);
              }
              setCryptoModalType("sell");
              setCryptoModalOpen(true);
            }}
            className="relative overflow-hidden rounded-3xl p-8 text-white text-left group"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              boxShadow: '0 20px 40px -12px rgba(239, 68, 68, 0.4)',
            }}
            onMouseEnter={(e) => {
              if (document.documentElement.classList.contains('dark')) {
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(239, 68, 68, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (document.documentElement.classList.contains('dark')) {
                e.currentTarget.style.boxShadow = '0 20px 40px -12px rgba(239, 68, 68, 0.4)';
              }
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </div>
              <h3 className="font-extrabold text-2xl mb-2">Kripto Sat</h3>
              <p className="text-sm opacity-90 font-medium">Pozisyon kapat</p>
            </div>
          </motion.button>
        </motion.div>

        {/* Özet Kartlar - Modern */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative overflow-hidden rounded-2xl backdrop-blur-xl p-5 border border-green-200/50 dark:border-green-700/50"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
            boxShadow: '0 8px 32px -8px rgba(16, 185, 129, 0.2)',
          }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 dark:bg-green-900/50 flex items-center justify-center">
                <TrendingUpIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">En Çok Yükselen</span>
            </div>
            {cryptoGainers.length > 0 ? (
              <div className="space-y-2">
                {cryptoGainers.slice(0, 3).map((crypto) => (
                  <div key={crypto.symbol} className="flex items-center justify-between p-2 rounded-lg bg-white/40 dark:bg-gray-700/40 backdrop-blur-sm">
                    <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">{crypto.symbol.replace('USD', '')}</span>
                    <span className="text-green-600 dark:text-green-400 font-extrabold text-sm">+{crypto.changePercent?.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-600 dark:text-gray-300">Veri yok</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl backdrop-blur-xl p-5 border border-red-200/50 dark:border-red-800/50"
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
            boxShadow: '0 8px 32px -8px rgba(239, 68, 68, 0.2)',
          }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 dark:bg-red-900/50 flex items-center justify-center">
                <TrendingDownIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">En Çok Düşen</span>
            </div>
            {cryptoLosers.length > 0 ? (
              <div className="space-y-2">
                {cryptoLosers.slice(0, 3).map((crypto) => (
                  <div key={crypto.symbol} className="flex items-center justify-between p-2 rounded-lg bg-white/40 dark:bg-gray-700/40 backdrop-blur-sm">
                    <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">{crypto.symbol.replace('USD', '')}</span>
                    <span className="text-red-600 dark:text-red-400 font-extrabold text-sm">{crypto.changePercent?.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-600 dark:text-gray-300">Veri yok</p>
            )}
          </div>
        </motion.div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Popüler Kripto Paralar - Modern */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 relative overflow-hidden rounded-3xl backdrop-blur-xl p-8 border border-white/20 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/95"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
              boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.15)',
            }}
            ref={popularKriptoRef}
          >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-400/5 to-transparent dark:from-yellow-400/10 dark:to-transparent rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-accent-600 dark:text-accent-400" />
              {cryptoFilter === "all" ? "Popüler Kripto Paralar" : 
               cryptoFilter === "gainers" ? "En Çok Yükselenler" :
               cryptoFilter === "losers" ? "En Çok Düşenler" : "En Yüksek Hacim"}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">{filteredCryptos.length} kripto</span>
              <button className="text-sm text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-semibold flex items-center gap-1">
                Tümü
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto">
            {filteredCryptos.length > 0 ? (
              filteredCryptos.map((crypto, index) => (
                <motion.div
                  key={crypto.symbol}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.03 }}
                  onClick={() => {
                    setSelectedCryptoSymbol(crypto.symbol);
                    setCryptoModalType("buy");
                    setCryptoModalOpen(true);
                  }}
                  className="group flex items-center justify-between p-5 bg-white/60 backdrop-blur-sm rounded-2xl hover:bg-white/90 cursor-pointer transition-all border border-gray-200/50 hover:border-accent-300/50 hover:shadow-xl"
                  style={{
                    boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    <div className="relative">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-xl shadow-lg"
                        style={{
                          boxShadow: '0 8px 24px -8px rgba(251, 191, 36, 0.4)',
                        }}
                      >
                        {crypto.symbol.replace('USD', '')[0]}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
                      </motion.div>
                      {cryptoWatchlist.includes(crypto.symbol) && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg"
                          style={{
                            boxShadow: '0 4px 12px -4px rgba(251, 191, 36, 0.6)',
                          }}
                        >
                          <Star className="w-3.5 h-3.5 text-yellow-900 fill-yellow-900" />
                        </motion.div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-900 dark:text-gray-100 text-lg">{crypto.symbol.replace('USD', '')}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCryptoWatchlist(crypto.symbol);
                          }}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Star className={`w-4 h-4 ${cryptoWatchlist.includes(crypto.symbol) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{crypto.name}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {crypto.volume !== undefined && (
                          <div className="flex items-center gap-1">
                            <Volume2 className="w-3 h-3" />
                            <span>{(crypto.volume / 1000000).toFixed(1)}M</span>
                          </div>
                        )}
                        {crypto.high !== undefined && crypto.low !== undefined && (
                          <div className="flex items-center gap-1">
                            <span>Yük: ${crypto.high.toFixed(2)}</span>
                            <span className="text-gray-300">|</span>
                            <span>Düş: ${crypto.low.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    {crypto.price !== undefined ? (
                      <>
                        <p className="font-bold text-gray-900 dark:text-gray-100 text-xl mb-1">
                          ${crypto.price.toFixed(2)}
                        </p>
                        {crypto.changePercent !== undefined && (
                          <div className={`flex items-center justify-end gap-1 text-sm font-semibold mb-1 ${
                            crypto.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {crypto.changePercent >= 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            <span>
                              {crypto.changePercent >= 0 ? '+' : ''}{crypto.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        )}
                        {crypto.change !== undefined && (
                          <p className={`text-xs font-medium ${
                            crypto.change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {crypto.change >= 0 ? '+' : ''}${crypto.change.toFixed(2)}
                          </p>
                        )}
                        {crypto.previousClose !== undefined && (
                          <p className="text-xs text-gray-400 mt-1">
                            Önceki: ${crypto.previousClose.toFixed(2)}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="animate-pulse">
                        <div className="h-6 w-20 bg-gray-200 rounded"></div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <Coins className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Fiyatlar yükleniyor...</p>
              </div>
            )}
          </div>
          </div>
          </motion.div>

          {/* Kripto Pozisyonlar - Modern */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative overflow-hidden rounded-3xl backdrop-blur-xl p-8 border border-white/20 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/95"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
              boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.15)',
            }}
            ref={kriptoPositionsRef}
          >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/5 to-transparent dark:from-orange-400/10 dark:to-transparent rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Wallet className="w-7 h-7 text-accent-600 dark:text-accent-400" />
                Kripto Pozisyonlarım
              </h2>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full shadow-sm">
              <div className="w-2.5 h-2.5 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-green-700 dark:text-green-300">Canlı</span>
            </div>
            </div>

            {/* Toplam Özet - Modern */}
            {cryptoPositions.filter((p: any) => parseFloat(p.qty || '0') > 0).length > 0 && (
              <div className="mb-6 p-5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl border border-yellow-200/50 backdrop-blur-sm"
                style={{
                  boxShadow: '0 8px 32px -8px rgba(251, 191, 36, 0.2)',
                }}
              >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Toplam Portföy Değeri</span>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  ${cryptoPositions
                    .filter((p: any) => parseFloat(p.qty || '0') > 0)
                    .reduce((sum: number, pos: any) => sum + parseFloat(pos.market_value || '0'), 0)
                    .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Toplam Kazanç/Kayıp</span>
                {(() => {
                  const totalPL = cryptoPositions
                    .filter((p: any) => parseFloat(p.qty || '0') > 0)
                    .reduce((sum: number, pos: any) => sum + parseFloat(pos.unrealized_pl || '0'), 0);
                  return (
                    <div className={`flex items-center gap-1 font-bold text-lg ${
                      totalPL >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {totalPL >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span>
                        {totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {cryptoPositions.filter((p: any) => parseFloat(p.qty || '0') > 0).length > 0 ? (
              cryptoPositions
                .filter((p: any) => parseFloat(p.qty || '0') > 0)
                .slice(0, 8)
                .map((pos: any, index: number) => {
                  const marketValue = parseFloat(pos.market_value || '0');
                  const costBasis = parseFloat(pos.cost_basis || '0');
                  const unrealizedPL = parseFloat(pos.unrealized_pl || '0');
                  const unrealizedPLPercent = costBasis > 0 ? ((unrealizedPL / costBasis) * 100) : 0;
                  const currentPrice = parseFloat(pos.qty || '0') > 0 ? marketValue / parseFloat(pos.qty || '1') : 0;
                  const avgCost = parseFloat(pos.qty || '0') > 0 ? costBasis / parseFloat(pos.qty || '1') : 0;

                  return (
                    <motion.div
                      key={pos.symbol}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="group p-5 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:bg-white/90 hover:shadow-xl transition-all"
                      style={{
                        boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.08)',
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <motion.div 
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-lg shadow-lg"
                            style={{
                              boxShadow: '0 8px 24px -8px rgba(251, 191, 36, 0.4)',
                            }}
                          >
                            {pos.symbol.replace('USD', '')[0]}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
                          </motion.div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-gray-100 text-lg">{pos.symbol.replace('USD', '')}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{parseFloat(pos.qty || '0').toFixed(4)} adet</p>
                          </div>
                        </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedCryptoSymbol(pos.symbol);
                              setCryptoModalType("sell");
                              setCryptoModalOpen(true);
                            }}
                            className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-xl hover:shadow-lg transition-all"
                            style={{
                              boxShadow: '0 4px 12px -4px rgba(239, 68, 68, 0.4)',
                            }}
                          >
                            Sat
                          </motion.button>
                        </div>
                        <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Piyasa Değeri</span>
                          <span className="font-bold text-gray-900 dark:text-gray-100">
                            ${marketValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Güncel Fiyat</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            ${currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Ortalama Maliyet</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            ${avgCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Kazanç/Kayıp</span>
                            <div className={`flex items-center gap-1 font-bold ${
                              unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {unrealizedPL >= 0 ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              <span className="text-sm">
                                {unrealizedPL >= 0 ? '+' : ''}${unrealizedPL.toFixed(2)}
                              </span>
                              <span className="text-xs ml-1">
                                ({unrealizedPLPercent >= 0 ? '+' : ''}{unrealizedPLPercent.toFixed(2)}%)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
            ) : (
              <div className="text-center py-12">
                <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm mb-3 font-medium">Henüz kripto pozisyonunuz yok</p>
                <button
                  onClick={() => {
                    setCryptoModalType("buy");
                    setCryptoModalOpen(true);
                  }}
                  className="px-4 py-2 text-sm text-accent-600 hover:text-accent-700 font-semibold bg-accent-50 rounded-lg hover:bg-accent-100 transition-colors"
                >
                  İlk kripto yatırımınızı yapın →
                </button>
              </div>
            )}
            </div>
            </div>
            </motion.div>
          </div>

        {/* Kripto Performans Grafiği - Modern */}
        {cryptoPerformanceData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative overflow-hidden rounded-3xl backdrop-blur-xl p-8 border border-white/20"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
              boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/5 to-transparent rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-accent-600" />
                  Kripto Performansı
                </h2>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-gray-600">Kazanç</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-gray-600">Kayıp</span>
                    </div>
                  </div>
                </div>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cryptoPerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="symbol" 
                        stroke="#6b7280"
                        fontSize={12}
                        tick={{ fill: '#6b7280' }}
                        tickFormatter={(value) => value.replace('USD', '')}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        fontSize={12}
                        tick={{ fill: '#6b7280' }}
                        tickFormatter={(value) => `${value.toFixed(1)}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                        formatter={(value: number) => {
                          const entry = cryptoPerformanceData.find(d => d.unrealizedPLPercent === value);
                          return `${value >= 0 ? '+' : ''}${value.toFixed(2)}% ($${entry?.unrealizedPL?.toFixed(2) || '0.00'})`;
                        }}
                        labelFormatter={(label) => `Sembol: ${label.replace('USD', '')}`}
                      />
                      <Bar 
                        dataKey="unrealizedPLPercent" 
                        radius={[8, 8, 0, 0]}
                        animationDuration={800}
                      >
                        {cryptoPerformanceData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.unrealizedPLPercent >= 0 ? '#10b981' : '#ef4444'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* 15 Dakikalık Kripto Fiyat Grafiği */}
                {cryptoChartData.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 relative overflow-hidden rounded-3xl backdrop-blur-xl p-8 border border-white/20"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                      boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.15)',
                    }}
                  >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/5 to-transparent rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <Activity className="w-6 h-6 text-accent-600" />
                          15 Dakikalık Fiyat Grafiği
                        </h2>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-green-700 dark:text-green-300">Canlı</span>
                  </div>
                      </div>
                      <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="time"
                              stroke="#6b7280"
                              fontSize={11}
                              tick={{ fill: '#6b7280' }}
                              interval="preserveStartEnd"
                            />
                            <YAxis 
                              yAxisId="left"
                              stroke="#6b7280"
                              fontSize={11}
                              tick={{ fill: '#6b7280' }}
                              tickFormatter={(value) => `$${value.toFixed(2)}`}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                              }}
                              formatter={(value: number, name: string) => {
                                if (name === 'price') return [`$${value.toFixed(2)}`, 'Fiyat'];
                                if (name === 'volume') return [value.toLocaleString(), 'Hacim'];
                                return [`$${value.toFixed(2)}`, name];
                              }}
                            />
                            <Legend />
                            {(() => {
                              // Tüm zamanları birleştir ve her sembol için fiyat ekle
                              const allTimes = new Set<string>();
                              cryptoChartData.forEach(c => c.data.forEach((d: any) => allTimes.add(d.time)));
                              const mergedData = Array.from(allTimes).sort().map(time => {
                                const dataPoint: any = { time };
                                cryptoChartData.forEach(c => {
                                  const point = c.data.find((d: any) => d.time === time);
                                  dataPoint[c.symbol.replace('USD', '')] = point ? point.price : null;
                                });
                                return dataPoint;
                              });

                              return cryptoChartData.map((chart, index) => (
                                <Line
                                  key={chart.symbol}
                                  yAxisId="left"
                                  type="monotone"
                                  dataKey={chart.symbol.replace('USD', '')}
                                  data={mergedData}
                                  name={chart.symbol.replace('USD', '')}
                                  stroke={index === 0 ? '#f59e0b' : index === 1 ? '#3b82f6' : index === 2 ? '#10b981' : index === 3 ? '#ef4444' : '#8b5cf6'}
                                  strokeWidth={2}
                                  dot={false}
                                  activeDot={{ r: 4 }}
                                  connectNulls
                                />
                              ));
                            })()}
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Özet İstatistikler - Modern */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200/50">
                  {(() => {
                    const totalPL = cryptoPerformanceData.reduce((sum, entry) => sum + (entry.unrealizedPL || 0), 0);
                    const totalPLPercent = cryptoPerformanceData.reduce((sum, entry) => sum + entry.unrealizedPLPercent, 0) / cryptoPerformanceData.length;
                    const winners = cryptoPerformanceData.filter(e => e.unrealizedPLPercent >= 0).length;
                    const losers = cryptoPerformanceData.filter(e => e.unrealizedPLPercent < 0).length;
                    
                    return (
                      <>
                        <motion.div 
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="text-center p-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-600/50"
                          style={{
                            boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.08)',
                          }}
                        >
                          <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 font-medium">Toplam Kazanç/Kayıp</p>
                          <p className={`text-xl font-extrabold ${totalPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}
                          </p>
                        </motion.div>
                        <motion.div 
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="text-center p-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-600/50"
                          style={{
                            boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.08)',
                          }}
                        >
                          <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 font-medium">Ortalama %</p>
                          <p className={`text-xl font-extrabold ${totalPLPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {totalPLPercent >= 0 ? '+' : ''}{totalPLPercent.toFixed(2)}%
                          </p>
                        </motion.div>
                        <motion.div 
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="text-center p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-200/50 backdrop-blur-sm"
                          style={{
                            boxShadow: '0 4px 20px -4px rgba(16, 185, 129, 0.2)',
                          }}
                        >
                          <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 font-medium">Kazananlar</p>
                          <p className="text-xl font-extrabold text-green-600">{winners}</p>
                        </motion.div>
                        <motion.div 
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="text-center p-4 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-2xl border border-red-200/50 backdrop-blur-sm"
                          style={{
                            boxShadow: '0 4px 20px -4px rgba(239, 68, 68, 0.2)',
                          }}
                        >
                          <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 font-medium">Kaybedenler</p>
                          <p className="text-xl font-extrabold text-red-600">{losers}</p>
                        </motion.div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          )}
      </div>
    );
  };

  // Kart online durumunu güncelle
  const updateCardOnlineStatus = async (cardId: string, onlineEnabled: boolean) => {
    try {
      // Demo hesabı için direkt state güncelle
      const isDemoAccount = user?.email?.toLowerCase() === 'demo@datpay.com';
      if (isDemoAccount) {
        setMambuCards(prevCards => 
          prevCards.map(card => 
            card.id === cardId 
              ? { ...card, onlineEnabled }
              : card
          )
        );
        return;
      }

      const response = await fetch('/api/mambu/cards', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardId,
          onlineEnabled,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Kartları yeniden yükle
          if (user?.email) {
            const cardsResponse = await fetch(`/api/mambu/cards?email=${encodeURIComponent(user.email)}`);
            if (cardsResponse.ok) {
              const cardsData = await cardsResponse.json();
              if (cardsData.success && cardsData.cards) {
                setMambuCards(cardsData.cards);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Card update error:', error);
    }
  };

  // Kart görünürlüğünü toggle et
  const toggleCardVisibility = (cardId: string) => {
    setCardVisibility(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  // CardApplicationModal artık ayrı bir component dosyasında (components/CardApplicationModal.tsx)
  // CardApplicationTrackingModal artık ayrı bir component dosyasında (components/CardApplicationTrackingModal.tsx)

  // Opsiyon ekranı render fonksiyonu
  const renderOpsiyonScreen = () => {
    // Opsiyon performans verisi
    const optionsPerformanceData = optionsPositions
      .filter((p: any) => parseFloat(p.qty || '0') > 0)
      .map((pos: any) => {
        const marketValue = parseFloat(pos.market_value || '0');
        const costBasis = parseFloat(pos.cost_basis || '0');
        const unrealizedPL = parseFloat(pos.unrealized_pl || '0');
        const unrealizedPLPercent = costBasis > 0 ? ((unrealizedPL / costBasis) * 100) : 0;
        return {
          symbol: pos.symbol || pos.underlying_symbol || 'N/A',
          unrealizedPL: unrealizedPL,
          unrealizedPLPercent: unrealizedPLPercent,
          qty: parseFloat(pos.qty || '0'),
        };
      })
      .sort((a, b) => Math.abs(b.unrealizedPLPercent) - Math.abs(a.unrealizedPLPercent));

    return (
      <div className="space-y-6">
        {/* Header - Modern */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-gray-900/95 shadow-2xl p-8 border border-white/20 dark:border-gray-800/50"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
            boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)',
          }}
          ref={opsiyonHeaderRef}
        >
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-indigo-500/5 dark:from-purple-500/10 dark:via-blue-500/10 dark:to-indigo-500/10 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-transparent dark:from-purple-400/20 dark:to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 flex items-center justify-center shadow-2xl"
                  style={{
                    boxShadow: '0 10px 40px -10px rgba(139, 92, 246, 0.5)',
                  }}
                >
                  <FileText className="w-8 h-8 text-white" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
                </motion.div>
                <div>
                  <h1 className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent">
                    Opsiyon
                  </h1>
                  <p className="text-gray-700 dark:text-gray-200 text-xl font-bold">Opsiyon pozisyonlarınızı yönetin ve yeni işlemler yapın</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {(() => {
                  const marketInfo = getMarketHoursInfo();
                  return (
                    <>
                      <div className="text-right px-4 py-2 bg-gray-50/80 rounded-xl backdrop-blur-sm border border-gray-200/50">
                        <div className="text-xs text-gray-500 font-medium mb-1">Şu An (TR/ET)</div>
                        <div className="text-sm font-bold text-gray-800">
                          {marketInfo.currentTimeTR} / {marketInfo.currentTimeET}
                        </div>
                      </div>
                      {/* Pre-Market */}
                      <div 
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm border ${
                          marketInfo.currentSession === 'pre-market' 
                            ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 animate-blink' 
                            : 'bg-gray-50/80 dark:bg-gray-700/80 border-gray-200/50 dark:border-gray-600/50'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${
                          marketInfo.currentSession === 'pre-market' 
                            ? 'bg-purple-500 dark:bg-purple-400' 
                            : 'bg-purple-500 dark:bg-purple-400'
                        }`}></div>
                        <div className="text-left flex-1">
                          <div className="text-xs text-gray-500 font-medium">Pre-Market</div>
                          <div className="text-xs font-bold text-gray-800">
                            {marketInfo.preMarketStartET} - {marketInfo.preMarketEndET} ET
                          </div>
                          <div className="text-xs text-gray-600">
                            {marketInfo.preMarketStartTR} - {marketInfo.preMarketEndTR} TR
                          </div>
                        </div>
                      </div>
                      {/* Regular Market */}
                      <div 
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm border ${
                          marketInfo.currentSession === 'regular' 
                            ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 animate-blink' 
                            : 'bg-gray-50/80 dark:bg-gray-700/80 border-gray-200/50 dark:border-gray-600/50'
                        }`}
                      >
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <div className="text-left flex-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Regular Market</div>
                          <div className="text-xs font-bold text-gray-800 dark:text-gray-100">
                            {marketInfo.regularMarketStartET} - {marketInfo.regularMarketEndET} ET
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {marketInfo.regularMarketStartTR} - {marketInfo.regularMarketEndTR} TR
                          </div>
                        </div>
                      </div>
                      {/* After-Market */}
                      <div 
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm border ${
                          marketInfo.currentSession === 'after-market' 
                            ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 animate-blink' 
                            : 'bg-gray-50/80 dark:bg-gray-700/80 border-gray-200/50 dark:border-gray-600/50'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${
                          marketInfo.currentSession === 'after-market' 
                            ? 'bg-orange-500 dark:bg-orange-400' 
                            : 'bg-orange-500 dark:bg-orange-400'
                        }`}></div>
                        <div className="text-left flex-1">
                          <div className="text-xs text-gray-500 font-medium">After-Market</div>
                          <div className="text-xs font-bold text-gray-800">
                            {marketInfo.afterMarketStartET} - {marketInfo.afterMarketEndET} ET
                          </div>
                          <div className="text-xs text-gray-600">
                            {marketInfo.afterMarketStartTR} - {marketInfo.afterMarketEndTR} TR
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Hızlı İşlemler - Modern */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setSelectedOptionsSymbol(null);
              setOptionsModalType("buy");
              setOptionsModalOpen(true);
            }}
            className="relative overflow-hidden rounded-3xl p-8 text-white text-left group"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%)',
              boxShadow: '0 20px 40px -12px rgba(139, 92, 246, 0.4)',
            }}
            onMouseEnter={(e) => {
              if (document.documentElement.classList.contains('dark')) {
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(139, 92, 246, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (document.documentElement.classList.contains('dark')) {
                e.currentTarget.style.boxShadow = '0 20px 40px -12px rgba(139, 92, 246, 0.4)';
              }
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </div>
              <h3 className="font-extrabold text-2xl mb-2">Opsiyon Al</h3>
              <p className="text-sm opacity-90 font-medium">Yeni opsiyon pozisyonu aç</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              const hasPositions = optionsPositions.some((p: any) => parseFloat(p.qty || '0') > 0);
              if (hasPositions) {
                const firstPosition = optionsPositions.find((p: any) => parseFloat(p.qty || '0') > 0);
                setSelectedOptionsSymbol(firstPosition?.symbol || null);
              } else {
                setSelectedOptionsSymbol(null);
              }
              setOptionsModalType("sell");
              setOptionsModalOpen(true);
            }}
            className="relative overflow-hidden rounded-3xl p-8 text-white text-left group"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              boxShadow: '0 20px 40px -12px rgba(239, 68, 68, 0.4)',
            }}
            onMouseEnter={(e) => {
              if (document.documentElement.classList.contains('dark')) {
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(239, 68, 68, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (document.documentElement.classList.contains('dark')) {
                e.currentTarget.style.boxShadow = '0 20px 40px -12px rgba(239, 68, 68, 0.4)';
              }
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </div>
              <h3 className="font-extrabold text-2xl mb-2">Opsiyon Sat</h3>
              <p className="text-sm opacity-90 font-medium">Pozisyon kapat</p>
            </div>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Opsiyon Pozisyonlar - Modern */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 relative overflow-hidden rounded-3xl backdrop-blur-xl p-8 border border-white/20"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
              boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/5 to-transparent rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-accent-600" />
                  Opsiyon Pozisyonlarım
                </h2>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full shadow-sm">
              <div className="w-2.5 h-2.5 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-green-700 dark:text-green-300">Canlı</span>
            </div>
              </div>

              {/* Toplam Özet - Modern */}
              {optionsPositions.filter((p: any) => parseFloat(p.qty || '0') > 0).length > 0 && (
                <div className="mb-6 p-5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl border border-purple-200/50 backdrop-blur-sm"
                  style={{
                    boxShadow: '0 8px 32px -8px rgba(139, 92, 246, 0.2)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Toplam Portföy Değeri</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${optionsPositions
                        .filter((p: any) => parseFloat(p.qty || '0') > 0)
                        .reduce((sum: number, pos: any) => sum + parseFloat(pos.market_value || '0'), 0)
                        .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Toplam Kazanç/Kayıp</span>
                    {(() => {
                      const totalPL = optionsPositions
                        .filter((p: any) => parseFloat(p.qty || '0') > 0)
                        .reduce((sum: number, pos: any) => sum + parseFloat(pos.unrealized_pl || '0'), 0);
                      return (
                        <div className={`flex items-center gap-1 font-bold text-lg ${
                          totalPL >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {totalPL >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span>
                            {totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {optionsPositions.filter((p: any) => parseFloat(p.qty || '0') > 0).length > 0 ? (
                  optionsPositions
                    .filter((p: any) => parseFloat(p.qty || '0') > 0)
                    .map((pos: any) => {
                      const marketValue = parseFloat(pos.market_value || '0');
                      const costBasis = parseFloat(pos.cost_basis || '0');
                      const unrealizedPL = parseFloat(pos.unrealized_pl || '0');
                      const unrealizedPLPercent = costBasis > 0 ? ((unrealizedPL / costBasis) * 100) : 0;
                      return { ...pos, unrealizedPLPercent, unrealizedPL };
                    })
                    .sort((a, b) => {
                      // Önce kar/zarar yüzdesine göre sırala (en yüksek kar veya en düşük zarar önce)
                      if (Math.abs(b.unrealizedPLPercent) !== Math.abs(a.unrealizedPLPercent)) {
                        return Math.abs(b.unrealizedPLPercent) - Math.abs(a.unrealizedPLPercent);
                      }
                      // Eğer yüzde eşitse, mutlak kar/zarar miktarına göre sırala
                      return Math.abs(b.unrealizedPL) - Math.abs(a.unrealizedPL);
                    })
                    .slice(0, 8)
                    .map((pos: any, index: number) => {
                      const marketValue = parseFloat(pos.market_value || '0');
                      const costBasis = parseFloat(pos.cost_basis || '0');
                      const unrealizedPL = parseFloat(pos.unrealized_pl || '0');
                      const unrealizedPLPercent = costBasis > 0 ? ((unrealizedPL / costBasis) * 100) : 0;
                      const currentPrice = parseFloat(pos.qty || '0') > 0 ? marketValue / parseFloat(pos.qty || '1') : 0;
                      const avgCost = parseFloat(pos.qty || '0') > 0 ? costBasis / parseFloat(pos.qty || '1') : 0;
                      const symbol = pos.symbol || pos.underlying_symbol || 'N/A';

                      return (
                        <motion.div
                          key={pos.symbol || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.05 }}
                          className="group p-5 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:bg-white/90 hover:shadow-xl transition-all"
                          style={{
                            boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.08)',
                          }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <motion.div 
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg"
                                style={{
                                  boxShadow: '0 8px 24px -8px rgba(139, 92, 246, 0.4)',
                                }}
                              >
                                {symbol.substring(0, 2)}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
                              </motion.div>
                              <div>
                                <p className="font-bold text-gray-900 text-lg">{symbol}</p>
                                <p className="text-xs text-gray-500">{parseFloat(pos.qty || '0').toFixed(2)} kontrat</p>
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSelectedOptionsSymbol(pos.symbol);
                                setOptionsModalType("sell");
                                setOptionsModalOpen(true);
                              }}
                              className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-xl hover:shadow-lg transition-all"
                              style={{
                                boxShadow: '0 4px 12px -4px rgba(239, 68, 68, 0.4)',
                              }}
                            >
                              Sat
                            </motion.button>
                          </div>
                          <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600 font-medium">Piyasa Değeri</span>
                              <span className="font-bold text-gray-900">
                                ${marketValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600 font-medium">Güncel Fiyat</span>
                              <span className="font-semibold text-gray-900">
                                ${currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600 font-medium">Ortalama Maliyet</span>
                              <span className="font-semibold text-gray-700">
                                ${avgCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="pt-2 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Kazanç/Kayıp</span>
                                <div className={`flex items-center gap-1 font-bold ${
                                  unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {unrealizedPL >= 0 ? (
                                    <TrendingUp className="w-4 h-4" />
                                  ) : (
                                    <TrendingDown className="w-4 h-4" />
                                  )}
                                  <span className="text-sm">
                                    {unrealizedPL >= 0 ? '+' : ''}${unrealizedPL.toFixed(2)}
                                  </span>
                                  <span className="text-xs ml-1">
                                    ({unrealizedPLPercent >= 0 ? '+' : ''}{unrealizedPLPercent.toFixed(2)}%)
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm mb-3 font-medium">Henüz opsiyon pozisyonunuz yok</p>
                    <button
                      onClick={() => {
                        setOptionsModalType("buy");
                        setOptionsModalOpen(true);
                      }}
                      className="px-4 py-2 text-sm text-accent-600 hover:text-accent-700 font-semibold bg-accent-50 rounded-lg hover:bg-accent-100 transition-colors"
                    >
                      İlk opsiyon işleminizi yapın →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Özet Kartlar ve En Çok Kazandıran Opsiyonlar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="relative overflow-hidden rounded-2xl backdrop-blur-xl p-5 border border-purple-200/50"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
                boxShadow: '0 8px 32px -8px rgba(139, 92, 246, 0.2)',
              }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-bold text-gray-800">Toplam Pozisyon</span>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900 mb-2">
                    {optionsPositions.filter((p: any) => parseFloat(p.qty || '0') > 0).length}
                  </p>
                  {(() => {
                    const totalPL = optionsPositions
                      .filter((p: any) => parseFloat(p.qty || '0') > 0)
                      .reduce((sum: number, pos: any) => sum + parseFloat(pos.unrealized_pl || '0'), 0);
                    const totalCostBasis = optionsPositions
                      .filter((p: any) => parseFloat(p.qty || '0') > 0)
                      .reduce((sum: number, pos: any) => sum + parseFloat(pos.cost_basis || '0'), 0);
                    const totalPLPercent = totalCostBasis > 0 ? (totalPL / totalCostBasis) * 100 : 0;
                    return (
                      <div className={`text-sm font-semibold ${
                        totalPL >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)} ({totalPLPercent >= 0 ? '+' : ''}{totalPLPercent.toFixed(2)}%)
                      </div>
                    );
                  })()}
                </div>
              </div>
            </motion.div>

            {/* En Çok Kazandıran Opsiyonlar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="relative overflow-hidden rounded-2xl backdrop-blur-xl p-5 border border-yellow-200/50"
              style={{
                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
                boxShadow: '0 8px 32px -8px rgba(251, 191, 36, 0.2)',
              }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-yellow-600" />
                  </div>
                  <span className="text-sm font-bold text-gray-800">En Çok Kazandıran</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {topGainingOptions.length > 0 ? (
                    topGainingOptions.map((opt: any, index: number) => (
                      <motion.div
                        key={opt.symbol || opt.underlying_symbol}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                        className="p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-yellow-200/50 hover:bg-white/80 transition-all cursor-pointer"
                        onClick={() => {
                          setSelectedOptionsSymbol(opt.symbol || opt.underlying_symbol);
                          setOptionsModalType("buy");
                          setOptionsModalOpen(true);
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex-1">
                            <span className="text-sm font-bold text-gray-900 block truncate max-w-[140px]">
                              {opt.symbol || opt.underlying_symbol}
                            </span>
                            <span className="text-xs text-gray-500">
                              {opt.type === 'underlying' ? 'Underlying' : 'Opsiyon'}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-green-600 font-bold text-sm">
                              <TrendingUp className="w-3 h-3" />
                              <span>+{opt.changePercent?.toFixed(2) || '0.00'}%</span>
                            </div>
                            <div className="text-xs text-gray-600 mt-0.5">
                              ${opt.change >= 0 ? '+' : ''}{opt.change?.toFixed(2) || '0.00'}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-yellow-200/30 flex items-center justify-between text-xs">
                          <span className="text-gray-500">Fiyat:</span>
                          <span className="font-semibold text-gray-700">${opt.currentPrice?.toFixed(2) || '0.00'}</span>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Veriler yükleniyor...
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Opsiyon Performans Grafiği - Modern */}
        {optionsPerformanceData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative overflow-hidden rounded-3xl backdrop-blur-xl p-8 border border-white/20"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
              boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/5 to-transparent rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-accent-600" />
                  Opsiyon Performansı
                </h2>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-600">Kazanç</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-600">Kayıp</span>
                  </div>
                </div>
              </div>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={optionsPerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="symbol" 
                      stroke="#6b7280"
                      fontSize={12}
                      tick={{ fill: '#6b7280' }}
                      tickFormatter={(value) => value.length > 10 ? value.substring(0, 10) + '...' : value}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                      tick={{ fill: '#6b7280' }}
                      tickFormatter={(value) => `${value.toFixed(1)}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(value: number) => {
                        const entry = optionsPerformanceData.find(d => d.unrealizedPLPercent === value);
                        return `${value >= 0 ? '+' : ''}${value.toFixed(2)}% ($${entry?.unrealizedPL?.toFixed(2) || '0.00'})`;
                      }}
                      labelFormatter={(label) => `Sembol: ${label}`}
                    />
                    <Bar 
                      dataKey="unrealizedPLPercent" 
                      radius={[8, 8, 0, 0]}
                      animationDuration={800}
                    >
                      {optionsPerformanceData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.unrealizedPLPercent >= 0 ? '#10b981' : '#ef4444'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 15 Dakikalık Opsiyon Fiyat Grafiği */}
              {optionsChartData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 relative overflow-hidden rounded-3xl backdrop-blur-xl p-8 border border-white/20"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                    boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/5 to-transparent rounded-full blur-3xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-purple-600" />
                        15 Dakikalık Underlying Fiyat Grafiği
                      </h2>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-green-700 dark:text-green-300">Canlı</span>
                  </div>
                    </div>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="time"
                            stroke="#6b7280"
                            fontSize={11}
                            tick={{ fill: '#6b7280' }}
                            interval="preserveStartEnd"
                          />
                          <YAxis 
                            yAxisId="left"
                            stroke="#6b7280"
                            fontSize={11}
                            tick={{ fill: '#6b7280' }}
                            tickFormatter={(value) => `$${value.toFixed(2)}`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                            formatter={(value: number, name: string) => {
                              if (name === 'price') return [`$${value.toFixed(2)}`, 'Fiyat'];
                              if (name === 'volume') return [value.toLocaleString(), 'Hacim'];
                              return [`$${value.toFixed(2)}`, name];
                            }}
                          />
                          <Legend />
                          {(() => {
                            // Tüm zamanları birleştir ve her sembol için fiyat ekle
                            const allTimes = new Set<string>();
                            optionsChartData.forEach(c => c.data.forEach((d: any) => allTimes.add(d.time)));
                            const mergedData = Array.from(allTimes).sort().map(time => {
                              const dataPoint: any = { time };
                              optionsChartData.forEach(c => {
                                const point = c.data.find((d: any) => d.time === time);
                                dataPoint[c.symbol] = point ? point.price : null;
                              });
                              return dataPoint;
                            });

                            return optionsChartData.map((chart, index) => (
                              <Line
                                key={chart.symbol}
                                yAxisId="left"
                                type="monotone"
                                dataKey={chart.symbol}
                                data={mergedData}
                                name={chart.symbol}
                                stroke={index === 0 ? '#8b5cf6' : index === 1 ? '#3b82f6' : index === 2 ? '#10b981' : index === 3 ? '#f59e0b' : '#ef4444'}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                                connectNulls
                              />
                            ));
                          })()}
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  const quickActions = [
    {
      icon: TrendingUp,
      title: "Yatırım Yap",
      description: "Hisse senedi al",
      color: "primary",
      gradient: "from-primary-500 to-primary-600",
      onClick: () => {
        setTradeModalType("buy");
        setTradeModalOpen(true);
      },
    },
    {
      icon: Send,
      title: "Para Gönder",
      description: "Anında transfer",
      color: "secondary",
      gradient: "from-secondary-500 to-secondary-600",
      onClick: () => setTransferModalOpen(true),
    },
    {
      icon: Building2,
      title: "Yatırım Hesabına Transfer",
      description: "Banka'dan yatırım hesabına",
      color: "accent",
      gradient: "from-green-500 to-emerald-600",
      onClick: () => setTransferToAlpacaModalOpen(true),
    },
    {
      icon: Building2,
      title: "Hesaba Transfer",
      description: "Yatırım hesabından Banka'ya",
      color: "accent",
      gradient: "from-blue-500 to-indigo-600",
      onClick: () => setTransferFromAlpacaModalOpen(true),
    },
    {
      icon: Coins,
      title: "Kripto Al",
      description: "150+ kripto",
      color: "accent",
      gradient: "from-accent-500 to-accent-600",
      onClick: () => {
        setCryptoModalType("buy");
        setCryptoModalOpen(true);
      },
    },
    {
      icon: Receipt,
      title: "Fatura Öde",
      description: "Hızlı ödeme",
      color: "primary",
      gradient: "from-primary-400 to-primary-500",
      onClick: () => setBillModalOpen(true),
    },
    {
      icon: CreditCard,
      title: "Kart Başvurusu",
      description: "Yeni kart başvurusu",
      color: "accent",
      gradient: "from-purple-500 to-pink-600",
      onClick: () => setCardApplicationModalOpen(true),
    },
    {
      icon: FileText,
      title: "Başvuru Takip",
      description: "Kart başvurularınızı takip edin",
      color: "accent",
      gradient: "from-indigo-500 to-blue-600",
      onClick: () => {
        setCardApplicationTrackingModalOpen(true);
        fetchCardApplications();
      },
    },
    {
      icon: Wallet,
      title: "Para Yükle",
      description: "Kredi/Banka kartı ile",
      color: "accent",
      gradient: "from-emerald-500 to-teal-600",
      onClick: () => setDepositModalOpen(true),
    },
  ];

  // Portföy özeti hesaplamaları
  const mambuCashForStats = parseFloat(mambuAccount?.cashBalance || mambuAccount?.totalBalance || '0') || 0;
  const alpacaCashForStats = parseFloat(accountData?.cash || accountData?.trade_cash || '0') || 0;
  const alpacaStocksForStats = positions
    .filter((p: any) => p.asset_class === 'us_equity')
    .reduce((sum: number, p: any) => {
      const value = parseFloat(p.market_value || '0') || 0;
      return sum + value;
    }, 0);
  const alpacaCryptoForStats = cryptoPositions.reduce((sum: number, p: any) => {
    const value = parseFloat(p.market_value || '0') || 0;
    return sum + value;
  }, 0);
  
  // Toplam Portföy: Mambu + Alpaca nakit ve hisse
  const totalPortfolioForStats = mambuCashForStats + alpacaCashForStats + alpacaStocksForStats;
  
  // Yatırımlar: Alpaca nakit + hisse
  const investmentsForStats = alpacaCashForStats + alpacaStocksForStats;

  // Format helper function
  const formatCurrency = (value: number): string => {
    if (isNaN(value) || !isFinite(value)) return '$0.00';
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Toplam Portföy değişimini gerçek pozisyonlardan hesapla
  const calculatePortfolioChange = () => {
    try {
      // Önce Alpaca'dan gelen equity değişimini kullan (en güvenilir)
      if (accountData && lastEquity > 0) {
        return {
          change: totalChange,
          changePercent: totalChangePercent
        };
      }
      
      // Eğer Alpaca equity yoksa, pozisyonlardan kar/zarar hesapla
      const stockPnL = positions.reduce((sum: number, pos: any) => {
        return sum + parseFloat(pos.unrealized_pl || '0');
      }, 0);
      
      const cryptoPnL = cryptoPositions.reduce((sum: number, pos: any) => {
        return sum + parseFloat(pos.unrealized_pl || '0');
      }, 0);
      
      const optionsPnL = optionsPositions.reduce((sum: number, pos: any) => {
        return sum + parseFloat(pos.unrealized_pl || '0');
      }, 0);
      
      const totalPnL = stockPnL + cryptoPnL + optionsPnL;
      
      // Portföy geçmişinden başlangıç değerini bul
      let baseValue = totalPortfolioValue;
      
      if (portfolioHistory && Array.isArray(portfolioHistory) && portfolioHistory.length > 0) {
        // En eski kaydı bul (başlangıç değeri)
        const sortedHistory = Array.from(portfolioHistory).sort((a: any, b: any) => {
          const dateA = new Date(a?.timestamp || 0).getTime();
          const dateB = new Date(b?.timestamp || 0).getTime();
          return dateA - dateB; // En eski ilk
        });
        
        const oldest = sortedHistory[0];
        const oldestEquity = parseFloat(oldest?.equity || '0');
        
        // Eğer eski değer varsa, onu kullan
        if (oldestEquity > 0) {
          baseValue = oldestEquity;
        }
      }
      
      // Yüzde hesapla
      const changePercent = baseValue > 0 && baseValue !== totalPortfolioValue
        ? ((totalPnL / baseValue) * 100)
        : totalPortfolioValue > 0
        ? (totalPnL / totalPortfolioValue) * 100
        : 0;
      
      return {
        change: totalPnL,
        changePercent: changePercent
      };
    } catch (error) {
      console.error('Portfolio change calculation error:', error);
      // Hata durumunda fallback
      return {
        change: portfolioData.totalChange,
        changePercent: portfolioData.totalChangePercent
      };
    }
  };

  const portfolioChangeData = calculatePortfolioChange();

  const stats = [
    {
      title: "Toplam Portföy",
      value: formatCurrency(totalPortfolioForStats),
      change: portfolioChangeData.change,
      changePercent: portfolioChangeData.changePercent,
      icon: Wallet,
      color: "primary",
    },
    {
      title: "Nakit",
      value: formatCurrency(mambuCashForStats),
      icon: DollarSign,
      color: "secondary",
    },
    {
      title: "Yatırımlar",
      value: formatCurrency(investmentsForStats),
      icon: Building2,
      color: "accent",
    },
    {
      title: "Kripto",
      value: formatCurrency(alpacaCryptoForStats),
      icon: Coins,
      color: "primary",
    },
  ];

  // Alpaca hesap oluşturma form handler fonksiyonları
  const handleAccountFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAccountFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAccountFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountFormError(null);
    setAccountFormSubmitting(true);

    try {
      const accountData = {
        contact: {
          email_address: accountFormData.email,
          phone_number: accountFormData.phone || undefined,
          street_address: accountFormData.streetAddress ? [accountFormData.streetAddress] : undefined,
          city: accountFormData.city || undefined,
          state: accountFormData.state || undefined,
          postal_code: accountFormData.postalCode || undefined,
          country: accountFormData.country || "US",
        },
        identity: {
          given_name: accountFormData.firstName,
          family_name: accountFormData.lastName,
          date_of_birth: accountFormData.dateOfBirth || undefined,
          tax_id: accountFormData.taxId || undefined,
          tax_id_type: accountFormData.taxIdType || undefined,
          country_of_citizenship: accountFormData.country || "US",
          country_of_birth: accountFormData.country || "US",
          country_of_tax_residence: accountFormData.country || "US",
        },
        agreements: [
          {
            agreement: 'account_agreement',
            signed_at: new Date().toISOString(),
            ip_address: '127.0.0.1',
          },
          {
            agreement: 'customer_agreement',
            signed_at: new Date().toISOString(),
            ip_address: '127.0.0.1',
          },
          {
            agreement: 'margin_agreement',
            signed_at: new Date().toISOString(),
            ip_address: '127.0.0.1',
          },
        ],
        enabled_assets: ["us_equity"],
      };

      const response = await fetch("/api/alpaca/accounts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Hesap oluşturulamadı");
      }

      setAccountFormSuccess(true);
      setAlpacaAccountExists(true);
      setAlpacaAccountId(data.account?.id || data.account?.account_number || null);
      
      // Alpaca verilerini yeniden yükle
      setTimeout(() => {
        fetchAlpacaData();
      }, 2000);
    } catch (err: any) {
      console.error("Alpaca account creation error:", err);
      setAccountFormError(err.message || "Hesap oluşturulurken bir hata oluştu");
    } finally {
      setAccountFormSubmitting(false);
    }
  };

  // Eğer hesap yoksa ve yatırım alanlarındaysa form göster
  const isDemoAccount = user?.email?.toLowerCase().includes('demo') || 
                        user?.email?.toLowerCase() === 'demo@datpay.com';
  const showAccountForm = alpacaAccountExists === false && 
                          (activeTab === "borsa" || activeTab === "kripto" || activeTab === "opsiyon") &&
                          (isDemoAccount || kycVerified !== false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DashboardNavbar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
          {/* Yatırım Hesabı Oluşturma Formu - Hesap yoksa göster */}
          {showAccountForm ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Yatırım Hesabı Oluştur</h2>
                    <p className="text-sm opacity-90">Yatırım işlemleri için hesap bilgilerinizi girin</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {accountFormSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Hesap Başarıyla Oluşturuldu!</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Yatırım hesabınız oluşturuldu. Artık yatırım işlemlerine başlayabilirsiniz.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleAccountFormSubmit} className="space-y-4">
                    {/* Kişisel Bilgiler */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Kişisel Bilgiler</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Ad <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={accountFormData.firstName}
                            onChange={handleAccountFormChange}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Soyad <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={accountFormData.lastName}
                            onChange={handleAccountFormChange}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={accountFormData.email}
                          onChange={handleAccountFormChange}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Telefon
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={accountFormData.phone}
                          onChange={handleAccountFormChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Doğum Tarihi
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={accountFormData.dateOfBirth}
                          onChange={handleAccountFormChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Adres Bilgileri */}
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Adres Bilgileri</h3>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Sokak Adresi
                        </label>
                        <input
                          type="text"
                          name="streetAddress"
                          value={accountFormData.streetAddress}
                          onChange={handleAccountFormChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Şehir
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={accountFormData.city}
                            onChange={handleAccountFormChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Eyalet
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={accountFormData.state}
                            onChange={handleAccountFormChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Posta Kodu
                          </label>
                          <input
                            type="text"
                            name="postalCode"
                            value={accountFormData.postalCode}
                            onChange={handleAccountFormChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Ülke
                          </label>
                          <select
                            name="country"
                            value={accountFormData.country}
                            onChange={handleAccountFormChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="US">United States</option>
                            <option value="TR">Turkey</option>
                            <option value="GB">United Kingdom</option>
                            <option value="DE">Germany</option>
                            <option value="FR">France</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Vergi Bilgileri */}
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Vergi Bilgileri (Opsiyonel)</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Vergi Kimlik No
                          </label>
                          <input
                            type="text"
                            name="taxId"
                            value={accountFormData.taxId}
                            onChange={handleAccountFormChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Vergi Kimlik Tipi
                          </label>
                          <select
                            name="taxIdType"
                            value={accountFormData.taxIdType}
                            onChange={handleAccountFormChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="USA_SSN">USA SSN</option>
                            <option value="USA_ITIN">USA ITIN</option>
                            <option value="USA_EIN">USA EIN</option>
                            <option value="NON_USA">Non-USA</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Hata Mesajı */}
                    {accountFormError && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-700">{accountFormError}</p>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={accountFormSubmitting}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {accountFormSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Oluşturuluyor...
                          </>
                        ) : (
                          "Hesap Oluştur"
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          ) : (
            <>
              {/* Tab içeriği */}
              {activeTab === "borsa" ? (
                renderBorsaScreen()
              ) : activeTab === "kripto" ? (
                renderKriptoScreen()
              ) : activeTab === "opsiyon" ? (
                renderOpsiyonScreen()
              ) : (
                <>
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Hoş Geldin, <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
                    {user?.firstName} {user?.lastName}
                  </span>
                </h1>
                <p className="text-gray-700 dark:text-gray-300">
                  Portföyünüzü yönetin, yatırım yapın ve finansal hedeflerinize ulaşın
                </p>
              </div>
              {dataLoading && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 dark:border-primary-400"></div>
                  <span className="text-sm">Veriler yükleniyor...</span>
                </div>
              )}
            </div>
            {dataError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{dataError}</p>
                <button
                  onClick={fetchAlpacaData}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 font-semibold"
                >
                  Tekrar Dene
                </button>
              </div>
            )}
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${stat.color}-400 to-${stat.color}-600 flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  {stat.change !== undefined && stat.changePercent !== undefined && (
                    <div className={`flex items-center gap-1 ${stat.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {stat.change >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="text-sm font-semibold">
                        {stat.change >= 0 ? '+' : ''}{stat.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="text-sm text-gray-700 dark:text-gray-300 mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Hızlı İşlemler Menüsü */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Hızlı İşlemler</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={action.onClick}
                  className={`relative overflow-hidden rounded-2xl p-6 text-left bg-gradient-to-br ${action.gradient} text-white shadow-lg hover:shadow-xl transition-all group`}
                >
                  <div className="relative z-10">
                    <action.icon className="w-8 h-8 mb-3 opacity-90 group-hover:opacity-100 transition-opacity" />
                    <h3 className="font-bold text-lg mb-1">{action.title}</h3>
                    <p className="text-sm opacity-80 group-hover:opacity-100 transition-opacity">{action.description}</p>
                  </div>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </motion.button>
              ))}
            </div>
          </motion.div>

                  {/* Widget Grid Layout */}
                  <div className="nakit-layout mb-8">
                    <GridLayout
                      className="layout"
                      layout={nakitLayout}
                      cols={4}
                      rowHeight={100}
                      width={nakitGridWidth}
                      onLayoutChange={(layout: any) => setNakitLayout(layout)}
                      isDraggable={true}
                      isResizable={true}
                      draggableHandle=".drag-handle"
                    >
                    {/* Gelir/Gider Özeti */}
                    {(() => {
                      const mambuTxns = mambuTransactions || [];
                      
                      // Mambu'ya yatan paralar (Banka gelirleri)
                      const bankIncome = mambuTxns
                        .filter((tx: any) => tx.type === 'DEPOSIT' || tx.type === 'CREDIT')
                        .reduce((sum: number, tx: any) => sum + parseFloat(tx.amount || tx.value || '0'), 0);
                      
                      // Mambu harcamaları (sadece pozitif değerler)
                      const bankExpenses = mambuTxns
                        .filter((tx: any) => tx.type !== 'DEPOSIT' && tx.type !== 'CREDIT')
                        .reduce((sum: number, tx: any) => {
                          const amount = parseFloat(tx.amount || tx.value || '0');
                          // Sadece pozitif değerleri ekle (harcamalar pozitif olmalı)
                          return sum + Math.abs(amount);
                        }, 0);
                      
                      // Borsa ve Kripto kar/zarar hesaplama
                      const stockProfit = positions
                        .filter((p: any) => p.asset_class === 'us_equity')
                        .reduce((sum: number, p: any) => {
                          const marketValue = parseFloat(p.market_value || '0');
                          const costBasis = parseFloat(p.cost_basis || '0');
                          return sum + (marketValue - costBasis);
                        }, 0);
                      
                      const cryptoProfit = cryptoPositions.reduce((sum: number, p: any) => {
                        const marketValue = parseFloat(p.market_value || '0');
                        const costBasis = parseFloat(p.cost_basis || '0');
                        return sum + (marketValue - costBasis);
                      }, 0);
                      
                      const investmentProfit = stockProfit + cryptoProfit;
                      
                      // Toplam Gelir: Banka gelirleri + Yatırım karı
                      const totalIncome = bankIncome + (investmentProfit > 0 ? investmentProfit : 0);
                      
                      // Toplam Gider: Banka harcamaları + Yatırım zararı (sadece pozitif değerler)
                      const investmentLoss = investmentProfit < 0 ? Math.abs(investmentProfit) : 0;
                      const totalExpenses = Math.max(0, bankExpenses + investmentLoss);
                      
                      // Net Nakit Akışı: Gelir - Gider
                      const netCashFlow = totalIncome - totalExpenses;
                      
                      // Aktif Yatırımlar: Toplam değer ve adet bilgisi
                      const stockCount = positions.filter((p: any) => 
                        p.asset_class === 'us_equity' && parseFloat(p.qty || '0') > 0
                      ).length;
                      const cryptoCount = cryptoPositions.filter((p: any) => 
                        parseFloat(p.qty || '0') > 0
                      ).length;
                      const optionsCount = positions.filter((p: any) => 
                        p.asset_class === 'option' && parseFloat(p.qty || '0') > 0
                      ).length;
                      
                      const totalInvestmentValue = positions
                        .filter((p: any) => p.asset_class === 'us_equity' || p.asset_class === 'option')
                        .reduce((sum: number, p: any) => sum + parseFloat(p.market_value || '0'), 0) +
                        cryptoPositions.reduce((sum: number, p: any) => sum + parseFloat(p.market_value || '0'), 0);
                      
                      const totalProductCount = stockCount + cryptoCount + optionsCount;
                      
                      return (
                        <div key="income-expense" className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 h-full flex flex-col overflow-hidden">
                          <div className="flex items-center justify-between mb-4 flex-shrink-0">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                              <Activity className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                              Gelir/Gider Özeti
                            </h2>
                            <div className="drag-handle cursor-move p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto min-h-0">
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-lg p-6 border border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                                <ArrowDownRight className="w-6 h-6 text-white" />
                              </div>
                              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-sm text-gray-700 dark:text-gray-300 mb-1">Toplam Gelir</h3>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                              Banka: ${bankIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} • 
                              Yatırım: ${(investmentProfit > 0 ? investmentProfit : 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>

                          <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-2xl shadow-lg p-6 border border-red-200 dark:border-red-800">
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                                <ArrowUpRight className="w-6 h-6 text-white" />
                              </div>
                              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-sm text-gray-700 dark:text-gray-300 mb-1">Toplam Gider</h3>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                              Harcamalar: ${bankExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} • 
                              Zarar: ${(investmentProfit < 0 ? Math.abs(investmentProfit) : 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>

                          <div className={`rounded-2xl shadow-lg p-6 border ${
                              netCashFlow >= 0
                                ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
                                : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                netCashFlow >= 0 ? 'bg-green-500' : 'bg-red-500'
                              }`}>
                                <Activity className="w-6 h-6 text-white" />
                              </div>
                              {netCashFlow >= 0 ? (
                                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                              ) : (
                                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                            <h3 className="text-sm text-gray-700 dark:text-gray-300 mb-1">Net Nakit Akışı</h3>
                            <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {netCashFlow >= 0 ? '+' : ''}${netCashFlow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                              Gelir - Gider
                            </p>
                          </div>

                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl shadow-lg p-6 border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                                <Target className="w-6 h-6 text-white" />
                              </div>
                              <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-sm text-gray-700 dark:text-gray-300 mb-1">Aktif Yatırımlar</h3>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              ${totalInvestmentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                              {totalProductCount} ürün (Borsa: {stockCount}, Kripto: {cryptoCount}, Opsiyon: {optionsCount})
                            </p>
                          </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Nakit Dağılımı Pasta Grafiği */}
                    <div key="cash-distribution" className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 h-full flex flex-col overflow-hidden">
                      <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <PieChart className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                          Nakit Dağılımı
                        </h2>
                        <div className="drag-handle cursor-move p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-h-0 overflow-y-auto">
                      {(() => {
                        const cashValue = portfolioData.cash || 0;
                        const stockValue = positions
                          .filter((p: any) => p.asset_class === 'us_equity')
                          .reduce((sum: number, p: any) => {
                            const qty = parseFloat(p.qty || '0');
                            const price = parseFloat(p.current_price || p.market_value || '0');
                            return sum + (qty * price);
                          }, 0);
                        const cryptoValue = cryptoPositions.reduce((sum: number, p: any) => {
                          const qty = parseFloat(p.qty || '0');
                          const price = parseFloat(p.current_price || p.market_value || '0');
                          return sum + (qty * price);
                        }, 0);
                        
                        // Mambu'dan gelen loan ve kredi kartı borcu
                        const loanDebt = mambuAccount?.totalLoanBalance || 0;
                        const creditCardDebt = mambuAccount?.creditCardDebt || 0;
                        
                        // Toplam değer (nakit + yatırımlar + borçlar)
                        const totalValue = cashValue + stockValue + cryptoValue + loanDebt + creditCardDebt;
                        
                        const pieData = [
                          { name: 'Nakit', value: cashValue, color: '#3b82f6' },
                          { name: 'Borsa', value: stockValue, color: '#10b981' },
                          { name: 'Kripto', value: cryptoValue, color: '#f59e0b' },
                          { name: 'Kredi Borcu', value: loanDebt, color: '#ef4444' },
                          { name: 'Kredi Kartı Borcu', value: creditCardDebt, color: '#dc2626' },
                        ].filter(item => item.value > 0);
                        
                        return totalValue > 0 ? (
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart>
                                <Pie
                                  data={pieData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  formatter={(value: any) => `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                />
                                <Legend />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                            <div className="mt-4 space-y-2">
                              {pieData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                                  </div>
                                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    ${item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                              <PieChart className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                              <p className="text-gray-600 dark:text-gray-300">Portföy verisi yok</p>
                            </div>
                          </div>
                        );
                      })()}
                      </div>
                    </div>

                    {/* Hesap Bilgileri Bölümü */}
                    <div key="accounts" className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 h-full flex flex-col overflow-hidden">
                      <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <Wallet className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                          Hesap Bilgilerim
                        </h2>
                        <div className="drag-handle cursor-move p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-h-0 overflow-y-auto">
                    {mambuAccount && mambuAccount.accounts && mambuAccount.accounts.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mambuAccount.accounts.map((account: any, index: number) => {
                          const balance = parseFloat(account.balance || account.availableBalance || '0');
                          const accountType = account.accountType || account.productTypeKey || 'DEPOSIT';
                          const accountState = account.accountState || account.state || 'ACTIVE';
                          
                          return (
          <motion.div
                              key={account.id || account.encodedKey || index}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.6 + index * 0.05 }}
                              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                    accountType.includes('SAVINGS') || accountType.includes('DEPOSIT')
                                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                      : accountType.includes('LOAN')
                                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                      : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                  }`}>
                                    {accountType.includes('SAVINGS') || accountType.includes('DEPOSIT') ? (
                                      <Wallet className="w-6 h-6" />
                                    ) : accountType.includes('LOAN') ? (
                                      <CreditCard className="w-6 h-6" />
                                    ) : (
                                      <Building2 className="w-6 h-6" />
                                    )}
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                                      {account.name || account.accountName || accountType || 'Hesap'}
                                    </h3>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                      {account.id || account.encodedKey || account.accountNumber || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  accountState === 'ACTIVE' || accountState === 'ACTIVE_IN_ARREARS'
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                    : accountState === 'CLOSED'
                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                                }`}>
                                  {accountState === 'ACTIVE' || accountState === 'ACTIVE_IN_ARREARS' ? 'Aktif' :
                                   accountState === 'CLOSED' ? 'Kapalı' : accountState}
                                </span>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Bakiye</span>
                                  <span className={`text-lg font-bold ${
                                    balance >= 0 
                                      ? 'text-gray-900 dark:text-gray-100'
                                      : 'text-red-600 dark:text-red-400'
                                  }`}>
                                    ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                </div>
                                
                                {account.availableBalance !== undefined && parseFloat(account.availableBalance || '0') !== balance && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 dark:text-gray-500">Kullanılabilir</span>
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                      ${parseFloat(account.availableBalance || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                )}
                                
                                {account.currencyCode && (
                                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                                    <span className="text-xs text-gray-500 dark:text-gray-500">Para Birimi</span>
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                      {account.currencyCode}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                        <div className="text-center mb-6">
                          <Wallet className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Aktif Hesabınız Yok</h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Yeni bir hesap açarak işlemlerinize başlayabilirsiniz.
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              // Form verilerini varsayılan değerlerle başlat
                              setMambuAccountFormData({
                                productTypeKey: 'DEFAULT_SAVINGS',
                                currencyCode: 'USD',
                                accountName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Ana Hesap',
                                notes: '',
                              });
                              setMambuAccountModalOpen(true);
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                          >
                            <Plus className="w-5 h-5" />
                            Yeni Hesap Aç
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              fetchAlpacaData();
                            }}
                            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
                          >
                            <ArrowRight className="w-5 h-5" />
                            Yenile
                          </motion.button>
                        </div>
                      </div>
                    )}
                      </div>
                    </div>

                    {/* Kayıtlı Kartlarım Widget */}
                    <div key="cards" className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 h-full flex flex-col overflow-hidden">
                      <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <CreditCard className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              Kayıtlı Kartlarım
            </h2>
                        <div className="drag-handle cursor-move p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-h-0 overflow-y-auto">
            {cardsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
              </div>
            ) : mambuCards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mambuCards.slice(0, 3).map((card: any, index: number) => {
                  const isVisible = cardVisibility[card.id] || false;
                  const cardNumberParts = card.cardNumber.replace(/\s/g, '').match(/.{1,4}/g) || [];
                  const fullCardNumber = cardNumberParts.join(' ');
                  const maskedCardNumber = cardNumberParts.map((part: string, i: number) => 
                    i < cardNumberParts.length - 1 ? '****' : part
                  ).join(' ');
                  
                  return (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.35 + index * 0.05 }}
                      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-800 dark:via-blue-900 dark:to-indigo-900 p-5 text-white shadow-xl hover:shadow-2xl transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #312e81 100%)',
                        minHeight: '200px',
                      }}
                    >
                      {/* Kart Arka Plan Efektleri */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
                      <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-lg opacity-50 blur-sm"></div>
                      
                      {/* Kilit Butonu */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCardVisibility(card.id);
                        }}
                        className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                      >
                        {isVisible ? (
                          <Unlock className="w-4 h-4 text-white" />
                        ) : (
                          <Lock className="w-4 h-4 text-white" />
                        )}
                      </button>
                      
                      <div className="relative z-10 h-full flex flex-col">
                        {/* Chip ve Logo */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md shadow-lg flex items-center justify-center">
                            <div className="w-7 h-5 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded border-2 border-yellow-700/30 flex items-center justify-center">
                              <div className="w-4 h-3 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-sm"></div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {card.onlineEnabled ? (
                              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/30 rounded-full backdrop-blur-sm">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-xs font-semibold">Aktif</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 px-2 py-1 bg-gray-500/30 rounded-full backdrop-blur-sm">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                <span className="text-xs font-semibold">Kapalı</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Kart Numarası */}
                        <div className="mb-4 flex-1">
                          <p className="text-xs opacity-80 mb-2">Kart Numarası</p>
                          <p className="text-xl font-bold tracking-widest font-mono">
                            {isVisible ? fullCardNumber : maskedCardNumber}
                          </p>
                        </div>
                        
                        {/* Kart Alt Bilgileri */}
                        <div className="mt-auto">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <p className="text-xs opacity-80 mb-1">Kart Sahibi</p>
                              <p className="text-sm font-semibold uppercase tracking-wide">
                                {card.cardholderName || `${user?.firstName} ${user?.lastName}`}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs opacity-80 mb-1">Son Kullanma</p>
                              <p className="text-sm font-semibold">
                                {isVisible 
                                  ? `${String(card.expiryMonth).padStart(2, '0')}/${card.expiryYear}`
                                  : '**/**'
                                }
                              </p>
                            </div>
                          </div>
                          
                          {/* CVV (sadece görünürken) */}
                          {isVisible && (
                            <div className="mb-3 flex items-center justify-between">
                              <div>
                                <p className="text-xs opacity-80 mb-1">CVV</p>
                                <p className="text-sm font-semibold font-mono">{card.cvv || '123'}</p>
                              </div>
                              <div>
                                <p className="text-xs opacity-80 mb-1">Bakiye</p>
                                <p className="text-sm font-bold">
                                  ${card.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* Online Alışveriş Toggle */}
                          <div className="flex items-center justify-between pt-3 border-t border-white/20">
                            <div className="flex items-center gap-2">
                              <ShoppingCart className="w-4 h-4 opacity-80" />
                              <span className="text-xs font-medium">Online Alışveriş</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateCardOnlineStatus(card.id, !card.onlineEnabled);
                              }}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                card.onlineEnabled ? 'bg-green-500' : 'bg-gray-600'
                              }`}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                  card.onlineEnabled ? 'translate-x-5' : 'translate-x-0.5'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Henüz kayıtlı kartınız yok</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Kart eklemek için müşteri hizmetleri ile iletişime geçin</p>
              </div>
            )}
                      </div>
                    </div>

                    {/* Portföy Grafiği Widget */}
                    <div key="portfolio-chart" className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 h-full flex flex-col overflow-hidden">
                      <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <LineChart className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                          Portföy Geçmişi
                        </h2>
                        <div className="drag-handle cursor-move p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                          </svg>
                  </div>
            </div>
                      
                      {/* Zaman Aralığı Seçimi */}
                      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                        {(['1d', '7d', '30d', '90d', '1y'] as const).map((range) => (
                          <button
                            key={range}
                            onClick={() => setPortfolioTimeRange(range)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                              portfolioTimeRange === range
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {range === '1d' ? 'Günlük' : range === '7d' ? '7 Gün' : range === '30d' ? '30 Gün' : range === '90d' ? '90 Gün' : '1 Yıl'}
                          </button>
                        ))}
                      </div>

                      <div className="flex-1 min-h-0 overflow-y-auto">
                      {portfolioHistoryLoading ? (
                        <div className="flex items-center justify-center h-64">
                          <div className="text-center">
                            <Loader2 className="w-12 h-12 text-primary-600 dark:text-primary-400 mx-auto mb-4 animate-spin" />
                            <p className="text-gray-600 dark:text-gray-300">Portföy geçmişi yükleniyor...</p>
                          </div>
                        </div>
                      ) : portfolioHistory && Array.isArray(portfolioHistory) && portfolioHistory.length > 0 ? (
                        <>
                          {/* Ana Portföy Grafiği */}
                          <div className="h-64 mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={(() => {
                                const now = new Date();
                                const cutoffDate = new Date();
                                if (portfolioTimeRange === '1d') cutoffDate.setDate(now.getDate() - 1);
                                else if (portfolioTimeRange === '7d') cutoffDate.setDate(now.getDate() - 7);
                                else if (portfolioTimeRange === '30d') cutoffDate.setDate(now.getDate() - 30);
                                else if (portfolioTimeRange === '90d') cutoffDate.setDate(now.getDate() - 90);
                                else cutoffDate.setFullYear(now.getFullYear() - 1);
                                
                                return portfolioHistory.filter((item: any) => {
                                  const itemDate = new Date(item.timestamp);
                                  return itemDate >= cutoffDate;
                                });
                              })()}>
                                <defs>
                                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                                <XAxis 
                                  dataKey="timestamp" 
                                  tickFormatter={(value) => {
                                    const date = new Date(value);
                                    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
                                  }}
                                  stroke="#6b7280"
                                  className="dark:stroke-gray-400"
                                />
                                <YAxis 
                                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                  stroke="#6b7280"
                                  className="dark:stroke-gray-400"
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px'
                                  }}
                                  formatter={(value: any) => [`$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Portföy Değeri']}
                                  labelFormatter={(label) => {
                                    const date = new Date(label);
                                    return date.toLocaleString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                                  }}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="equity" 
                                  stroke="#3b82f6" 
                                  strokeWidth={2}
                                  fillOpacity={1}
                                  fill="url(#portfolioGradient)" 
                                />
                              </AreaChart>
                            </ResponsiveContainer>
            </div>

                          {/* Kar/Zarar Analizi - Hisse, Kripto, Opsiyon */}
                          {(() => {
                            // Hisse kar/zarar hesaplama
                            const stockPnL = positions.reduce((sum: number, pos: any) => {
                              const unrealizedPL = parseFloat(pos.unrealized_pl || '0');
                              return sum + unrealizedPL;
                            }, 0);
                            
                            // Kripto kar/zarar hesaplama
                            const cryptoPnL = cryptoPositions.reduce((sum: number, pos: any) => {
                              const unrealizedPL = parseFloat(pos.unrealized_pl || '0');
                              return sum + unrealizedPL;
                            }, 0);
                            
                            // Opsiyon kar/zarar hesaplama
                            const optionsPnL = optionsPositions.reduce((sum: number, pos: any) => {
                              const unrealizedPL = parseFloat(pos.unrealized_pl || '0');
                              return sum + unrealizedPL;
                            }, 0);
                            
                            const totalPnL = stockPnL + cryptoPnL + optionsPnL;
                            
                            // Geçmiş verilerden kar/zarar trendi hesapla
                            const pnlHistory = (Array.isArray(portfolioHistory) ? portfolioHistory : []).map((item: any, index: number) => {
                              if (!item || index === 0) {
                                return { 
                                  ...(item || {}), 
                                  stockPnL: 0, 
                                  cryptoPnL: 0, 
                                  optionsPnL: 0, 
                                  totalPnL: 0,
                                  timestamp: item?.timestamp || new Date().toISOString(),
                                  equity: item?.equity || '0'
                                };
                              }
                              // Basit bir tahmin (gerçek veri yoksa)
                              const prevItem = Array.isArray(portfolioHistory) ? portfolioHistory[index - 1] : null;
                              if (!prevItem) {
                                return {
                                  ...(item || {}),
                                  stockPnL: 0,
                                  cryptoPnL: 0,
                                  optionsPnL: 0,
                                  totalPnL: 0,
                                  timestamp: item?.timestamp || new Date().toISOString(),
                                  equity: item?.equity || '0'
                                };
                              }
                              const equityChange = (parseFloat(item?.equity || '0') - parseFloat(prevItem?.equity || '0'));
                              return {
                                ...(item || {}),
                                stockPnL: equityChange * 0.6, // Tahmini dağılım
                                cryptoPnL: equityChange * 0.25,
                                optionsPnL: equityChange * 0.15,
                                totalPnL: equityChange,
                                timestamp: item?.timestamp || new Date().toISOString(),
                                equity: item?.equity || '0'
                              };
                            }).filter((item: any) => {
                              if (!item || !item.timestamp) return false;
                              try {
                                const itemDate = new Date(item.timestamp);
                                const now = new Date();
                                const cutoffDate = new Date();
                                if (portfolioTimeRange === '1d') cutoffDate.setDate(now.getDate() - 1);
                                else if (portfolioTimeRange === '7d') cutoffDate.setDate(now.getDate() - 7);
                                else if (portfolioTimeRange === '30d') cutoffDate.setDate(now.getDate() - 30);
                                else if (portfolioTimeRange === '90d') cutoffDate.setDate(now.getDate() - 90);
                                else cutoffDate.setFullYear(now.getFullYear() - 1);
                                return itemDate >= cutoffDate;
                              } catch (error) {
                                return false;
                              }
                            });
                            
                            return (
                              <div className="space-y-4 mb-6">
                                {/* Kar/Zarar Özeti */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Hisse Kar/Zarar</p>
                                    <p className={`text-lg font-bold ${stockPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                      {stockPnL >= 0 ? '+' : ''}${stockPnL.toFixed(2)}
                                    </p>
                                  </div>
                                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Kripto Kar/Zarar</p>
                                    <p className={`text-lg font-bold ${cryptoPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                      {cryptoPnL >= 0 ? '+' : ''}${cryptoPnL.toFixed(2)}
                                    </p>
                                  </div>
                                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Opsiyon Kar/Zarar</p>
                                    <p className={`text-lg font-bold ${optionsPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                      {optionsPnL >= 0 ? '+' : ''}${optionsPnL.toFixed(2)}
                                    </p>
                                  </div>
                                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Toplam Kar/Zarar</p>
                                    <p className={`text-lg font-bold ${totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                      {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                                    </p>
                                  </div>
                                </div>

                                {/* Kar/Zarar Trend Grafiği */}
                                <div className="h-48">
                                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">Kar/Zarar Trendi</h3>
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={pnlHistory}>
                                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                                      <XAxis 
                                        dataKey="timestamp" 
                                        tickFormatter={(value) => {
                                          const date = new Date(value);
                                          return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
                                        }}
                                        stroke="#6b7280"
                                        className="dark:stroke-gray-400"
                                      />
                                      <YAxis 
                                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                        stroke="#6b7280"
                                        className="dark:stroke-gray-400"
                                      />
                                      <Tooltip 
                                        contentStyle={{ 
                                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                          border: '1px solid #e5e7eb',
                                          borderRadius: '8px'
                                        }}
                                        formatter={(value: any, name: string) => {
                                          const formatted = `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                          const labels: Record<string, string> = {
                                            stockPnL: 'Hisse',
                                            cryptoPnL: 'Kripto',
                                            optionsPnL: 'Opsiyon',
                                            totalPnL: 'Toplam'
                                          };
                                          return [formatted, labels[name] || name];
                                        }}
                                        labelFormatter={(label) => {
                                          const date = new Date(label);
                                          return date.toLocaleString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
                                        }}
                                      />
                                      <Legend />
                                      <Line 
                                        type="monotone" 
                                        dataKey="stockPnL" 
                                        stroke="#3b82f6" 
                                        strokeWidth={2}
                                        name="Hisse"
                                        dot={false}
                                      />
                                      <Line 
                                        type="monotone" 
                                        dataKey="cryptoPnL" 
                                        stroke="#eab308" 
                                        strokeWidth={2}
                                        name="Kripto"
                                        dot={false}
                                      />
                                      <Line 
                                        type="monotone" 
                                        dataKey="optionsPnL" 
                                        stroke="#a855f7" 
                                        strokeWidth={2}
                                        name="Opsiyon"
                                        dot={false}
                                      />
                                      <Line 
                                        type="monotone" 
                                        dataKey="totalPnL" 
                                        stroke="#6b7280" 
                                        strokeWidth={3}
                                        name="Toplam"
                                        dot={false}
                                        strokeDasharray="5 5"
                                      />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>
                            );
                          })()}

                          {/* İşlem Geçmişi */}
                          {(() => {
                            // Borsa işlemleri (us_equity)
                            const stockOrders = (orders || [])
                              .filter((o: any) => 
                                (o.status === 'filled' || o.status === 'partially_filled') &&
                                o.asset_class === 'us_equity'
                              )
                              .map((order: any) => ({
                                id: order.id,
                                type: 'Borsa',
                                symbol: order.symbol,
                                side: order.side,
                                qty: parseFloat(order.filled_qty || order.qty || '0'),
                                price: parseFloat(order.filled_avg_price || order.limit_price || '0'),
                                total: parseFloat(order.filled_qty || order.qty || '0') * parseFloat(order.filled_avg_price || order.limit_price || '0'),
                                timestamp: order.filled_at || order.created_at,
                                status: order.status,
                              }))
                              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                            // Kripto işlemleri
                            const cryptoOrders = (orders || [])
                              .filter((o: any) => 
                                (o.status === 'filled' || o.status === 'partially_filled') &&
                                o.asset_class === 'crypto'
                              )
                              .map((order: any) => ({
                                id: order.id,
                                type: 'Kripto',
                                symbol: order.symbol,
                                side: order.side,
                                qty: parseFloat(order.filled_qty || order.qty || '0'),
                                price: parseFloat(order.filled_avg_price || order.limit_price || '0'),
                                total: parseFloat(order.filled_qty || order.qty || '0') * parseFloat(order.filled_avg_price || order.limit_price || '0'),
                                timestamp: order.filled_at || order.created_at,
                                status: order.status,
                              }))
                              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                            // Opsiyon işlemleri
                            const optionsOrders = (orders || [])
                              .filter((o: any) => 
                                (o.status === 'filled' || o.status === 'partially_filled') &&
                                o.asset_class === 'option'
                              )
                              .map((order: any) => ({
                                id: order.id,
                                type: 'Opsiyon',
                                symbol: order.symbol,
                                side: order.side,
                                qty: parseFloat(order.filled_qty || order.qty || '0'),
                                price: parseFloat(order.filled_avg_price || order.limit_price || '0'),
                                total: parseFloat(order.filled_qty || order.qty || '0') * parseFloat(order.filled_avg_price || order.limit_price || '0'),
                                timestamp: order.filled_at || order.created_at,
                                status: order.status,
                              }))
                              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                            const allTrades = [...stockOrders, ...cryptoOrders, ...optionsOrders]
                              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                              .slice(0, 10);

                            return allTrades.length > 0 ? (
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                  <Activity className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                  Son Al/Sat İşlemleri
                                </h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                  {allTrades.map((trade: any, index: number) => (
        <motion.div
                                      key={trade.id || index}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                          trade.side === 'buy'
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                            : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                        }`}>
                                          {trade.side === 'buy' ? (
                                            <TrendingUp className="w-5 h-5" />
                                          ) : (
                                            <TrendingDown className="w-5 h-5" />
                                          )}
              </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                              {trade.symbol}
                                            </p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                              trade.type === 'Borsa'
                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                : trade.type === 'Kripto'
                                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                                                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                            }`}>
                                              {trade.type}
                        </span>
                      </div>
                                          <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {trade.side === 'buy' ? 'Alım' : 'Satım'} • {trade.qty.toFixed(2)} adet • ${trade.price.toFixed(2)}
                                            {trade.timestamp && (
                                              <span className="ml-2">
                                                • {new Date(trade.timestamp).toLocaleDateString('tr-TR', {
                                                  day: '2-digit',
                                                  month: '2-digit',
                                                  hour: '2-digit',
                                                  minute: '2-digit'
                                                })}
                </span>
              )}
                                          </p>
            </div>
                                      </div>
                                      <div className="text-right ml-4 flex-shrink-0">
                                        <p className={`font-bold text-sm ${
                                          trade.side === 'buy'
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                        }`}>
                                          ${trade.total.toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                          })}
                                        </p>
                                        {trade.status === 'partially_filled' && (
                                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Kısmen
                                          </p>
                        )}
                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Henüz al/sat işlemi bulunmuyor</p>
                              </div>
                            );
                          })()}
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-64">
                          <div className="text-center">
                            <BarChart3 className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-300">Portföy geçmişi yükleniyor...</p>
                          </div>
              </div>
            )}
                      </div>
                    </div>

                    {/* Son İşlemler Widget */}
                    <div key="transactions" className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 h-full flex flex-col overflow-hidden">
                      <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <Activity className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                          Son İşlemler
                        </h2>
                        <div className="drag-handle cursor-move p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" onClick={(e) => e.stopPropagation()}>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-h-0 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                      {(() => {
                        // Mambu işlemlerini formatla
                        const formattedMambuTransactions = (mambuTransactions || []).map((tx: any) => ({
                          id: tx.id || `mambu-${Date.now()}-${Math.random()}`,
                          source: 'Mambu',
                          type: tx.type,
                          description: tx.description || tx.type || 'İşlem',
                          amount: parseFloat(tx.amount || tx.value || '0'),
                          timestamp: tx.timestamp ? new Date(tx.timestamp).getTime() : 0,
                          date: tx.timestamp ? new Date(tx.timestamp) : null,
                          balance: tx.balance,
                          isCredit: tx.type === 'DEPOSIT' || tx.type === 'CREDIT',
                        }));

                        // Alpaca işlemlerini formatla (tüm order'lar - silinmeden gösterilsin)
                        const formattedAlpacaOrders = (orders || [])
                          .map((order: any) => {
                            const qty = parseFloat(order.filled_qty || order.qty || '0');
                            const price = parseFloat(order.filled_avg_price || order.limit_price || order.stop_price || '0');
                            const notional = parseFloat(order.notional || '0');
                            const totalValue = qty > 0 ? qty * price : notional;
                            
                            // Timestamp hesapla - önce filled_at, sonra created_at, son olarak updated_at
                            let timestamp = 0;
                            let date = null;
                            
                            if (order.filled_at) {
                              date = new Date(order.filled_at);
                              timestamp = date.getTime();
                            } else if (order.created_at) {
                              date = new Date(order.created_at);
                              timestamp = date.getTime();
                            } else if (order.updated_at) {
                              date = new Date(order.updated_at);
                              timestamp = date.getTime();
                            } else {
                              // Eğer hiç tarih yoksa, şu anki zamanı kullan (en sona eklenir)
                              date = new Date();
                              timestamp = date.getTime();
                            }
                            
                            return {
                              id: order.id || `alpaca-${Date.now()}-${Math.random()}`,
                              source: 'Borsa',
                              type: order.side === 'buy' ? 'BUY' : 'SELL',
                              description: `${order.side === 'buy' ? 'Alım' : 'Satım'} - ${order.symbol || 'N/A'}`,
                              amount: totalValue,
                              timestamp: timestamp,
                              date: date,
                              symbol: order.symbol,
                              qty: qty,
                              price: price,
                              status: order.status,
                              isCredit: order.side === 'buy',
                            };
                          })
                          .filter(order => order.symbol); // Sembolü olmayan order'ları filtrele

                        // Alpaca pozisyonlarını formatla (hisse senetleri)
                        // Pozisyonları orders ile eşleştirerek tarih bilgisini bul
                        const formattedAlpacaPositions = (positions || [])
                          .filter((pos: any) => pos.asset_class === 'us_equity' && parseFloat(pos.qty || '0') > 0)
                          .map((pos: any) => {
                            const qty = parseFloat(pos.qty || '0');
                            const costBasis = parseFloat(pos.cost_basis || '0');
                            const avgPrice = qty > 0 ? costBasis / qty : 0;
                            
                            // Aynı sembol için en son filled order'ı bul (pozisyon açıldığında)
                            const relatedOrder = (orders || [])
                              .filter((order: any) => 
                                order.symbol === pos.symbol && 
                                order.side === 'buy' &&
                                (order.status === 'filled' || order.status === 'partially_filled')
                              )
                              .sort((a: any, b: any) => {
                                const aTime = a.filled_at ? new Date(a.filled_at).getTime() : 0;
                                const bTime = b.filled_at ? new Date(b.filled_at).getTime() : 0;
                                return bTime - aTime;
                              })[0];
                            
                            // Order'dan tarih bilgisini al, yoksa pozisyon güncellenme tarihini kullan
                            const positionDate = relatedOrder?.filled_at 
                              ? new Date(relatedOrder.filled_at)
                              : (relatedOrder?.created_at 
                                ? new Date(relatedOrder.created_at)
                                : new Date());
                            
                            return {
                              id: `position-${pos.symbol}-${positionDate.getTime()}`,
                              source: 'Borsa',
                              type: 'BUY',
                              description: `Pozisyon Açıldı - ${pos.symbol}`,
                              amount: costBasis,
                              timestamp: positionDate.getTime(),
                              date: positionDate,
                              symbol: pos.symbol,
                              qty: qty,
                              price: avgPrice,
                              status: 'active',
                              isCredit: true,
                              isPosition: true,
                            };
                          });

                        // Pozisyonları unique hale getir (aynı sembol için sadece en son pozisyon açma işlemi)
                        const uniquePositions = formattedAlpacaPositions.reduce((acc: any[], pos: any) => {
                          const existing = acc.find(p => p.symbol === pos.symbol);
                          if (!existing || pos.timestamp > existing.timestamp) {
                            // Yeni pozisyon veya daha yeni tarihli pozisyon
                            return [...acc.filter(p => p.symbol !== pos.symbol), pos];
                          }
                          return acc;
                        }, []);

                        // Tüm işlemleri birleştir ve tarihe göre sırala (tüm işlemler gösterilsin)
                        const allTransactions = [...formattedMambuTransactions, ...formattedAlpacaOrders, ...uniquePositions]
                          .filter(tx => tx && (tx.timestamp > 0 || tx.date))
                          .sort((a, b) => {
                            const aTime = a.timestamp || (a.date ? a.date.getTime() : 0);
                            const bTime = b.timestamp || (b.date ? b.date.getTime() : 0);
                            return bTime - aTime;
                          });

                        // Debug: Console'da işlem sayılarını göster
                        if (typeof window !== 'undefined' && allTransactions.length === 0) {
                          console.log('Son İşlemler Debug:', {
                            mambuCount: formattedMambuTransactions.length,
                            ordersCount: formattedAlpacaOrders.length,
                            positionsCount: uniquePositions.length,
                            totalOrders: (orders || []).length,
                            totalPositions: (positions || []).length,
                          });
                        }

                        return allTransactions.length > 0 ? (
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {allTransactions.map((transaction: any, index: number) => {
                              const isExpanded = expandedTransactionId === transaction.id;
                  return (
                              <div key={transaction.id} className="w-full">
                              <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + index * 0.05 }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setExpandedTransactionId(prev => prev === transaction.id ? null : transaction.id);
                                }}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer w-full"
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    transaction.isCredit
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                      : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                  }`}>
                                    {transaction.isCredit ? (
                                      <ArrowDownRight className="w-5 h-5" />
                                    ) : (
                                      <ArrowUpRight className="w-5 h-5" />
                                    )}
                      </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                                        {transaction.description}
                                      </p>
                                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                                        transaction.source === 'Borsa'
                                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                      }`}>
                                        {transaction.source}
                                      </span>
                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      {transaction.date ? transaction.date.toLocaleString('tr-TR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      }) : 'Tarih yok'}
                                      {transaction.symbol && (
                                        <span className="ml-2 text-gray-500">• {transaction.symbol}</span>
                                      )}
                                      {transaction.qty && transaction.qty > 0 && (
                                        <span className="ml-2 text-gray-500">• {transaction.qty} adet</span>
                                      )}
                                      {transaction.price && transaction.price > 0 && (
                                        <span className="ml-2 text-gray-500">• ${transaction.price.toFixed(2)}/adet</span>
                                      )}
                          </p>
                        </div>
                      </div>
                                <div className="text-right ml-4 flex-shrink-0 flex flex-col items-end gap-1">
                                  <p className={`font-bold text-sm ${
                                    transaction.isCredit
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-red-600 dark:text-red-400'
                                  }`}>
                                    {transaction.isCredit ? '+' : '-'}
                                    ${transaction.amount.toLocaleString('en-US', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    })}
                                  </p>
                                  {transaction.balance !== undefined && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Bakiye: ${parseFloat(transaction.balance).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                      })}
                                    </p>
                                  )}
                                  {transaction.status && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {transaction.status === 'filled' ? 'Tamamlandı' :
                                       transaction.status === 'partially_filled' ? 'Kısmen' :
                                       transaction.status === 'canceled' ? 'İptal' :
                                       transaction.status === 'rejected' ? 'Reddedildi' : transaction.status}
                                    </p>
                                  )}
                                  <div className="mt-1">
                                    {isExpanded ? (
                                      <ChevronUp className="w-4 h-4 text-gray-400" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                                </div>
                              </motion.div>
                              
                              {/* Expandable Detail Section */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="mt-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                                  >
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">İşlem Tipi</p>
                                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                        {transaction.type === 'BUY' ? 'Alım' : transaction.type === 'SELL' ? 'Satım' : transaction.type}
                                      </p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Kaynak</p>
                                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                        {transaction.source}
                                      </p>
                                    </div>
                                    {transaction.symbol && (
                                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Sembol</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                          {transaction.symbol}
                                        </p>
                                      </div>
                                    )}
                                    {transaction.qty && transaction.qty > 0 && (
                                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Miktar</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                          {transaction.qty.toLocaleString('tr-TR')} adet
                                        </p>
                      </div>
                                    )}
                                    {transaction.price && transaction.price > 0 && (
                                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Alım Fiyatı</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                          ${transaction.price.toFixed(2)}/adet
                                        </p>
                    </div>
                                    )}
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Toplam Tutar</p>
                                      <p className={`text-sm font-bold ${
                                        transaction.isCredit
                                          ? 'text-green-600 dark:text-green-400'
                                          : 'text-red-600 dark:text-red-400'
                                      }`}>
                                        {transaction.isCredit ? '+' : '-'}
                                        ${transaction.amount.toLocaleString('en-US', {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2
                                        })}
                                      </p>
              </div>
                                    {transaction.date && (
                                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tarih ve Saat</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                          {transaction.date.toLocaleString('tr-TR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit'
                                          })}
                                        </p>
              </div>
            )}
                                    {transaction.status && (
                                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Durum</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                          {transaction.status === 'filled' ? 'Tamamlandı' : 
                                           transaction.status === 'partially_filled' ? 'Kısmen Tamamlandı' :
                                           transaction.status === 'active' ? 'Aktif' :
                                           transaction.status === 'canceled' ? 'İptal Edildi' :
                                           transaction.status === 'rejected' ? 'Reddedildi' :
                                           transaction.status}
                                        </p>
          </div>
                                    )}
                                  </div>
                                  
                                  {/* Ek Bilgiler */}
                                  {transaction.balance !== undefined && (
                                    <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                                      <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">İşlem Sonrası Bakiye</p>
                                      <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                                        ${parseFloat(transaction.balance).toLocaleString('en-US', {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2
                                        })}
                                      </p>
                </div>
              )}

                                  {transaction.isPosition && (
                                    <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                                      <p className="text-xs text-yellow-600 dark:text-yellow-400">
                                        Bu bir aktif pozisyon kaydıdır. Pozisyon açıldığında oluşturulmuştur.
                                      </p>
            </div>
          )}
        </motion.div>
                                )}
                              </AnimatePresence>
                              </div>
                            );
                            })}
              </div>
            ) : (
                          <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                              <Receipt className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                              <p className="text-gray-600 dark:text-gray-300">Henüz işlem bulunmuyor</p>
              </div>
          </div>
                        );
                      })()}
                      </div>
                    </div>
                    </GridLayout>
                  </div>

                  {/* Önemli Bildirimler ve Uyarılar */}
                  {(() => {
                    const notifications = [];
                    
                    // Düşük bakiye uyarısı
                    if (portfolioData.cash < 100) {
                      notifications.push({
                        type: 'warning',
                        icon: AlertCircle,
                        title: 'Düşük Bakiye',
                        message: 'Nakit bakiyeniz düşük. Para yüklemeyi düşünün.',
                        color: 'yellow'
                      });
                    }
                    
                    // KYC durumu kontrolü
                    if (kycVerified === false) {
                      notifications.push({
                        type: 'info',
                        icon: Shield,
                        title: 'KYC Doğrulaması',
                        message: 'Hesabınızı tam olarak kullanmak için KYC doğrulaması yapın.',
                        color: 'blue',
                        action: () => setKycModalOpen(true)
                      });
                    }
                    
                    // Yatırım hesabı kontrolü
                    if (alpacaAccountExists === false && !user?.email?.toLowerCase().includes('demo')) {
                      notifications.push({
                        type: 'info',
                        icon: Building2,
                        title: 'Yatırım Hesabı',
                        message: 'Yatırım işlemleri için hesap oluşturun.',
                        color: 'blue'
                      });
                    }
                    
                    return notifications.length > 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65 }}
                        className="mb-8"
                      >
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                          <Info className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                          Önemli Bildirimler
                        </h2>
                        <div className="space-y-3">
                          {notifications.map((notif, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.7 + index * 0.1 }}
                              className={`p-4 rounded-xl border-l-4 ${
                                notif.color === 'yellow' 
                                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 dark:border-yellow-600'
                                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600'
                              } ${notif.action ? 'cursor-pointer hover:opacity-80' : ''}`}
                              onClick={notif.action}
                            >
                              <div className="flex items-start gap-3">
                                <notif.icon className={`w-5 h-5 mt-0.5 ${
                                  notif.color === 'yellow'
                                    ? 'text-yellow-600 dark:text-yellow-400'
                                    : 'text-blue-600 dark:text-blue-400'
                                }`} />
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                    {notif.title}
                                  </h3>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {notif.message}
                                  </p>
          </div>
                                {notif.action && (
                                  <ArrowRight className="w-5 h-5 text-gray-400" />
              )}
            </div>
        </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ) : null;
                  })()}
                </>
              )}
            </>
          )}
          </div>
      </div>
    </div>

    {/* Modals */}
      {/* Kart Başvuru Modal */}
      {cardApplicationModalOpen && (
        <CardApplicationModal
          user={user}
          onClose={() => setCardApplicationModalOpen(false)}
          onSuccess={() => {
            setCardApplicationModalOpen(false);
            // Kartları ve başvuruları yeniden yükle
            if (user?.email) {
              fetch(`/api/mambu/cards?email=${encodeURIComponent(user.email)}`)
                .then(res => res.json())
                .then(data => {
                  if (data.success && data.cards) {
                    setMambuCards(data.cards);
                  }
                })
                .catch(console.error);
              fetchCardApplications();
            }
          }}
        />
      )}

      {/* Kart Başvuru Takip Modal */}
      {cardApplicationTrackingModalOpen && (
        <CardApplicationTrackingModal
          user={user}
          applications={cardApplications}
          loading={cardApplicationsLoading}
          onClose={() => setCardApplicationTrackingModalOpen(false)}
          onRefresh={fetchCardApplications}
        />
      )}

      {/* Para Yükleme Modal */}
      <DepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        user={user}
        onSuccess={() => {
          // Mambu hesabını yeniden yükle
          if (user?.email) {
            fetch(`/api/mambu/account?email=${encodeURIComponent(user.email)}`)
              .then(res => res.json())
              .then(data => {
                if (data.success && data.account) {
                  setMambuAccount(data.account);
                }
              })
              .catch(console.error);
          }
        }}
      />

      {/* Hesap Açma Modal */}
      {mambuAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Wallet className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                Yeni Hesap Aç
              </h2>
              <button
                onClick={() => setMambuAccountModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!user?.email) {
                  alert('Email bulunamadı');
                  return;
                }

                setCreatingAccount(true);
                try {
                  const response = await fetch('/api/mambu/account/create', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      email: user.email,
                      productTypeKey: mambuAccountFormData.productTypeKey,
                      accountName: mambuAccountFormData.accountName,
                      currencyCode: mambuAccountFormData.currencyCode,
                      notes: mambuAccountFormData.notes,
                    }),
                  });

                  const data = await response.json();

                  if (data.success) {
                    alert('Hesap başarıyla oluşturuldu!');
                    setMambuAccountModalOpen(false);
                    // Verileri yenile
                    fetchAlpacaData();
                  } else {
                    alert(data.error || 'Hesap oluşturulamadı');
                  }
                } catch (error: any) {
                  console.error('Hesap oluşturma hatası:', error);
                  alert('Hesap oluşturulurken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
                } finally {
                  setCreatingAccount(false);
                }
              }}
              className="space-y-4"
            >
              {/* Hesap Tipi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hesap Tipi
                </label>
                <select
                  value={mambuAccountFormData.productTypeKey}
                  onChange={(e) => setMambuAccountFormData({ ...mambuAccountFormData, productTypeKey: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="DEFAULT_SAVINGS">Tasarruf Hesabı</option>
                  <option value="DEFAULT_CHECKING">Vadesiz Hesap</option>
                  <option value="DEFAULT_DEPOSIT">Mevduat Hesabı</option>
                </select>
              </div>

              {/* Para Birimi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Para Birimi
                </label>
                <select
                  value={mambuAccountFormData.currencyCode}
                  onChange={(e) => setMambuAccountFormData({ ...mambuAccountFormData, currencyCode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="USD">USD - Amerikan Doları</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - İngiliz Sterlini</option>
                  <option value="TRY">TRY - Türk Lirası</option>
                </select>
              </div>

              {/* Hesap Adı */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hesap Adı
                </label>
                <input
                  type="text"
                  value={mambuAccountFormData.accountName}
                  onChange={(e) => setMambuAccountFormData({ ...mambuAccountFormData, accountName: e.target.value })}
                  placeholder="Örn: Ana Hesap, Tasarruf Hesabı"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Notlar (Opsiyonel) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notlar (Opsiyonel)
                </label>
                <textarea
                  value={mambuAccountFormData.notes}
                  onChange={(e) => setMambuAccountFormData({ ...mambuAccountFormData, notes: e.target.value })}
                  placeholder="Hesap hakkında notlar..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Butonlar */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setMambuAccountModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={creatingAccount}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creatingAccount ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Hesap Aç
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Success Toast Notification for Dashboard Trade */}
      <AnimatePresence>
        {showTradeSuccessToast && (
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
                  {tradeFormType === "buy" ? "Alım emri" : "Satım emri"} başarıyla gönderildi.
                </p>
              </div>
              <button
                onClick={() => setShowTradeSuccessToast(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TradeModal
        isOpen={tradeModalOpen}
        onClose={() => {
          setTradeModalOpen(false);
          setSelectedSymbol(null);
        }}
        type={tradeModalType}
        symbol={selectedSymbol || undefined}
        accountData={accountData}
        positions={positions}
        cryptoPositions={cryptoPositions}
        optionsPositions={optionsPositions}
        onSuccess={() => {
          fetchAlpacaData();
        }}
      />
      <TransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        transferType="mambu-to-mambu"
      />
      
      <TransferModal
        isOpen={transferToAlpacaModalOpen}
        onClose={() => setTransferToAlpacaModalOpen(false)}
        transferType="mambu-to-alpaca"
      />
      
      <TransferModal
        isOpen={transferFromAlpacaModalOpen}
        onClose={() => setTransferFromAlpacaModalOpen(false)}
        transferType="alpaca-to-mambu"
      />
      
      {/* Crypto Modal */}
      <TradeModal
        isOpen={cryptoModalOpen}
        onClose={() => {
          setCryptoModalOpen(false);
          setSelectedCryptoSymbol(null);
          setCryptoModalType("buy");
        }}
        type={cryptoModalType}
        symbol={selectedCryptoSymbol || ""}
        assetType="crypto"
        accountData={accountData}
        positions={positions}
        cryptoPositions={cryptoPositions}
        optionsPositions={optionsPositions}
        onSuccess={() => {
          fetchAlpacaData();
        }}
      />

      {/* Options Modal */}
      <OptionsModal
        isOpen={optionsModalOpen}
        existingOptionsPositions={optionsPositions}
        onClose={() => {
          setOptionsModalOpen(false);
          setSelectedOptionsSymbol(null);
          setOptionsModalType("buy");
        }}
        type={optionsModalType}
        accountId={accountData?.id || accountData?.account_number || null}
        accountData={accountData}
        onSuccess={() => {
          fetchAlpacaData();
        }}
      />

      {/* KYC Modal */}
      <KYCModal
        isOpen={kycModalOpen && !isDemoAccount}
        onClose={() => {
          // Demo hesap için veya KYC doğrulanmışsa kapatmaya izin ver
          const isDemo = user?.email?.toLowerCase().includes('demo') || 
                        user?.email?.toLowerCase() === 'demo@datpay.com';
          if (!isDemo && kycVerified === false) {
            return;
          }
          setKycModalOpen(false);
        }}
        userEmail={user?.email || ""}
        onComplete={() => {
          setKycVerified(true);
          setKycModalOpen(false);
        }}
      />


      {/* Sembol Detay Modal */}
      {symbolDetailModalOpen && selectedSymbolDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 p-6 text-white">
              <button
                onClick={() => {
                  setSymbolDetailModalOpen(false);
                  setSelectedSymbolDetail(null);
                  setSymbolDetailData(null);
                  setSymbolDetailChartData([]);
                  setSymbolDetailLivePrice(null);
                  setPreviousLivePrice(null);
                  setPriceChangeDirection(null);
                  setSymbolDetailChartPeriod('1W');
                  setSymbolDetailChartType('line');
                  setShowTradeForm(false);
                  setTradeStatus('idle');
                  setTradeErrorMessage('');
                  setTradeQuantity('');
                  setTradeLimitPrice('');
                }}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="pr-12 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{selectedSymbolDetail.symbol} Fiyat Grafiği</h2>
                  <p className="text-white/90">{selectedSymbolDetail.name}</p>
                </div>
                {symbolDetailLivePrice !== null && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-lg font-bold">Canlı: ${symbolDetailLivePrice.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {symbolDetailData ? (
                <>
                  {/* Fiyat Bilgileri */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className={`rounded-xl p-4 border relative transition-all duration-300 ${
                      priceChangeDirection === 'up' 
                        ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-300 shadow-lg shadow-green-200' 
                        : priceChangeDirection === 'down'
                        ? 'bg-gradient-to-br from-red-100 to-rose-100 border-red-300 shadow-lg shadow-red-200'
                        : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                    }`}>
                      <p className="text-sm text-gray-600 mb-1">Mevcut Fiyat</p>
                      <div className="flex items-center gap-2">
                        <motion.p 
                          key={symbolDetailLivePrice !== null ? symbolDetailLivePrice : symbolDetailData.price}
                          initial={{ scale: 1, opacity: 1 }}
                          animate={{ 
                            scale: priceChangeDirection ? [1, 1.1, 1] : 1,
                            opacity: priceChangeDirection ? [1, 0.7, 1] : 1
                          }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className={`text-2xl font-bold transition-colors duration-300 ${
                            priceChangeDirection === 'up' 
                              ? 'text-green-600' 
                              : priceChangeDirection === 'down'
                              ? 'text-red-600'
                              : 'text-gray-900'
                          }`}
                        >
                          ${(symbolDetailLivePrice !== null ? symbolDetailLivePrice : symbolDetailData.price).toFixed(2)}
                        </motion.p>
                        {symbolDetailLivePrice !== null && (
                          <motion.div 
                            className={`w-2 h-2 rounded-full ${
                              priceChangeDirection === 'up' 
                                ? 'bg-green-500' 
                                : priceChangeDirection === 'down'
                                ? 'bg-red-500'
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
                        )}
                        {priceChangeDirection && (
                          <motion.span
                            key={priceChangeDirection}
                            initial={{ opacity: 0, scale: 0.5, y: -5 }}
                            animate={{ 
                              opacity: 1, 
                              scale: [0.5, 1.2, 1],
                              y: 0
                            }}
                            exit={{ opacity: 0, scale: 0.5, y: 5 }}
                            transition={{ 
                              duration: 0.4,
                              ease: "easeOut"
                            }}
                            className={`text-xl font-bold ${
                              priceChangeDirection === 'up' ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {priceChangeDirection === 'up' ? '↑' : '↓'}
                          </motion.span>
                        )}
                      </div>
                    </div>
                    <div className={`rounded-xl p-4 border ${
                      symbolDetailData.change >= 0 
                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
                        : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'
                    }`}>
                      <p className="text-sm text-gray-600 mb-1">Değişim</p>
                      <p className={`text-2xl font-bold ${
                        symbolDetailData.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {symbolDetailData.change >= 0 ? '+' : ''}{symbolDetailData.change.toFixed(2)} ({symbolDetailData.changePercent >= 0 ? '+' : ''}{symbolDetailData.changePercent.toFixed(2)}%)
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">Yüksek</p>
                      <p className="text-2xl font-bold text-gray-900">${symbolDetailData.high.toFixed(2)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                      <p className="text-sm text-gray-600 mb-1">Düşük</p>
                      <p className="text-2xl font-bold text-gray-900">${symbolDetailData.low.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Zaman Aralığı Butonları ve Canlı Mod */}
                  <div className="mb-4 space-y-3">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex gap-2 flex-wrap">
                        {(['1W', '1M', '3M', '6M', '1Y', 'ALL'] as const).map((period) => (
                          <motion.button
                            key={period}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setIsManualPeriodSelection(true);
                              setSymbolDetailChartPeriod(period);
                            }}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                              symbolDetailChartPeriod === period
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                          >
                            {period === '1W' ? '1 Hafta' : 
                             period === '1M' ? '1 Ay' :
                             period === '3M' ? '3 Ay' :
                             period === '6M' ? '6 Ay' :
                             period === '1Y' ? '1 Yıl' : 'Tümü'}
                          </motion.button>
                        ))}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setIsManualPeriodSelection(true);
                            setSymbolDetailChartPeriod('LIVE');
                          }}
                          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                            symbolDetailChartPeriod === 'LIVE'
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${symbolDetailChartPeriod === 'LIVE' ? 'bg-white animate-pulse' : 'bg-green-500'}`}></div>
                            Canlı
                          </span>
                        </motion.button>
                      </div>
                      {symbolDetailChartPeriod === 'LIVE' && (
                        <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          5 Dakikalık Canlı Veri
                        </div>
                      )}
                    </div>
                    
                    {/* Grafik Tipi Seçici ve Tools */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 font-medium">Grafik Tipi:</span>
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSymbolDetailChartType('line')}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                              symbolDetailChartType === 'line'
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                          >
                            Çizgi
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSymbolDetailChartType('candlestick')}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                              symbolDetailChartType === 'candlestick'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                          >
                            Mum
                          </motion.button>
                        </div>
                      </div>
                      
                      {/* Chart Tools - Only for candlestick */}
                      {symbolDetailChartType === 'candlestick' && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Zoom Controls */}
                          <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
                            <motion.button
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
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setDrawingTool(drawingTool === 'line' ? null : 'line');
                                setIsDrawing(drawingTool !== 'line');
                              }}
                              className={`p-2 rounded transition-colors ${
                                drawingTool === 'line' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                              title="Çizgi Çiz"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setDrawingTool(drawingTool === 'marker' ? null : 'marker');
                                setIsDrawing(drawingTool !== 'marker');
                              }}
                              className={`p-2 rounded transition-colors ${
                                drawingTool === 'marker' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
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
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setDrawings([]);
                                  setDrawingTool(null);
                                  setIsDrawing(false);
                                }}
                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-colors"
                                title="Çizimleri Temizle"
                              >
                                <X className="w-4 h-4" />
                              </motion.button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grafik */}
                  {symbolDetailChartData.length > 0 ? (
                    <div className="mb-6 bg-gray-50 rounded-xl p-4 relative">
                      <div 
                        className="h-[600px] w-full relative"
                        onMouseDown={(e) => {
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
                        }}
                        onMouseMove={(e) => {
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
                        }}
                        onMouseUp={() => {
                          setIsPanning(false);
                          setPanStart(null);
                          if (isDrawing && drawingTool === 'line' && drawings.length > 0) {
                            const lastDrawing = drawings[drawings.length - 1];
                            if (lastDrawing.type === 'line' && lastDrawing.points.length === 2) {
                              setIsDrawing(false);
                              setDrawingTool(null);
                            }
                          }
                        }}
                        onMouseLeave={() => {
                          setIsPanning(false);
                          setPanStart(null);
                        }}
                        style={{ cursor: isDrawing ? 'crosshair' : isPanning ? 'grabbing' : 'grab' }}
                      >
                        {/* Drawing Overlay */}
                        {drawings.length > 0 && (
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
                        {(() => {
                          // Slice edilmiş veriyi hesapla (zoom için - sadece candlestick için)
                          const startIndex = symbolDetailChartType === 'candlestick' 
                            ? Math.floor((chartZoom.start / 100) * symbolDetailChartData.length)
                            : 0;
                          const endIndex = symbolDetailChartType === 'candlestick'
                            ? Math.ceil((chartZoom.end / 100) * symbolDetailChartData.length)
                            : symbolDetailChartData.length;
                          const slicedData = symbolDetailChartData.slice(startIndex, endIndex);
                          
                          return (
                          <ResponsiveContainer width="100%" height="100%">
                            {symbolDetailChartType === 'line' ? (
                              <LineChart data={symbolDetailChartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                  dataKey="time"
                                  stroke="#6b7280"
                                  fontSize={11}
                                  tick={{ fill: '#6b7280' }}
                                  interval="preserveStartEnd"
                                />
                                <YAxis 
                                  stroke="#6b7280"
                                  fontSize={11}
                                  tick={{ fill: '#6b7280' }}
                                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                  }}
                                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Fiyat']}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="price"
                                  stroke="#3b82f6"
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
                                dataKey="time"
                                stroke="#6b7280"
                                fontSize={10}
                                tick={{ fill: '#6b7280' }}
                                interval={0}
                                tickFormatter={(value: string) => {
                                  // Slice edilmiş veri içinde index bul
                                  const currentIndex = slicedData.findIndex((d: any) => d.time === value);
                                  if (currentIndex === -1) return '';
                                  if (currentIndex === 0) return value; // İlk tick'i göster
                                  
                                  // Önceki entry'nin gününü kontrol et
                                  const prevEntry = slicedData[currentIndex - 1];
                                  if (!prevEntry) return value;
                                  
                                  // Gün numaralarını karşılaştır (örn: "10 Kas" -> "10")
                                  const currentDay = value.match(/^(\d+)/)?.[1];
                                  const prevDay = prevEntry.time?.match(/^(\d+)/)?.[1];
                                  
                                  // Eğer gün değiştiyse göster, değilse boş string
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
                                formatter={(value: any, name: string, props: any) => {
                                  if (props.payload) {
                                    const data = props.payload;
                                    const close = data.close !== undefined ? data.close : data.price;
                                    const open = data.open !== undefined ? data.open : data.price;
                                    const high = data.high !== undefined ? data.high : data.price;
                                    const low = data.low !== undefined ? data.low : data.price;
                                    
                                    // Hesaplamalar
                                    const change = close - open;
                                    const changePercent = open > 0 ? ((change / open) * 100) : 0;
                                    const range = high - low;
                                    const rangePercent = low > 0 ? ((range / low) * 100) : 0;
                                    
                                    // Alım/Satım oranı (basit hesaplama)
                                    const bodySize = Math.abs(close - open);
                                    const totalRange = high - low;
                                    const buyRatio = totalRange > 0 ? ((close > open ? bodySize : 0) / totalRange) * 100 : 50;
                                    const sellRatio = 100 - buyRatio;
                                    
                                    // Derinlik (spread) - tahmini
                                    const spread = range * 0.001; // Varsayılan spread %0.1
                                    
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
                              {/* Candlestick visualization - Using Bar for scale, custom SVG for rendering */}
                              <Bar dataKey="high" fill="transparent" stroke="transparent" />
                              <Bar dataKey="low" fill="transparent" stroke="transparent" />
                              {/* Custom candlestick shapes with proper clipping */}
                              <defs>
                                <clipPath id="chartClip">
                                  <rect x="0" y="0" width="100%" height="100%" />
                                </clipPath>
                              </defs>
                              <g clipPath="url(#chartClip)">
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
                                  
                                  // Calculate positions - using percentage for SVG
                                  // Fixed candle body size (8-10px equivalent) with increased bar spacing
                                  const totalBars = slicedData.length;
                                  
                                  // Increased X padding for better bar spacing (barCategoryGap equivalent)
                                  const xPadding = 15;
                                  const availableWidth = 100 - (xPadding * 2);
                                  
                                  // Increased bar spacing (barGap equivalent)
                                  const barSpacing = availableWidth / totalBars;
                                  // Fixed candle body size: approximately 8-10px equivalent in percentage
                  // For a typical chart width of ~800px, 8-10px = ~1-1.25% of width
                  // We'll use a minimum of 1.2% but scale with available space
                                  const minCandleWidthPercent = 1.2;
                                  const maxCandleWidthPercent = 1.5;
                                  const candleWidthPercent = Math.max(
                                    minCandleWidthPercent,
                                    Math.min(maxCandleWidthPercent, (availableWidth / totalBars) * 0.4)
                                  );
                                  
                                  const xCenter = xPadding + (index + 0.5) * barSpacing;
                                  // Candle width: fixed size (8-10px equivalent) that doesn't scale with screen size
                                  const candleWidth = candleWidthPercent;
                                  
                                  // Y positions - normalized within domain bounds (sliced data için)
                                  const minPrice = Math.min(...slicedData.map((d: any) => (d.low || d.price) || 0));
                                  const maxPrice = Math.max(...slicedData.map((d: any) => (d.high || d.price) || 0));
                                  const priceRange = maxPrice - minPrice || 1;
                                  
                                  // Domain padding for outlier wicks (especially 14 Kas'taki uzun kırmızı fitil)
                                  // Using 5% padding as requested to prevent autoscale issues
                                  const domainMin = minPrice - (priceRange * 0.05);
                                  const domainMax = maxPrice + (priceRange * 0.05);
                                  const domainRange = domainMax - domainMin || 1;
                                  
                                  // Convert price to percentage (inverted Y axis)
                                  // Increased Y padding to prevent overflow
                                  const yPadding = 8;
                                  const availableHeight = 100 - (yPadding * 2);
                                  
                                  // Calculate Y positions with proper scaling
                                  const highY = yPadding + ((domainMax - high) / domainRange) * availableHeight;
                                  const lowY = yPadding + ((domainMax - low) / domainRange) * availableHeight;
                                  const openY = yPadding + ((domainMax - open) / domainRange) * availableHeight;
                                  const closeY = yPadding + ((domainMax - close) / domainRange) * availableHeight;
                                  
                                  const bodyTop = Math.min(openY, closeY);
                                  const bodyBottom = Math.max(openY, closeY);
                                  const bodyHeight = Math.max(bodyBottom - bodyTop, 0.3);
                                  
                                  // Strict clamping to stay within padded bounds
                                  // Additional 2% margin to ensure no overflow
                                  const clampMargin = 2;
                                  const clampedHighY = Math.max(yPadding + clampMargin, Math.min(100 - yPadding - clampMargin, highY));
                                  const clampedLowY = Math.max(yPadding + clampMargin, Math.min(100 - yPadding - clampMargin, lowY));
                                  const clampedBodyTop = Math.max(yPadding + clampMargin, Math.min(100 - yPadding - clampMargin, bodyTop));
                                  const clampedBodyHeight = Math.max(0.3, Math.min(100 - yPadding - clampedBodyTop - clampMargin, bodyHeight));
                                  
                                  return (
                                    <g key={`candle-${index}`}>
                                      {/* High-Low wick - İnce çizgi (strokeWidth küçültüldü) */}
                                      <line
                                        x1={`${xCenter}%`}
                                        x2={`${xCenter}%`}
                                        y1={`${clampedHighY}%`}
                                        y2={`${clampedLowY}%`}
                                        stroke={color}
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                      />
                                      {/* Open-Close body - Kalın ve belirgin */}
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
                          );
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 bg-gray-50 rounded-xl p-8 border border-gray-200">
                      <div className="text-center">
                        <LineChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium mb-2">
                          {symbolDetailChartPeriod === 'LIVE' 
                            ? 'Canlı veri yükleniyor...' 
                            : 'Grafik verisi yükleniyor...'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {symbolDetailChartPeriod === 'LIVE' 
                            ? 'Piyasa açıldığında canlı veriler görüntülenecek' 
                            : 'Lütfen bekleyin'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* İstatistikler */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Açılış</p>
                      <p className="text-lg font-bold text-gray-900">${symbolDetailData.open.toFixed(2)}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Hacim</p>
                      <p className="text-lg font-bold text-gray-900">{symbolDetailData.volume.toLocaleString()}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Son Güncelleme</p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(symbolDetailData.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Al/Sat Butonları */}
                  <div className="flex gap-4 mb-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setTradeFormType('buy');
                        setShowTradeForm(true);
                        setTradeQuantity('');
                        setTradeLimitPrice('');
                        setTradeOrderType('market');
                        setTradeStatus('idle');
                        setTradeErrorMessage('');
                      }}
                      className="flex-1 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
                    >
                      Al
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setTradeFormType('sell');
                        setShowTradeForm(true);
                        setTradeQuantity('');
                        setTradeLimitPrice('');
                        setTradeOrderType('market');
                        setTradeStatus('idle');
                        setTradeErrorMessage('');
                      }}
                      className="flex-1 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 transition-all shadow-lg"
                    >
                      Sat
                    </motion.button>
                  </div>

                  {/* Al/Sat Formu */}
                  {showTradeForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200 mb-4"
                    >
            <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">
                          {tradeFormType === 'buy' ? 'Al' : 'Sat'} - {selectedSymbolDetail.symbol}
                        </h3>
              <button
                          onClick={() => {
                            setShowTradeForm(false);
                            setTradeStatus('idle');
                            setTradeErrorMessage('');
                          }}
                          className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

                      <form onSubmit={(e) => {
                        handleTradeSubmit(
                          e,
                          selectedSymbolDetail,
                          tradeFormType,
                          tradeQuantity,
                          tradeOrderType,
                          tradeLimitPrice
                        );
                      }} className="space-y-4">
                        {/* Miktar */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Miktar
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={tradeQuantity}
                            onChange={(e) => setTradeQuantity(e.target.value)}
                            disabled={tradeStatus === 'loading'}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                            placeholder="0.00"
                          />
          </div>

                        {/* Emir Tipi */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Emir Tipi
                          </label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setTradeOrderType('market');
                                setTradeLimitPrice('');
                              }}
                              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                                tradeOrderType === 'market'
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              Piyasa
                            </button>
                            <button
                              type="button"
                              onClick={() => setTradeOrderType('limit')}
                              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                                tradeOrderType === 'limit'
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              Limit
                            </button>
                          </div>
                        </div>

                        {/* Limit Fiyat (sadece limit emir için) */}
                        {tradeOrderType === 'limit' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Limit Fiyat ($)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={tradeLimitPrice}
                              onChange={(e) => setTradeLimitPrice(e.target.value)}
                              disabled={tradeStatus === 'loading'}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                              placeholder="0.00"
                            />
                          </div>
                        )}

                        {/* Toplam Fiyat */}
                        {tradeQuantity && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Toplam:</span>
                              <span className="text-lg font-bold text-gray-900">
                                $
                                {(
                                  parseFloat(tradeQuantity || '0') * 
                                  (tradeOrderType === 'limit' && tradeLimitPrice
                                    ? parseFloat(tradeLimitPrice)
                                    : symbolDetailLivePrice !== null
                                    ? symbolDetailLivePrice
                                    : symbolDetailData?.price || 0)
                                ).toFixed(2)}
                              </span>
                            </div>
                            {tradeFormType === 'buy' && accountData && (
                              <div className={`mt-2 text-xs ${
                                (parseFloat(tradeQuantity || '0') * 
                                  (tradeOrderType === 'limit' && tradeLimitPrice
                                    ? parseFloat(tradeLimitPrice)
                                    : symbolDetailLivePrice !== null
                                    ? symbolDetailLivePrice
                                    : symbolDetailData?.price || 0)) > 
                                parseFloat(accountData.buying_power || accountData.cash || '0')
                                  ? 'text-red-600'
                                  : 'text-green-600'
                              }`}>
                                {(
                                  (parseFloat(tradeQuantity || '0') * 
                                    (tradeOrderType === 'limit' && tradeLimitPrice
                                      ? parseFloat(tradeLimitPrice)
                                      : symbolDetailLivePrice !== null
                                      ? symbolDetailLivePrice
                                      : symbolDetailData?.price || 0)) > 
                                  parseFloat(accountData.buying_power || accountData.cash || '0')
                                ) ? 'Yetersiz bakiye' : 'Yeterli bakiye'}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Hata/Success Mesajı */}
                        {tradeErrorMessage && (
                          <div className={`p-3 rounded-lg ${
                            tradeStatus === 'error' 
                              ? 'bg-red-50 text-red-700 border border-red-200' 
                              : 'bg-green-50 text-green-700 border border-green-200'
                          }`}>
                            {tradeErrorMessage}
                          </div>
                        )}

                        {/* Submit Butonu */}
                        <button
                          type="submit"
                          disabled={tradeStatus === 'loading' || !tradeQuantity}
                          className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                            tradeFormType === 'buy'
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                              : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {tradeStatus === 'loading' ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              İşlem yapılıyor...
                            </span>
                          ) : tradeStatus === 'success' ? (
                            <span className="flex items-center justify-center gap-2">
                              <CheckCircle className="w-5 h-5" />
                              İşlem başarılı!
                            </span>
                          ) : (
                            `${tradeFormType === 'buy' ? 'Al' : 'Sat'} - ${selectedSymbolDetail.symbol}`
                          )}
                        </button>
                      </form>
                    </motion.div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Veriler yükleniyor...</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Bill Payment Modal - Basit placeholder */}
      {billModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Fatura Öde</h2>
              <button
                onClick={() => setBillModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600">Fatura ödeme özelliği yakında eklenecek.</p>
          </div>
        </div>
      )}

    </main>
  );
}


