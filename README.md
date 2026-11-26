# Yogeshwari Dairy Customer E-Commerce 🥛⚡

Customer-facing quick-commerce web application for **Yogeshwari Dairy Products**, delivering fresh farm cow & buffalo milk, curd, malai paneer, desi bilona ghee, and traditional sweets across Ambajogai in **10-15 minutes**. Styled with authentic **Blinkit quick-commerce** design patterns, emerald green & warm yellow tokens, and 4°C cold-chain preservation guarantee.

---

## ⚡ Blinkit Quick-Commerce Features

- **⚡ 10-15 Mins Hyperlocal Delivery:** Dark-store fulfillment model anchored at Ambajogai Mandi Bazar with live countdown timers.
- **🥛 Cold-Chain Dairy Guarantee:** Chilled at 4°C from milking to doorstep with insulated thermal packs.
- **🛒 Blinkit Stepper & Quantity Selector:** Instant tactile `ADD` button converting into `[- qty +]` emerald stepper with Web Audio feedback and haptic cues.
- **🏷️ Micro-Badges & Scarcity Alerts:** `10 MINS`, `4°C Chilled`, `Morning Batch`, and `< 5 left` low-stock indicators.
- **🔍 Animated Dairy Search Bar:** Rotating search prompts for daily essentials (`cow milk`, `malai paneer`, `bilona ghee`, `shrikhand`) with trending tags and instant product thumbnail preview.
- **📱 1-Thumb Mobile Bottom Navigation:** Quick access to Home, Categories, Wishlist, Orders, and Account.
- **🧾 Itemized Bill Breakdown:** Transparent breakdown with Handling Fee (₹2), Delivery Partner Tip selector (₹10/₹20/₹30/₹50), Free Delivery Progress Bar, and total savings pill.
- **🛵 4-Stage Live Order Tracker:** `Order Confirmed` → `Packed & Chilled` → `Out for Delivery` → `Delivered` with direct Rider Call action.
- **🌿 Freshness Guarantee & Hassle-Free Returns:** Instant replacement or UPI photo-refund for any damaged dairy pouch.
- **🔐 MongoDB Atlas Authentication:** Secure Phone OTP and Email/Password authentication with JWT token management and guest fallback.

---

## 🛠️ Tech Stack

- **Framework:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS + PostCSS + Autoprefixer
- **State Management:** Zustand (with `persist` middleware for cart & address)
- **Routing:** React Router DOM v6
- **Icons:** Lucide React
- **Celebration FX:** Canvas Confetti

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `VITE_USE_MOCK_API` | Use offline local mock adapter (`true`/`false`) | `true` |
| `VITE_BACKEND_URL` | Express backend base URL | `https://yogeshwari-dairy-shop-inventory-system.onrender.com/api/v1/ecommerce` |
| `VITE_STORE_PHONE` | Dairy hotline / WhatsApp number | `+919370869896` |
| `VITE_FREE_DELIVERY_THRESHOLD` | Order amount for zero delivery charges | `300` |
| `VITE_STANDARD_DELIVERY_FEE` | Flat delivery fee below threshold | `30` |

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── address/
│   │   └── AddressSelectorModal.tsx
│   ├── cart/
│   │   ├── CartDrawer.tsx
│   │   └── FloatingCartBar.tsx
│   ├── layout/
│   │   ├── CategoryPills.tsx
│   │   ├── Footer.tsx
│   │   └── Navbar.tsx
│   ├── order/
│   │   ├── LiveOrderTracker.tsx
│   │   └── OrderSuccessModal.tsx
│   └── product/
│       ├── ProductCard.tsx
│       └── ProductDetailModal.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── OrdersPage.tsx
│   └── TrackOrderPage.tsx
├── services/
│   └── api/
│       ├── httpApiClient.ts
│       ├── index.ts
│       ├── mockApiClient.ts
│       └── mockData.ts
├── store/
│   ├── cartStore.ts
│   └── customerStore.ts
├── types/
│   └── ecommerce.ts
├── utils/
│   ├── formatters.ts
│   ├── haptics.ts
│   └── whatsapp.ts
├── App.tsx
├── index.css
├── main.tsx
└── vite-env.d.ts
```

---

## 📄 License
MIT
