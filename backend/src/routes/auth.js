const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { authLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get('/google', authLimiter, passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
}));

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get(
    '/google/callback',
    passport.authenticate('google', { 
        failureRedirect: process.env.CLIENT_URL + '/login?error=auth_failed',
        session: false 
    }),
    (req, res) => {
        // Create JWT token
        const token = jwt.sign(
            { userId: req.user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Redirect to frontend with token
        res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`);
    }
);

// @desc    Get current user
// @route   GET /api/auth/me
router.get('/me', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
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
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;
