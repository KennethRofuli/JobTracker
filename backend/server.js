const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');

// Load environment variables FIRST before importing other modules
dotenv.config();

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

console.log('Starting Job Tracker backend');

const connectDB = require('./src/config/db');
const passport = require('./src/config/passport');
const logger = require('./src/config/logger');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const applicationRoutes = require('./src/routes/applications');
const authRoutes = require('./src/routes/auth');
const notificationScheduler = require('./src/services/notificationScheduler');
const emailService = require('./src/services/emailService');

const app = express();

// Trust first proxy (required for Render, Heroku, etc.)
app.set('trust proxy', 1);

// Security Middleware
// Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// Prevent NoSQL injection by sanitizing user input
app.use(mongoSanitize());

// HTTP request logger
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', {
        stream: { write: (message) => logger.info(message.trim()) }
    }));
}

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true, // Required for cookies
    optionsSuccessStatus: 200
}));

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    name: 'sessionId', // Custom name to avoid defaults
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions'
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-domain in production
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined
    }
}));
app.use(passport.initialize());

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);

if (process.env.ENABLE_DEBUG_ROUTES === 'true') {
    app.get('/debug/send-test-email', async (req, res) => {
        const to = req.query.to || process.env.DEBUG_EMAIL_RECIPIENT;
        if (!to) {
            return res.status(400).json({
                success: false,
                error: 'Missing recipient. Add ?to=you@example.com or set DEBUG_EMAIL_RECIPIENT.'
            });
        }

        try {
            await emailService.sendEmail({
                to,
                subject: 'Job Tracker Test Email',
                text: 'This is a test email sent from the Job Tracker backend.'
            });
            return res.json({ success: true, message: `Test email sent to ${to}` });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    });
}

app.get('/', (req, res) =>{
    res.json({message: 'API is running'})
})

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
    });

    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'An error occurred' 
            : err.message
    });
});

const PORT = process.env.PORT || 5000;

const init = async () => {
    console.log('init() starting');
    await connectDB();
    console.log('Database connected');
    notificationScheduler.start();
    console.log('Notification scheduler started');
    app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
        console.log(`Server running on port ${PORT}`);
    });
};

init().catch((error) => {
    console.error('Initialization failed:', error);
    process.exit(1);
});