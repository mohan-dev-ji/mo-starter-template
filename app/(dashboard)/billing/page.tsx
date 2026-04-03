"use client";

import { useState } from "react";
import { useAppState } from "@/app/components/AppStateProvider";
import { UpgradeButton } from "@/app/components/dashboard/ui/UpgradeButton";
import { SubscriptionBadge } from "@/app/components/dashboard/ui/SubscriptionBadge";
import { PricingToggle } from "@/app/components/marketing/ui/PricingToggle";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/app/components/shared/ui/Card";
import { CardSkeleton } from "@/app/components/shared/ui/Skeleton";
import { Button } from "@/app/components/shared/ui/Button";
import { formatDate } from "@/lib/utils";
import { Check } from "lucide-react";

const plans = {
  pro: {
    name: "Pro",
    price: { monthly: "$12", yearly: "$96" },
    features: ["Unlimited [units]", "All core features", "Priority support", "Up to 5 users"],
  },
  business: {
    name: "Business",
    price: { monthly: "$39", yearly: "$312" },
    features: ["Everything in Pro", "Unlimited users", "Dedicated support", "Custom integrations"],
  },
};

export default function BillingPage() {
  const { userRecord, subscription, isLoading } = useAppState();
  const [billingPlan, setBillingPlan] = useState<"monthly" | "yearly">("monthly");
  const [portalLoading, setPortalLoading] = useState(false);

  const handlePortal = async () => {
    if (!userRecord?.subscription.stripeCustomerId) return;
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  };

  if (isLoading) return <div className="space-y-4"><CardSkeleton /><CardSkeleton /></div>;

  const isSubscribed = subscription.status === "active" || subscription.status === "cancelled";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-heading font-bold">Billing</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription.</p>
      </div>

      {/* Current plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current plan</CardTitle>
            <SubscriptionBadge tier={subscription.tier} />
          </div>
          <CardDescription>
            {isSubscribed
              ? `${subscription.tier} · ${subscription.plan} billing`
              : "You are on the free plan."}
          </CardDescription>
        </CardHeader>
        {isSubscribed && (
          <CardContent>
            <div className="flex items-center justify-between">
              {subscription.subscriptionEndsAt && (
                <p className="text-small text-muted-foreground">
                  {subscription.status === "cancelled" ? "Access until" : "Renews"}{" "}
                  {formatDate(subscription.subscriptionEndsAt)}
                </p>
              )}
              <Button
                variant="secondary"
                size="sm"
                loading={portalLoading}
                onClick={handlePortal}
              >
                Manage billing
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Upgrade options — shown only for free users */}
      {!isSubscribed && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-subheading">Upgrade your plan</h2>
            <PricingToggle value={billingPlan} onChange={setBillingPlan} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(["pro", "business"] as const).map((tier) => {
              const p = plans[tier];
              return (
                <Card key={tier}>
                  <CardHeader>
                    <CardTitle>{p.name}</CardTitle>
                    <CardDescription>
                      <span className="text-heading font-bold text-foreground">
                        {billingPlan === "monthly" ? p.price.monthly : p.price.yearly}
                      </span>
                      <span className="text-muted-foreground text-small ml-1">
                        / {billingPlan === "monthly" ? "month" : "year"}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-small">
                          <Check className="w-4 h-4 text-success shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <UpgradeButton tier={tier} plan={billingPlan} label={`Upgrade to ${p.name}`} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
