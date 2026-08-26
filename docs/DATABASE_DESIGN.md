# Femmeera E-Commerce Database Architecture Blueprint

## 1. Overview & Core Principles

- **Engine**: MySQL 8.0+ (InnoDB Engine)
- **Charset / Collation**: `utf8mb4_unicode_ci`
- **Primary Keys**: `BIGINT UNSIGNED AUTO_INCREMENT`
- **Monetary Storage**: `DECIMAL(12, 2)` (Strictly avoiding IEEE 754 floating-point inaccuracies)
- **Foreign Key Enforcement**: All relationships maintain referential integrity with explicit cascade / set null / restrict rules.

---

## 2. Table Schemas & Data Dictionary

### 2.1 USERS & AUTHORIZATION
- `users`: Core account table (`id`, `name`, `email`, `phone`, `password`, `user_type`: CUSTOMER/ADMIN, `status`: ACTIVE/SUSPENDED/PENDING).
- `roles`: RBAC roles (`SUPER_ADMIN`, `ADMIN`, `PRODUCT_MANAGER`, `INVENTORY_MANAGER`, `ORDER_MANAGER`, `MARKETING_MANAGER`).
- `permissions`: Module privileges (`products.manage`, `categories.manage`, `inventory.adjust`, `orders.manage`, `cms.manage`).
- `role_user`: Pivot mapping users to roles.
- `permission_role`: Pivot mapping roles to permissions.

### 2.2 CATALOG & CLOTHING VARIANTS
- `categories`: Self-referencing tree (`id`, `parent_id`, `name`, `slug`, `description`, `image_url`, `banner_url`, `sort_order`, `status`: ACTIVE/DISABLED/ARCHIVED).
  - Seeded initial structure: `Women` (root, `parent_id` = NULL) ➔ `Traditional Wear` & `Western Wear` (`parent_id` = 1).
- `collections`: Curated thematic collections (`id`, `name`, `slug`, `banner_url`, `is_featured`, `status`).
- `products`: Parent product definitions (`id`, `category_id`, `collection_id`, `name`, `slug`, `sku`, `brand`, `gender`, `status`, `is_featured`, `is_new`, `is_best_seller`).
- `product_variants`: Clothing size/color matrix (`id`, `product_id`, `sku`, `size`, `color`, `price`, `mrp`, `stock`, `low_stock_threshold`, `status`).
- `product_images`: Product media gallery (`id`, `product_id`, `product_variant_id`, `image_url`, `alt_text`, `sort_order`, `is_primary`).

### 2.3 INVENTORY ENGINE
- `inventory`: Current balance per variant (`id`, `variant_id`, `available_quantity`, `reserved_quantity`, `low_stock_threshold`).
- `inventory_transactions`: Auditable transaction log (`id`, `variant_id`, `type`: PURCHASE/SALE/RETURN/CANCELLATION/DAMAGE/ADJUSTMENT, `quantity`, `reference_type`, `reference_id`, `notes`, `created_by`).

### 2.4 ORDERS & SNAPSHOT RETENTION
- `orders`: Master order record (`id`, `user_id`, `order_number`, `subtotal`, `discount_amount`, `shipping_amount`, `tax_amount`, `total_amount`, `currency`, `payment_status`, `order_status`, `shipping_address_snapshot`, `billing_address_snapshot`).
- `order_items`: Line item immutable snapshots (`id`, `order_id`, `product_id`, `variant_id`, `product_name_snapshot`, `sku_snapshot`, `size_snapshot`, `color_snapshot`, `quantity`, `unit_price`, `discount_amount`, `total_amount`).
  - **Historical Accuracy**: Product name, SKU, size, color, and price at checkout are locked inside snapshots so future catalog updates do not alter past invoice amounts.
- `order_status_history`: Audit trail of status transitions (`id`, `order_id`, `previous_status`, `new_status`, `comment`, `changed_by`).

### 2.5 PAYMENTS & WEBHOOKS
- `payments`: Master gateway record (`id`, `order_id`, `provider`, `provider_payment_id`, `amount`, `currency`, `status`, `payment_method`, `paid_at`).
- `payment_transactions`: Gateway webhook log (`id`, `payment_id`, `transaction_type`, `provider_transaction_id`, `amount`, `status`, `response_data`).

### 2.6 CARTS & WISHLISTS
- `carts`: Persistent shopping cart (`id`, `user_id`, `session_id`, `status`).
- `cart_items`: Cart items (`id`, `cart_id`, `variant_id`, `quantity`).
- `wishlists` / `wishlist_items`: Customer saved products.

### 2.7 MARKETING & REVIEWS
- `coupons` / `coupon_usage`: Promo discount codes and redemption caps.
- `offers` / `offer_rules`: Dynamic discount campaigns.
- `reviews` / `review_images`: Moderated product reviews (`PENDING`, `APPROVED`, `REJECTED`).

### 2.8 CMS & POPUPS
- `homepage_sections`: Dynamic layout blocks (`HERO`, `PRODUCT_GRID`, `BANNER`, `CATEGORY_GRID`, `TESTIMONIAL`, `TEXT`, `NEWSLETTER`).
- `hero_banners`: Carousel slides (`desktop` and `mobile` image URLs).
- `popups`: Lead capture modals (`delay_seconds`, `frequency`, `coupon_code`).
- `announcements`: Notification bar settings.

### 2.9 SYSTEM & AUDIT LOGS
- `settings`: Key-value store config (`store_name`, `currency`, `free_shipping_threshold`).
- `notifications`: In-app notification queue.
- `audit_logs`: Administrative activity trail (`user_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `user_agent`).
