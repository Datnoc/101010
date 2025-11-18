"use client";

import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { ReactNode } from "react";

// Stripe publishable key'i environment variable'dan al
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
}

export default function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const options: StripeElementsOptions = {
    ...(clientSecret && { clientSecret }),
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#3b82f6",
        colorBackground: "#ffffff",
        colorText: "#1f2937",
        colorDanger: "#ef4444",
        fontFamily: "system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "8px",
      },
    },
  };

  // Elements provider'ı her zaman render et
  // clientSecret yoksa bile, böylece useStripe() ve useElements() hook'ları çalışır
  return (
    <Elements options={options} stripe={stripePromise}>
      {children}
    </Elements>
  );
}

