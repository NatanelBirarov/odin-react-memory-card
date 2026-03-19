## Rate Limiting Approach

This project uses in-memory rate limiting for auth endpoints.
That choice is intentional for a personal/portfolio app: fewer moving parts, easier setup, and clear security baseline.

Current approach:

- Endpoint-specific limits for sensitive auth flows (sign-in, sign-up, password reset, OTP)
- Relaxed limits for low-risk auth routes
- Structured 429 responses with retry metadata

Production scaling path:

- Replace in-memory storage with a shared store (for example Redis) to support multiple server instances.
