# Security Implementation Guide

## Overview

This application implements multiple layers of security to protect against common web vulnerabilities and attacks.

## Implemented Security Features

### 1. Rate Limiting

**Purpose**: Prevent API abuse, brute force attacks, and DDoS attempts

**Implementation**:
- **General API**: 100 requests per 15 minutes per IP
- **Authentication routes**: 5 attempts per 15 minutes per IP
- **Application creation**: 10 requests per minute per IP

**Files**:
- `src/middleware/rateLimiter.js`

### 2. Input Validation & Sanitization

**Purpose**: Prevent XSS attacks, NoSQL injection, and malicious data

**Implementation**:
- Express-validator for input validation
- Automatic HTML escaping
- Field length restrictions
- Enum validation for status and source fields
- MongoDB sanitization to prevent NoSQL injection

**Files**:
- `src/middleware/validation.js`
- Applied in: `src/routes/applications.js`

**Validation Rules**:
```javascript
- company_name: Required, 1-200 characters, escaped
- job_title: Required, 1-200 characters, escaped
- location: Optional, max 200 characters, escaped
- url: Optional, max 2000 characters
- source: Must be one of: Indeed, LinkedIn, Email, Manual, Glassdoor, OnlineJobs.ph
- status: Must be one of: Applied, Interviewing, Offered, Rejected, Accepted
```

### 3. Security Headers (Helmet.js)

**Purpose**: Protect against clickjacking, XSS, MIME sniffing, and other attacks

**Headers Set**:
- `Content-Security-Policy`: Controls resource loading
- `X-DNS-Prefetch-Control`: Controls DNS prefetching
- `X-Frame-Options`: Prevents clickjacking
- `X-Content-Type-Options`: Prevents MIME sniffing
- `Strict-Transport-Security`: Enforces HTTPS (production)
- `X-Download-Options`: Controls IE downloads
- `X-Permitted-Cross-Domain-Policies`: Controls cross-domain policies

**Files**:
- Configured in: `server.js`

### 4. Request Size Limits

**Purpose**: Prevent large payload attacks and memory exhaustion

**Implementation**:
- JSON body limit: 10MB
- URL-encoded body limit: 10MB

**Files**:
- Configured in: `server.js`

### 5. Authentication & Authorization

**Purpose**: Ensure only authenticated users can access their own data

**Implementation**:
- JWT token-based authentication
- Google OAuth 2.0 for secure login
- Token expiration: 30 days
- User-specific data isolation (userId in all queries)

**Files**:
- `src/middleware/auth.js`
- `src/config/passport.js`
- `src/routes/auth.js`

### 6. Logging & Monitoring

**Purpose**: Track suspicious activity and debug issues

**Implementation**:
- Winston logger for structured logging
- HTTP request logging with Morgan
- Error logging with stack traces (dev only)
- Separate log files for errors, combined logs, exceptions, and rejections

**Log Files** (backend/logs/):
- `error.log`: All errors
- `combined.log`: All requests and events
- `exceptions.log`: Uncaught exceptions
- `rejections.log`: Unhandled promise rejections

**Files**:
- `src/config/logger.js`

### 7. Session Security

**Purpose**: Secure user sessions

**Implementation**:
- HTTP-only cookies (prevents XSS cookie theft)
- Secure cookies in production (HTTPS only)
- 24-hour session expiration
- Random session secrets

### 8. CORS Protection

**Purpose**: Control which domains can access the API

**Implementation**:
- Whitelist specific origin (CLIENT_URL)
- Credentials support enabled
- Preflight request handling

## Production Deployment Checklist

### Required for Production:

1. **HTTPS**
   - [ ] Enable HTTPS/SSL certificate
   - [ ] Update `NODE_ENV=production`
   - [ ] Cookies will automatically become secure

2. **Environment Variables**
   - [ ] Use strong, random secrets (JWT_SECRET, SESSION_SECRET)
   - [ ] Set proper CLIENT_URL for production domain
   - [ ] Secure MongoDB connection string
   - [ ] Google OAuth production credentials

3. **Rate Limiting** (Optional - Adjust if needed)
   - [ ] Review rate limits for production traffic
   - [ ] Consider Redis for distributed rate limiting

4. **Monitoring** (Recommended)
   - [ ] Set up log rotation
   - [ ] Implement alerting for errors
   - [ ] Monitor rate limit hits
   - [ ] Track authentication failures

5. **Database**
   - [ ] Enable MongoDB authentication
   - [ ] Use connection pooling
   - [ ] Regular backups
   - [ ] Database access restrictions (IP whitelist)

6. **Additional Security** (Recommended)
   - [ ] Web Application Firewall (WAF)
   - [ ] DDoS protection (Cloudflare, AWS Shield)
   - [ ] Regular security audits
   - [ ] Dependency vulnerability scanning (npm audit)

## Security Best Practices

### For Developers:

1. **Never commit sensitive data**
   - Keep `.env` files out of version control
   - Use `.env.example` for templates

2. **Keep dependencies updated**
   ```bash
   npm audit
   npm audit fix
   ```

3. **Review security logs regularly**
   ```bash
   tail -f backend/logs/error.log
   ```

4. **Test rate limits**
   - Verify rate limiting works before deployment
   - Test with tools like Apache Bench or Artillery

5. **Validate all user input**
   - Never trust client-side data
   - Always validate on the server

### For Users:

1. **Strong passwords** (for database, secrets)
2. **Regular token rotation** (30-day expiration enforced)
3. **Monitor account activity**
4. **Report suspicious behavior**

## Testing Security

### Rate Limiting Test:
```bash
# Test API rate limit (should fail after 100 requests in 15 min)
for i in {1..105}; do curl http://localhost:5000/api/applications; done
```

### Input Validation Test:
```bash
# Test XSS prevention (should be escaped)
curl -X POST http://localhost:5000/api/applications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"company_name":"<script>alert('XSS')</script>","job_title":"Test"}'
```

### NoSQL Injection Test:
```bash
# Should be sanitized
curl -X POST http://localhost:5000/api/applications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"company_name":{"$gt":""},"job_title":"Test"}'
```

## Incident Response

If you detect suspicious activity:

1. **Check logs**: `backend/logs/error.log`
2. **Identify source**: Check IP addresses
3. **Block if needed**: Add IP to firewall/WAF
4. **Rotate secrets**: Change JWT_SECRET, SESSION_SECRET
5. **Force re-authentication**: All users must log in again
6. **Review code**: Check for vulnerabilities
7. **Update dependencies**: `npm audit fix`

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://github.com/goldbergyoni/nodebestpractices#6-security-best-practices)
- [Helmet.js Documentation](https://helmetjs.github.io/)

## Support

For security issues or questions:
- Review application logs
- Check security headers with tools like SecurityHeaders.com
- Run `npm audit` regularly
- Keep all dependencies updated
