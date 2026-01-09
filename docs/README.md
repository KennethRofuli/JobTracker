# 📚 Job Tracker Documentation

Complete documentation for the Job Tracker application - a MERN stack job application tracking system with browser extension integration.

---

## 🚀 Quick Start

New to Job Tracker? Start here:

1. **[Setup Guide](../README.md#installation)** - Get the application running locally
2. **[Testing Guide](guides/TESTING_QUICK_START.md)** - Verify your installation works
3. **[Browser Extension Setup](../extension/README.md)** - Auto-capture jobs from job boards

---

## 📖 Documentation Structure

### 🛠️ Guides
Step-by-step instructions for common tasks and features.

| Guide | Description |
|-------|-------------|
| [Mobile OAuth Guide](guides/MOBILE_OAUTH_GUIDE.md) | Fixing OAuth authentication on iOS and mobile devices |
| [Multi-User Guide](guides/MULTI_USER_GUIDE.md) | Managing multiple users and authentication |
| [Testing Quick Start](guides/TESTING_QUICK_START.md) | Quick testing procedures for local development |

### 🚢 Deployment
Production deployment guides and CI/CD setup.

| Guide | Description |
|-------|-------------|
| [CI/CD Guide](deployment/CI_CD_GUIDE.md) | GitHub Actions pipeline setup and automation |
| [GCP Console Walkthrough](deployment/GCP_CONSOLE_WALKTHROUGH.md) | Deploying to Google Cloud Platform |

### 🔒 Security
Security features, OAuth implementation, and best practices.

| Document | Description |
|----------|-------------|
| [Security Overview](security/SECURITY.md) | Complete security features and implementation |
| [OAuth Setup](security/OAUTH_SETUP.md) | Google OAuth 2.0 configuration guide |
| [OAuth Flow Diagram](security/OAUTH_FLOW_DIAGRAM.md) | Visual OAuth authentication flow |
| [OAuth Security Implementation](security/OAUTH_SECURITY_IMPLEMENTATION.md) | Detailed OAuth security measures |
| [GCP Security Checklist](security/GCP_SECURITY_CHECKLIST.md) | Production security checklist for GCP |
| [Security Implementation Summary](security/SECURITY_IMPLEMENTATION_SUMMARY.md) | Quick reference for security features |

---

## 🏗️ Architecture

```
Job Tracker Application
├── Frontend (React)
│   ├── Dashboard UI
│   ├── OAuth Authentication
│   └── Application Management
│
├── Backend (Node.js/Express)
│   ├── REST API
│   ├── MongoDB Database
│   └── JWT Authentication
│
└── Browser Extension
    ├── Content Scripts (Indeed, LinkedIn, Glassdoor)
    ├── Background Worker
    └── Popup UI
```

---

## 🔧 Tech Stack

### Frontend
- **React** 18.x - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Passport.js** - OAuth authentication
- **JWT** - Token-based auth

### Security
- **Helmet.js** - Security headers
- **express-mongo-sanitize** - NoSQL injection prevention
- **express-rate-limit** - Rate limiting
- **CORS** - Cross-origin configuration

### DevOps
- **GitHub Actions** - CI/CD
- **Vercel** - Frontend hosting (optional)
- **Render/GCP** - Backend hosting (optional)

---

## 📝 API Documentation

### Authentication Endpoints

```
POST   /api/auth/google              - Initiate Google OAuth
GET    /api/auth/google/callback     - OAuth callback
GET    /api/auth/me                  - Get current user
GET    /api/auth/token               - Get JWT for extension
POST   /api/auth/logout              - Logout user
```

### Application Endpoints

```
GET    /api/applications             - Get all applications
GET    /api/applications/:id         - Get single application
POST   /api/applications             - Create application
PUT    /api/applications/:id         - Update application
DELETE /api/applications/:id         - Delete application
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/KennethRofuli/JobTracker/issues)
- **Documentation**: You are here! 📍
- **Main README**: [Project README](../README.md)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Made with ❤️ by Kenneth John Rofuli**
