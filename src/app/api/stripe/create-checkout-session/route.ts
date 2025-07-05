import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  const { adId } = await req.json();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Premium Job Ad - 7 Days',
        },
        unit_amount: 2500, // $25.00
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/business/payment-success?adId=${adId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/business`,
    metadata: {
      adId,
    },
  });

  return NextResponse.json({ url: session.url });
}
