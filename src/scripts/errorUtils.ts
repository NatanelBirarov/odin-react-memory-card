export function handleApiError(
  error: unknown,
  fallbackMessage = "An unexpected error occurred",
): string[] {
  if (!error) return [fallbackMessage];

  if (typeof error === "string") {
    return [error];
  }

  if (typeof error === "object") {
    // Check if error has a 'message' property
    if ("message" in error) {
      const msg = (error as { message: unknown }).message;
      if (Array.isArray(msg)) {
        return msg.map((item) => String(item));
      }
      if (typeof msg === "string" && msg.trim()) {
        return [msg];
      }
    }

    // Check if error has an 'error' property (e.g. better-auth responses)
    if ("error" in error) {
      const err = (error as { error: unknown }).error;
      if (typeof err === "string" && err.trim()) {
        return [err];
      }
      if (err && typeof err === "object" && "message" in err) {
        const msg = (err as { message: unknown }).message;
        if (typeof msg === "string" && msg.trim()) {
          return [msg];
        }
      }
    }
  }

  return [fallbackMessage];
}
