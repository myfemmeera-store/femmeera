# Femmeera Admin Role-Based Access Control (RBAC) Specification

## 1. Overview & Security Hierarchy

Admin security is enforced at the API layer via dual middleware guards:
1. `admin.access`: Verifies user is authenticated, has `user_type === 'ADMIN'`, and account status is `ACTIVE`. If a customer attempts to access `/api/v1/admin/*`, the API returns **403 Forbidden**.
2. `permission:<permission_name>`: Verifies that the admin's role possesses the specific granular permission required for the target route.

---

## 2. Operational Roles Breakdown

| Role | Module Focus | Primary Privileges |
| :--- | :--- | :--- |
| `SUPER_ADMIN` | Root System Control | Full unrestricted access. Bypasses permission checks. Can manage admin users & roles. |
| `ADMIN` | General Operations | All operational permissions except `users.*` management. |
| `PRODUCT_MANAGER` | Catalog & Content | `products.*`, `categories.*`, `collections.*`, `product_images.*` |
| `INVENTORY_MANAGER`| Warehouse Stock | `inventory.view`, `inventory.update` |
| `ORDER_MANAGER` | Fulfillment | `orders.view`, `orders.update`, `orders.cancel`, `orders.refund` |
| `MARKETING_MANAGER`| Campaigns & CMS | `coupons.*`, `offers.*`, `homepage.*`, `banners.*`, `popups.*` |

---

## 3. Granular Permission Index

```
products.view, products.create, products.update, products.delete
categories.view, categories.create, categories.update, categories.delete
inventory.view, inventory.update
orders.view, orders.update, orders.cancel, orders.refund
customers.view, customers.update
reviews.view, reviews.moderate
coupons.view, coupons.create, coupons.update, coupons.delete
offers.view, offers.create, offers.update, offers.delete
homepage.view, homepage.update
banners.view, banners.create, banners.update, banners.delete
popups.view, popups.create, popups.update, popups.delete
reports.view
settings.view, settings.update
users.view, users.create, users.update, users.delete
```

---

## 4. Audit Logging Trigger Map

Every administrative mutation writes a record to `audit_logs`:
- `ADMIN_LOGIN`, `ADMIN_LOGOUT`
- `ADMIN_USER_CREATED`, `ADMIN_ROLE_CHANGED`, `ADMIN_USER_DISABLED`
- `PRODUCT_CREATED`, `PRODUCT_UPDATED`, `PRICE_CHANGED`
- `INVENTORY_UPDATED`
- `ORDER_STATUS_CHANGED`
- `COUPON_CREATED`, `OFFER_CREATED`, `HOMEPAGE_UPDATED`
