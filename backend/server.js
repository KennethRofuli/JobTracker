const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');

// Load environment variables FIRST before importing other modules
dotenv.config();

const connectDB = require('./src/config/db');
const passport = require('./src/config/passport');
const logger = require('./src/config/logger');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const { getCookieConfig } = require('./src/utils/userAgent');
const applicationRoutes = require('./src/routes/applications');
const authRoutes = require('./src/routes/auth');

const app = express();

// Trust first proxy (required for Render, Heroku, etc.)
app.set('trust proxy', 1);

connectDB();

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
// Note: credentials: true is required for cookie-based authentication
// Mobile browsers with sameSite: 'none' require proper origin configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true, // Required for cookies
    optionsSuccessStatus: 200
}));

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cookieParser());

// Dynamic session configuration based on user agent
app.use((req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieConfig = getCookieConfig(userAgent, isProduction);
    
    session({
        secret: process.env.SESSION_SECRET || 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: cookieConfig.secure,
            httpOnly: true,
            sameSite: cookieConfig.sameSite,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    })(req, res, next);
});

app.use(passport.initialize());

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);

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
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`Server running on port ${PORT}`);
})