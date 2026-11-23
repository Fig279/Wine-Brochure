# Discover Mendoza

An interactive tri-fold tourism brochure. Open the cover, unfold the flap, then turn the whole sheet over to see the outside.

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # production build in dist/
npm run preview  # serve the production build
```

## How to use it

- Click the cover to open it, click the flap to unfold it, click the left panel to fold back.
- Or use the Previous / Next buttons, the dots, the **←** / **→** keys, or swipe.

## How it works

The brochure is three paper leaves, each with a front and back face, built with CSS 3D transforms:

| Leaf | Front | Back |
| --- | --- | --- |
| 1 (left, hinged on its right edge) | Inside panel 1 | Cover |
| 2 (centre, fixed) | Inside panel 2 | Back panel |
| 3 (right, hinged on its left edge) | Inside panel 3 | Inside flap |

`data-step` on `.book` (0–3) drives every animation. Panels are authored at real print size (3.667in × 8.5in) and the whole book is scaled to fit the window.

## Photos

Images hotlink Wikimedia Commons, as in the original brochure. For a production deployment, download them into `public/images/` and update the `src` attributes in `index.html`, keeping the credit lines.
