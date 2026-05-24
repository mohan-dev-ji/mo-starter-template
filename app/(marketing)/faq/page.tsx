"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What's included in the free plan?",
    answer:
      "The free plan covers core features, up to 100 [units] per month, community support, and a single user. It's designed to let you try the product end-to-end before you decide to upgrade.",
  },
  {
    question: "Can I change plans or cancel at any time?",
    answer:
      "Yes. You can upgrade, downgrade, or cancel from the Billing page in your dashboard. If you cancel a paid plan, you'll keep access until the end of the current billing period.",
  },
  {
    question: "Do you offer a free trial of Pro or Max?",
    answer:
      "We don't run time-limited trials. Instead, the free plan stays free forever so you can validate the product, and paid plans are billed monthly with no long-term commitment.",
  },
  {
    question: "How does billing work?",
    answer:
      "Billing is handled by Stripe. You can pay monthly or yearly (yearly saves two months), and you can manage payment methods, invoices, and receipts from the Stripe customer portal linked in your dashboard.",
  },
  {
    question: "Is my data secure?",
    answer:
      "All traffic is served over HTTPS, authentication is handled by Clerk, and your data is stored in Convex with row-level access controls. We never sell your data or share it with third parties.",
  },
  {
    question: "How do I get support?",
    answer:
      "Free users get community support. Pro users get priority email support with a one-business-day response target. Max users get a dedicated point of contact and an SLA on response times.",
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
            Everything you need to know about the product and billing.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={faq.question}
                className="bg-card border border-border rounded-lg overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-muted/30 transition-colors"
                >
                  <span className="font-semibold text-foreground">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
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
