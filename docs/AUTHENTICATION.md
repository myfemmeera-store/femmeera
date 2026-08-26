# Femmeera Backend Authentication Specification

## 1. Overview

Femmeera utilizes **Laravel Sanctum** token-based authentication. Frontend applications (Next.js Customer Storefront on port 3000 & Next.js Admin Panel on port 3001) authenticate statelessly by passing a `Authorization: Bearer <token>` HTTP header.

---

## 2. Authentication Flow

```
┌─────────────────────────────────┐
│     Next.js Client App          │
└────────────────┬────────────────┘
                 │
                 │ 1. POST /api/v1/auth/login { email, password }
                 ▼
┌─────────────────────────────────┐
│     Laravel AuthService         │
│  - Validate Request Payload     │
│  - Hash Check (Bcrypt)          │
│  - Verify Account Status ACTIVE │
│  - Create Sanctum Token         │
└────────────────┬────────────────┘
                 │
                 │ 2. Return JSON { success: true, data: { user, token } }
                 ▼
┌─────────────────────────────────┐
│     Client Local Storage        │
│     (Appends Bearer Header)     │
└─────────────────────────────────┘
```

---

## 3. Account Status Rules

Users in `users` table possess a `status` flag:
- `ACTIVE`: Normal operational account.
- `SUSPENDED`: Login attempt rejected with 422 ("Your account is currently suspended").
- `PENDING`: Email verification required.

Passwords are **never** stored in plain text and are hashed using Bcrypt (`BCRYPT_ROUNDS=12`).
