import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe, getPriceId, type PriceTier, type PricePlan } from "@/lib/stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export const dynamic = "force-dynamic";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { tier: PriceTier; plan: PricePlan };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { tier, plan } = body;

  let user;
  try {
    user = await convex.query(api.users.getUserByClerkId, { clerkUserId: userId });
  } catch (err) {
    console.error("Convex query failed:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
  if (!user?.subscription.stripeSubscriptionId) {
    return NextResponse.json({ error: "No active subscription found" }, { status: 400 });
  }

  const priceId = getPriceId(tier, plan);
  if (!priceId) {
    return NextResponse.json({ error: "Invalid plan or tier" }, { status: 400 });
  }

  let subscription;
  try {
    subscription = await stripe.subscriptions.retrieve(user.subscription.stripeSubscriptionId);
  } catch (err) {
    console.error("Failed to retrieve subscription:", err);
    return NextResponse.json({ error: "Failed to retrieve subscription" }, { status: 500 });
  }

  const currentItemId = subscription.items.data[0]?.id;

  if (!currentItemId) {
    return NextResponse.json({ error: "No subscription item found" }, { status: 400 });
  }

  try {
    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      items: [{ id: currentItemId, price: priceId }],
      proration_behavior: "always_invoice",
      // If the subscription was set to cancel at period end, resume it
      cancel_at_period_end: false,
    });
  } catch (err) {
    console.error("Failed to update subscription:", err);
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
