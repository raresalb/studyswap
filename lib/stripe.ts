import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
});

/** Create a Stripe Checkout Session for credit purchase */
export async function createCreditCheckoutSession({
  userId,
  credits,
  priceEur,
  userEmail,
}: {
  userId: string;
  credits: number;
  priceEur: number;
  userEmail: string;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `${credits} Credite StudySwap`,
            description: `Pachet de ${credits} credite pentru platforma StudySwap`,
          },
          unit_amount: Math.round(priceEur * 100), // cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    customer_email: userEmail,
    metadata: {
      userId,
      credits: credits.toString(),
      type: "credit_purchase",
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/wallet?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/wallet?cancelled=true`,
  });

  return session;
}
