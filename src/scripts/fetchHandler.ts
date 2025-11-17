function withTimeout<T>(promise: Promise<T>, timeoutSecs: number): Promise<T> {
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(
      () => reject(new Error("Request timed out")),
      timeoutSecs * 1000
    );
  });

  return Promise.race([promise, timeoutPromise]);
}

type FetchWithRetryOptions = {
  timeoutSecs: number;
  tries: number;
};

export async function fetchWithRetry<T>(
  fetchFunction: () => Promise<T>,
  options: FetchWithRetryOptions = { timeoutSecs: 1, tries: 1 }
): Promise<T> {
  let attempt = 0;
  while (attempt < options.tries) {
    try {
      return await withTimeout(fetchFunction(), options.timeoutSecs);
    } catch (error: any) {
      attempt++;
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt >= options.tries) {
        throw new Error(
          `Failed after ${options.tries} tries: ${error.message}`
        );
      }
    }
  }
  throw new Error("Unexpected error in retry logic");
}
