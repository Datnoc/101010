"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, CheckCircle2, AlertCircle, Loader2, FileText, Coins } from "lucide-react";

interface AccountPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string | null;
  onSuccess?: () => void;
}

export default function AccountPermissionsModal({
  isOpen,
  onClose,
  accountId,
  onSuccess,
}: AccountPermissionsModalProps) {
  const [optionsEnabled, setOptionsEnabled] = useState(false);
  const [cryptoEnabled, setCryptoEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Mevcut izinleri yükle
  useEffect(() => {
    const loadPermissions = async () => {
      if (!accountId || !isOpen) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/alpaca/account?accountId=${accountId}`);
        const data = await response.json();
        
        if (data.success && data.account) {
          const enabledAssets = data.account.enabled_assets || [];
          setOptionsEnabled(enabledAssets.includes('us_option'));
          setCryptoEnabled(enabledAssets.includes('crypto'));
        }
      } catch (err: any) {
        console.error('Load permissions error:', err);
        setError('İzinler yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    
    loadPermissions();
  }, [accountId, isOpen]);

  const handleSave = async () => {
    if (!accountId) {
      setError('Account ID bulunamadı');
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await fetch('/api/alpaca/accounts/permissions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId,
          options_enabled: optionsEnabled,
          crypto_enabled: cryptoEnabled,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || 'İzinler güncellenemedi');
      }
      
      setSuccess(true);
      
      // Başarılı güncelleme sonrası callback
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      console.error('Save permissions error:', err);
      setError(err.message || 'İzinler güncellenirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 dark:from-purple-700 dark:via-indigo-700 dark:to-blue-700 p-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Hesap İzinleri</h2>
                <p className="text-sm opacity-90">Yatırım izinlerinizi yönetin</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400" />
              </div>
            ) : success ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">İzinler Güncellendi!</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Hesap izinleriniz başarıyla güncellendi.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Opsiyon İzni */}
                <div className="p-5 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">Opsiyon Trading</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Opsiyon işlemleri yapabilme izni</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={optionsEnabled}
                        onChange={(e) => setOptionsEnabled(e.target.checked)}
                        className="sr-only peer"
                        disabled={saving}
                      />
                      <div className="w-14 h-7 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600 dark:peer-checked:bg-purple-500"></div>
                    </label>
                  </div>
                  {optionsEnabled && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
                      <p className="text-xs text-green-800 dark:text-green-300">
                        Opsiyon trading aktif. Artık opsiyon alım-satım işlemleri yapabilirsiniz.
                      </p>
                    </div>
                  )}
                </div>

                {/* Kripto İzni */}
                <div className="p-5 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center">
                        <Coins className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">Kripto Trading</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Kripto para işlemleri yapabilme izni</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cryptoEnabled}
                        onChange={(e) => setCryptoEnabled(e.target.checked)}
                        className="sr-only peer"
                        disabled={saving}
                      />
                      <div className="w-14 h-7 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-600 dark:peer-checked:bg-yellow-500"></div>
                    </label>
                  </div>
                  {cryptoEnabled && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
                      <p className="text-xs text-green-800 dark:text-green-300">
                        Kripto trading aktif. Artık kripto para alım-satım işlemleri yapabilirsiniz.
                      </p>
                    </div>
                  )}
                </div>

                {/* Bilgilendirme */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Not:</strong> İzinleri aktif etmek için yatırım hesabınızın bu özellikler için yetkilendirilmiş olması gerekmektedir. 
                    Bazı hesaplarda ek onay süreci gerekebilir.
                  </p>
                </div>

                {/* Hata Mesajı */}
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  </div>
                )}

                {/* Butonlar */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-purple-600 dark:bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      "Kaydet"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

