"use client";

import { useState, FormEvent } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { CreditCard, X } from "lucide-react";
import { motion } from "framer-motion";

interface AddCardFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
  isAdding: boolean;
  setIsAdding: (value: boolean) => void;
}

export default function AddCardForm({
  clientSecret,
  onSuccess,
  onCancel,
  isAdding,
  setIsAdding,
}: AddCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsAdding(true);
    setErrorMessage(null);

    try {
      // Setup Intent'i confirm et
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Bir hata oluştu");
        setIsAdding(false);
      } else if (setupIntent && setupIntent.status === "succeeded") {
        // Başarılı - kart eklendi
        onSuccess();
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Kart eklenirken bir hata oluştu");
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Yeni Kart Ekle</h2>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <PaymentElement />
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={!stripe || isAdding}
            className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? "Ekleniyor..." : "Kartı Ekle"}
          </button>
        </div>
      </form>
    </div>
  );
}

