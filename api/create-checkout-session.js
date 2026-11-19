import Stripe from 'stripe';

const MENU = new Map([
  ['oxtails', { name: 'Oxtails', unitAmount: 3000 }],
  ['brownstew', { name: 'Brownstew Chicken', unitAmount: 3000 }],
  ['meatballs', { name: 'Meatballs in Plum Sauce', unitAmount: 3000 }],
  ['salmon', { name: 'Jerk Salmon', unitAmount: 3000 }],
  ['wing-meal', { name: '8-Piece Wing Meal', unitAmount: 3000 }],
  ['wings-only', { name: '12 Wings Only', unitAmount: 2000 }]
]);

function reply(response, status, body) { response.status(status).json(body); }

function originFor(request) {
  const origin = request.headers.origin;
  return typeof origin === 'string' && /^https:\/\/[a-z0-9.-]+$/i.test(origin) ? origin : 'https://kitchenofkay.com';
}

function readOrder(body) {
  const name = typeof body?.name === 'string' ? body.name.trim().replace(/\s+/g, ' ').slice(0, 50) : '';
  const note = typeof body?.note === 'string' ? body.note.trim().slice(0, 240) : '';
  const combined = new Map();

  for (const item of Array.isArray(body?.items) ? body.items : []) {
    const id = typeof item?.id === 'string' ? item.id : '';
    const quantity = Number(item?.quantity);
    if (!MENU.has(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) continue;
    combined.set(id, (combined.get(id) || 0) + quantity);
  }

  const totalItems = [...combined.values()].reduce((sum, quantity) => sum + quantity, 0);
  if (!name) throw new Error('Add a pickup name before checkout.');
  if (!combined.size || totalItems > 50) throw new Error('Choose a valid pickup order before checkout.');
  return { name, note, items: [...combined.entries()].map(([id, quantity]) => ({ id, quantity })) };
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return reply(response, 405, { error: 'Method not allowed.' });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return reply(response, 503, { error: 'Online payments are not configured yet. Please use the text-order option.' });
  }

  let order;
  try { order = readOrder(request.body); }
  catch (error) { return reply(response, 400, { error: error.message }); }

  const summary = order.items.map(({ id, quantity }) => `${quantity}× ${MENU.get(id).name}`).join(', ');
  const metadata = { pickup_name: order.name, kitchen_note: order.note || 'None', order_summary: summary };

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      submit_type: 'pay',
      customer_creation: 'always',
      phone_number_collection: { enabled: true },
      billing_address_collection: 'auto',
      line_items: order.items.map(({ id, quantity }) => {
        const dish = MENU.get(id);
        return { quantity, price_data: { currency: 'usd', unit_amount: dish.unitAmount, product_data: { name: `Kitchen of Kay — ${dish.name}` } } };
      }),
      success_url: `${originFor(request)}/order-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${originFor(request)}/order.html?checkout=cancelled`,
      metadata,
      payment_intent_data: { metadata }
    }, { idempotencyKey: typeof request.body?.idempotencyKey === 'string' ? request.body.idempotencyKey.slice(0, 255) : undefined });
    return reply(response, 200, { url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Session creation failed:', error);
    return reply(response, 502, { error: 'Unable to start secure checkout. Please try again or send a text request.' });
  }
}
