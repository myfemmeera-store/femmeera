# Femmeera REST API Architecture & Security Blueprint

## 1. REST Standards & API Versioning

- **Base URL**: `https://api.femmeera.com/api/v1`
- **Versioning Strategy**: Explicit URL prefixing `/api/v1/`
- **Content-Type**: `application/json`
- **Accept**: `application/json`
- **Authentication**: Bearer Token (Laravel Sanctum Personal Access Tokens)

---

## 2. API Response Envelope Conventions

### 2.1 Success Response Standard (200, 201)
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {
    "user": {
      "id": 1,
      "name": "Super Administrator",
      "email": "admin@femmeera.com",
      "user_type": "ADMIN",
      "roles": ["SUPER_ADMIN"]
    }
  },
  "meta": {
    "pagination": {
      "total": 100,
      "per_page": 15,
      "current_page": 1,
      "last_page": 7
    }
  }
}
```

### 2.2 Error Response Standard (400, 401, 403, 404, 422, 500)
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "email": [
      "The email field is required."
    ]
  }
}
```

---

## 3. Rate Limiting & Protection Rules

- `POST /api/v1/auth/login`: Max 5 attempts per minute per IP.
- `POST /api/v1/auth/register`: Max 5 attempts per minute per IP.
- `GET /api/v1/admin/*`: Max 60 requests per minute per authenticated user/IP.

---

## 4. Endpoints Catalogue

### 4.1 Customer & Admin Authentication (`/api/v1/auth`)
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register new customer account |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user and issue Bearer token |
| `GET` | `/api/v1/auth/me` | Authenticated | Get current logged-in user profile & roles |
| `POST` | `/api/v1/auth/logout` | Authenticated | Revoke current Bearer token & log audit event |
| `POST` | `/api/v1/auth/forgot-password` | Public | Request password reset token |
| `POST` | `/api/v1/auth/reset-password` | Public | Reset password with token |
| `POST` | `/api/v1/auth/verify-email` | Authenticated | Verify email address |

### 4.2 Protected Admin Management (`/api/v1/admin`)
| Method | Endpoint | Required Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/dashboard` | `reports.view` | Aggregated dashboard sales & order metrics |
| `GET` | `/api/v1/admin/users` | `users.view` | List admin users & roles (SUPER_ADMIN) |
| `POST` | `/api/v1/admin/users` | `users.create` | Create new admin user & assign role |
| `GET` | `/api/v1/admin/users/{id}`| `users.view` | Fetch admin user details |
| `PUT` | `/api/v1/admin/users/{id}`| `users.update` | Update admin user info, status, or role |
| `DELETE`| `/api/v1/admin/users/{id}`| `users.delete` | Disable admin user (SUPER_ADMIN protected) |
| `GET` | `/api/v1/admin/products` | `products.view` | Paginated product directory |
| `GET` | `/api/v1/admin/categories`| `categories.view` | Category tree hierarchy |
| `GET` | `/api/v1/admin/inventory` | `inventory.view` | Stock balance inventory levels |
| `GET` | `/api/v1/admin/orders` | `orders.view` | Master orders list |
| `GET` | `/api/v1/admin/customers`| `customers.view` | Registered customer directory |
| `GET` | `/api/v1/admin/reviews` | `reviews.view` | Review moderation queue |
| `GET` | `/api/v1/admin/coupons` | `coupons.view` | Promo coupons list |
| `GET` | `/api/v1/admin/offers` | `offers.view` | Promotional offer campaigns |
| `GET` | `/api/v1/admin/homepage` | `homepage.view` | Homepage CMS sections config |
| `GET` | `/api/v1/admin/banners` | `banners.view` | Hero slider banners |
| `GET` | `/api/v1/admin/popups` | `popups.view` | Lead capture popup rules |
| `GET` | `/api/v1/admin/reports` | `reports.view` | Analytics and sales reports |
