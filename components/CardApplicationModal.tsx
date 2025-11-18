"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  X,
  Loader2,
  CheckCircle2,
  CheckCircle,
  ArrowRight,
  Zap,
  Award,
  Shield,
  Star,
  Sparkles,
  Info,
} from "lucide-react";

interface CardApplicationModalProps {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CardApplicationModal({ user, onClose, onSuccess }: CardApplicationModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [cardType, setCardType] = useState<'DEBIT' | 'CREDIT'>('DEBIT');
  const [cardFeature, setCardFeature] = useState<'VIRTUAL' | 'DRAKE' | 'METAL' | 'STANDARD'>('STANDARD');
  const [cardDesign, setCardDesign] = useState<string>('gradient-blue');
  const [cardIcon, setCardIcon] = useState<string>('credit-card');
  const [isSingleUse, setIsSingleUse] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phoneNumber: '',
    deliveryAddress: '',
    deliveryCity: '',
    deliveryState: '',
    deliveryZipCode: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleNext = () => {
    if (currentStep === 1) {
      if (!cardType || !cardFeature) {
        setError('Lütfen kart tipi ve özelliği seçin');
        return;
      }
      setCurrentStep(2);
      setError(null);
    } else if (currentStep === 2) {
      if (!formData.address || !formData.city || !formData.zipCode || !formData.phoneNumber) {
        setError('Lütfen tüm zorunlu alanları doldurun');
        return;
      }
      setCurrentStep(3);
      setError(null);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/mambu/cards/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.email,
          cardType,
          cardFeature,
          cardDesign,
          cardIcon,
          isSingleUse: cardFeature === 'DRAKE' ? isSingleUse : false,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          phoneNumber: formData.phoneNumber,
          deliveryAddress: formData.deliveryAddress || formData.address,
          deliveryCity: formData.deliveryCity || formData.city,
          deliveryState: formData.deliveryState || formData.state,
          deliveryZipCode: formData.deliveryZipCode || formData.zipCode,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setError(data.error || 'Kart başvurusu oluşturulamadı');
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Başvuru Alındı!</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Kart başvurunuz başarıyla oluşturuldu. Onay süreci başlatıldı.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors"
            >
              Tamam
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Kart Başvurusu</h2>
                <p className="text-sm opacity-90">Adım {currentStep} / 3</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Form Steps */}
        <div className="p-6 flex-1 overflow-y-auto min-h-0">
          {/* Step 1: Kart Tipi ve Özellik Seçimi */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Kart Tipi ve Özelliği Seçin</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">İstediğiniz kart tipini ve özelliğini seçin</p>
              </div>

              {/* Kart Tipi */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Kart Tipi <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCardType('DEBIT')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      cardType === 'DEBIT'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      <span className="font-semibold">Banka Kartı</span>
                    </div>
                    <p className="text-xs mt-1 opacity-80">Hesabınızdaki parayla harcama yapın</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardType('CREDIT')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      cardType === 'CREDIT'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      <span className="font-semibold">Kredi Kartı</span>
                    </div>
                    <p className="text-xs mt-1 opacity-80">Kredi limiti ile harcama yapın</p>
                  </button>
                </div>
              </div>

              {/* Kart Özelliği */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Kart Özelliği <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCardFeature('VIRTUAL')}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      cardFeature === 'VIRTUAL'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-5 h-5" />
                      <span className="font-semibold">Sanal Kart</span>
                    </div>
                    <p className="text-xs opacity-80">Sadece online kullanım için</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardFeature('DRAKE')}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      cardFeature === 'DRAKE'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="w-5 h-5" />
                      <span className="font-semibold">Drake Kart</span>
                    </div>
                    <p className="text-xs opacity-80">Özel tasarım premium kart</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardFeature('METAL')}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      cardFeature === 'METAL'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-5 h-5" />
                      <span className="font-semibold">Metal Kart</span>
                    </div>
                    <p className="text-xs opacity-80">Metal malzeme, premium deneyim</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardFeature('STANDARD')}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      cardFeature === 'STANDARD'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="w-5 h-5" />
                      <span className="font-semibold">Standart Kart</span>
                    </div>
                    <p className="text-xs opacity-80">Klasik plastik kart</p>
                  </button>
                </div>
              </div>

              {/* Drake Kart için Tek Kullanımlık Seçeneği */}
              {cardFeature === 'DRAKE' && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="singleUse"
                      checked={isSingleUse}
                      onChange={(e) => setIsSingleUse(e.target.checked)}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="singleUse" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <span className="font-semibold text-gray-900 dark:text-gray-100">Tek Kullanımlık Kart</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Bu kart sadece bir kez kullanılabilir. İşlem sonrası otomatik olarak iptal edilir.
                      </p>
                    </label>
                  </div>
                </div>
              )}

