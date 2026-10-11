# Kitchen of Kay launch handoff

The public experience, responsive layout, fast-order draft, PWA, offline support, SEO basics, policy pages, security headers, and deployment pipeline are complete.

## External services still to connect

1. **Stripe:** choose the final checkout model, create products/prices, add a server-side checkout endpoint, configure the production webhook, and replace the text-order action when online payment is ready.
2. **Resend:** verify the sending domain, add a server-side order-confirmation endpoint, and configure customer and kitchen confirmation templates.

Never expose Stripe or Resend secret keys in Vite client variables. Store them as encrypted Vercel environment variables and use server-side functions.

## Business details still needed from the owner

- Confirm the exact pickup address before publishing it.
- Confirm regular hours or keep the current “call for today’s hours” language.
- Confirm current weekly dishes, pricing, tax, cancellation, refund, and allergy policies.
- Supply any Instagram, TikTok, Maps, or review-profile links that should appear publicly.
- Provide the business email addresses that Resend should use for sender and recipient.

## Final checks after integrations

- Complete a real Stripe test-mode payment and verify the webhook result.
- Verify both customer and kitchen emails arrive through Resend.
- Update Privacy and Terms to describe payment, email, and any analytics data handling.
- Run the existing mobile, desktop, offline, cart-persistence, and console-error smoke tests again.
