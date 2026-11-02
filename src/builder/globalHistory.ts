export type JournalChange = { area: string; before: unknown; after: unknown; apply: (value: unknown) => void }
export type JournalEntry = { label: string; changes: JournalChange[]; target?: unknown; mergeKey?: object; editedAt?: number }
export class GlobalJournal {
  private past: JournalEntry[] = []
  private future: JournalEntry[] = []
  private listeners = new Set<() => void>()
  private group: JournalEntry | null = null
  private context: { area: string; target: unknown } | null = null
  private snapshot = { canUndo: false, canRedo: false, undoLabel: "", redoLabel: "" }
  subscribe = (fn: () => void) => { this.listeners.add(fn); return () => { this.listeners.delete(fn) } }
  getSnapshot = () => this.snapshot
  setContext(area: string, target: unknown) { this.context = { area, target } }
  private emit() { this.snapshot = { canUndo: !!this.past.length, canRedo: !!this.future.length, undoLabel: this.past.at(-1)?.label || "", redoLabel: this.future.at(-1)?.label || "" }; this.listeners.forEach(fn => fn()) }
  record(change: JournalChange, label: string, mergeKey?: object, now = Date.now()) {
    if (Object.is(change.before, change.after)) return
    if (this.group) {
      const previous = this.group.changes.find(c => c.area === change.area)
      if (previous) previous.after = change.after
      else this.group.changes.push(change)
      return
    }
    const previous = this.past.at(-1)
    if (mergeKey && !this.future.length && previous?.mergeKey === mergeKey && previous.changes.length === 1 && previous.changes[0].area === change.area && now - previous.editedAt! < 700) {
      previous.changes[0].after = change.after; previous.editedAt = now; this.emit(); return
    }
    this.past = [...this.past, { label, changes: [change], mergeKey, editedAt: now, target: this.context?.area === change.area ? this.context.target : undefined }].slice(-80)
    this.future = []; this.emit()
  }
  batch(label: string, run: () => void) {
    if (this.group) { run(); return }
    this.group = { label, changes: [], target: this.context?.target }
    try { run() } finally {
      const group = this.group; this.group = null
      if (group.changes.length) { this.past = [...this.past, group].slice(-80); this.future = []; this.emit() }
    }
  }
  undo() {
    const entry = this.past.pop(); if (!entry) return
    [...entry.changes].reverse().forEach(c => c.apply(c.before))
    this.future.push(entry); this.emit(); return entry.target
  }
  redo() {
    const entry = this.future.pop(); if (!entry) return
    entry.changes.forEach(c => c.apply(c.after))
    this.past.push(entry); this.emit(); return entry.target
  }
  forget(area: string) {
    // A reload/discard is a new baseline: never retain a half-restorable compound action.
    this.past = this.past.filter(e => !e.changes.some(c => c.area === area))
    this.future = this.future.filter(e => !e.changes.some(c => c.area === area)); this.emit()
  }
}
export const globalJournal = new GlobalJournal()
