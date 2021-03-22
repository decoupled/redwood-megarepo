export function AddressInfo_is(x: unknown): x is import("net").AddressInfo {
  if (typeof x !== "object") return false
  if (x === null) return false
  try {
    const { address, family, port } = x as import("net").AddressInfo
    if (typeof address !== "string") return false
    if (typeof family !== "string") return false
    if (typeof port !== "number") return false
  } catch (e) {
    return false
  }
  return true
}

/**
 * server.address() has changed over time.
 * this downcast helps accomodate newer versions of node
 * @param x
 * @returns
 */
export function AddressInfo_cast_getPort_orThrow(x: unknown): number {
  if (!AddressInfo_is(x)) throw new Error("not a valid AddressInfo object")
  return x.port
}
