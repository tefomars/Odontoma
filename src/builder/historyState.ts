export type EditHistory<T> = { present: T; past: T[]; future: T[]; revision: number }
export type EditAction<T> = { type: "set"; next: T | ((value: T) => T) } | { type: "undo" } | { type: "redo" } | { type: "reset"; next: T }
export function editHistory<T>(state: EditHistory<T>, action: EditAction<T>, limit = 80): EditHistory<T> {
  if (action.type === "reset") return { present: action.next, past: [], future: [], revision: state.revision + 1 }
  if (action.type === "undo") {
    if (!state.past.length) return state
    return { present: state.past[state.past.length - 1], past: state.past.slice(0, -1), future: [state.present, ...state.future].slice(0, limit), revision: state.revision + 1 }
  }
  if (action.type === "redo") {
    if (!state.future.length) return state
    return { present: state.future[0], past: [...state.past, state.present].slice(-limit), future: state.future.slice(1), revision: state.revision + 1 }
  }
  const next = typeof action.next === "function" ? (action.next as (v: T) => T)(state.present) : action.next
  return Object.is(next, state.present) ? state : { present: next, past: [...state.past, state.present].slice(-limit), future: [], revision: state.revision + 1 }
}
