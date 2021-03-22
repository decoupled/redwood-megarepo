export function waitUntil(
  test: () => boolean,
  ttl: number = 5000,
  interval: number = 100
): Promise<void> {
  const start = new Date().getMilliseconds()
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      function tick() {
        try {
          if (test() === true) return resolve()
          const now = new Date().getMilliseconds()
          if (now - start > ttl) return reject("Timeout")
          setTimeout(tick, interval)
        } catch (e) {
          reject(e)
        }
      }
      tick()
    }, 10) // nextTick
  })
}
