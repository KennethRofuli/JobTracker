# Mobile Authentication Fix

**Issue:** Authentication failed when using mobile browsers due to strict cookie policies.

**Date Fixed:** January 6, 2026

---

## Problem Description

The application was using cookie-based authentication with `sameSite: 'lax'` attribute. While this works well for desktop browsers and provides good CSRF protection, mobile browsers (Safari on iOS, Chrome on Android, etc.) have stricter cookie policies that can block cookies with `sameSite: 'lax'` in certain cross-site contexts, especially during OAuth redirects.

### Symptoms
- Users on mobile browsers couldn't complete Google OAuth login
- Cookies weren't being set or sent properly from mobile devices
- Authentication worked on desktop but failed on mobile

---

## Root Cause

1. **SameSite Cookie Policy**: The `sameSite: 'lax'` attribute blocks cookies in some cross-site requests on mobile browsers
2. **OAuth Flow on Mobile**: During OAuth redirects (Google → App), mobile browsers treat this as a cross-site request and block cookies
3. **Secure Flag**: Mobile browsers require `secure: true` when using `sameSite: 'none'`, but this wasn't being set in development

---

## Solution Implemented

We implemented **dynamic cookie configuration** based on User-Agent detection:

### 1. Created User-Agent Detection Utility

**File:** `backend/src/utils/userAgent.js`

```javascript
function isMobileBrowser(userAgent) {
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i;
    return mobileRegex.test(userAgent);
}

function getCookieConfig(userAgent, isProduction) {
    const isMobile = isMobileBrowser(userAgent);
    
    return {
        httpOnly: true,
        secure: isProduction || isMobile,  // Always secure for mobile
        sameSite: isMobile ? 'none' : 'lax',  // 'none' for mobile, 'lax' for desktop
        maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
    };
}
```

### 2. Updated Authentication Routes

**File:** `backend/src/routes/auth.js`

- OAuth callback now detects mobile browsers via User-Agent
- Applies appropriate cookie configuration based on device type
- Logout also uses matching cookie configuration to properly clear cookies

### 3. Updated Session Configuration

**File:** `backend/server.js`

- Session cookies use `sameSite: 'none'` in production for mobile compatibility
- Uses `sameSite: 'lax'` in development for easier local testing
- Auth token cookies use dynamic per-request configuration based on User-Agent

---

## Cookie Configuration by Device Type

### Mobile Browsers (iPhone, iPad, Android, etc.)
```javascript
{
    httpOnly: true,
    secure: true,           // Always secure for mobile
    sameSite: 'none',       // Allows cross-site cookies
    maxAge: 604800000       // 7 days
}
```

### Desktop Browsers
```javascript
{
    httpOnly: true,
    secure: isProduction,   // Only secure in production
    sameSite: 'lax',        // Better CSRF protection
    maxAge: 604800000       // 7 days
}
```

---

## Security Considerations

### Why This Is Safe

1. **CSRF Protection Still Active**:
   - OAuth state parameter validation still in place
   - HTTPS required for mobile (`secure: true`)
   - `httpOnly` flag prevents XSS attacks

2. **SameSite 'none' Requirements**:
   - Only used for mobile browsers
   - Requires `secure: true` (HTTPS only)
   - Modern browsers enforce this requirement

3. **Trade-offs**:
   - Mobile: Slightly less CSRF protection, but authentication works
   - Desktop: Maximum CSRF protection with `sameSite: 'lax'`

### Why SameSite 'none' for Mobile Is Necessary

Mobile browsers treat OAuth redirects as cross-site requests:
```
User → Google OAuth → Your App (cross-site redirect)
```

With `sameSite: 'lax'`, cookies aren't sent on the redirect back from Google, breaking authentication.

With `sameSite: 'none'` + `secure: true`, cookies work properly while maintaining security through:
- HTTPS encryption
- httpOnly flag (no JavaScript access)
- State parameter validation (CSRF protection)

---

## Testing

### Desktop Browser Test
```bash
curl -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)" \
  http://localhost:5000/api/auth/google
```
Expected: `sameSite: lax`, `secure: false` (in dev)

### Mobile Browser Test
```bash
curl -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)" \
  http://localhost:5000/api/auth/google
```
Expected: `sameSite: none`, `secure: true` (even in dev)

---

## Production Requirements

### HTTPS Is Mandatory for Mobile

For mobile authentication to work in production, you **must**:

1. ✅ Deploy with HTTPS enabled
2. ✅ Set `NODE_ENV=production` 
3. ✅ Configure proper `CLIENT_URL` in `.env`
4. ✅ Update Google OAuth redirect URIs to HTTPS

### Why HTTPS Is Required

Browsers **enforce** that `sameSite: 'none'` cookies must have `secure: true`, which requires HTTPS. Without HTTPS, mobile authentication will fail.

---

## Rollback Instructions

If you need to revert to the old behavior (desktop-only support):

1. Remove `backend/src/utils/userAgent.js`
2. In `backend/src/routes/auth.js`, replace:
   ```javascript
   const cookieConfig = getCookieConfig(userAgent, isProduction);
   res.cookie('auth_token', token, cookieConfig);
   ```
   With:
   ```javascript
   res.cookie('auth_token', token, {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'lax',
       maxAge: 7 * 24 * 60 * 60 * 1000
   });
   ```

---

## Related Files Modified

- `backend/src/utils/userAgent.js` (new)
- `backend/src/routes/auth.js`
- `backend/server.js`

---

## Additional Resources

- [MDN: SameSite Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [Chrome SameSite Cookie Changes](https://www.chromium.org/updates/same-site)
- [Safari Cookie Policy](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)
