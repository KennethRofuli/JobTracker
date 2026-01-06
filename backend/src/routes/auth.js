const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { authLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get('/google', authLimiter, (req, res, next) => {
    // Generate state parameter for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store state in session (or encrypted cookie)
    req.session.oauthState = state;
    
    // Pass state to Google OAuth
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        session: false,
        state: state
    })(req, res, next);
});

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get(
    '/google/callback',
    (req, res, next) => {
        // Validate state parameter (CSRF protection)
        const receivedState = req.query.state;
        const storedState = req.session.oauthState;
        
        if (!receivedState || receivedState !== storedState) {
            return res.redirect(`${process.env.CLIENT_URL}/login?error=invalid_state`);
        }
        
        // Clear used state
        delete req.session.oauthState;
        
        next();
    },
    passport.authenticate('google', { 
        failureRedirect: process.env.CLIENT_URL + '/login?error=auth_failed',
        session: false 
    }),
    (req, res) => {
        // Create JWT token with shorter expiry
        const token = jwt.sign(
            { userId: req.user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // Reduced from 30d to 7d
        );

        // Set token in secure, httpOnly cookie instead of URL
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Redirect to frontend without token in URL
        res.redirect(`${process.env.CLIENT_URL}/auth-success`);
    }
);

// @desc    Get current user
// @route   GET /api/auth/me
router.get('/me', async (req, res) => {
    try {
        // Try cookie first, then fall back to Authorization header
        const token = req.cookies.auth_token || req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const User = require('../models/User');
        const user = await User.findById(decoded.userId).select('-googleId');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// @desc    Logout
// @route   POST /api/auth/logout
router.post('/logout', (req, res) => {
    // Clear auth cookie
    res.clearCookie('auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;
