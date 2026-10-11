# Kitchen of Kay — scroll motion website

A responsive, locally hosted restaurant site built around the supplied 15-second film and weekly menu. Scroll down to advance the film; scroll up to reverse it. The film flows directly into a second scroll sequence where six dishes move through a 3D coverflow. There is no play button, video player, cart, or simulated ordering flow.

## Run

```bash
npm install
npm run dev -- --port 5173
```

Open http://localhost:5173. To build for static hosting, run `npm run build`; publish the `dist` directory. `npm run preview` previews the production build locally.

## Content

- `index.html`: brand, weekly menu, and contact copy. The phone number and Los Angeles location came from the supplied site export; confirm these before publication.
- `order.html`: separate fast-order menu with dish selection, quantities, subtotal, copied order details, and a prefilled text request.
- `src/main.js`: film and menu scroll mapping, chapter text, coverflow controls, drag interaction, and accessibility controls.
- `src/scroll-film.js`: canvas frame loading, bounded decoded-frame cache, and responsive crop.
- `src/style.css`: responsive visual styling.
- `public/media/frames/`: 241 original-video frames at 1280×720.
- `public/media/frames-mobile/`: 241 lighter frames at 768×432.
- `public/media/menu/`: six matching dish portraits on black plates, generated specifically for this menu.
- `design/`: visual concepts for the film and menu. The original concept's play control was removed following the user's correction. These are design references, not site backgrounds.

The film retains its original imagery, including the board in the background. The supplied weekly menu was rebuilt as an interactive section with its listings, prices, side choices, weekly availability note, and complimentary porridge note. The original flyer itself is not used as a page background.

## Behavior

Normal browser scrolling maps the pinned introduction to the film timeline. Chapter buttons are optional shortcuts. Images load around the requested frame, with at most 28 decoded frames retained. Mobile uses smaller frame files. The menu responds to scrolling, dragging, previous/next controls, dish dots, and left/right arrow keys. There is no third-party analytics, API, font, or runtime CDN dependency.

Reduced-motion preferences default to a still hero and ordinary page scrolling. Visitors can also disable motion themselves. Keyboard navigation, visible focus, semantic headings, and a skip link are included. A static poster remains available if JavaScript or frame loading fails.

## Publication

This project is a local preview, not a public deployment. There is no order-processing backend. Telephone links open the visitor's calling application; they do not place an order.
