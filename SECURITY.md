# Femmeera E-Commerce Security Architecture

## 1. Security Framework Overview

Femmeera enforces a **Defense-in-Depth** security architecture:
1. **Edge Level**: Cloudflare WAF, DDoS protection, Bot mitigation, Rate limiting.
2. **Transport Level**: Enforced HTTPS/TLS 1.3 encryption.
3. **Application Level**: Strict Input Validation, CORS policies, XSS escaping, CSRF protection, Prepared SQL Statements.
4. **Auth & Authorization**: Token authentication (Laravel Sanctum), Granular RBAC policies, Password hashing (Argon2id/Bcrypt).
5. **Data & Webhook Verification**: Server-side HMAC SHA256 signature verification for all payment webhooks, zero frontend price trust.

---

## 2. Admin Role-Based Access Control (RBAC) Matrix

| Role | Catalog CRUD | Stock Adjust | Order Process | CMS / Popups | Coupons / Offers | Admin Users | Audit Logs |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `SUPER_ADMIN` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `ADMIN` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `PRODUCT_MANAGER` | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `INVENTORY_MANAGER`| ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `ORDER_MANAGER` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `MARKETING_MANAGER`| ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |

---

## 3. Server-Side Webhook Verification Engine

Payments are NEVER approved based on frontend success callbacks.
All Razorpay gateway webhooks pass through server signature checks:

```
                  ┌────────────────────────────────┐
                  │    Razorpay Webhook Payload    │
                  └───────────────┬────────────────┘
                                  │
                                  ▼
                  ┌────────────────────────────────┐
                  │ Extract `X-Razorpay-Signature` │
                  └───────────────┬────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│ Compute HMAC-SHA256(Raw Request Body, Configured Webhook Secret)  │
└─────────────────────────────────┬────────────────────────────────┘
                                  │
                ┌─────────────────┴─────────────────┐
                ▼                                   ▼
        [Signature Matches]               [Signature Mismatch]
                │                                   │
                ▼                                   ▼
  ┌──────────────────────────┐        ┌──────────────────────────┐
  │ Process Payment Update   │        │ Reject Request (401/400) │
  │ Confirm Order Status     │        │ Log Security Incident    │
  │ Transaction Record: SALE │        └──────────────────────────┘
  └──────────────────────────┘
```

---

## 4. Rate Limiting & Protection Rules

- **Authentication Endpoints (`/api/v1/auth/login`, `/api/v1/admin/auth/login`)**: Max 5 attempts per minute per IP.
- **Checkout Endpoints (`/api/v1/checkout/calculate`, `/api/v1/orders/create`)**: Max 10 attempts per minute per user/IP.
- **Public API Endpoints (`/api/v1/products`, `/api/v1/categories`)**: Max 60 requests per minute per IP.
- **Webhook Endpoints (`/api/v1/webhooks/*`)**: IP restricted & signed signature validation.

---

## 5. Security Audit Log System

Every administrative action automatically records a non-volatile record in `audit_logs`:
- **Logged Fields**: `user_id`, `action`, `ip_address`, `user_agent`, `old_values_json`, `new_values_json`, `created_at`.
- **Monitored Actions**: `PRODUCT_UPDATE`, `STOCK_ADJUSTMENT`, `ORDER_STATUS_CHANGE`, `REFUND_INITIATE`, `COUPON_CREATE`, `ADMIN_LOGIN`.
