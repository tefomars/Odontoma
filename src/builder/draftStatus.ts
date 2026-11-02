import { useEffect, useMemo, useSyncExternalStore } from "react"
import type { NavigationIssue } from "@/content/appBuilder/navigationValidation"

export const draftLabels = { library: "Bancos de preguntas y flashcards", home: "Menús y tarjetas de quizzes", decks: "Tarjetas de flashcards", written: "Cuestionarios escritos", pages: "Menús personalizados", organization: "Subdivisiones y clases de repaso", theme: "Apariencia global", overrides: "Edición directa de la app" } as const
export type DraftArea = keyof typeof draftLabels
export type DraftReport = { area: DraftArea; label: string; ready: boolean; dirty: boolean }
let reports: DraftReport[] = (Object.keys(draftLabels) as DraftArea[]).map(area => ({ area, label: draftLabels[area], ready: false, dirty: false }))
let issues: NavigationIssue[] = []
const listeners = new Set<() => void>()
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn) } }
export function setDraftReport(area: DraftArea, ready: boolean, dirty: boolean) {
  const old = reports.find(r => r.area === area)!
  if (old.ready === ready && old.dirty === dirty) return
  reports = reports.map(r => r.area === area ? { ...r, ready, dirty } : r)
  listeners.forEach(fn => fn())
}
export function useDraftStatus(area: DraftArea, ready: boolean, value: unknown, saved: unknown) {
  const text = useMemo(() => JSON.stringify(value), [value])
  const savedText = useMemo(() => JSON.stringify(saved), [saved])
  useEffect(() => { setDraftReport(area, ready, ready && text !== savedText) }, [area, ready, text, savedText])
}
export const getDraftReports = () => reports
export function useDraftReports() { return useSyncExternalStore(subscribe, getDraftReports, getDraftReports) }
export function setNavigationIssues(next: NavigationIssue[]) {
  if (JSON.stringify(next) === JSON.stringify(issues)) return
  issues = next; listeners.forEach(fn => fn())
}
export function useNavigationIssues() { return useSyncExternalStore(subscribe, () => issues, () => issues) }
