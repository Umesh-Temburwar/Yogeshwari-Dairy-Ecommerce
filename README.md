# Yogeshwari Dairy Customer E-Commerce 🥛⚡

Customer-facing quick-commerce web application for **Yogeshwari Dairy Products**, delivering fresh farm cow & buffalo milk, curd, malai paneer, desi bilona ghee, and traditional sweets across Nagpur in **15-20 minutes**.

Integrates directly with the Yogeshwari Dairy backend and Supabase inventory system.

---

## 🚀 Features

- **⚡ 15-Mins Quick-Commerce Architecture:** Styled with Blinkit / Zepto / Swiggy Instamart high-converting visual patterns.
- **🥛 Authentic Vidarbha Dairy Catalogue:** 24+ curated local dairy items (Cow Milk, Buffalo Milk, Malai Paneer, Bilona Ghee, Amrakhand, Shrikhand, Gulab Jamun, Dahi, Masala Chaas).
- **🛒 Dynamic Cart & Free Delivery Meter:** Live progress toward the ₹300 free delivery threshold.
- **📍 Multi-Address Book:** Instant switching between `Home`, `Shop`, and `Work` delivery destinations with address creation.
- **🛵 5-Stage Live Order Tracker:** Step-by-step progress tracking (`Placed` → `Confirmed` → `Packing` → `Out for Delivery` → `Delivered`) with delivery rider details.
- **📲 WhatsApp One-Tap Order Confirmation:** Instant order receipt generation and messaging directly to the dairy counter staff.
- **🔌 Offline-First Adapter Architecture:** Toggle between `MockEcommerceApiClient` (default for seamless local dev & preview) and `HttpEcommerceApiClient` (`https://yogeshwari-dairy-shop-inventory-system.onrender.com/api/v1/ecommerce`).
- **📳 Haptic Web Feedback:** Native vibration feedback on cart add/remove actions (`navigator.vibrate`).
- **🎉 Confetti Celebration:** Interactive confetti burst upon successful order placement.

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
| `VITE_STORE_PHONE` | Dairy hotline / WhatsApp number | `+9370869896` |
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
