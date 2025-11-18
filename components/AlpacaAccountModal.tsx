"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface AlpacaAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userFirstName?: string;
  userLastName?: string;
  onSuccess?: (accountId: string) => void;
}

export default function AlpacaAccountModal({
  isOpen,
  onClose,
  userEmail,
  userFirstName = "",
  userLastName = "",
  onSuccess,
}: AlpacaAccountModalProps) {
  const [formData, setFormData] = useState({
    firstName: userFirstName,
    lastName: userLastName,
    email: userEmail,
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdAccountId, setCreatedAccountId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const accountData = {
        contact: {
          email_address: formData.email,
          phone_number: formData.phone || undefined,
          street_address: formData.streetAddress ? [formData.streetAddress] : undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          postal_code: formData.postalCode || undefined,
          country: formData.country || "US",
        },
        identity: {
          given_name: formData.firstName,
          family_name: formData.lastName,
          date_of_birth: formData.dateOfBirth || undefined,
          tax_id: formData.taxId || undefined,
          tax_id_type: formData.taxIdType || undefined,
          country_of_citizenship: formData.country || "US",
          country_of_birth: formData.country || "US",
          country_of_tax_residence: formData.country || "US",
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
        enabled_assets: ["us_equity"], // Varsayılan olarak sadece hisse senedi
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

      setSuccess(true);
      setCreatedAccountId(data.account?.id || data.account?.account_number || null);
      
      // Başarılı oluşturma sonrası callback
      if (onSuccess && data.account?.id) {
        setTimeout(() => {
          onSuccess(data.account.id);
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      console.error("Alpaca account creation error:", err);
      setError(err.message || "Hesap oluşturulurken bir hata oluştu");
    } finally {
      setSubmitting(false);
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
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
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

          <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            {success ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Hesap Başarıyla Oluşturuldu!</h3>
                <p className="text-gray-600 mb-6">
                  Alpaca yatırım hesabınız oluşturuldu. Artık yatırım işlemlerine başlayabilirsiniz.
                </p>
                {createdAccountId && (
                  <p className="text-sm text-gray-500 mb-4">
                    Hesap ID: <span className="font-mono">{createdAccountId}</span>
                  </p>
                )}
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Tamam
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                        value={formData.firstName}
                        onChange={handleChange}
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
                        value={formData.lastName}
                        onChange={handleChange}
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
                      value={formData.email}
                      onChange={handleChange}
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
                      value={formData.phone}
                      onChange={handleChange}
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
                      value={formData.dateOfBirth}
                      onChange={handleChange}
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
                      value={formData.streetAddress}
                      onChange={handleChange}
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
                        value={formData.city}
                        onChange={handleChange}
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
                        value={formData.state}
                        onChange={handleChange}
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
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Ülke
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
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
                        value={formData.taxId}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Vergi Kimlik Tipi
                      </label>
                      <select
                        name="taxIdType"
                        value={formData.taxIdType}
                        onChange={handleChange}
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
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
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
      </div>
    </AnimatePresence>
  );
}

