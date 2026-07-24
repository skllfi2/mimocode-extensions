# Security Rules

- Never log secrets, tokens, or API keys
- Never hardcode credentials — use env vars or secret managers
- Sanitize user input before rendering in HTML or passing to shell
- Prefer parameterized queries over string concatenation
- Set secure HTTP headers (CSP, CORS, HSTS)
- Validate and constrain file paths to prevent traversal
- Never use `eval()` or `Function()` on untrusted input
