"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Wallet, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import StripeProvider from "./StripeProvider";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSuccess?: () => void;
}

function DepositFormContent({ onClose, user, onSuccess }: Omit<DepositModalProps, 'isOpen'>) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  
  return (
    <StripeProvider clientSecret={clientSecret || undefined}>
      <DepositForm 
        onClose={onClose} 
        user={user} 
        onSuccess={onSuccess}
        onClientSecretChange={setClientSecret}
      />
    </StripeProvider>
  );
}

interface DepositFormProps extends Omit<DepositModalProps, 'isOpen'> {
  onClientSecretChange?: (secret: string | null) => void;
}

function DepositForm({ onClose, user, onSuccess, onClientSecretChange }: DepositFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  // Preset amount buttons
  const presetAmounts = [25, 50, 100, 250, 500, 1000];

  // Create payment intent when amount is set
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (!amount || parseFloat(amount) < 0.5) {
        setClientSecret(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/stripe/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: parseFloat(amount),
            currency: "usd",
            email: user?.email,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setClientSecret(data.clientSecret);
          setPaymentIntentId(data.paymentIntentId);
          if (onClientSecretChange) {
            onClientSecretChange(data.clientSecret);
          }
        } else {
          setError(data.error || "Payment Intent oluşturulamadı");
          setClientSecret(null);
          if (onClientSecretChange) {
            onClientSecretChange(null);
          }
        }
      } catch (err: any) {
        setError(err.message || "Bir hata oluştu");
        setClientSecret(null);
        if (onClientSecretChange) {
          onClientSecretChange(null);
        }
      } finally {
        setLoading(false);
      }
    };

    // Debounce payment intent creation
    const timeoutId = setTimeout(createPaymentIntent, 500);
    return () => clearTimeout(timeoutId);
  }, [amount, user?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setError("Stripe yüklenmedi, lütfen sayfayı yenileyin");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "Form gönderilemedi");
        setLoading(false);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard?payment=success`,
        },
        redirect: "if_required",
      });

      if (confirmError) {
        setError(confirmError.message || "Ödeme onaylanamadı");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Ödeme başarılı oldu, şimdi Mambu'ya para yükle
        try {
          const depositResponse = await fetch("/api/mambu/deposit-stripe", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user?.email,
              amount: parseFloat(amount),
              paymentIntentId: paymentIntent.id,
            }),
          });

          const depositData = await depositResponse.json();

          if (depositData.success) {
            setSuccess(true);
            // Kısa bir süre sonra modal'ı kapat ve callback'i çağır
            setTimeout(() => {
              if (onSuccess) onSuccess();
              onClose();
            }, 2000);
          } else {
            // Ödeme başarılı ama Mambu'ya yükleme başarısız
            // Bu durumda kullanıcıya bilgi ver ve admin'e bildir
            setError(
              depositData.error || 
              "Ödeme başarılı ancak para hesabınıza yüklenirken bir sorun oluştu. Lütfen destek ekibiyle iletişime geçin. Payment Intent ID: " + paymentIntent.id
            );
            console.error("Mambu deposit failed after successful payment:", depositData);
          }
        } catch (depositError: any) {
          // Ödeme başarılı ama Mambu'ya yükleme hatası
          setError(
            "Ödeme başarılı ancak para hesabınıza yüklenirken bir sorun oluştu. Lütfen destek ekibiyle iletişime geçin. Payment Intent ID: " + paymentIntent.id
          );
          console.error("Mambu deposit error after successful payment:", depositError);
        }
      }
    } catch (err: any) {
      setError(err.message || "Ödeme işlenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
        </motion.div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Ödeme Başarılı!
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Para hesabınıza yükleniyor...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Yüklenecek Tutar (USD)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            $
          </span>
          <input
            type="number"
            step="0.01"
            min="0.5"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            required
          />
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Minimum tutar: $0.50
        </p>

        {/* Preset Amount Buttons */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {presetAmounts.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(preset.toString())}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              ${preset}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Stripe Payment Element */}
      {clientSecret && amount && parseFloat(amount) >= 0.5 && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
          <PaymentElement />
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={!stripe || !elements || !clientSecret || loading || !amount || parseFloat(amount) < 0.5}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              İşleniyor...
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5" />
              Para Yükle
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function DepositModal({ isOpen, onClose, user, onSuccess }: DepositModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Para Yükle</h2>
                <p className="text-sm opacity-90">Kredi/Banka kartı ile</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <DepositFormContent onClose={onClose} user={user} onSuccess={onSuccess} />
        </div>
      </motion.div>
    </div>
  );
}

