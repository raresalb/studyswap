import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { TransactionType, TransactionStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { userId, credits, type } = session.metadata ?? {};

    if (type !== "credit_purchase" || !userId || !credits) {
      return NextResponse.json({ received: true });
    }

    const creditsAmount = parseInt(credits);

    // Award credits to user
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          credits: { increment: creditsAmount },
          totalEarned: { increment: creditsAmount },
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: TransactionType.PURCHASE_CREDITS,
          status: TransactionStatus.COMPLETED,
          amount: creditsAmount,
          description: `Cumpărare ${creditsAmount} credite`,
          stripePaymentIntentId: session.payment_intent as string,
          metadata: {
            sessionId: session.id,
            amountPaid: session.amount_total,
          },
        },
      });

      // Create notification
      await tx.notification.create({
        data: {
          userId,
          type: "credits_purchased",
          title: "Credite adăugate!",
          message: `${creditsAmount} credite au fost adăugate în contul tău.`,
          link: "/dashboard/wallet",
        },
      });
    });
  }

  return NextResponse.json({ received: true });
}
