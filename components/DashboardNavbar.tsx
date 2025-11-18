"use client";

import { useState, useEffect } from "react";
import { Settings, Wallet, TrendingUp, Coins, LogOut, User, CreditCard, Shield, X, FileText } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import StripeProvider from "./StripeProvider";
import AddCardForm from "./AddCardForm";
import AccountPermissionsModal from "./AccountPermissionsModal";

interface DashboardNavbarProps {
  activeTab?: "nakit" | "borsa" | "kripto" | "opsiyon";
  onTabChange?: (tab: "nakit" | "borsa" | "kripto" | "opsiyon") => void;
}

export default function DashboardNavbar({ activeTab = "borsa", onTabChange }: DashboardNavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const [isCloseAccountModalOpen, setIsCloseAccountModalOpen] = useState(false);
  const [isInvestorInfoModalOpen, setIsInvestorInfoModalOpen] = useState(false);
  const [isSavedCardsModalOpen, setIsSavedCardsModalOpen] = useState(false);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  
  // Yatırımcı bilgileri için state
  const [mambuAccountInfo, setMambuAccountInfo] = useState<any>(null);
  const [alpacaAccountInfo, setAlpacaAccountInfo] = useState<any>(null);
  const [accountInfoLoading, setAccountInfoLoading] = useState(false);
  
  // Hesap kapatma için state
  const [closeAccountStep, setCloseAccountStep] = useState<'info' | 'agreement' | 'confirm'>('info');
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [closeAccountLoading, setCloseAccountLoading] = useState(false);
  
  // KYC için state
  const [kycFiles, setKycFiles] = useState<{
    idFront?: File;
    idBack?: File;
    selfie?: File;
  }>({});
  const [kycUploading, setKycUploading] = useState(false);
  
  // Kart ekleme için state
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [cardAdding, setCardAdding] = useState(false);
  
  // İzinler modal için state
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [alpacaAccountId, setAlpacaAccountId] = useState<string | null>(null);

  const tabs = [
    { id: "nakit" as const, label: "Nakit", icon: Wallet },
    { id: "borsa" as const, label: "Borsa", icon: TrendingUp },
    { id: "opsiyon" as const, label: "Opsiyon", icon: FileText },
    { id: "kripto" as const, label: "Kripto", icon: Coins },
  ];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Yatırımcı bilgileri modal'ı açıldığında hesap bilgilerini çek
  const fetchAccountInfo = async () => {
    if (!user?.email) return;
    
    setAccountInfoLoading(true);
    try {
      // Mambu hesap bilgileri
      const mambuRes = await fetch(`/api/mambu/account?email=${encodeURIComponent(user.email)}`);
      if (mambuRes.ok) {
        const mambuData = await mambuRes.json();
        if (mambuData.success && mambuData.account) {
          setMambuAccountInfo(mambuData.account);
        }
      }

      // Alpaca hesap bilgileri - account ID'yi bul
      let accountId: string | null = null;
      
      // Önce kullanıcının account ID'sini kontrol et
      if (user?.alpacaAccountId) {
        accountId = user.alpacaAccountId;
      } else {
        // Broker API'den hesapları al
        try {
          const accountsRes = await fetch('/api/alpaca/accounts');
          if (accountsRes.ok) {
            const accountsData = await accountsRes.json();
            const accounts = accountsData.accounts || [];
            
            if (accounts.length > 0) {
              const userAccount = accounts.find((acc: any) => 
                acc.email === user?.email || 
                acc.contact?.email === user?.email
              );
              
              accountId = userAccount?.id || 
                          userAccount?.account_number || 
                          accounts[0].id || 
                          'd005ca65-a340-4373-b783-41a0ca3d13f9'; // Demo fallback
            } else {
              accountId = 'd005ca65-a340-4373-b783-41a0ca3d13f9'; // Demo fallback
            }
          }
        } catch (error) {
          console.error('Accounts fetch error:', error);
          accountId = 'd005ca65-a340-4373-b783-41a0ca3d13f9'; // Demo fallback
        }
      }

      // Alpaca hesap bilgileri
      if (accountId) {
        const alpacaRes = await fetch(`/api/alpaca/account?accountId=${accountId}`);
        if (alpacaRes.ok) {
          const alpacaData = await alpacaRes.json();
          if (alpacaData.success && alpacaData.account) {
            setAlpacaAccountInfo(alpacaData.account);
          }
        }
      }
    } catch (error) {
      console.error('Account info fetch error:', error);
    } finally {
      setAccountInfoLoading(false);
    }
  };

  // Modal açıldığında hesap bilgilerini çek
  const handleInvestorInfoOpen = () => {
    setIsInvestorInfoModalOpen(true);
    fetchAccountInfo();
  };

  // Kayıtlı kartları Stripe'dan çek
  const fetchSavedCards = async () => {
    if (!user?.email) return;
    
    setCardsLoading(true);
    try {
      // Email ile kartları çek (API route customer ID'yi otomatik bulur)
      const response = await fetch(`/api/stripe/cards?email=${encodeURIComponent(user.email)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSavedCards(data.cards || []);
        }
      }
    } catch (error) {
      console.error('Cards fetch error:', error);
    } finally {
      setCardsLoading(false);
    }
  };

  // Kayıtlı kartlar modal'ı açıldığında kartları çek
  const handleSavedCardsOpen = () => {
    setIsSavedCardsModalOpen(true);
    fetchSavedCards();
  };

  // Kart ekleme modal'ını aç ve Setup Intent oluştur
  const handleAddCardOpen = async () => {
    if (!user?.email) return;
    
    setIsAddCardModalOpen(true);
    setCardAdding(true);
    
    try {
      // Setup Intent oluştur
      const setupIntentRes = await fetch('/api/stripe/setup-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });

      const setupIntentData = await setupIntentRes.json();
      
      if (!setupIntentData.success) {
        throw new Error(setupIntentData.error || 'Setup Intent oluşturulamadı');
      }

      setClientSecret(setupIntentData.clientSecret);
    } catch (error: any) {
      console.error('Setup Intent error:', error);
      alert('Kart ekleme formu yüklenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
      setIsAddCardModalOpen(false);
    } finally {
      setCardAdding(false);
    }
  };

  // Kart ekleme başarılı olduğunda
  const handleCardAddSuccess = () => {
    setIsAddCardModalOpen(false);
    setClientSecret(null);
    fetchSavedCards();
  };

  // Modal kapandığında state'i temizle
  useEffect(() => {
    if (!isAddCardModalOpen) {
      setClientSecret(null);
    }
  }, [isAddCardModalOpen]);

  // KYC belgesi yükle
  const handleKYCUpload = async (documentType: 'ID_FRONT' | 'ID_BACK' | 'SELFIE') => {
    if (!user?.email || !kycFiles[documentType.toLowerCase() as keyof typeof kycFiles]) return;
    
    setKycUploading(true);
    try {
      const formData = new FormData();
      formData.append('email', user.email);
      formData.append('documentType', documentType);
      formData.append('file', kycFiles[documentType.toLowerCase() as keyof typeof kycFiles]!);
      
      const response = await fetch('/api/mambu/kyc/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Belge başarıyla yüklendi!');
        // Dosyayı state'ten temizle
        setKycFiles(prev => ({ ...prev, [documentType.toLowerCase()]: undefined }));
      } else {
        alert('Belge yükleme hatası: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (error: any) {
      console.error('KYC upload error:', error);
      alert('Belge yükleme sırasında bir hata oluştu');
    } finally {
      setKycUploading(false);
    }
  };

  // Hesap kapatma işlemi
  const handleCloseAccount = async () => {
    if (!user?.email || !agreementAccepted || !consentAccepted) return;
    
    setCloseAccountLoading(true);
    try {
      // Account ID'yi bul
      let accountId: string | null = null;
      if (user?.alpacaAccountId) {
        accountId = user.alpacaAccountId;
      } else {
        try {
          const accountsRes = await fetch('/api/alpaca/accounts');
          if (accountsRes.ok) {
            const accountsData = await accountsRes.json();
            const accounts = accountsData.accounts || [];
            if (accounts.length > 0) {
              accountId = accounts[0].id || 'd005ca65-a340-4373-b783-41a0ca3d13f9';
            }
          }
        } catch (error) {
          console.error('Accounts fetch error:', error);
        }
      }
      
      const response = await fetch('/api/account/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          accountId,
          agreementAccepted,
          consentAccepted,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Hesaplarınız başarıyla kapatıldı. Çıkış yapılıyor...');
        // Logout yap
        setTimeout(() => {
          handleLogout();
        }, 2000);
      } else {
        alert('Hesap kapatma hatası: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (error: any) {
      console.error('Close account error:', error);
      alert('Hesap kapatma sırasında bir hata oluştu');
    } finally {
      setCloseAccountLoading(false);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16 relative">
            {/* DatPay Logo - Solda */}
            <Link href="/" className="absolute left-0 flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 via-secondary-500 to-accent-500 flex items-center justify-center"
              >
                <TrendingUp className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
                DatPay
              </span>
            </Link>

            {/* Tabs - Ortada */}
            <div className="flex items-center space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange?.(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      isActive
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-2 border-primary-200 dark:border-primary-700"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* User Menu with Settings - Sağda */}
            <div className="absolute right-0">
              <div className="relative">
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                    {user?.firstName?.[0] || "U"}
                  </div>
                  <span>{user?.firstName}</span>
                  <Settings className="w-4 h-4" />
                </button>

              <AnimatePresence>
                {isSettingsOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsSettingsOpen(false)}
                      className="fixed inset-0 bg-black/20 z-40"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold">
                            {user?.firstName?.[0] || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                              {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Settings Menu */}
                      <div className="py-2">
                        {/* Ayarlar Başlığı */}
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            <Settings className="w-4 h-4" />
                            <span>Ayarlar</span>
                          </div>
                        </div>
                        {/* Yatırımcı Bilgileri */}
                        <button
                          onClick={() => {
                            setIsSettingsOpen(false);
                            handleInvestorInfoOpen();
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                        >
                          <User className="w-4 h-4" />
                          <span>Yatırımcı Bilgileri</span>
                        </button>

                        {/* KYC Doğrulama */}
                        <button
                          onClick={() => {
                            setIsSettingsOpen(false);
                            setIsKYCModalOpen(true);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                        >
                          <Shield className="w-4 h-4" />
                          <span>KYC Doğrulama</span>
                        </button>

                        {/* Hesap İzinleri */}
                        <button
                          onClick={async () => {
                            setIsSettingsOpen(false);
                            // Alpaca account ID'yi bul
                            let accountId: string | null = null;
                            
                            if (user?.alpacaAccountId) {
                              accountId = user.alpacaAccountId;
                            } else {
                              try {
                                const accountsRes = await fetch('/api/alpaca/accounts');
                                if (accountsRes.ok) {
                                  const accountsData = await accountsRes.json();
                                  const accounts = accountsData.accounts || [];
                                  
                                  if (accounts.length > 0) {
                                    const userAccount = accounts.find((acc: any) => 
                                      acc.email === user?.email || 
                                      acc.contact?.email === user?.email
                                    );
                                    
                                    accountId = userAccount?.id || 
                                                userAccount?.account_number || 
                                                accounts[0].id || 
                                                null;
                                  }
                                }
                              } catch (error) {
                                console.error('Accounts fetch error:', error);
                              }
                            }
                            
                            setAlpacaAccountId(accountId);
                            setIsPermissionsModalOpen(true);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Hesap İzinleri</span>
                        </button>

                        {/* Kayıtlı Kartlar */}
                        <button
                          onClick={() => {
                            setIsSettingsOpen(false);
                            handleSavedCardsOpen();
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Kayıtlı Kartlar</span>
                          {savedCards.length > 0 && (
                            <span className="ml-auto text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full">
                              {savedCards.length}
                            </span>
                          )}
                        </button>

                        <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

                        {/* Hesap Kapatma */}
                        <button
                          onClick={() => {
                            setIsSettingsOpen(false);
                            setIsCloseAccountModalOpen(true);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center gap-3"
                        >
                          <X className="w-4 h-4" />
                          <span>Hesap Kapatma</span>
                        </button>

                        {/* Çıkış Yap */}
                        <button
                          onClick={() => {
                            setIsSettingsOpen(false);
                            handleLogout();
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Çıkış Yap</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* KYC Modal */}
      <AnimatePresence>
        {isKYCModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsKYCModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">KYC Doğrulama</h2>
                  </div>
                  <button
                    onClick={() => setIsKYCModalOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Kimlik doğrulama işlemi için gerekli belgeleri yükleyin.
                  </p>
                  
                  {/* Kimlik Belgesi Ön Yüz */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Kimlik Belgesi (Ön Yüz)
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setKycFiles(prev => ({ ...prev, idFront: file }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    {kycFiles.idFront && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">{kycFiles.idFront.name}</span>
                        <button
                          onClick={() => handleKYCUpload('ID_FRONT')}
                          disabled={kycUploading}
                          className="px-3 py-1 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                        >
                          {kycUploading ? 'Yükleniyor...' : 'Yükle'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Kimlik Belgesi Arka Yüz */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Kimlik Belgesi (Arka Yüz)
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setKycFiles(prev => ({ ...prev, idBack: file }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    {kycFiles.idBack && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">{kycFiles.idBack.name}</span>
                        <button
                          onClick={() => handleKYCUpload('ID_BACK')}
                          disabled={kycUploading}
                          className="px-3 py-1 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                        >
                          {kycUploading ? 'Yükleniyor...' : 'Yükle'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Selfie */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Selfie (Yüz Fotoğrafı)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setKycFiles(prev => ({ ...prev, selfie: file }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    {kycFiles.selfie && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">{kycFiles.selfie.name}</span>
                        <button
                          onClick={() => handleKYCUpload('SELFIE')}
                          disabled={kycUploading}
                          className="px-3 py-1 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                        >
                          {kycUploading ? 'Yükleniyor...' : 'Yükle'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setIsKYCModalOpen(false)}
                      className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hesap Kapatma Modal */}
      <AnimatePresence>
        {isCloseAccountModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCloseAccountModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                      <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Hesap Kapatma</h2>
                  </div>
                  <button
                    onClick={() => {
                      setIsCloseAccountModalOpen(false);
                      setCloseAccountStep('info');
                      setAgreementAccepted(false);
                      setConsentAccepted(false);
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  {closeAccountStep === 'info' && (
                    <>
                      <div className="space-y-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <h3 className="font-bold text-red-900 mb-2">⚠️ Önemli Bilgilendirme</h3>
                          <ul className="text-sm text-red-800 space-y-2 list-disc list-inside">
                            <li>Hesap kapatma işlemi geri alınamaz.</li>
                            <li>Mambu ve Alpaca hesaplarınız kapatılacaktır.</li>
                            <li>Aktif pozisyonlarınız varsa, önce bunları kapatmanız gerekmektedir.</li>
                            <li>Hesabınızdaki bakiyeler, yasal süreçlere göre işleme alınacaktır.</li>
                            <li>Gelecekte hesap açmak için yeniden kayıt olmanız gerekecektir.</li>
                            <li>Tüm işlem geçmişiniz saklanacak ancak hesaba erişim sağlanamayacaktır.</li>
                          </ul>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h3 className="font-bold text-yellow-900 mb-2">📋 Hesap Kapatma Süreci</h3>
                          <ol className="text-sm text-yellow-800 space-y-2 list-decimal list-inside">
                            <li>Hesap kapatma talebiniz onaylandıktan sonra, hesaplarınız CLOSED durumuna alınacaktır.</li>
                            <li>Kalan bakiyeleriniz varsa, yasal süreçlere göre size iade edilecektir.</li>
                            <li>Hesap kapatma işlemi 1-3 iş günü içinde tamamlanacaktır.</li>
                            <li>İşlem tamamlandıktan sonra size email gönderilecektir.</li>
                          </ol>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setCloseAccountStep('agreement')}
                          className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                        >
                          Devam Et
                        </button>
                        <button
                          onClick={() => {
                            setIsCloseAccountModalOpen(false);
                            setCloseAccountStep('info');
                          }}
                          className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                        >
                          İptal
                        </button>
                      </div>
                    </>
                  )}

                  {closeAccountStep === 'agreement' && (
                    <>
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">Sözleşme ve Rıza Metni</h3>
                        
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                          <h4 className="font-semibold text-gray-900 mb-2">Hesap Kapatma Sözleşmesi</h4>
                          <p className="text-sm text-gray-700 mb-4">
                            Hesap kapatma işlemini başlatarak, aşağıdaki koşulları kabul etmiş sayılırsınız:
                          </p>
                          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                            <li>Hesap kapatma işleminin geri alınamaz olduğunu kabul ediyorum.</li>
                            <li>Tüm aktif pozisyonlarımın kapatılacağını ve bunun sonuçlarından sorumlu olduğumu biliyorum.</li>
                            <li>Kalan bakiyelerimin yasal süreçlere göre iade edileceğini kabul ediyorum.</li>
                            <li>Hesap kapatma işlemi sonrasında hesabıma erişim sağlayamayacağımı biliyorum.</li>
                            <li>Gelecekte hesap açmak için yeniden kayıt olmam gerektiğini kabul ediyorum.</li>
                          </ul>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                          <h4 className="font-semibold text-gray-900 mb-2">Kişisel Verilerin Korunması ve Rıza Metni</h4>
                          <p className="text-sm text-gray-700 mb-4">
                            Hesap kapatma işlemi sırasında ve sonrasında kişisel verilerinizin işlenmesi hakkında:
                          </p>
                          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                            <li>Kişisel verilerimin hesap kapatma işlemi için işlenmesine rıza gösteriyorum.</li>
                            <li>Yasal yükümlülüklerimiz gereği, bazı verilerin saklanması gerektiğini kabul ediyorum.</li>
                            <li>İşlem geçmişi ve finansal verilerin yasal süreçlere göre saklanacağını biliyorum.</li>
                            <li>KVKK kapsamındaki haklarımı biliyorum ve bunları kullanabileceğimi kabul ediyorum.</li>
                          </ul>
                        </div>

                        <div className="space-y-3">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={agreementAccepted}
                              onChange={(e) => setAgreementAccepted(e.target.checked)}
                              className="mt-1 w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-sm text-gray-700">
                              Hesap Kapatma Sözleşmesi'ni okudum ve kabul ediyorum.
                            </span>
                          </label>
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={consentAccepted}
                              onChange={(e) => setConsentAccepted(e.target.checked)}
                              className="mt-1 w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-sm text-gray-700">
                              Kişisel Verilerin Korunması ve Rıza Metni'ni okudum ve kabul ediyorum.
                            </span>
                          </label>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setCloseAccountStep('info')}
                          className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                        >
                          Geri
                        </button>
                        <button
                          onClick={() => setCloseAccountStep('confirm')}
                          disabled={!agreementAccepted || !consentAccepted}
                          className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Devam Et
                        </button>
                      </div>
                    </>
                  )}

                  {closeAccountStep === 'confirm' && (
                    <>
                      <div className="space-y-4">
                        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                          <h3 className="font-bold text-red-900 mb-2">⚠️ Son Onay</h3>
                          <p className="text-sm text-red-800">
                            Hesap kapatma işlemini onaylıyor musunuz? Bu işlem geri alınamaz ve hesaplarınız (Mambu ve Alpaca) kapatılacaktır.
                          </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Kapatılacak Hesaplar:</h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            <li>• Mambu Banka Hesabı</li>
                            <li>• Alpaca Yatırımcı Hesabı</li>
                          </ul>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setCloseAccountStep('agreement')}
                          className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                        >
                          Geri
                        </button>
                        <button
                          onClick={handleCloseAccount}
                          disabled={closeAccountLoading}
                          className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {closeAccountLoading ? 'Kapatılıyor...' : 'Hesabı Kapat'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Yatırımcı Bilgileri Modal */}
      <AnimatePresence>
        {isInvestorInfoModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInvestorInfoModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Yatırımcı Bilgileri</h2>
                  </div>
                  <button
                    onClick={() => setIsInvestorInfoModalOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  {/* Kişisel Bilgiler */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Kişisel Bilgiler</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Ad</label>
                        <input
                          type="text"
                          defaultValue={user?.firstName || ""}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Soyad</label>
                        <input
                          type="text"
                          defaultValue={user?.lastName || ""}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          defaultValue={user?.email || ""}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Telefon</label>
                        <input
                          type="tel"
                          placeholder="+90 555 123 4567"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mambu Hesap Bilgileri */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-blue-600" />
                      Banka
                    </h3>
                    {accountInfoLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      </div>
                    ) : mambuAccountInfo ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">Toplam Bakiye</span>
                          <span className="text-lg font-bold text-gray-900">
                            ${(mambuAccountInfo.cashBalance || mambuAccountInfo.totalBalance || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">Client ID</span>
                          <span className="text-sm font-mono text-gray-600">{mambuAccountInfo.clientId || "N/A"}</span>
                        </div>
                        {mambuAccountInfo.accounts && mambuAccountInfo.accounts.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Hesaplar</p>
                            <div className="space-y-2">
                              {mambuAccountInfo.accounts.map((acc: any, idx: number) => (
                                <div key={idx} className="p-3 bg-white border border-gray-200 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">{acc.accountType || "Deposit Account"}</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                      ${parseFloat(acc.balance || acc.availableBalance || "0").toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        Mambu hesap bilgisi bulunamadı
                      </div>
                    )}
                  </div>

                  {/* Alpaca Hesap Bilgileri */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Yatırımcı
                    </h3>
                    {accountInfoLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      </div>
                    ) : alpacaAccountInfo ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-green-50 rounded-lg">
                            <span className="text-xs text-gray-600 block mb-1">Portföy Değeri</span>
                            <span className="text-lg font-bold text-gray-900">
                              ${parseFloat(alpacaAccountInfo.portfolio_value || "0").toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <span className="text-xs text-gray-600 block mb-1">Nakit</span>
                            <span className="text-lg font-bold text-gray-900">
                              ${parseFloat(alpacaAccountInfo.cash || "0").toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <span className="text-xs text-gray-600 block mb-1">Equity</span>
                            <span className="text-lg font-bold text-gray-900">
                              ${parseFloat(alpacaAccountInfo.equity || "0").toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="p-3 bg-yellow-50 rounded-lg">
                            <span className="text-xs text-gray-600 block mb-1">Alım Gücü</span>
                            <span className="text-lg font-bold text-gray-900">
                              ${parseFloat(alpacaAccountInfo.buying_power || "0").toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">Account Number</span>
                          <span className="text-sm font-mono text-gray-600">{alpacaAccountInfo.account_number || "N/A"}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">Hesap Durumu</span>
                          <span className={`text-sm font-semibold px-2 py-1 rounded ${
                            alpacaAccountInfo.status === "ACTIVE" 
                              ? "bg-green-100 text-green-700" 
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {alpacaAccountInfo.status || "N/A"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        Alpaca hesap bilgisi bulunamadı
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors">
                      Kaydet
                    </button>
                    <button
                      onClick={() => setIsInvestorInfoModalOpen(false)}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Kayıtlı Kartlar Modal */}
      <AnimatePresence>
        {isSavedCardsModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSavedCardsModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Kayıtlı Kartlar</h2>
                  </div>
                  <button
                    onClick={() => setIsSavedCardsModalOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <div className="p-6">
                  {cardsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  ) : savedCards.length > 0 ? (
                    <div className="space-y-4">
                      {savedCards.map((card) => (
                        <div
                          key={card.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">
                              {card.brand === "Visa" ? "VISA" : "MC"}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">
                                  •••• •••• •••• {card.last4}
                                </span>
                                {card.isDefault && (
                                  <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">
                                    Varsayılan
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                {card.expiryMonth}/{card.expiryYear}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!card.isDefault && (
                              <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                Varsayılan Yap
                              </button>
                            )}
                            <button className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                              Sil
                            </button>
                          </div>
                        </div>
                      ))}
                      <button 
                        onClick={handleAddCardOpen}
                        className="w-full mt-4 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors font-semibold"
                      >
                        + Yeni Kart Ekle
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">Henüz kayıtlı kartınız yok</p>
                      <button 
                        onClick={handleAddCardOpen}
                        className="px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                      >
                        İlk Kartınızı Ekleyin
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Kart Ekleme Modal */}
      <AnimatePresence>
        {isAddCardModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddCardModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {clientSecret ? (
                <StripeProvider clientSecret={clientSecret}>
                  <AddCardForm
                    clientSecret={clientSecret}
                    onSuccess={handleCardAddSuccess}
                    onCancel={() => setIsAddCardModalOpen(false)}
                    isAdding={cardAdding}
                    setIsAdding={setCardAdding}
                  />
                </StripeProvider>
              ) : (
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Kart formu yükleniyor...</p>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Account Permissions Modal */}
      <AccountPermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
        accountId={alpacaAccountId}
        onSuccess={() => {
          // İzinler güncellendi, sayfayı yenile veya verileri güncelle
          window.location.reload();
        }}
      />
    </>
  );
}

