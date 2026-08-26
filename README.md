# 🛍️ Femmeera — Luxury Women's Fashion E-Commerce Platform

A complete, full-stack E-Commerce ecosystem built for luxury women's ethnic & western apparel. Featuring a modern Next.js 16 storefront, a real-time admin management dashboard, an automated Laravel 11 REST API, Razorpay payment gateway integration, and Influencer Coupon & Analytics generator.

---

## 🚀 Key Features

### 🛒 Customer Storefront (`storefront/`)
- **Modern Responsive Design**: Built with Next.js 16 (App Router), Tailwind CSS, and Lucide Icons.
- **Product Discovery & Filters**: Filter by size (`S`, `M`, `L`, `XL`, `XXL`), color, fabric, and dynamic category attributes.
- **Watch & Shop (9:16 Video Reels)**: Mobile-first interactive video reels with one-click "View Product" checkout links.
- **Razorpay Payment Gateway**: Real-time Razorpay checkout modal with Webhook processing (`payment.captured`, `order.paid`, `payment.failed`, `refund.processed`).
- **Cash on Delivery (COD)**: Complete COD order flow.
- **Influencer Coupons**: Real-time discount coupon validation & percentage/flat rate calculation.
- **Customer Portal**: Saved shipping addresses, order tracking, invoice printouts, and returns requesting.

### ⚙️ Admin Management Dashboard (`admin/`)
- **Real-Time Overview**: Live revenue metrics, today's sales, pending orders count, and low stock warnings.
- **Mobile-Exclusive Quick Actions Launcher**: Daily task launcher tiles formatted specifically for smartphone screens.
- **Influencer Coupon Generator**: Create promo codes assigned to influencers with commission tracking & sales analytics.
- **Order Processing & Return Requests**: Manage order statuses (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`) and approve/reject customer return requests with automated email notifications.
- **Catalog Management**: Add/edit clothing products, variants, stock inventory, categories, hero banners, and 9:16 video reels.

### ⚡ Laravel API Backend (`backend/`)
- **Laravel 11 REST API**: Clean architecture with Sanctum API Token Authentication.
- **Automated Email Notifications**: SMTP integration for order confirmation, shipping updates, and return approvals.
- **Database Architecture**: 31 core tables (`users`, `orders`, `order_items`, `products`, `coupons`, `payments`, `customer_returns`, etc.).
- **PHPUnit Test Suite**: 48 automated test assertions ensuring 100% pass rate across payment, auth, and catalog services.

---

## 🛠️ Project Structure

```text
femmeera-store/
├── backend/            # Laravel 11 REST API Engine
├── storefront/         # Next.js 16 Customer Storefront App
├── admin/              # Next.js 16 Admin Management Dashboard App
└── femmeera_db.sql     # Complete MySQL Database Dump
```

---

## 💻 Local Setup Instructions

### Prerequisites
- **PHP** >= 8.2 with OpenSSL, PDO, Mbstring extensions
- **Composer** >= 2.0
- **Node.js** >= 18.0
- **MySQL / MariaDB**

### 1. Database Setup
1. Open phpMyAdmin or MySQL CLI.
2. Create database and import `femmeera_db.sql`:
   ```bash
   mysql -u root -p < femmeera_db.sql
   ```

### 2. Backend Setup (`backend/`)
```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan storage:link
php artisan serve --port=8000
```

### 3. Storefront Setup (`storefront/`)
```bash
cd storefront
cp .env.example .env.local
npm install
npm run dev
```
*(Runs on `http://localhost:3000`)*

### 4. Admin Dashboard Setup (`admin/`)
```bash
cd admin
cp .env.example .env.local
npm install
npm run dev -p 3001
```
*(Runs on `http://localhost:3001`)*

---

## 🔒 Security & Privacy

- **`.env` files**, API keys, and local media uploads are automatically ignored via `.gitignore` to prevent sensitive credentials from leaking to public repositories.
- Sample configuration templates are provided in `.env.example` across all services.

---

## 🧪 Testing

Run backend test suite:
```bash
cd backend
vendor/bin/phpunit
```
*(48 tests, 167 assertions — 100% Pass Rate)*

---

## 📄 License
Licensed under the [MIT License](LICENSE).
