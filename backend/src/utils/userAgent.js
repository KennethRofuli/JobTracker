/**
 * Utility functions for user agent detection
 */

/**
 * Check if the request is from a mobile browser
 * @param {string} userAgent - User-Agent header string
 * @returns {boolean} - True if mobile browser
 */
function isMobileBrowser(userAgent) {
    if (!userAgent) return false;
    
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;
    return mobileRegex.test(userAgent);
}

/**
 * Get appropriate cookie configuration based on user agent and environment
 * @param {string} userAgent - User-Agent header string
 * @param {boolean} isProduction - Whether running in production
 * @returns {object} - Cookie configuration object
 */
function getCookieConfig(userAgent, isProduction = false) {
    const isMobile = isMobileBrowser(userAgent);
    
    // For mobile browsers, use 'none' sameSite to ensure cross-site cookies work
    // This requires secure flag to be true
    // For desktop browsers, use 'lax' for better CSRF protection
    const sameSite = isMobile ? 'none' : 'lax';
    
    // For mobile with sameSite='none', secure must be true
    // For production, always use secure
    const secure = isProduction || isMobile;
    
    return {
        httpOnly: true,
        secure,
        sameSite,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };
}

module.exports = {
    isMobileBrowser,
    getCookieConfig
};
