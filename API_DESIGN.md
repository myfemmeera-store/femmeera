# Femmeera E-Commerce REST API Design Specification

## 1. REST Standards & Conventions

- **Base URL**: `https://api.femmeera.com/api/v1`
- **Content Type**: `application/json`
- **Authentication**: Bearer Tokens (Laravel Sanctum)
- **Standard Envelope**:
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {},
  "meta": {
    "pagination": {
      "total": 120,
      "per_page": 15,
      "current_page": 1,
      "last_page": 8
    }
  }
}
```

---

## 2. Customer Storefront API Endpoints

### 2.1 Catalog & Dynamic Categories
- `GET /categories/tree` — Fetch nested dynamic category hierarchy for header navigation (Returns `Women -> Traditional Wear`, `Women -> Western Wear`, and subcategories).
- `GET /categories/{slug}` — Fetch category metadata, banner image, breadcrumb path, and child subcategories.
- `GET /categories/{slug}/products` — Query paginated products under category/subcategory with filter & sort support (`?subcategory=`, `?size=`, `?color=`, `?fabric=`, `?occasion=`, `?fit=`, `?min_price=`, `?max_price=`, `?sort=price_asc|price_desc|newest`, `?page=1`).
- `GET /categories/{slug}/filters` — Fetch available filter attributes (Fabric options, Occasion options, Size list, Color list) specific to products in this category.

### 2.2 Products Public API
- `GET /products` — Global product search & directory listing.
- `GET /products/{slug}` — Fetch product detail page data (parent product + variants + attributes + images + average rating + reviews).

### 2.3 Cart, Wishlist & Checkout
- `GET /cart` — Fetch cart contents.
- `POST /cart/items` — Add variant to cart.
- `POST /checkout/calculate` — **Server-side price calculation**: Calculates exact subtotal, discounts, shipping, tax, total.
- `POST /orders/create` — Place order, reserve stock.

---

## 3. Admin Panel API Endpoints (Mobile & Desktop Unified)

### 3.1 Admin Category Hierarchy Management
- `GET /admin/categories` — Fetch full category tree with product count statistics.
- `POST /admin/categories` — Create category/subcategory (`{ parent_id, name, slug, description, image_url, banner_url, sort_order, is_active, seo_title, seo_description }`).
- `GET /admin/categories/{id}` — Get category edit payload.
- `PUT /admin/categories/{id}` — Update category details or change `parent_id`.
- `POST /admin/categories/reorder` — Update sort orders of categories/subcategories (`{ items: [{ id: 2, sort_order: 1 }, { id: 3, sort_order: 2 }] }`).
- `DELETE /admin/categories/{id}` — Soft delete or archive category.

### 3.2 Dynamic Product Attributes Management
- `GET /admin/attributes` — List attribute dictionary (`Fabric`, `Occasion`, `Fit`, `Pattern`).
- `POST /admin/attributes` — Create new attribute definition.
- `POST /admin/attributes/{id}/values` — Add selectable options (`Silk`, `Cotton`, `Wedding`).
- `DELETE /admin/attributes/values/{value_id}` — Remove option.

### 3.3 Product & Variant Management
- `GET /admin/products` — Paginated product list.
- `POST /admin/products` — Create product (`{ category_id, name, slug, sku, mrp, selling_price, attributes: [value_ids] }`).
- `PUT /admin/products/{id}` — Update product & attributes.
- `POST /admin/products/{id}/variants` — Add size/color variant (`{ color_name, color_hex, size, sku, selling_price, mrp, stock_quantity }`).

### 3.4 Inventory & Orders
- `GET /admin/inventory` — View stock levels.
- `POST /admin/inventory/adjust` — Stock transaction adjustment log.
- `GET /admin/orders` — List orders with mobile card filters.
- `PUT /admin/orders/{id}/status` — Order status transition (`PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
