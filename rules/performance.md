# Performance Rules

- Prefer streaming over buffering for large data
- Use `Map`/`Set` over plain objects for key-value lookups in hot paths
- Avoid creating objects in loops — hoist allocations
- Lazy-load heavy modules when possible
- Prefer `Array.prototype.filter` + `map` over a single `reduce` when clarity matters
- Cache expensive computations when inputs are stable
- Profile before optimizing — measure, don't guess
