# WeddingBudget.AI replica + Wishlist feature

Live: https://weddingbudgetai.vercel.app

## Run locally
```bash
npm install
npm run dev
```
Build: `npm run build` (output in `dist/`). Deploy with `npx vercel --prod`.

## What's inside
- Faithful React/Vite replica of the WeddingBudget.AI landing page (hero, features, destinations, venue styles, stats, vendor section, immersive venue viewer, About, testimonials, CTA, footer).
- 11-tab wedding planner (Style, Venue, Decor, Food, Artists, Sundries, Logistics, Budget, Checklist, Payments, Wishlist).
- All original data/style objects extracted from the deployed bundle, under `src/data/`.
- Original images mirrored under `public/`.

## Wishlist feature
- `src/components/WishlistTab.jsx` — couple side: add wishes, share link, QR code, private blessing inbox, approve messages, fullscreen digital blessing board.
- `src/components/GuestWishlist.jsx` — guest side: view wishes, help fulfil a wish with an amount, or send a private blessing.
- `src/wishlist.js` — link encoding/decoding and localStorage persistence.

Guests on the same device save blessings directly to the couple's inbox. On other devices the guest gets a private blessing link (WhatsApp/copy) that the couple opens to import the message; there is no backend/database configured.

## Stack
React 18, Vite 5, `qrcode`. No backend.
