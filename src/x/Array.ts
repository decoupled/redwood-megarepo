import { iter } from "@decoupled/xlib"

export function Array_collectInstancesOf<T>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  c: Function & { prototype: T },
  xs: Array<unknown> | undefined
): Array<T> {
  return iter(function* () {
    if (xs) for (const x of xs) if (x instanceof c) yield x as T
  })
}

