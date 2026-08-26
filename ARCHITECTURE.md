# Femmeera E-Commerce Architecture & System Design

## 1. System Overview

Femmeera is a high-performance, scalable, production-grade clothing brand e-commerce platform built using a decoupled architecture:
- **Customer Storefront**: Next.js (React / TypeScript / Tailwind CSS) optimized for high SEO, fast FCP/LCP, SSR/SSG/ISR, and responsive shopping across mobile and desktop.
- **Admin Panel**: Next.js (React / TypeScript / Tailwind CSS) designed **Mobile-First** to enable 100% full business operation, inventory control, dynamic category tree management, CMS management, and order processing directly from mobile devices, tablets, laptops, and desktops.
- **Backend Service**: Laravel (PHP) built as a **Modular Monolith** exposing stateless REST APIs, encapsulated service layers, strict DTO validation, and role-based policies.
- **Database & Storage**: MySQL for relational data integrity, Redis for session/cache/queue handling, and external object storage (S3 / Cloud Storage / Hostinger Object Storage) for media files.
- **CDN & Edge Layer**: Cloudflare handling SSL, WAF, DNS, DDOS mitigation, asset caching, and web traffic routing.

---

## 2. System Architecture Diagram

```
                              ┌───────────────────────────────────┐
                              │           End Users               │
                              │   (Mobile Storefront & Admin)    │
                              └─────────────────┬─────────────────┘
                                                │
                                                ▼
                              ┌───────────────────────────────────┐
                              │          Cloudflare CDN           │
                              │     (WAF / SSL / Edge Cache)      │
                              └─────────┬───────────────┬─────────┘
                                        │               │
                    ┌───────────────────┘               └───────────────────┐
                    ▼                                                       ▼
  ┌──────────────────────────────────┐                    ┌──────────────────────────────────┐
  │     Next.js Storefront (Web)     │                    │     Next.js Admin Panel (Web)    │
  │   - Dynamic Category Tree Nav    │                    │   - 100% Mobile Responsive       │
  │   - Dynamic SEO Category Slugs   │                    │   - Touch-optimized Workflows    │
  │   - SSR / SSG / ISR Pages        │                    │   - Category Tree Manager        │
  │   - EAV Attribute Filters        │                    │   - Real-time Analytics Widgets  │
  └─────────────────┬────────────────┘                    └─────────────────┬────────────────┘
                    │                                                       │
                    └───────────────────┐               ┌───────────────────┘
                                        ▼               ▼
                              ┌───────────────────────────────────┐
                              │      Laravel REST API Backend     │
                              │        (Modular Monolith)         │
                              │  - Controller -> Service Layer    │
                              │  - Auth & RBAC Policies          │
                              │  - Server-side Price Calculations │
                              │  - Transactional Inventory Engine │
                              │  - Category Tree & EAV Resolver   │
                              │  - Webhook Handlers               │
                              └─────────┬───────────────┬─────────┘
                                        │               │
            ┌───────────────────────────┼───────────────┴───────────────────────────┐
            ▼                           ▼                                           ▼
┌───────────────────────┐   ┌───────────────────────┐                   ┌───────────────────────┐
│     MySQL Database    │   │      Redis Cache      │                   │ Media / Object Storage│
│  - Relational Schema  │   │  - Response Cache     │                   │  - Product Images     │
│  - Category Hierarchy │   │  - Cart & Session Store│                  │  - Hero Banners       │
│  - EAV Attributes     │   │  - Queue / Async Jobs │                   │  - Optimized WebP/AVIF│
└───────────────────────┘   └───────────────────────┘                   └───────────────────────┘
```

---

## 3. Dynamic Women's Clothing Category Architecture

### 3.1 Hierarchical Category Tree Engine
The backend resolves category trees dynamically without hardcoded tables (`traditional_products` vs `western_products`). All products link directly to `category_id`.

```
Women (Root, parent_id = NULL, slug = 'women')
 ├── Traditional Wear (parent_id = 1, slug = 'traditional-wear')
 │    ├── Sarees (Future: parent_id = 2, slug = 'sarees')
 │    ├── Salwar Suits (Future: parent_id = 2, slug = 'salwar-suits')
 │    ├── Kurtis (Future: parent_id = 2, slug = 'kurtis')
 │    ├── Anarkali (Future: parent_id = 2, slug = 'anarkali')
 │    ├── Lehenga (Future: parent_id = 2, slug = 'lehenga')
 │    └── Ethnic Sets (Future: parent_id = 2, slug = 'ethnic-sets')
 └── Western Wear (parent_id = 1, slug = 'western-wear')
      ├── Dresses (Future: parent_id = 3, slug = 'dresses')
      ├── Tops (Future: parent_id = 3, slug = 'tops')
      ├── T-Shirts (Future: parent_id = 3, slug = 't-shirts')
      ├── Jeans (Future: parent_id = 3, slug = 'jeans')
      ├── Co-ord Sets (Future: parent_id = 3, slug = 'co-ord-sets')
      └── Jackets (Future: parent_id = 3, slug = 'jackets')
```

### 3.2 Dynamic URL Routing & Slug Resolution
- Route pattern: `/women/[...slug]`
- Resolver logic:
  - Request `/women/traditional` ➔ Matches `category.slug = 'traditional-wear'`, fetches products where `category_id = 2` OR subcategories under `id = 2`.
  - Request `/women/traditional/sarees` ➔ Matches subcategory `category.slug = 'sarees'`, fetches products where `category_id = 4`.
  - Request `/women/western/dresses` ➔ Matches subcategory `category.slug = 'dresses'`, fetches products where `category_id = 5`.

---

## 4. Flexible Product Attribute Engine (EAV Pattern)

To support rich clothing filters (Fabric, Occasion, Fit, Pattern, Size, Color) without adding hundreds of static columns to `products`:
1. `attributes`: Dictionary defining attribute types (`Fabric`, `Occasion`, `Fit`, `Pattern`).
2. `attribute_values`: Options (`Silk`, `Cotton`, `Wedding`, `Casual`, `Regular`, `Solid`).
3. `product_attribute_values`: Links products to values.

This structure allows the storefront to dynamically render filter sidebars based on active attributes present in the requested category.

---

## 5. Admin Mobile Category Management UI

### 5.1 Mobile Layout Specification

```
┌──────────────────────────────────────────┐
│  ☰  Femmeera Admin            🔔  👤     │
├──────────────────────────────────────────┤
│  Catalog ➔ Categories         [+ Add]    │
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │
│ │ 👗 Traditional Wear                  │ │
│ │ Path: /women/traditional              │ │
│ │ 12 Products • Active                 │ │
│ │ [Edit] [Add Subcategory] [Reorder]   │ │
│ └──────────────────────────────────────┘ │
│ ┌──────────────────────────────────────┐ │
│ │ 👚 Western Wear                      │ │
│ │ Path: /women/western                 │ │
│ │ 18 Products • Active                 │ │
│ │ [Edit] [Add Subcategory] [Reorder]   │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│  [📊 Dash] [📦 Orders] [👕 Items] [⚙️ More]│
└──────────────────────────────────────────┘
```

### 5.2 Mobile Touch Capabilities
- Drag-to-reorder categories via touch handles.
- Re-parent subcategories via simple drop-down selector.
- Inline status toggle switch (`Active` / `Disabled`).
