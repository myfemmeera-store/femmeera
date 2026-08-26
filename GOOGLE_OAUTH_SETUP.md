# Google OAuth 2.0 / OpenID Connect Setup Guide (Femmeera Store)

This guide provides step-by-step instructions to configure Google Cloud Console OAuth 2.0 credentials for both **Local Development** and **Hostinger Production Deployment**.

---

## 1. Google Cloud Console Configuration

### Step 1: Create or Select a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown at the top bar and click **New Project**.
3. Enter Project Name (e.g., `Femmeera Store`) and click **Create**.

---

### Step 2: Configure OAuth Consent Screen
1. Navigate to **APIs & Services** > **OAuth consent screen**.
2. Select **External** user type and click **Create**.
3. Fill in the App Information:
   - **App Name**: `Femmeera`
   - **User Support Email**: `your-support-email@domain.com`
   - **Developer Contact Email**: `your-email@domain.com`
4. Click **Save and Continue**.
5. In the **Scopes** section, add the following scopes:
   - `openid`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
6. Click **Save and Continue** until completed.

---

### Step 3: Create OAuth 2.0 Client Credentials
1. Navigate to **APIs & Services** > **Credentials**.
2. Click **+ CREATE CREDENTIALS** at the top and select **OAuth client ID**.
3. Select Application Type: **Web application**.
4. Set Name: `Femmeera Web Client`.

---

### Step 4: Configure Authorized JavaScript Origins & Redirect URIs

#### A. Local Development:
- **Authorized JavaScript origins**:
  - `http://localhost:3000`
  - `http://localhost:8000`
- **Authorized redirect URIs**:
  - `http://localhost:8000/api/v1/auth/google/callback`

#### B. Hostinger Production Deployment:
- **Authorized JavaScript origins**:
  - `https://femmeera.com` (replace with your actual domain)
- **Authorized redirect URIs**:
  - `https://femmeera.com/api/v1/auth/google/callback`

5. Click **Create**.
6. Copy your **Client ID** and **Client Secret**.

---

## 2. Environment Variables Configuration

### A. Local Development Environment (`.env`)

#### Backend (`backend/.env`):
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

#### Storefront (`storefront/.env.local`):
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

---

### B. Hostinger Production Environment Configuration

On Hostinger cPanel / hPanel environment variables setting:

#### Backend Production Environment:
```env
GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-production-client-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/v1/auth/google/callback
FRONTEND_URL=https://yourdomain.com
```

#### Storefront Production Environment:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com
NEXT_PUBLIC_API_BASE_URL=https://yourdomain.com/api/v1
```

---

## 3. Security Recommendations
- **Never commit `.env` files** containing `GOOGLE_CLIENT_SECRET` to GitHub or public repositories.
- Backend token verification uses direct HTTPS communication with Google (`https://oauth2.googleapis.com/tokeninfo`).
- Frontend never accesses `GOOGLE_CLIENT_SECRET`.
