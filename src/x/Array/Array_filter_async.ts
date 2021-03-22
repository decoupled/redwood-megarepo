export async function Array_filter_async<T>(
  arr: T[],
  filter: (t: T) => Promise<boolean>
): Promise<T[]> {
  const arr2: T[] = []
  await Promise.all(
    arr.map(async (x) => {
      if (await filter(x)) arr2.push(x)
    })
  )
  return arr2
}
