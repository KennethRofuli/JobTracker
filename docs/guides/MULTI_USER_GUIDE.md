# IMPORTANT: Multi-User Setup Instructions

## ⚠️ Critical for Shared Computers

If multiple people use Job Tracker on the same computer, **ALWAYS follow these steps when switching users:**

### When Logging Out:
1. **Dashboard**: Click Logout button ✓
2. **Extension**: Click extension icon → Click "Logout" ✓

### Why Both Are Required:
- The extension stores authentication separately from the website
- If you only logout from the dashboard, the extension keeps the old user's credentials
- This causes jobs to be saved to the wrong account

### How to Verify Who's Logged In:
- Click the extension icon
- Look at "Logged in as [Name]"
- Make sure this matches who should be logged in

### If You See "Already Saved" Error:
This means another user's job is in YOUR tracker. This should only happen if:
1. You actually saved it before (check your dashboard)
2. OR someone else's token is still in the extension (they didn't logout properly)

**Solution**: Click extension icon → Logout → Login again with correct user

## Quick Test:
After logging in, click the extension icon and verify it shows YOUR name!
