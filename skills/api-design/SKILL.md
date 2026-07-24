---
name: api-design
description: Use when designing or reviewing REST/GraphQL/gRPC APIs. Covers naming, versioning, error handling, and documentation.
---

# API Design Guide

## REST Naming

- Resources are nouns, not verbs: `/users`, not `/getUsers`
- Use plural: `/users/123`, not `/user/123`
- Nested resources for relationships: `/users/123/posts`
- Query params for filtering: `/users?role=admin&active=true`

## HTTP Methods

| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| GET | Read | Yes | Yes |
| POST | Create | No | No |
| PUT | Replace | Yes | No |
| PATCH | Partial update | No* | No |
| DELETE | Remove | Yes | No |

## Status Codes

- `200` OK — success
- `201` Created — resource created
- `204` No Content — success, no body
- `400` Bad Request — client error
- `401` Unauthorized — not authenticated
- `403` Forbidden — not authorized
- `404` Not Found — resource doesn't exist
- `409` Conflict — state conflict
- `422` Unprocessable — validation error
- `429` Too Many Requests — rate limited
- `500` Internal Error — server error

## Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": [
      { "field": "email", "issue": "Invalid format" }
    ]
  }
}
```

## Versioning

- URL path: `/v1/users` (simplest, most visible)
- Header: `Accept: application/vnd.api+json;version=2`
- Query: `/users?version=2` (least preferred)

## Rate Limiting

Always include headers:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
