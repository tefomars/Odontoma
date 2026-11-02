import { useCallback, useRef, useState, useSyncExternalStore, type SetStateAction } from "react"
import { editHistory, type EditHistory } from "./historyState"
import { globalJournal } from "./globalHistory"
import { draftLabels, type DraftArea } from "./draftStatus"

export function useHistoryState<T>(initialValue: T, limit = 80, area?: DraftArea) {
  const [history, update] = useState<EditHistory<T>>(() => ({ present: initialValue, past: [], future: [], revision: 0 }))
  const current = useRef(history)
  const global = useSyncExternalStore(globalJournal.subscribe, globalJournal.getSnapshot, globalJournal.getSnapshot)
  const transition = useCallback((action: Parameters<typeof editHistory<T>>[1]) => {
    const before = current.current
    const after = editHistory(before, action, limit)
    if (before === after) return
    // Outside React updater functions: StrictMode cannot journal an action twice.
    const field = typeof document === "undefined" ? null : document.activeElement
    const merge = typeof document !== "undefined" && (field instanceof HTMLTextAreaElement || (field instanceof HTMLInputElement && ["text", "search", "number", "url", "email"].includes(field.type))) ? field : undefined
    if (area && action.type === "set") globalJournal.record({ area, before: before.present, after: after.present, apply: value => { current.current = editHistory(current.current, { type: "reset", next: value as T }, limit); update(current.current) } }, draftLabels[area], merge)
    if (area && action.type === "reset") globalJournal.forget(area)
    current.current = after; update(after)
  }, [area, limit])
  const setState = useCallback((next: SetStateAction<T>) => transition({ type: "set", next }), [transition])
  const undo = useCallback(() => { if (area) globalJournal.undo(); else transition({ type: "undo" }) }, [area, transition])
  const redo = useCallback(() => { if (area) globalJournal.redo(); else transition({ type: "redo" }) }, [area, transition])
  const reset = useCallback((next: T) => transition({ type: "reset", next }), [transition])
  return { state: history.present, setState, undo, redo, reset, area, canUndo: area ? global.canUndo : history.past.length > 0, canRedo: area ? global.canRedo : history.future.length > 0, revision: history.revision }
}
