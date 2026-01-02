# Auto Job Tracker

A comprehensive MERN stack application that automatically tracks your job applications using a browser extension. Say goodbye to manual spreadsheets and hello to automated job application tracking!

## Features

- **Automatic Capture**: Browser extension automatically captures job details when you apply
- **Interactive Dashboard**: Beautiful React dashboard to view and manage all applications
- **Smart Search & Filter**: Quickly find applications by company, title, or status
- **Real-time Stats**: Track your application metrics with clickable stat cards
- **Duplicate Prevention**: Intelligent system prevents duplicate entries
- **Quick Access**: Click company names to revisit job postings
- **Location Tracking**: Automatically captures job location information
- **Multi-Site Support**: Works on Indeed, LinkedIn, Glassdoor, and OnlineJobs.ph
- **Google OAuth**: Secure authentication with your Google account

## Tech Stack

### Backend
- **Node.js** & **Express.js** - RESTful API server
- **MongoDB Atlas** - Cloud database with indexed duplicate prevention
- **Mongoose** - ODM for MongoDB
- **Passport.js** - Google OAuth authentication
- **JWT** - Token-based authentication

### Frontend
- **React 18** - Modern UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Minimalist responsive styling

### Browser Extension
- **Chrome Extension Manifest V3** - Modern extension architecture
- **Content Scripts** - DOM scraping for job sites
- **Background Service Worker** - API communication

## Prerequisites

Before you begin, ensure you have:
- **Node.js** (v14 or higher) installed
- **MongoDB Atlas** account (free tier works great!)
- **Google Cloud Console** account (for OAuth)
- **Google Chrome** browser
- **Git** for version control

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/KennethRofuli/JobTracker.git
cd JobTracker
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=5000
CLIENT_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
```

**Getting your MongoDB URI:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password
6. Replace `myFirstDatabase` with your database name (e.g., `jobtracker`)

**Setting up Google OAuth:**
See [OAUTH_SETUP.md](OAUTH_SETUP.md) for detailed instructions.

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Start the backend server:

```bash
npm start
```

You should see:
```
Server running on port 5000
MongoDB Connected: [your-cluster-info]
```

### 3. Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

The dashboard will open automatically at `http://localhost:3000`

### 4. Install Browser Extension

1. Open **Google Chrome**
2. Go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked**
5. Navigate to the `extension` folder in your project
6. Select the folder

You should see the **Job Tracker** extension installed!

## How to Use

### First Time Setup

1. Open `http://localhost:3000` in your browser
2. Click **Continue with Google**
3. Authorize the application with your Google account
4. You'll be redirected to your dashboard

### Extension Setup

1. Click the extension icon in Chrome
2. Click **Login with Google** (opens web app)
3. Or paste your auth token manually from the web app

### Method 1: Automatic Capture (Recommended)

1. **Navigate** to a supported job site (Indeed, LinkedIn, Glassdoor, OnlineJobs.ph)
2. **Open** a job posting
3. **Click** the "Apply" button on the job posting
4. The extension will **automatically capture** and save the job details
5. You'll see a **success notification** confirming the save

**Auto-capture works when:**
- You're on a job details page
- Company name and job title are visible
- You click the actual "Apply" or "Easy Apply" button
- You're logged in via the extension

### Method 2: Manual Entry

1. **Click** the extension icon in your Chrome toolbar
2. The popup will **attempt to auto-fill** data from the current page
3. **Fill in** or edit any fields:
   - Company Name (required)
   - Job Title (required)
   - Location
   - Job URL
   - Source (Indeed, LinkedIn, etc.)
   - Status (Applied, Interview, Offer, Rejected)
4. **Click** "Save Application"
5. Success message appears!

### Managing Applications

**Dashboard Features:**

**Stats Cards** (clickable to filter):
- Total Applications
- Applied
- Interview
- Offers
- Rejected

**Search Bar**: Search by company name or job title

**Application Table**:
- View all application details
- Click company names to open job URLs
- Update status with dropdown
- Delete applications with delete button

## Supported Job Sites

### Indeed
- Company name
- Job title  
- Location
- Auto-capture on Apply button

