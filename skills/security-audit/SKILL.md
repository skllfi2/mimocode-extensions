---
name: security-audit
description: Use when the user asks to audit, review, or harden code for security vulnerabilities. Covers OWASP Top 10, dependency scanning, secret detection, and secure coding practices.
---

# Security Audit

When auditing code, check for:

1. **Injection**: SQL, NoSQL, OS command, LDAP, XSS
2. **Broken Auth**: weak passwords, missing MFA, session fixation
3. **Sensitive Data Exposure**: unencrypted data, verbose errors
4. **XML External Entities**: XXE injection
5. **Broken Access Control**: IDOR, privilege escalation
6. **Security Misconfiguration**: default creds, debug mode in prod
7. **XSS**: reflected, stored, DOM-based
8. **Insecure Deserialization**: untrusted data deserialization
9. **Using Components with Known Vulnerabilities**: outdated deps
10. **Insufficient Logging**: missing audit trails

## Tools to Use

- `grep` for patterns: `password|secret|token|key|api_key`
- `bash` for: `npm audit`, `pip audit`, `trivy`, `semgrep`
- Check `.env` files are gitignored
- Verify HTTPS-only external calls
