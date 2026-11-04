/** Editable project data is JSON. Structural sharing lets unchanged subtrees
 * short-circuit instead of serializing the entire library on every keystroke. */
export function draftValuesEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true
  if (typeof left === "number" && typeof right === "number" && left === right) return true
  if (!left || !right || typeof left !== "object" || typeof right !== "object") return false
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false
    for (let index = 0; index < left.length; index++) if (!draftValuesEqual(left[index] ?? null, right[index] ?? null)) return false
    return true
  }
  const a = left as Record<string, unknown>, b = right as Record<string, unknown>
  // Optional fields set to undefined are omitted by JSON saves.
  const keys = Object.keys(a).filter(key => a[key] !== undefined)
  return keys.length === Object.keys(b).filter(key => b[key] !== undefined).length && keys.every(key => Object.hasOwn(b, key) && draftValuesEqual(a[key], b[key]))
}
