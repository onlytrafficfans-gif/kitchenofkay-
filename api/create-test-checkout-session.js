import crypto from 'node:crypto';
import Stripe from 'stripe';

function reply(response, status, body) { response.status(status).json(body); }

function isAuthorized(candidate, expected) {
  if (typeof candidate !== 'string' || typeof expected !== 'string') return false;
  const actualBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

function originFor(request) {
  const origin = request.headers.origin;
  return typeof origin === 'string' && /^https:\/\/[a-z0-9.-]+$/i.test(origin) ? origin : 'https://kitchenofkay.com';
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return reply(response, 405, { error: 'Method not allowed.' });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.KOK_CHECKOUT_TEST_TOKEN) {
    return reply(response, 404, { error: 'Test checkout is unavailable.' });
  }
  if (!isAuthorized(request.body?.token, process.env.KOK_CHECKOUT_TEST_TOKEN)) {
    return reply(response, 403, { error: 'This test link is not authorized.' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      submit_type: 'pay',
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: 100,
          product_data: { name: 'Kitchen of Kay — checkout test' }
        }
      }],
      success_url: `${originFor(request)}/order-success.html?checkout=test&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${originFor(request)}/test-checkout.html?cancelled=1`,
      metadata: { checkout_test: 'true', amount: '1.00' }
    });
    return reply(response, 200, { url: session.url });
  } catch (error) {
    console.error('Stripe test Checkout Session creation failed:', error);
    return reply(response, 502, { error: 'Unable to start the $1 test checkout.' });
  }
}
