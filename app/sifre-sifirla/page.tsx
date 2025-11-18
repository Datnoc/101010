"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, TrendingUp, ArrowRight, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setFormStatus("error");
      setErrorMessage("Lütfen email adresinizi girin.");
      return;
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormStatus("error");
      setErrorMessage("Lütfen geçerli bir email adresi girin.");
      return;
    }

    setFormStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormStatus("error");
        setErrorMessage(data.message || data.error || "Bir hata oluştu. Lütfen tekrar deneyin.");
        return;
      }

      // Başarılı - email gönderildi
      setFormStatus("success");
    } catch (error: any) {
      setFormStatus("error");
      setErrorMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
      console.error('Forgot password error:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
      <section className="pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 via-secondary-500 to-accent-500 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
                  Şifremi Unuttum
                </span>
              </h1>
              <p className="text-gray-600">
                Email adresinize şifre sıfırlama linki göndereceğiz
              </p>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            >
              {formStatus === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{errorMessage}</p>
                </motion.div>
              )}

              {formStatus === "success" ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-green-700 text-sm">
                      Şifre sıfırlama linki email adresinize gönderildi. Lütfen email kutunuzu kontrol edin.
                    </p>
                  </div>
                  <p className="text-gray-600 text-sm mb-6">
                    Email gelmediyse spam klasörünüzü kontrol etmeyi unutmayın.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Giriş sayfasına dön
                  </Link>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      E-posta Adresi
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                        placeholder="ornek@email.com"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Kayıtlı email adresinizi girin, size şifre sıfırlama linki gönderelim.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={formStatus === "loading"}
                    className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formStatus === "loading" ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Gönderiliyor...</span>
                      </>
                    ) : (
                      <>
                        <span>Şifre Sıfırlama Linki Gönder</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Back to Login */}
              {formStatus !== "success" && (
                <div className="mt-6 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Giriş sayfasına dön
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Security Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-gray-500">
                🔒 Şifre sıfırlama linki 24 saat geçerlidir
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}


