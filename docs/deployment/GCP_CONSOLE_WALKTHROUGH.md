# GCP Console Configuration Walkthrough

**Interactive guide for configuring OAuth security in Google Cloud Console**

---

## 🎯 **Overview**

You'll be configuring:
1. OAuth Consent Screen
2. OAuth Credentials (Redirect URIs)
3. Cross-Account Protection
4. Billing Account
5. Project Permissions (IAM)

**Time needed:** ~15-20 minutes  
**Cost:** $0 (OAuth and basic services are free)

---

## 📋 **Prerequisites**

- ✅ Google account
- ✅ GCP project already created ("Job Tracker")
- ✅ OAuth 2.0 Client ID already created

**Not sure if you have these?** We'll check in Step 0.

---

## 🚀 **Step 0: Verify Your Setup**

### **0.1 - Open Google Cloud Console**

1. Go to: **https://console.cloud.google.com/**
2. Sign in with your Google account
3. You should see the main dashboard

### **0.2 - Select Your Project**

Look at the top navigation bar:

```
┌─────────────────────────────────────────────────────┐
│ ☰  Google Cloud   [Job Tracker ▼]   🔔   👤        │
└─────────────────────────────────────────────────────┘
                    └── Click here
```

1. **Click the project dropdown** (shows current project name)
2. Find and select **"Job Tracker"**
3. If you don't see it, you'll need to create a project first

**To create a new project:**
- Click "NEW PROJECT" in the project selector
- Name: "Job Tracker"
- Click "CREATE"
- Wait ~30 seconds for creation

---

## 🔐 **Step 1: Configure OAuth Consent Screen**

This is what users see when they click "Login with Google".

### **1.1 - Navigate to OAuth Consent Screen**

**Exact navigation:**
```
☰ Menu (top-left) 
  → APIs & Services 
    → OAuth consent screen
```

**Step-by-step:**
1. Click the **hamburger menu** (☰) in the top-left corner
2. Scroll down to **"APIs & Services"**
3. Click **"OAuth consent screen"**

You should now see the OAuth consent screen configuration page.

---

### **1.2 - Choose User Type**

You'll see two options:

```
○ Internal
  Only available to users in your organization

● External
  Available to any user with a Google Account
```

**Choose:** ● **External** (unless you have a Google Workspace)

Click **"CREATE"** or **"CONTINUE"**

---

### **1.3 - Configure App Information**

Fill out the form:

#### **App Information Section:**

| Field | What to Enter |
|-------|---------------|
| **App name*** | `Job Tracker` |
| **User support email*** | Your email (dropdown) |
| **App logo** | (Optional) Upload a logo image |

#### **App Domain Section:**

| Field | What to Enter | Notes |
|-------|---------------|-------|
| **Application home page** | `http://localhost:3000` | For development |
| **Application privacy policy link** | (Leave blank for now) | Add before going to production |
| **Application terms of service link** | (Leave blank for now) | Add before going to production |

#### **Authorized Domains Section:**

**For Development:**
- Leave blank or add: `localhost`

