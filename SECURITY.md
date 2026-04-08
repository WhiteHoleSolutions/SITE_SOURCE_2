# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of White Hole Solutions seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please DO NOT:
- Open a public GitHub issue for security vulnerabilities
- Disclose the vulnerability publicly before it has been addressed

### Please DO:
1. Email details to: [security@whiteholesolutions.com](mailto:security@whiteholesolutions.com)
2. Include as much information as possible:
   - Type of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if you have one)

### What to Expect:
- **Response Time**: We will acknowledge your email within 48 hours
- **Investigation**: We will investigate and validate the issue within 7 days
- **Fix Timeline**: Critical vulnerabilities will be patched within 14 days
- **Credit**: We will publicly thank you for responsible disclosure (unless you prefer to remain anonymous)

## Security Best Practices

When deploying this application:

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, randomly generated secrets
   - Rotate JWT_SECRET periodically

2. **Database**
   - Regularly backup your SQLite database
   - Use Render's persistent disk or external backup
   - Test restore procedures

3. **Authentication**
   - Change default admin credentials immediately
   - Use strong passwords (12+ characters, mixed case, numbers, symbols)
   - Enable 2FA if/when available

4. **Updates**
   - Keep dependencies updated: `npm update`
   - Monitor security advisories
   - Test updates in staging before production

5. **Access Control**
   - Restrict admin access to necessary personnel only
   - Regularly audit user accounts
   - Remove inactive accounts

6. **HTTPS**
   - Always use HTTPS in production (Render provides this)
   - Set secure cookie flags
   - Use HSTS headers

7. **File Uploads**
   - Validate file types and sizes
   - Scan uploads for malware if possible
   - Implement rate limiting

## Known Security Considerations

- **SQLite Database**: Ensure persistent disk backups on Render
- **JWT Tokens**: Tokens are stored in HTTP-only cookies for security
- **Password Storage**: Uses bcryptjs with salt rounds
- **API Routes**: Protected by middleware, role-based access control

## Security Updates

Security updates will be released as patch versions and announced via:
- GitHub Security Advisories
- Release notes
- This security policy

Thank you for helping keep White Hole Solutions secure!
