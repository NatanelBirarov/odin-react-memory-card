// Reference implementation for race-based timeout behavior.
// Keeping this here for future comparison, but current flow uses AbortSignal.timeout.
// function withTimeout<T>(promise: Promise<T>, timeoutSecs: number): Promise<T> {
//   const timeoutPromise = new Promise<T>((_, reject) => {
//     setTimeout(
//       () => reject(new Error("Request timed out")),
//       timeoutSecs * 1000,
//     );
//   });
//
//   return Promise.race([promise, timeoutPromise]);
// }

export async function fetchWithRetry<T>(
  fetchFunction: () => Promise<T>,
  tries: number = 3,
): Promise<T> {
  let attempt = 0;
  while (attempt < tries) {
    try {
      return await fetchFunction();
    } catch (error: unknown) {
      attempt++;
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt >= tries) {
        throw new Error(
          `Failed after ${tries} tries: ${(error as Error).message}`,
        );
      }
    }
  }
  throw new Error("Unexpected error in retry logic");
}
