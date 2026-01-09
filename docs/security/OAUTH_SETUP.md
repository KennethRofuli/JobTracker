# Google OAuth Setup Guide

## 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback`
     - For production: `https://yourdomain.com/api/auth/google/callback`
   - Add authorized JavaScript origins:
     - `http://localhost:3000`
     - For production: `https://yourdomain.com`

5. Copy the Client ID and Client Secret

## 2. Configure Backend

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Google OAuth credentials to `.env`:
   ```
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   JWT_SECRET=your_random_jwt_secret
   SESSION_SECRET=your_random_session_secret
   CLIENT_URL=http://localhost:3000
   ```

3. Generate random secrets:
   ```bash
   # Use Node.js to generate random strings
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## 3. Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## 4. Start the Application

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm start
```

## 5. Extension Setup

1. After logging in to the web app, copy your token:
   - Open browser DevTools (F12)
   - Go to Console
   - Type: `localStorage.getItem('token')`
   - Copy the token value

2. Open the browser extension popup
3. Paste the token in the "Paste token here" field
4. Click "Save Token"

Alternatively, click "Login with Google" in the extension to open the web app login page.

## 6. First Time Login

1. Open `http://localhost:3000` in your browser
2. Click "Continue with Google"
3. Authorize the application
4. You'll be redirected to the dashboard

## Production Deployment

For production:
1. Update `CLIENT_URL` in backend `.env` to your production domain
2. Update authorized redirect URIs in Google Cloud Console
3. Use environment variables for sensitive data
4. Enable HTTPS
5. Set `NODE_ENV=production`

## Troubleshooting

### "Redirect URI mismatch" error
- Make sure the redirect URI in Google Console exactly matches: `http://localhost:5000/api/auth/google/callback`

### "Invalid token" error
- Token may have expired (30-day expiration)
- Log in again to get a new token

### Extension not saving jobs
- Make sure you're logged in (check extension popup)
- Verify backend is running on port 5000
- Check browser console for errors
