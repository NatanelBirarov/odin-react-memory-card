# API Documentation

This document describes the REST API endpoints provided by the Express backend.

## Authentication Routes

All authentication routes are mounted under `/api/auth/` and are handled automatically by the [better-auth](https://better-auth.com) framework.

**Base URL:** `/api/auth`

The client utilizes the `better-auth/react` hooks to communicate with these endpoints, managing sessions, OTP verification, sign-in, sign-up, and password resets securely.

---

## Settings Routes

### `GET /api/settings`
Retrieves the authenticated user's settings, primarily volume preferences.

- **Auth Required:** Yes (Valid Session Cookie)
- **Response Format:** JSON

**Success Response (200):**
```json
{
  "musicVolume": 0.5,
  "sfxVolume": 0.8
}
```

### `PUT /api/settings`
Updates the authenticated user's volume settings.

- **Auth Required:** Yes (Valid Session Cookie)
- **Request Format:** JSON

**Request Body:**
```json
{
  "musicVolume": 0.2,
  "sfxVolume": 1.0
}
```

**Success Response (200):**
```json
{
  "musicVolume": 0.2,
  "sfxVolume": 1.0
}
```

---

## Game Data Routes

### `GET /api/gamedata`
Retrieves all game progression data across different Pokémon card sets for the authenticated user.

- **Auth Required:** Yes (Valid Session Cookie)
- **Response Format:** JSON

**Success Response (200):**
```json
[
  {
    "id": "base1",
    "completedLevels": 2,
    "levels": 5,
    "highScore": 1200,
    "completed": false
  },
  {
    "id": "sm1",
    "completedLevels": 5,
    "levels": 5,
    "highScore": 5500,
    "completed": true
  }
]
```

### `POST /api/gamedata`
Upserts (creates or updates) the player's progress for a specific Pokémon card set.

- **Auth Required:** Yes (Valid Session Cookie)
- **Request Format:** JSON

**Request Body:**
```json
{
  "setId": "base1",
  "completedLevels": 3,
  "levels": 5,
  "highScore": 1800,
  "completed": false
}
```

**Success Response (200):**
```json
{
  "success": true
}
```

---

## Error Handling

Most endpoints share a common error response format when an error occurs during execution or validation.

**Error Response (400, 401, or 500):**
```json
{
  "error": "Detailed error message string"
}
```

- `401 Unauthorized`: Missing or invalid session cookie.
- `400 Bad Request`: Validation errors (handled by Zod schema middleware).
- `500 Internal Server Error`: Server-side errors or database issues.
- `429 Too Many Requests`: Triggered on auth routes if rate limits are exceeded.
