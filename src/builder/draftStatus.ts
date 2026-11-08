import { useEffect, useMemo, useSyncExternalStore } from "react"
import type { NavigationIssue } from "@/content/appBuilder/navigationValidation"
import { draftValuesEqual } from "./draftEquality"

export const draftLabels = { mixed: "Exámenes completos", library: "Bancos de preguntas y flashcards", home: "Menús y tarjetas de quizzes", decks: "Tarjetas de flashcards", written: "Cuestionarios escritos", pages: "Menús personalizados", organization: "Subdivisiones y clases de repaso", theme: "Apariencia global", overrides: "Edición directa de la app", changelog: "Versión e historial de cambios" } as const
export type DraftArea = keyof typeof draftLabels
export type DraftReport = { area: DraftArea; label: string; ready: boolean; dirty: boolean; blocked?: string }
let reports: DraftReport[] = (Object.keys(draftLabels) as DraftArea[]).map(area => ({ area, label: draftLabels[area], ready: false, dirty: false }))
let issues: NavigationIssue[] = []
const listeners = new Set<() => void>()
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn) } }
export function setDraftReport(area: DraftArea, ready: boolean, dirty: boolean, blocked?: string) {
  const old = reports.find(r => r.area === area)!
  if (old.ready === ready && old.dirty === dirty && old.blocked === blocked) return
  reports = reports.map(r => r.area === area ? { ...r, ready, dirty, blocked } : r)
  listeners.forEach(fn => fn())
}
export function useDraftStatus(area: DraftArea, ready: boolean, value: unknown, saved: unknown, blocked?: string) {
  const dirty = useMemo(() => !draftValuesEqual(value, saved), [value, saved])
  useEffect(() => { setDraftReport(area, ready, ready && dirty, blocked) }, [area, ready, dirty, blocked])
}
export const getDraftReports = () => reports
export function useDraftReports() { return useSyncExternalStore(subscribe, getDraftReports, getDraftReports) }
export function setNavigationIssues(next: NavigationIssue[]) {
  if (JSON.stringify(next) === JSON.stringify(issues)) return
  issues = next; listeners.forEach(fn => fn())
}
export function useNavigationIssues() { return useSyncExternalStore(subscribe, () => issues, () => issues) }
