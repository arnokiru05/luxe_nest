# Luxe Nest

Luxe Nest is a modern Next.js e-commerce platform for premium, minimalist household essentials — sofas, lighting, home decor, bedroom furniture, and more.

Unlike a traditional checkout flow, Luxe Nest minimises friction by letting customers browse, build a cart, and complete orders via **WhatsApp integration**, making it ideal for local Kenyan markets.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database:** PostgreSQL (Neon)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **Authentication:** Custom JWT-based auth (Admin only)

## ✨ Key Features

- **WhatsApp Ordering:** Customers add items to cart and send order details directly via WhatsApp.
- **Guest Checkout:** Collects Name, Address, Phone, and Email — no account required.
- **Admin Dashboard:** Secure, authenticated dashboard for managing products, categories, and orders.
- **Mobile-First Design:** Fully responsive, optimised for mobile browsing.
- **No Customer Accounts:** Removed login/signup friction for a seamless guest experience.

## 🚀 Getting Started

### 1. Clone & Install

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in `frontend/`:

```env
NODE_ENV="development"
DATABASE_URL="postgresql://user:password@host:5432/luxenest?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
ADMIN_EMAIL="admin@luxenest.com"
ADMIN_PASSWORD="Admin123!"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_WHATSAPP_NUMBER="254796305689"
```

### 3. Database Setup

```bash
npx prisma db push
npx prisma generate
node prisma/seed.js
```

### 4. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 📂 Project Structure

- `/app` — Next.js App Router pages and API routes
  - `/app/api/admin` — Secure admin CRUD routes
  - `/app/api/auth` — Admin login/logout
- `/components` — Reusable UI components
- `/lib` — Auth utilities, Prisma client
- `/prisma` — Schema and seed script
