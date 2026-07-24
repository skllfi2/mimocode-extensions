# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability within MiMoCode Extensions, please send an email to skllfi2@users.noreply.github.com. All security vulnerabilities will be promptly addressed.

## Security Best Practices

### API Keys

- Never commit API keys to the repository
- Use environment variables for sensitive data
- Rotate keys regularly

### MCP Servers

- Only install trusted MCP servers
- Review MCP server permissions
- Monitor MCP server activity

### Configuration

- Keep `mimocode.jsonc` out of version control
- Use `.gitignore` to exclude sensitive files
- Review permissions before granting access

## Dependencies

We regularly update dependencies to patch security vulnerabilities.

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

## Access Control

- Use principle of least privilege
- Limit file system access
- Review permission requests

## Data Privacy

- MiMoCode Extensions does not collect personal data
- Token usage is stored locally
- No telemetry without explicit consent

## Updates

Security updates are released as soon as possible.

```bash
# Update to latest version
bash setup.sh update
```
