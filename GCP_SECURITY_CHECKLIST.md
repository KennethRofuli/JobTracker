# GCP Security Checklist for Job Tracker OAuth App

This checklist addresses the security issues identified in your Google Cloud Platform Project Checkup (January 4, 2026).

---

## 📋 **Pre-Requirements**

- [ ] GCP Project created ("Job Tracker")
- [ ] OAuth 2.0 Client ID created
- [ ] `.env` file configured with `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

---

## 🔐 **App Security Issues**

### 1. Cross-Account Protection

**Status:** ⚠️ Not Configured

**Steps to Fix:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: **APIs & Services** → **OAuth consent screen**
3. Scroll to **"Advanced Settings"** section
4. Enable **"Cross-Account Protection"**
5. This adds XSS protection headers and validates tokens across Google accounts

**Why this matters:** Prevents attackers from using stolen tokens across different Google accounts.

---

### 2. Use Secure OAuth Flows

**Status:** ⚠️ Vulnerable to Impersonation

**Current Issues:**
- ❌ No `state` parameter (CSRF vulnerability)
- ❌ JWT token exposed in URL redirect
- ❌ No PKCE (Proof Key for Code Exchange)

**Steps to Fix:**

#### A. Enable State Parameter (CSRF Protection)

**In GCP Console:**
1. No configuration needed - handled in code

**In Your Code:** (See Section 3 for implementation)
- Generate random `state` value before redirect
- Store in session/cookie
- Validate on callback

#### B. Remove Token from URL

**Current:** `?token=${token}` in URL (visible in browser history)

**Fixed:** Use secure httpOnly cookies or POST to frontend

#### C. Implement PKCE (Optional but Recommended)

**For public clients (browser extensions):**
1. Generate `code_verifier` (random string)
2. Create `code_challenge` (SHA256 hash)
3. Send `code_challenge` with auth request
4. Send `code_verifier` with token exchange

---

### 3. OAuth Consent Screen Configuration

**Steps:**

1. **APIs & Services** → **OAuth consent screen**
2. **User Type:** 
   - Choose "External" for public app
   - Choose "Internal" if only for your organization
3. **App Information:**
   - App name: "Job Tracker"
   - User support email: Your email
   - App logo: Upload logo (optional)
4. **Scopes:**
   - Review requested scopes (currently: profile, email)
   - ✅ Only request minimum necessary scopes
5. **Authorized domains:**
   - Add your production domain (e.g., `yourapp.com`)
   - Add `localhost` for development
6. **Developer contact information:**
   - Add at least 2 email addresses

---

## 👤 **Developer Identity Issues**

### 4. Billing Account Verification

**Status:** ⚠️ No Billing Account

**Steps to Fix:**

1. Navigate to: **Billing** → **Account Management**
2. Click **"Link a billing account"**
3. Options:
   - **Create new billing account:** Enter payment information
   - **Link existing billing account:** Select from dropdown
4. Accept Google Cloud Terms of Service
5. Verify billing is active

**Why this matters:**
- Required for production OAuth apps
- Increases API quotas
- Needed for certain GCP services
- Validates your identity as legitimate developer

**Cost Concerns:**
- OAuth and basic API usage is FREE
- You only pay for compute/storage resources you use
- Set up billing alerts to monitor spending

---

### 5. Project Contacts

**Status:** ⚠️ Incorrect Number of Owners/Editors

**Steps to Fix:**

1. Navigate to: **IAM & Admin** → **IAM**
2. Review current members
3. **Recommended Setup:**
   - At least **2 Owners** (for business continuity)
   - Appropriate **Editors** (for team members)
   - Use **Viewers** for read-only access
4. Click **"Grant Access"** to add members:
   - Email address: Team member's Google account
   - Role: Owner/Editor/Viewer
   - Click **"Save"**

**Best Practices:**
- Don't have too many Owners (security risk)
- Use service accounts for automated processes
- Regularly audit IAM permissions
- Remove users who leave the team

---

## 🌐 **Modern Platforms** (Already Passing)

### 6. Legacy Operating Systems ✅

**Status:** ✅ Passing - App runs on modern OS

### 7. Legacy Browsers ✅

**Status:** ✅ Passing - App supports modern browsers

---

## 🔒 **Additional Security Best Practices**

### Session Security

**Current Configuration Review:**

```javascript
cookie: {
    secure: true,              // ✅ HTTPS only in production
    httpOnly: true,            // ✅ Prevents XSS
    maxAge: 24 * 60 * 60 * 1000,  // ✅ 24 hours is reasonable
    sameSite: 'lax'           // ⚠️ ADD THIS: CSRF protection
}
```

**Recommendations:**
- [ ] Add `sameSite: 'lax'` or `'strict'` to cookies
- [ ] Reduce JWT expiry from 30 days to 7 days
- [ ] Implement refresh tokens for long-term sessions
- [ ] Add token rotation on each use

---

### Authorized Redirect URIs

**Steps:**

1. **APIs & Services** → **Credentials**
2. Click your OAuth 2.0 Client ID
3. **Authorized redirect URIs:**
   - Add: `http://localhost:5000/api/auth/google/callback` (development)
   - Add: `https://yourdomain.com/api/auth/google/callback` (production)
