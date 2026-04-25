# Job Tracker Browser Extension

## 🚀 Installation

1. **Add Icons** - Place three PNG files in the `icons/` folder:
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)
   
   You can create simple icons or download free ones from [flaticon.com](https://www.flaticon.com)

2. **Load Extension in Chrome/Edge:**
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the `extension` folder

3. **Start Your Backend:**
   ```bash
   cd backend
   npm run dev
   ```

## 📋 How to Use

### Method 1: Auto-Capture
1. Navigate to a job posting on LinkedIn, Indeed, Glassdoor, or Jobright.ai
2. Click the extension icon in your browser
3. Click "🎯 Auto-Capture from Page"
4. Review the captured data
5. Click "Save Application"

### Method 2: Manual Entry
1. Click the extension icon anywhere
2. Fill in Company Name and Job Title
3. Select Source and Status
4. Click "Save Application"

### Method 3: Auto-Save on Apply (Advanced)
- When you click "Apply" on LinkedIn, Indeed, or Jobright.ai, the extension automatically detects and saves the job
- You'll see a browser notification confirming the save

## ⚠️ Multiple Users on Same Computer

**IMPORTANT**: If multiple people use Job Tracker on the same computer:

1. **Always log out from the extension** when switching users
2. Click the extension icon → Click "Logout" button  
3. The next user should log in with their own account

**Why?** The extension stores login tokens locally in Chrome. If User A logs out from the website but NOT the extension, and User B logs in to the website, the extension will still use User A's token. This causes jobs to be saved to the wrong account and shows "already saved" errors.

**Best Practice:**
- When done using Job Tracker, logout from BOTH:
  - ✓ The website dashboard (click Logout button)
  - ✓ The browser extension (click extension icon → Logout)

## 🛠️ Troubleshooting

- **"Already saved" error when different users try to save same job:** Previous user didn't log out from extension. Click extension icon → Logout → Login with correct account
- **Extension not working?** Make sure your backend is running and you're logged in (click extension icon to check)
- **Can't capture data?** Refresh the job posting page (F5) and try again
- **CORS errors?** Make sure CORS is enabled in your backend (`app.use(cors())`)

## 🎯 Supported Job Sites

- LinkedIn Jobs
- Indeed
- Glassdoor
- OnlineJobs.ph
- Jobright.ai

More sites can be added by updating the selectors in `content.js`!
