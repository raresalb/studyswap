import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCreditCheckoutSession } from "@/lib/stripe";
import { CREDIT_PACKAGES } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ message: "Neautorizat" }, { status: 401 });
  }

  const { credits, price } = await req.json();

  // Validate package
  const validPackage = CREDIT_PACKAGES.find(
    (p) => p.credits === credits && p.price === price
  );
  if (!validPackage) {
    return NextResponse.json({ message: "Pachet invalid" }, { status: 400 });
  }

  try {
    const checkoutSession = await createCreditCheckoutSession({
      userId: session.user.id,
      credits,
      priceEur: price,
      userEmail: session.user.email,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ message: "Eroare la creare sesiune plată" }, { status: 500 });
  }
}
