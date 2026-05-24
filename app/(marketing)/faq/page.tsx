"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How does the free plan work?",
    answer:
      "The free plan includes core features and up to 100 [units] per month. No credit card required — sign up and start building immediately.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Yes. Upgrade, downgrade, or cancel at any time from your billing settings. Plan changes take effect immediately and we prorate the difference.",
  },
  {
    question: "What happens if I cancel my subscription?",
    answer:
      "You keep access to paid features until the end of your current billing period. After that, your account reverts to the free plan — your data stays put.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a full refund within 14 days of your initial purchase if the product isn't a fit. Contact support and we'll process it, no questions asked.",
  },
  {
    question: "Is my data secure?",
    answer:
      "All data is encrypted in transit and at rest. We follow industry-standard security practices and never sell or share your information with third parties.",
  },
  {
    question: "How do I get support?",
    answer:
      "Free users get community support. Pro and Max plans include priority email support, with Max customers getting dedicated assistance and SLA guarantees.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-heading font-bold mb-4">Frequently asked questions</h1>
          <p className="text-muted-foreground">
            Everything you need to know. Can&apos;t find what you&apos;re looking for?{" "}
            <a href="mailto:support@example.com" className="text-primary hover:underline">
              Get in touch
            </a>
            .
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={faq.question}
                className="bg-card border border-border rounded-lg"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 p-6 text-left"
                >
                  <span className="font-semibold">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-muted-foreground shrink-0 transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-small text-muted-foreground">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