4. **Authorized JavaScript origins:**
   - Add: `http://localhost:3000` (development)
   - Add: `https://yourdomain.com` (production)
5. Click **"Save"**

**Security Note:** Never use wildcards in production redirect URIs

---

### OAuth Scopes Review

**Currently Requested:**
- `profile` - Basic profile information
- `email` - Email address

**Recommendations:**
- ✅ These are minimal and appropriate
- ⚠️ If you add more scopes later, justify each one
- ✅ Consider using incremental authorization

---

## 🚀 **Before Going to Production**

### Pre-Launch Checklist

- [ ] All GCP security issues resolved
- [ ] Billing account linked and verified
- [ ] OAuth consent screen fully configured
- [ ] Privacy Policy URL added
- [ ] Terms of Service URL added
- [ ] App verification completed (if requesting sensitive scopes)
- [ ] Authorized domains added
- [ ] Production redirect URIs configured
- [ ] Environment variables secured (never commit `.env`)
- [ ] HTTPS enabled on production server
- [ ] Rate limiting configured (✅ already done)
- [ ] Error logging enabled (✅ already done)
- [ ] CORS restricted to production domain

---

### Verification Status

**If using sensitive/restricted scopes, you'll need Google verification:**

1. **APIs & Services** → **OAuth consent screen**
2. Click **"Publish App"** (moves from Testing to Production)
3. Google may require verification if using:
   - Gmail API
   - Google Drive API
   - Other sensitive scopes

**Verification Process:**
- Submit app for review
- Provide privacy policy
- Demonstrate how you use OAuth data
- Response time: 4-6 weeks typically

**Your App:** Using only `profile` and `email` - likely no verification needed

---

## 📊 **Monitoring & Maintenance**

### Set Up Monitoring

1. **APIs & Services** → **Dashboard**
2. Monitor:
   - API quota usage
   - Error rates
   - Authentication success/failure rates
3. Set up alerts for unusual activity

### Regular Audits

- [ ] Monthly: Review IAM permissions
- [ ] Quarterly: Rotate OAuth client secrets
- [ ] Quarterly: Review authorized redirect URIs
- [ ] Yearly: Update privacy policy and ToS

---

## 🆘 **Troubleshooting Common Issues**

### "Redirect URI Mismatch" Error

**Solution:**
- Ensure callback URL in code exactly matches GCP console
- Check for trailing slashes
- Verify HTTP vs HTTPS

### "Access Blocked: This app's request is invalid"

**Solution:**
- Check OAuth consent screen configuration
- Verify scopes are approved
- Ensure app is published (or user is test user)

### "Invalid Client" Error

**Solution:**
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- Ensure no extra spaces or quotes
- Check client hasn't been deleted/regenerated

---

## 📚 **Additional Resources**

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**Last Updated:** January 4, 2026
**Status:** Configuration required before production deployment
