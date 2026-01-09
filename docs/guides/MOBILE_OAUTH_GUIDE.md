# Mobile OAuth Authentication Guide

## Issue: OAuth Fails on iOS/Mobile Devices

### Problem
iOS Safari and other mobile browsers have strict privacy settings that can cause OAuth authentication to fail, particularly with session-based state validation.

### Root Causes
1. **Session cookies not persisting** across OAuth redirects on mobile browsers
2. **SameSite cookie restrictions** in iOS Safari
3. **Cross-domain cookie blocking** due to Intelligent Tracking Prevention (ITP)
4. **State parameter validation failing** when session is lost

### Solution Implemented

We've switched from session-based state storage to an in-memory Map for OAuth state validation. This is more reliable across mobile devices.

### Configuration Requirements

#### For Production Deployment:

1. **Ensure HTTPS is enabled** - Mobile browsers require secure connections for cookies
   
2. **Update your `.env` file** with these variables:
   ```env
   NODE_ENV=production
   CLIENT_URL=https://your-frontend-domain.com
   GOOGLE_CALLBACK_URL=https://your-backend-domain.com/api/auth/google/callback
   
   # Optional: Set if your frontend and backend are on different subdomains
   COOKIE_DOMAIN=.your-domain.com
   ```

3. **Google OAuth Console Setup**:
   - Add your mobile-accessible domain to authorized JavaScript origins:
     - `https://your-frontend-domain.com`
   - Add callback URLs:
     - `https://your-backend-domain.com/api/auth/google/callback`

#### For Local Testing on Mobile:

1. **Use ngrok or similar tunneling service** to expose your local server:
   ```bash
   ngrok http 5000
   ngrok http 3000
   ```

2. **Update your `.env` file** with ngrok URLs:
   ```env
   CLIENT_URL=https://your-ngrok-frontend.ngrok.io
   GOOGLE_CALLBACK_URL=https://your-ngrok-backend.ngrok.io/api/auth/google/callback
   ```

3. **Update Google OAuth Console** with ngrok URLs temporarily

### Testing on iOS

1. Open Safari on your iOS device
2. Navigate to your app URL
3. Click "Sign in with Google"
4. Complete the Google authentication
5. You should be redirected back successfully

### Troubleshooting

#### Still getting "Authentication Failed"?

1. **Check browser console** (on mobile, use Safari's Web Inspector connected to your Mac)
   
2. **Verify cookies are being set**:
   - Open your backend endpoint in Safari
   - Check Storage inspector for `auth_token` cookie

3. **Check OAuth state validation**:
   - Look at server logs for state validation errors
   - Error will show: `OAuth state validation failed`

4. **iOS Specific Issues**:
   - Enable "Prevent Cross-Site Tracking" toggle in Safari settings (counterintuitively, try both on and off)
   - Try in private browsing mode to rule out cached state
   - Clear Safari cache and try again

5. **Cookie Domain Issues**:
   - If frontend and backend are on different domains, ensure CORS is properly configured
   - Consider deploying frontend and backend on same domain with different paths

### Production Best Practices

For production with high traffic, replace the in-memory Map with:

1. **Redis** - For distributed systems
   ```javascript
   const redis = require('redis');
   const client = redis.createClient();
   
   // Store state
   await client.setEx(`oauth:${state}`, 600, Date.now().toString());
   
   // Validate state
   const exists = await client.exists(`oauth:${state}`);
   if (exists) {
       await client.del(`oauth:${state}`);
   }
   ```

2. **Database** - For simpler setups
   - Create an `OAuthState` collection with TTL index
   - Store state with expiration timestamp

### Alternative: Token-based Auth Flow

If cookie-based auth continues to be problematic on mobile, consider:

1. **Return token in URL fragment** (one-time use):
   ```javascript
   res.redirect(`${CLIENT_URL}/auth-success#token=${token}`);
   ```

2. **Frontend extracts and stores token** in localStorage

3. **Send token in Authorization header** for API calls

This avoids cookie restrictions but is slightly less secure (localStorage is accessible to JavaScript).

## Support

If you continue to experience issues:
1. Check server logs for detailed error messages
2. Enable verbose logging by adding console.log statements in auth routes
3. Test with different mobile browsers (Chrome iOS, Safari iOS, Firefox iOS)
4. Verify your production environment variables are correctly set
