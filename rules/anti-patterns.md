# Anti-Patterns to Avoid

## Code
- Don't use `any` type in TypeScript — use `unknown` and narrow
- Don't use `console.log` in production code — use a logger
- Don't catch errors silently — at minimum, log them
- Don't use magic strings — extract to constants or enums
- Don't mutate function parameters — clone first
- Don't use `setTimeout` for scheduling — use proper task queues
- Don't hardcode URLs — use environment variables

## Architecture
- Don't create God objects — split responsibilities
- Don't use circular dependencies — restructure
- Don't put business logic in controllers/routes
- Don't skip error handling on async operations
- Don't use shared mutable state without synchronization
- Don't couple to specific frameworks in core logic

## Git
- Don't commit directly to main/master
- Don't force push shared branches
- Don't commit secrets, tokens, or credentials
- Don't make mega-commits — split logically
- Don't use `--no-verify` to skip hooks
