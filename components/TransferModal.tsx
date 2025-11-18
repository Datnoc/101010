"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, AlertCircle, CheckCircle, User, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  transferType?: 'mambu-to-mambu' | 'mambu-to-alpaca' | 'alpaca-to-mambu'; // Transfer tipi
}

export default function TransferModal({ isOpen, onClose, transferType = 'mambu-to-mambu' }: TransferModalProps) {
  const { user } = useAuth();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Modal kapandığında state'i temizle
  useEffect(() => {
    if (!isOpen) {
      setRecipient("");
      setAmount("");
      setDescription("");
      setStatus("idle");
      setErrorMessage("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasyon
    if (!amount) {
      setStatus("error");
      setErrorMessage("Lütfen tutar bilgisini girin.");
      return;
    }

    if (parseFloat(amount) <= 0) {
      setStatus("error");
      setErrorMessage("Tutar 0'dan büyük olmalıdır.");
      return;
    }

    // Mambu-to-Mambu transfer için recipient kontrolü
    if (transferType === 'mambu-to-mambu') {
      if (!recipient) {
        setStatus("error");
        setErrorMessage("Lütfen alıcı email adresini girin.");
      return;
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipient)) {
      setStatus("error");
      setErrorMessage("Lütfen geçerli bir email adresi girin.");
      return;
      }
    }

    if (!user?.email) {
      setStatus("error");
      setErrorMessage("Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      let response;
      
      if (transferType === 'mambu-to-alpaca') {
        // Banka'dan Yatırım Hesabına transfer
        if (!user?.email) {
          setStatus("error");
          setErrorMessage("Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
          return;
        }

        response = await fetch('/api/transfer/mambu-to-alpaca', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            amount: parseFloat(amount),
            description: description || 'Transfer from Bank to Investment Account',
          }),
        });
      } else if (transferType === 'alpaca-to-mambu') {
        // Yatırım Hesabından Banka'ya transfer
        if (!user?.email) {
          setStatus("error");
          setErrorMessage("Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
          return;
        }

        response = await fetch('/api/transfer/alpaca-to-mambu', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            amount: parseFloat(amount),
            description: description || 'Transfer from Investment Account to Bank',
          }),
        });
      } else {
        // Banka'dan Banka'ya transfer (mevcut)
        if (!recipient) {
          setStatus("error");
          setErrorMessage("Lütfen alıcı email adresini girin.");
          return;
        }

        // Email formatı kontrolü
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recipient)) {
          setStatus("error");
          setErrorMessage("Lütfen geçerli bir email adresi girin.");
          return;
        }

        response = await fetch('/api/mambu/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          recipientEmail: recipient,
          amount: parseFloat(amount),
          description: description || '',
        }),
      });
      }

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(data.message || data.error || "Para transferi yapılamadı. Lütfen tekrar deneyin.");
        return;
      }
      
      setStatus("success");
      setTimeout(() => {
        onClose();
        // Sayfayı yenile (bakiye güncellemesi için)
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      setStatus("error");
      setErrorMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
      console.error("Transfer error:", error);
    }
  };

  const handleClose = () => {
    if (status !== "loading") {
      setRecipient("");
      setAmount("");
      setDescription("");
      setStatus("idle");
      setErrorMessage("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Send className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {transferType === 'mambu-to-alpaca' 
                      ? 'Yatırım Hesabına Transfer' 
                      : transferType === 'alpaca-to-mambu'
                      ? 'Hesaba Transfer'
                      : 'Para Gönder'}
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  disabled={status === "loading"}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

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
                    <p className="text-green-700 text-sm">
                      {transferType === 'mambu-to-alpaca' 
                        ? 'Para başarıyla banka hesabından yatırım hesabına transfer edildi!'
                        : transferType === 'alpaca-to-mambu'
                        ? 'Para başarıyla yatırım hesabından banka hesabına transfer edildi!'
                        : 'Para transferi başarıyla gönderildi!'}
                    </p>
                  </div>
                )}

                {transferType === 'mambu-to-mambu' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Alıcı Email
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="ornek@email.com"
                      required
                      disabled={status === "loading"}
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
                )}
                
                {transferType === 'mambu-to-alpaca' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Bilgi:</strong> Banka hesabınızdan yatırım hesabınıza para transfer edilecektir.
                    </p>
                  </div>
                )}
                
                {transferType === 'alpaca-to-mambu' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Bilgi:</strong> Yatırım hesabınızdan banka hesabınıza para transfer edilecektir.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tutar ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                      disabled={status === "loading"}
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Açıklama (Opsiyonel)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Transfer açıklaması..."
                    rows={3}
                    disabled={status === "loading"}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all disabled:opacity-50 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Gönderiliyor...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Gönder</span>
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

