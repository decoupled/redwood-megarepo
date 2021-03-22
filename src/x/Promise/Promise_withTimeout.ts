export function Promise_withTimeout<T>(
  p: Promise<T>,
  timeout = 1000
): Promise<T> {
  return Promise.race([
    p,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), timeout)
    ),
  ]) as any
}