              {/* Kart Tasarım Seçimi */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Kart Tasarımı
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setCardDesign('gradient-blue')}
                    className={`p-3 rounded-xl border-2 transition-all relative overflow-hidden ${
                      cardDesign === 'gradient-blue'
                        ? 'border-purple-500 ring-2 ring-purple-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                  >
                    <div className="h-16 rounded-lg bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700"></div>
                    <p className="text-xs mt-2 text-center font-medium text-gray-700 dark:text-gray-300">Mavi</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardDesign('gradient-purple')}
                    className={`p-3 rounded-xl border-2 transition-all relative overflow-hidden ${
                      cardDesign === 'gradient-purple'
                        ? 'border-purple-500 ring-2 ring-purple-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                  >
                    <div className="h-16 rounded-lg bg-gradient-to-br from-purple-500 via-pink-600 to-purple-700"></div>
                    <p className="text-xs mt-2 text-center font-medium text-gray-700 dark:text-gray-300">Mor</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardDesign('gradient-black')}
                    className={`p-3 rounded-xl border-2 transition-all relative overflow-hidden ${
                      cardDesign === 'gradient-black'
                        ? 'border-purple-500 ring-2 ring-purple-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                  >
                    <div className="h-16 rounded-lg bg-gradient-to-br from-gray-800 via-gray-900 to-black"></div>
                    <p className="text-xs mt-2 text-center font-medium text-gray-700 dark:text-gray-300">Siyah</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardDesign('gradient-gold')}
                    className={`p-3 rounded-xl border-2 transition-all relative overflow-hidden ${
                      cardDesign === 'gradient-gold'
                        ? 'border-purple-500 ring-2 ring-purple-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                  >
                    <div className="h-16 rounded-lg bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500"></div>
                    <p className="text-xs mt-2 text-center font-medium text-gray-700 dark:text-gray-300">Altın</p>
                  </button>
                </div>
              </div>

              {/* Kart İkonu Seçimi */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Kart İkonu
                </label>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {[
                    { id: 'credit-card', icon: CreditCard, name: 'Kart' },
                    { id: 'star', icon: Star, name: 'Yıldız' },
                    { id: 'diamond', icon: Sparkles, name: 'Elmas' },
                    { id: 'crown', icon: Award, name: 'Taç' },
                    { id: 'shield', icon: Shield, name: 'Kalkan' },
                    { id: 'zap', icon: Zap, name: 'Şimşek' },
                  ].map((iconOption) => {
                    const IconComponent = iconOption.icon;
                    return (
                      <button
                        key={iconOption.id}
                        type="button"
                        onClick={() => setCardIcon(iconOption.id)}
                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                          cardIcon === iconOption.id
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-2 ring-purple-300'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 hover:border-purple-300'
                        }`}
                      >
                        <IconComponent className={`w-6 h-6 ${
                          cardIcon === iconOption.id
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`} />
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{iconOption.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Kişisel Bilgiler */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Kişisel Bilgiler</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Adres ve iletişim bilgilerinizi girin</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Adres <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Sokak adresi"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Şehir <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="İstanbul"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    İlçe
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Kadıköy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Posta Kodu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="34000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Telefon Numarası <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="+90 555 123 4567"
                    required
                  />
                </div>
              </div>

              {/* Teslimat Adresi (Opsiyonel) */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="sameAddress"
                    defaultChecked
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          deliveryAddress: formData.address,
                          deliveryCity: formData.city,
                          deliveryState: formData.state,
                          deliveryZipCode: formData.zipCode,
                        });
                      }
                    }}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="sameAddress" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Teslimat adresi aynı
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Teslimat Adresi
                    </label>
                    <input
                      type="text"
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Sokak adresi (opsiyonel)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Teslimat Şehri
                    </label>
                    <input
                      type="text"
                      value={formData.deliveryCity}
                      onChange={(e) => setFormData({ ...formData, deliveryCity: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="İstanbul"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Teslimat İlçesi
                    </label>
                    <input
                      type="text"
                      value={formData.deliveryState}
                      onChange={(e) => setFormData({ ...formData, deliveryState: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Kadıköy"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Teslimat Posta Kodu
                    </label>
                    <input
                      type="text"
                      value={formData.deliveryZipCode}
                      onChange={(e) => setFormData({ ...formData, deliveryZipCode: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="34000"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Özet ve Onay */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Başvuru Özeti</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Lütfen bilgilerinizi kontrol edin</p>
              </div>

              {/* Özet Bilgiler */}
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Kart Bilgileri</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Kart Tipi:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {cardType === 'DEBIT' ? 'Banka Kartı' : 'Kredi Kartı'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Kart Özelliği:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {cardFeature === 'VIRTUAL' ? 'Sanal Kart' : 
                         cardFeature === 'DRAKE' ? 'Drake Kart' :
                         cardFeature === 'METAL' ? 'Metal Kart' : 'Standart Kart'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tasarım:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {cardDesign === 'gradient-blue' ? 'Mavi' :
                         cardDesign === 'gradient-purple' ? 'Mor' :
                         cardDesign === 'gradient-black' ? 'Siyah' : 'Altın'}
                      </span>
                    </div>
                    {cardFeature === 'DRAKE' && isSingleUse && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Özellik:</span>
                        <span className="font-medium text-yellow-600 dark:text-yellow-400">Tek Kullanımlık</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">İletişim Bilgileri</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Adres: </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{formData.address}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Şehir: </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{formData.city}</span>
                      {formData.state && (
                        <>
                          <span className="text-gray-600 dark:text-gray-400">, </span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{formData.state}</span>
                        </>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Posta Kodu: </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{formData.zipCode}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Telefon: </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{formData.phoneNumber}</span>
                    </div>
                  </div>
                </div>

                {formData.deliveryAddress && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Teslimat Adresi</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Adres: </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{formData.deliveryAddress}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Şehir: </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{formData.deliveryCity}</span>
                        {formData.deliveryState && (
                          <>
                            <span className="text-gray-600 dark:text-gray-400">, </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{formData.deliveryState}</span>
                          </>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Posta Kodu: </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{formData.deliveryZipCode}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bilgilendirme */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-semibold mb-1">Önemli Bilgiler:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Kart başvurunuz Mambu sistemine gönderilecektir</li>
                      <li>Onay süreci 1-3 iş günü sürebilir</li>
                      <li>Onaylandıktan sonra kartınız adresinize gönderilecektir</li>
                      <li>Başvuru durumunu takip edebilirsiniz</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Hata Mesajı */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Butonlar - Sabit Alt Kısım */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Geri
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            İptal
          </button>
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-center gap-2"
            >
              İleri
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  Başvuru Yap
                  <CheckCircle className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

