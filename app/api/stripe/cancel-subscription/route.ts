import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
// Minimal invoice shape we need — Stripe's dahlia SDK types don't expose
// payment_intent/period fields directly on Invoice despite them existing at runtime.
type InvoiceFields = {
  amount_paid: number;
  period_start: number;
  period_end: number;
  payment_intent: string | null;
};

export const dynamic = "force-dynamic";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let user;
  try {
    user = await convex.query(api.users.getUserByClerkId, { clerkUserId: userId });
  } catch (err) {
    console.error("Convex query failed:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  if (!user?.subscription.stripeSubscriptionId) {
    return NextResponse.json({ error: "No active subscription" }, { status: 400 });
  }

  try {
    // Expand latest_invoice so we can calculate and issue the prorated refund
    const subscription = await stripe.subscriptions.retrieve(
      user.subscription.stripeSubscriptionId,
      { expand: ["latest_invoice"] }
    );

    const invoice = subscription.latest_invoice as unknown as InvoiceFields | string | null;
    if (invoice && typeof invoice !== "string" && invoice.amount_paid > 0) {
      const now = Math.floor(Date.now() / 1000);
      const totalSeconds = invoice.period_end - invoice.period_start;
      const remainingSeconds = Math.max(0, invoice.period_end - now);

      if (totalSeconds > 0 && remainingSeconds > 0) {
        const refundAmount = Math.floor(
          (remainingSeconds / totalSeconds) * invoice.amount_paid
        );
        if (refundAmount > 0 && invoice.payment_intent) {
          await stripe.refunds.create({
            payment_intent: invoice.payment_intent,
            amount: refundAmount,
          });
        }
      }
    }

    // Cancel immediately — fires customer.subscription.deleted → webhook updates Convex to free
    await stripe.subscriptions.cancel(user.subscription.stripeSubscriptionId);
  } catch (err) {
    console.error("Cancel subscription failed:", err);
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
