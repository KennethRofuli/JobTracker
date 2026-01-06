# Quick Start: Testing Secure OAuth Implementation

**Goal:** Test the new secure OAuth flow locally before GCP configuration.

---

## 🚀 **5-Minute Test Setup**

### **Step 1: Update Environment Variables** (1 min)

Edit `backend/.env`:

```env
# Google OAuth (use your existing credentials)
GOOGLE_CLIENT_ID=your-existing-client-id
GOOGLE_CLIENT_SECRET=your-existing-secret

# Generate new secure secrets
JWT_SECRET=<paste-new-secret-here>
SESSION_SECRET=<paste-new-secret-here>

# Local development
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGODB_URI=your-mongodb-uri
```

**Generate secrets (Windows PowerShell):**
```powershell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Run this command **twice** to get two different secrets (one for JWT, one for SESSION).

---

### **Step 2: Install & Start Backend** (2 min)

```bash
cd backend
npm install
npm start
```

Should see:
```
✓ MongoDB Connected
✓ Server running on port 5000
```

---

### **Step 3: Start Frontend** (1 min)

```bash
cd frontend
npm start
```

Browser should open to: `http://localhost:3000`

---

### **Step 4: Test OAuth Flow** (1 min)

1. Click **"Login with Google"**
2. Complete Google authentication
3. **Check:** URL after redirect should be `/auth-success` (no `?token=`)
4. Should automatically redirect to dashboard

---

## ✅ **Verify Security Improvements**

### **Test 1: Token Not in URL** ✅

**After login, check the URL:**
- ❌ Bad: `http://localhost:3000/auth-success?token=eyJhbG...`
- ✅ Good: `http://localhost:3000/auth-success`

### **Test 2: Secure Cookie Present** ✅

**Open DevTools (F12) → Application tab → Cookies:**

Look for cookie named `auth_token`:
- ✅ HttpOnly: true
- ✅ Secure: false (ok in development)
- ✅ SameSite: Lax
- ✅ Expires: 7 days from now

### **Test 3: State Parameter (CSRF Protection)** ✅

**Open DevTools → Network tab:**

1. Click login
2. Find redirect to `accounts.google.com`
3. Check query parameters
4. Should see: `&state=<long-random-string>`

### **Test 4: Logout Clears Cookie** ✅

1. Click logout
2. Check DevTools → Application → Cookies
3. `auth_token` should be gone

### **Test 5: Can't Access Without Cookie** ✅

1. Logout
2. Try to visit `http://localhost:3000` directly
3. Should redirect to login

---

## 🔍 **Troubleshooting**

### Issue: "Cannot connect to backend"

**Fix:**
```bash
# Make sure backend is running on port 5000
cd backend
npm start
```

---

### Issue: "Invalid redirect_uri"

**Fix:** Add to GCP Console → Credentials → OAuth 2.0 Client:
- Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`

---

### Issue: "Invalid state"

**Causes:**
1. Session not persisting (check `SESSION_SECRET` is set)
2. Cookie settings in browser
3. Third-party cookies blocked

**Fix:**
- Ensure `SESSION_SECRET` in `.env`
- Use same domain (don't mix localhost and 127.0.0.1)
- Check browser privacy settings

---

### Issue: Cookie not set

**Fix:**
1. Check CORS: `CLIENT_URL=http://localhost:3000` (exact match)
2. Verify frontend uses `withCredentials: true`
3. Don't mix `localhost` with `127.0.0.1`

---

## 📊 **Visual Verification**

### **Before (Insecure):**
```
URL: /auth-success?token=eyJhbGciOiJIUzI1NiIs...
                   ^^^^^^^^^^^^^^^^^^^^^^^^
                   ❌ Token visible in URL!

Cookies: (empty)
LocalStorage: 
  token: "eyJhbGciOiJIUzI1NiIs..."
         ❌ Accessible by JavaScript
```

### **After (Secure):**
```
URL: /auth-success
     ✅ No token in URL!

Cookies:
  auth_token: eyJhbGciOiJIUzI1NiIs...
    • HttpOnly: true ✅
    • Secure: true (in prod) ✅
    • SameSite: Lax ✅

LocalStorage: (empty)
```

---

## 🎯 **What Changed**

| Feature | Before | After |
|---------|--------|-------|
| Token location | URL + localStorage | httpOnly cookie |
| JavaScript access | ✅ Yes (vulnerable) | ❌ No (secure) |
| CSRF protection | ❌ None | ✅ State param + SameSite |
| XSS vulnerability | ❌ Vulnerable | ✅ Protected |
| Browser history | ❌ Token saved | ✅ Clean URLs |
| Token expiry | 30 days | 7 days |

---

## 📝 **Next: GCP Configuration**

After local testing works, configure GCP:

1. Follow [GCP_SECURITY_CHECKLIST.md](GCP_SECURITY_CHECKLIST.md)
2. Enable Cross-Account Protection
3. Link billing account
4. Add project contacts
5. Update OAuth consent screen

---

## ✅ **Success Criteria**

You're ready for production when:

- [x] Local testing successful
- [x] Token not in URL
- [x] Cookie configured correctly
- [x] State parameter visible in network tab
- [x] Logout clears cookie
- [ ] GCP security settings configured
- [ ] Production .env file ready
- [ ] HTTPS enabled on production
- [ ] Production redirect URIs added to GCP

---

**Time to complete:** ~5-10 minutes  
**Difficulty:** Easy ⭐

For detailed troubleshooting, see [OAUTH_SECURITY_IMPLEMENTATION.md](OAUTH_SECURITY_IMPLEMENTATION.md).
