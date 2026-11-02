/** A preview session never reads or writes the student's real progress. */
export function memoryStorage(): Storage {
  const items = new Map<string, string>()
  return { get length() { return items.size }, getItem: key => items.get(String(key)) ?? null, setItem: (key, value) => { items.set(String(key), String(value)) }, removeItem: key => { items.delete(String(key)) }, clear: () => items.clear(), key: index => [...items.keys()][index] ?? null }
}
