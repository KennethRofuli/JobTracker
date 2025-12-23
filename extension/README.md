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
1. Navigate to a job posting on LinkedIn, Indeed, or Glassdoor
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
- When you click "Apply" on LinkedIn/Indeed, the extension automatically detects and saves the job
- You'll see a browser notification confirming the save

## 🛠️ Troubleshooting

- **Extension not working?** Make sure your backend is running on `http://localhost:5000`
- **Can't capture data?** Some job sites may have updated their HTML structure - you may need to update the selectors in `content.js`
- **CORS errors?** Make sure CORS is enabled in your backend (`app.use(cors())`)

## 🎯 Supported Job Sites

- LinkedIn Jobs
- Indeed
- Glassdoor

More sites can be added by updating the selectors in `content.js`!