### LinkedIn
- Company name
- Job title
- Location
- Auto-capture on Easy Apply button

### Glassdoor
- Company name
- Job title
- Location
- Auto-capture on Apply button

### OnlineJobs.ph
- Job title
- Auto-capture on Apply button
- Company info may be limited (shows as "OnlineJobs.ph Employer")

## Best Practices

1. **Keep servers running**: Both backend (port 5000) and frontend (port 3000) must be running
2. **Active tabs work best**: Extension works better when tab is active (retry logic handles inactive tabs)
3. **Wait for page load**: Ensure job posting is fully loaded before clicking Apply
4. **Manual backup**: Use manual entry if auto-capture fails
5. **Regular backups**: Your data is in MongoDB Atlas cloud storage

## Troubleshooting

### "Can't connect to server" error
- Ensure backend is running on port 5000
- Check MongoDB connection in backend terminal
- Verify `.env` file exists with correct MongoDB URI

### Extension not capturing data
- Refresh the page and try again
- Check if you're on a supported site
- Use manual entry as backup
- Make sure job details are visible on page
- Verify you're logged in (check extension popup)

### Duplicate entries
- System prevents exact duplicates (same company + job title)
- Database indexes enforce uniqueness per user
- Case-insensitive matching

### Frontend not loading
- Check if port 3000 is available
- Verify backend is running first
- Clear browser cache and reload

### Authentication issues
- Token expires after 30 days
- Log in again to get a new token
- Make sure Google OAuth is properly configured

## Project Structure

```
JobTracker/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB connection
│   │   │   └── passport.js        # OAuth configuration
│   │   ├── controllers/
│   │   │   └── applicationController.js  # CRUD logic
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT authentication
│   │   ├── models/
│   │   │   ├── Application.js     # Application schema
│   │   │   └── User.js            # User schema
│   │   └── routes/
│   │       ├── applications.js    # API routes
│   │       └── auth.js            # Auth routes
│   ├── .env                       # Environment variables
│   ├── server.js                  # Express server
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Stats.js           # Stats cards
│   │   │   ├── ApplicationTable.js # Application table
│   │   │   ├── Login.js           # Login page
│   │   │   └── AuthSuccess.js     # OAuth callback
│   │   ├── App.js                 # Main component
│   │   ├── App.css                # Styling
│   │   └── index.js               # Entry point with routing
│   └── package.json
│
└── extension/
    ├── manifest.json              # Extension config
    ├── popup.html                 # Extension UI
    ├── popup.js                   # Popup logic
    ├── content.js                 # Page scraping
    ├── background.js              # API communication
    ├── styles.css                 # Extension styles
    └── icons/                     # Extension icons
```

## API Endpoints

```
GET    /api/applications          # Get all applications (authenticated)
POST   /api/applications          # Create new application (authenticated)
PUT    /api/applications/:id      # Update application (authenticated)
DELETE /api/applications/:id      # Delete application (authenticated)

GET    /api/auth/google           # Initiate Google OAuth
GET    /api/auth/google/callback  # OAuth callback
GET    /api/auth/me               # Get current user
POST   /api/auth/logout           # Logout
```

## Customization

### Adding New Job Sites

Edit `extension/content.js` and add selectors:

```javascript
function extractJobInfo() {
  // Add your site detection
  if (window.location.hostname.includes('yourjobsite.com')) {
    return {
      company: document.querySelector('.company-selector')?.textContent?.trim(),
      title: document.querySelector('.title-selector')?.textContent?.trim(),
      location: document.querySelector('.location-selector')?.textContent?.trim()
    };
  }
  // ... existing code
}
```

Update `manifest.json` to include the new site:

```json
"content_scripts": [{
  "matches": [
    "*://*.yourjobsite.com/*"
  ]
}]
```

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## License

This project is open source and available for personal use.

## Author

**Kenneth Rofuli**
- GitHub: [@KennethRofuli](https://github.com/KennethRofuli)

## Acknowledgments

- Built with MERN stack
- MongoDB Atlas for cloud database
- Chrome Extensions API
- Passport.js for OAuth

---

Track every application and land your dream job!
