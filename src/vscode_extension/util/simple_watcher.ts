export function simple_watcher<T>(
  watchExpr: () => T | undefined,
  reaction: (v: T) => Disposable | undefined,
  interval = 1000
): Disposable {
  var dispose: Disposable | undefined
  var value: T | undefined
  const ivl = setInterval(tick, interval)
  return {
    dispose() {
      dispose?.dispose()
      clearInterval(ivl)
    },
  }
  function tick() {
    const value_2 = watchExpr()
    if (value === value_2) return
    value = value_2
    dispose?.dispose()
    if (typeof value !== "undefined") {
      dispose = reaction(value)
    }
  }
}

type Disposable = { dispose(): void }
