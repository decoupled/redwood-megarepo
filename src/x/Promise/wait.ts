export function wait(delay = 200): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delay)
  })
}

export const Promise_wait = wait