**For Production (add later):**
- Add your domain: `yourdomain.com` (without http:// or https://)

#### **Developer Contact Information:**

| Field | What to Enter |
|-------|---------------|
| **Email addresses*** | Your email (can add multiple) |

**Click:** "SAVE AND CONTINUE"

---

### **1.4 - Configure Scopes**

You'll see a list of scopes (permissions).

**Current scopes needed:**
- `userinfo.email`
- `userinfo.profile`
- `openid`

**To add scopes:**

1. Click **"ADD OR REMOVE SCOPES"** button
2. You'll see a side panel with available scopes

3. **Select these scopes:**
   ```
   ✓ .../auth/userinfo.email
     View your email address
   
   ✓ .../auth/userinfo.profile
     See your personal info
   
   ✓ openid
     Associate you with your personal info
   ```

4. Scroll down in the panel
5. Click **"UPDATE"**
6. Click **"SAVE AND CONTINUE"**

**Note:** These are non-sensitive scopes, so no Google verification needed!

---

### **1.5 - Add Test Users (While in Testing)**

If your app is in "Testing" mode, add test users:

1. Click **"ADD USERS"**
2. Enter email addresses of people who should test:
   - Your email
   - Any teammate emails
3. Click **"ADD"**
4. Click **"SAVE AND CONTINUE"**

**Note:** Skip this if you're publishing the app to production.

---

### **1.6 - Review and Submit**

1. Review all your settings
2. Click **"BACK TO DASHBOARD"**

**Your OAuth consent screen is now configured!** ✅

---

## 🔑 **Step 2: Configure OAuth 2.0 Credentials**

Now let's set up the redirect URIs.

### **2.1 - Navigate to Credentials**

**Exact navigation:**
```
☰ Menu 
  → APIs & Services 
    → Credentials
```

You'll see a list of credentials.

---

### **2.2 - Find Your OAuth 2.0 Client ID**

Look for:
```
OAuth 2.0 Client IDs
┌────────────────────────────────────────────────┐
│ Name               Type                         │
│ Web client 1      Web application         ⚙️ 🗑️ │
└────────────────────────────────────────────────┘
         └── Click the name
```

**Click on your OAuth 2.0 Client ID name**

---

### **2.3 - Configure Authorized JavaScript Origins**

Scroll to: **"Authorized JavaScript origins"**

**Current values to add:**

| Environment | URI to Add |
|-------------|------------|
| Development | `http://localhost:3000` |
| Development | `http://localhost:5000` |
| Production | `https://yourdomain.com` |

**To add:**
1. Click **"+ ADD URI"** under "Authorized JavaScript origins"
2. Paste: `http://localhost:3000`
3. Press Enter
4. Click **"+ ADD URI"** again
5. Paste: `http://localhost:5000`
6. Press Enter

---

### **2.4 - Configure Authorized Redirect URIs**

Scroll to: **"Authorized redirect URIs"**

**CRITICAL:** These must match EXACTLY what's in your code.

**Current values to add:**

| Environment | URI to Add |
|-------------|------------|
| Development | `http://localhost:5000/api/auth/google/callback` |
| Production | `https://yourdomain.com/api/auth/google/callback` |

**To add:**
1. Click **"+ ADD URI"** under "Authorized redirect URIs"
2. Paste: `http://localhost:5000/api/auth/google/callback`
3. Press Enter
4. **Verify:** No typos, no trailing slashes!

**Click "SAVE" at the bottom**

You'll see a success message.

**Your OAuth credentials are now configured!** ✅

---

## 🛡️ **Step 3: Enable Cross-Account Protection**

This prevents token theft across Google accounts.

### **3.1 - Navigate to OAuth Consent Screen Again**

**Exact navigation:**
```
☰ Menu 
  → APIs & Services 
    → OAuth consent screen
```

---

### **3.2 - Find Advanced Settings**

Scroll down on the OAuth consent screen page.

Look for a section called **"Advanced settings"** or similar.

**Note:** This feature may be:
- In a separate "Advanced" tab
- Under "Additional settings"
- May require clicking "EDIT APP"

---

### **3.3 - Enable Cross-Account Protection**

Look for:
```
□ Enable Cross-Account Protection
  Protect users from cross-account attacks
```

**Check the box:** ✓ Enable Cross-Account Protection

**Click "SAVE"**

**Cross-Account Protection is now enabled!** ✅

---

## 💳 **Step 4: Link Billing Account**

Required for production apps and increased quotas.

### **4.1 - Navigate to Billing**

**Exact navigation:**
```
☰ Menu 
  → Billing
```

Or click the notification banner if you see one.

---

### **4.2 - Link or Create Billing Account**

You'll see one of these screens:

#### **Option A: No Billing Account**

```
┌──────────────────────────────────────┐
│  Set up billing for this project     │
│                                      │
│  [Link a billing account]            │
│  [Create a billing account]          │
└──────────────────────────────────────┘
```

**If new to GCP:**
1. Click **"Create a billing account"**
2. Enter payment information
3. Accept terms
4. Click "START MY FREE TRIAL" (if offered)

**Google offers:**
- $300 free credits (new accounts)
- Free tier for many services
- OAuth is FREE (no charges)

---

#### **Option B: Have Existing Billing Account**

```
┌──────────────────────────────────────┐
│  Select a billing account:           │
│                                      │
│  ○ My Billing Account                │
│  ○ Create new billing account        │
│                                      │
│  [LINK]                              │
└──────────────────────────────────────┘
```

1. Select your billing account
2. Click **"SET ACCOUNT"** or **"LINK"**

---

### **4.3 - Verify Billing is Active**

After linking, you should see:

```
✓ Billing account: My Billing Account
  Status: Active
```

**Billing is now linked!** ✅

**Cost concerns?**
- OAuth usage is FREE
- Set up billing alerts:
  1. Go to: Billing → Budgets & alerts
  2. Click "CREATE BUDGET"
  3. Set alert at $1, $5, $10
  4. You'll get email notifications

---

## 👥 **Step 5: Configure IAM Permissions**

Add project owners/editors for business continuity.

### **5.1 - Navigate to IAM**

**Exact navigation:**
```
☰ Menu 
  → IAM & Admin 
    → IAM
```

---

### **5.2 - Review Current Members**

You'll see a list:

```
┌─────────────────────────────────────────────────────┐
│ Principal          Role                Conditions    │
├─────────────────────────────────────────────────────┤
│ you@gmail.com      Owner               -            │
└─────────────────────────────────────────────────────┘
```

---

### **5.3 - Add Additional Members (Optional but Recommended)**

**Best practice:** Have at least 2 owners.

**To add a member:**

1. Click **"GRANT ACCESS"** (or "+ ADD")
2. Enter:

| Field | What to Enter |
|-------|---------------|
| **New principals** | Email of team member |
| **Role** | Owner (for full access) |
|        | Editor (for dev access) |
|        | Viewer (for read-only) |

3. Click **"SAVE"**

**Recommended setup:**
- 2 Owners (you + backup)
- Editors for developers
- Viewers for stakeholders

---

### **5.4 - Remove Unnecessary Access**

Review the list and remove anyone who:
- Left the team
- No longer needs access

**To remove:**
1. Find the member
2. Click the delete icon (🗑️)
3. Confirm

**IAM permissions are now configured!** ✅

---

## ✅ **Step 6: Verify Everything**

Let's check your configuration is correct.

### **6.1 - Check OAuth Consent Screen**

Navigate to: **APIs & Services → OAuth consent screen**

**Verify:**
- ✅ App name: "Job Tracker"
- ✅ User support email: Set
- ✅ Scopes: email, profile, openid
- ✅ Publishing status: Testing (ok) or In Production

---

### **6.2 - Check Credentials**

Navigate to: **APIs & Services → Credentials**

**Verify your OAuth 2.0 Client ID has:**
- ✅ JavaScript origins: `http://localhost:3000`, `http://localhost:5000`
- ✅ Redirect URIs: `http://localhost:5000/api/auth/google/callback`

---

### **6.3 - Check Billing**

Navigate to: **Billing**

**Verify:**
- ✅ Billing account linked
- ✅ Status: Active

---

### **6.4 - Check IAM**

Navigate to: **IAM & Admin → IAM**

**Verify:**
- ✅ At least 1 Owner (you)
- ✅ Recommended: 2+ Owners

---

## 🎉 **Step 7: Get Your Credentials for .env**

### **7.1 - Navigate to Credentials**

```
☰ Menu → APIs & Services → Credentials
```

---

### **7.2 - Find Your OAuth 2.0 Client ID**

Click on your OAuth Client name to expand details.

You'll see:

```
┌──────────────────────────────────────────┐
│ Client ID                                │
│ 123456789-abc123.apps.googleusercontent.com │
│                                    [Copy] │
│                                          │
│ Client Secret                            │
│ GOCSPX-abcdefghijklmnop                 │
│                                    [Copy] │
└──────────────────────────────────────────┘
```

---

### **7.3 - Copy to Your .env File**

**Copy these values:**

1. Click **Copy** next to "Client ID"
2. Paste in your `backend/.env`:
   ```env
   GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
   ```

3. Click **Copy** next to "Client Secret"
4. Paste in your `backend/.env`:
   ```env
   GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
   ```

**⚠️ Security Warning:**
- Never commit `.env` to git
- Never share your Client Secret
- Add `.env` to `.gitignore`

---

## 🧪 **Step 8: Test Your Configuration**

### **8.1 - Start Your Application**

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

---

### **8.2 - Test Login Flow**

1. Open: `http://localhost:3000`
2. Click **"Login with Google"**
3. You should see Google's OAuth consent screen:

```
┌──────────────────────────────────────┐
│         Google                       │
│                                      │
│  Job Tracker wants to access your   │
│  Google Account                      │
│                                      │
│  This will allow Job Tracker to:    │
│  • View your email address           │
│  • View your basic profile info      │
│                                      │
│  [Cancel]  [Continue]                │
└──────────────────────────────────────┘
```

4. Click **"Continue"**
5. Should redirect to your dashboard

---

### **8.3 - Verify Security**

**In browser DevTools (F12):**

1. **Check URL (after login):**
   - ✅ Should be: `/auth-success`
   - ❌ Should NOT have: `?token=...`

2. **Check Cookies (Application tab → Cookies):**
   - ✅ Should see: `auth_token`
   - ✅ HttpOnly: true
   - ✅ SameSite: Lax

3. **Check Network tab:**
   - Look at redirect to Google
   - ✅ Should see: `&state=<random-string>`

**If all checks pass:** 🎉 **Success!**

---

## 🚨 **Common Issues & Solutions**

### **Issue: "Redirect URI mismatch"**

**Error message:**
```
Error 400: redirect_uri_mismatch
```

**Cause:** Redirect URI in GCP doesn't match code.

**Solution:**
1. Check your backend code shows: `/api/auth/google/callback`
2. Go to: GCP Console → Credentials
3. Verify redirect URI is **exactly:**
   ```
   http://localhost:5000/api/auth/google/callback
   ```
4. No trailing slash!
5. Check for typos
6. Save and wait 5 minutes for changes to propagate

---

### **Issue: "Access blocked: This app's request is invalid"**

**Cause:** OAuth consent screen not configured.

**Solution:**
1. Go to: OAuth consent screen
2. Verify app name is set
3. Verify scopes are added
4. If in Testing mode, add your email as test user
5. Click "PUBLISH APP" if ready for production

---

### **Issue: "This app isn't verified"**

**Warning screen:**
```
This app isn't verified
Job Tracker wants access to your Google Account
```

**This is NORMAL for apps in testing mode.**

**To proceed:**
1. Click **"Advanced"** (small link at bottom)
2. Click **"Go to Job Tracker (unsafe)"**
3. This only appears for app owner/testers

**To remove warning (for public apps):**
- Submit app for Google verification
- Or use only basic scopes (email, profile) - no verification needed

---

### **Issue: Can't find "Cross-Account Protection" setting**

**Cause:** UI varies by account type.

**Solution:**
1. This feature may be automatic for basic scopes
2. Check: OAuth consent screen → Edit
3. Look under "Advanced settings" or "Additional configuration"
4. If not visible, it may be enabled by default for your scope selection

---

### **Issue: Billing warning persists**

**Cause:** GCP takes time to update status.

**Solution:**
1. Verify billing account is linked
2. Wait 5-10 minutes
3. Refresh the Project Checkup page
4. Clear browser cache if needed

---

## 📱 **For Production Deployment**

When you're ready to deploy to production:

### **Update OAuth Consent Screen:**
1. Add production domain to "Authorized domains"
2. Add Privacy Policy URL
3. Add Terms of Service URL
4. Click "PUBLISH APP" (if not already)

### **Update Credentials:**
1. Add production JavaScript origin: `https://yourdomain.com`
2. Add production redirect URI: `https://yourdomain.com/api/auth/google/callback`
3. Keep localhost URIs for development

### **Update Backend .env:**
```env
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
```

---

## 📞 **Need More Help?**

### **GCP Documentation:**
- [OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [OAuth Consent Screen](https://support.google.com/cloud/answer/10311615)

### **Your Project Docs:**
- [TESTING_QUICK_START.md](TESTING_QUICK_START.md) - Local testing
- [OAUTH_SECURITY_IMPLEMENTATION.md](OAUTH_SECURITY_IMPLEMENTATION.md) - Code details
- [GCP_SECURITY_CHECKLIST.md](GCP_SECURITY_CHECKLIST.md) - Complete checklist

---

## ✅ **Completion Checklist**

Mark each as you complete:

- [ ] Project selected in GCP Console
- [ ] OAuth consent screen configured
- [ ] Scopes added (email, profile, openid)
- [ ] Authorized JavaScript origins added
- [ ] Authorized redirect URIs added
- [ ] Cross-Account Protection enabled (if available)
- [ ] Billing account linked
- [ ] IAM permissions configured
- [ ] Credentials copied to .env
- [ ] Local testing successful
- [ ] Login flow works
- [ ] Security checks pass (no token in URL, cookie present)

**When all checked:** 🎉 **You're done!**

---

**Total time:** 15-20 minutes  
**Difficulty:** Easy ⭐⭐  
**Result:** Secure, production-ready OAuth configuration
