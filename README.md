# Kitchen of Kay — scroll motion website

A responsive, installable restaurant site built around the supplied 15-second film, weekly menu, and the chef's personal story. On desktop, scrolling advances and reverses the film before flowing into a six-dish coverflow. Mobile uses a lighter, direct carousel and a dedicated fast-order flow designed for dependable one-handed use.

## Run

```bash
npm install
npm run dev -- --port 5173
```

Open http://localhost:5173. To build for static hosting, run `npm run build`; publish the `dist` directory. `npm run preview` previews the production build locally.

## Content

- `index.html`: brand, weekly menu, and contact copy. The phone number and Los Angeles location came from the supplied site export; confirm these before publication.
- `index.html` also includes the exact approved chef biography, a portrait frame from the supplied film, and the official Kitchen of Kay Facebook profile in the story, contact, and footer areas.
- `order.html`: separate fast-order menu with dish selection, quantities, subtotal, copied order details, and a prefilled text request.
- `src/main.js`: film and menu scroll mapping, chapter text, coverflow controls, drag interaction, and accessibility controls.
- `src/scroll-film.js`: canvas frame loading, bounded decoded-frame cache, responsive source switching, and data-aware concurrency.
- `src/style.css`: responsive visual styling.
- `src/pwa.js`: app installation, connectivity feedback, and service-worker update handling.
- `public/manifest.webmanifest`, `public/sw.js`, and `public/offline.html`: installable PWA metadata, offline caching, and branded offline fallback.
- `privacy.html`, `terms.html`, and `404.html`: production policy information, ordering expectations, and a branded dead-end recovery page.
- `public/media/frames/`: 241 original-video frames at 1280×720.
- `public/media/frames-mobile/`: 241 lighter frames at 768×432.
- `public/media/menu/`: six matching dish portraits on black plates, generated specifically for this menu.
- `design/`: visual concepts for the film and menu. The original concept's play control was removed following the user's correction. These are design references, not site backgrounds.

The film retains its original imagery, including the board in the background. The supplied weekly menu was rebuilt as an interactive section with its listings, prices, side choices, weekly availability note, and complimentary porridge note. The original flyer itself is not used as a page background.

## Behavior

Normal desktop scrolling maps the pinned introduction to the film timeline. Chapter buttons are optional shortcuts. Images load around the requested frame, with at most 28 decoded desktop frames or 18 mobile frames retained. Mobile uses smaller frame files and direct dish navigation rather than a long pinned scroll sequence. The menu responds to dragging, previous/next controls, dish dots, and left/right arrow keys. There is no third-party analytics, API, font, or runtime CDN dependency.

Reduced-motion preferences default to a still hero and ordinary page scrolling. Visitors can also disable motion themselves, and that preference is retained. Keyboard navigation, visible focus, semantic headings, larger touch targets, safe-area support, and a skip link are included. A static poster remains available if JavaScript or frame loading fails. Order drafts are saved locally and restored after a reload.

Fast Order validates the pickup name before opening the visitor's messaging app. The three-step ordering guide, return navigation, privacy and terms links, `robots.txt`, and `sitemap.xml` cover the current pre-payment launch. Update the privacy notice and ordering terms when payment, email, analytics, or account services are connected.

## Publication

The production site is available at [kitchenofkay.com](https://kitchenofkay.com) and is deployed through Vercel from the GitHub repository. There is no order-processing backend. Telephone links open the visitor's calling application; fast-order requests are prepared as a text message for the visitor to review and send.
