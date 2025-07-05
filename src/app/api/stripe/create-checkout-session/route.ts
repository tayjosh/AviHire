// src/app/api/stripe/create-checkout-session/route.ts
import Stripe from 'stripe';

// Initialize Stripe without specifying apiVersion, so it uses the version bundled in your installed package
type Env = { STRIPE_SECRET_KEY: string };
const stripe = new Stripe((process.env.STRIPE_SECRET_KEY as Env['STRIPE_SECRET_KEY']), {
  // No apiVersion override here
});

export async function POST(req: Request) {
  try {
    const { priceId } = await req.json();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: new URL('/success', req.url).toString(),
      cancel_url: new URL('/cancel', req.url).toString(),
    });

    return new Response(JSON.stringify({ sessionId: session.id }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    console.error('Stripe checkout creation error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
