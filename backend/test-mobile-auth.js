#!/usr/bin/env node

/**
 * Test script for mobile authentication
 * This script validates that the cookie configuration changes work correctly
 */

const { isMobileBrowser, getCookieConfig } = require('./src/utils/userAgent');

// Constants
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

console.log('=== Mobile Authentication Configuration Test ===\n');

// Test cases with different user agents
const testCases = [
    {
        name: 'iPhone (Safari)',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        expectedMobile: true
    },
    {
        name: 'Android (Chrome)',
        userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        expectedMobile: true
    },
    {
        name: 'iPad',
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        expectedMobile: true
    },
    {
        name: 'Desktop Chrome (Windows)',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        expectedMobile: false
    },
    {
        name: 'Desktop Firefox (Linux)',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0',
        expectedMobile: false
    },
    {
        name: 'Desktop Safari (macOS)',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        expectedMobile: false
    }
];

let passCount = 0;
let failCount = 0;

console.log('Testing User-Agent Detection:');
console.log('─────────────────────────────────────────────────────\n');

testCases.forEach(testCase => {
    const isMobile = isMobileBrowser(testCase.userAgent);
    const passed = isMobile === testCase.expectedMobile;
    
    console.log(`${passed ? '✅' : '❌'} ${testCase.name}`);
    console.log(`   Expected: ${testCase.expectedMobile ? 'Mobile' : 'Desktop'}`);
    console.log(`   Detected: ${isMobile ? 'Mobile' : 'Desktop'}`);
    
    if (passed) {
        passCount++;
    } else {
        failCount++;
        console.log(`   ⚠️  FAILED: Detection mismatch!`);
    }
    console.log('');
});

console.log('\n=== Cookie Configuration Tests ===\n');

// Test cookie configs for development and production
const environments = [
    { name: 'Development', isProduction: false },
    { name: 'Production', isProduction: true }
];

environments.forEach(env => {
    console.log(`${env.name} Environment:`);
    console.log('─────────────────────────────────────────────────────');
    
    // Mobile config
    const mobileConfig = getCookieConfig(testCases[0].userAgent, env.isProduction);
    console.log('\nMobile Browser Cookie Config:');
    console.log(`   httpOnly: ${mobileConfig.httpOnly}`);
    console.log(`   secure: ${mobileConfig.secure}`);
    console.log(`   sameSite: ${mobileConfig.sameSite}`);
    console.log(`   maxAge: ${mobileConfig.maxAge / MILLISECONDS_PER_DAY} days`);
    
    // Validate mobile config
    const mobileValid = 
        mobileConfig.httpOnly === true &&
        mobileConfig.secure === true &&  // Always true for mobile
        mobileConfig.sameSite === 'none';
    
    console.log(`   ${mobileValid ? '✅ Valid' : '❌ Invalid'} configuration`);
    
    // Desktop config
    const desktopConfig = getCookieConfig(testCases[3].userAgent, env.isProduction);
    console.log('\nDesktop Browser Cookie Config:');
    console.log(`   httpOnly: ${desktopConfig.httpOnly}`);
    console.log(`   secure: ${desktopConfig.secure}`);
    console.log(`   sameSite: ${desktopConfig.sameSite}`);
    console.log(`   maxAge: ${desktopConfig.maxAge / MILLISECONDS_PER_DAY} days`);
    
    // Validate desktop config
    const desktopValid = 
        desktopConfig.httpOnly === true &&
        desktopConfig.secure === env.isProduction &&
        desktopConfig.sameSite === 'lax';
    
    console.log(`   ${desktopValid ? '✅ Valid' : '❌ Invalid'} configuration`);
    console.log('');
    
    if (mobileValid && desktopValid) {
        passCount += 2;
    } else {
        failCount += (!mobileValid ? 1 : 0) + (!desktopValid ? 1 : 0);
    }
});

console.log('\n=== Test Summary ===\n');
console.log(`Total Tests: ${passCount + failCount}`);
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log('');

if (failCount === 0) {
    console.log('🎉 All tests passed! Mobile authentication fix is working correctly.\n');
    process.exit(0);
} else {
    console.log('⚠️  Some tests failed. Please review the implementation.\n');
    process.exit(1);
}
