---
name: database
description: Use when working with databases: schema design, migrations, query optimization, ORM usage, or data modeling.
---

# Database Guide

## Schema Design Rules

1. **Normalize to 3NF**, then denormalize only with measured performance need
2. **Primary keys**: prefer UUIDs for distributed systems, auto-increment for single-node
3. **Foreign keys**: always enforce referential integrity
4. **Indexes**: add on columns used in WHERE, JOIN, ORDER BY
5. **Timestamps**: always include `created_at` and `updated_at`

## Migration Rules

- Every schema change gets a migration
- Migrations must be reversible
- Never modify a committed migration — create a new one
- Test migrations against production-like data

## Query Optimization

- Use `EXPLAIN ANALYZE` before optimizing
- Avoid `SELECT *` — fetch only needed columns
- Use parameterized queries — never string concatenation
- Batch inserts/updates when possible
- N+1 queries: use JOIN or eager loading

## Common Anti-Patterns

- Storing JSON in relational columns (use JSONB or a separate table)
- No indexes on foreign keys
- Over-normalization causing 10-way joins
- Using ORM for complex analytical queries
