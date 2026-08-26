# Femmeera E-Commerce High-Performance & Scaling Specification

## 1. Multi-Tier Caching Blueprint

```
┌─────────────────────────────────────────────────────────────┐
│ Tier 1: Cloudflare Edge CDN Cache                           │
│ - Static assets (.js, .css, WebP/AVIF images) cached 30d   │
│ - HTML Page Edge Cache for static/ISR store pages           │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Tier 2: Next.js Storefront ISR & Memory Cache              │
│ - Static Generation (SSG) for static policy pages           │
│ - Incremental Static Regeneration (ISR) for Product & PDP   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Tier 3: Redis Server-Side Response & Data Cache             │
│ - Cached Categories & Collections JSON                      │
│ - Cached Storefront Homepage Config Payload                 │
│ - Session Caching & Queue Management                        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Tier 4: MySQL Database Query Optimization                   │
│ - Indexed Foreign Keys & Composite Filter Columns           │
│ - Eager Loading (`with(['variants', 'images'])`) to eliminate N+1│
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Image & Media Optimization Pipeline

Product media uploaded via Admin panel undergoes an automated client-side / server-side compression pipeline:
- **Formats**: Convert images to next-gen **WebP** and **AVIF** formats.
- **Sizes**:
  - `thumbnail`: 150x150 (Cart & Mobile Lists)
  - `medium`: 600x800 (Listing Card view)
  - `large`: 1200x1600 (Zoomable Product Detail View)
- **Upload Optimization**: Images uploaded via Admin mobile panel are compressed in-browser before API transmission to conserve mobile upload bandwidth.

---

## 3. Database Query & Indexing Strategy

- **Composite Indexing**:
  - `products`: `(is_active, is_featured, is_new_arrival, is_best_seller)`
  - `orders`: `(user_id, created_at)`, `(status, payment_status)`
  - `inventory_transactions`: `(product_variant_id, created_at)`
  - `reviews`: `(product_id, status)`
- **Pagination**: All listing endpoints enforce strict pagination (Default: 15 items per page, Max: 50 items per page). Infinite scroll on mobile storefront fetches cursor-paginated chunks.

---

## 4. Mobile Network Optimization Strategy

- **Bundle Reduction**: Admin & Storefront use dynamic `import()` code-splitting to ensure mobile page bundle remains < 120KB initial JS.
- **Debounced Inputs**: Search inputs use 350ms debouncing before triggering API network requests.
- **Optimistic UI Updates**: Cart quantity adjustments update local state immediately while syncs occur asynchronously in the background.
