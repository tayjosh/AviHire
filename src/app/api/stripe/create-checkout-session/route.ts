import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Make sure we actually have a key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY in environment');
}

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil'
});


type CheckoutItem = {
  name: string;
  price: number;
  quantity: number;
};

export async function POST(req: Request) {
  const { items } = await req.json() as { items: CheckoutItem[] };

  const session = await stripe.checkout.sessions.create({
    line_items: items.map((item: CheckoutItem) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.name },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    })),
    mode: 'payment',
    success_url: `${req.headers.get('origin')}/success`,
    cancel_url: `${req.headers.get('origin')}/cancel`,
  });

  return NextResponse.json({ url: session.url });
}
