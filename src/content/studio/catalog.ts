import data from "./data.json"
import type { StudyBank, StudyQuestion, StudioData } from "./schema"
import { applyBankPatch, compactLibrary, type StudioStorage } from "./storage"
import { questions as histo } from "../histologia"
import { chapters as histoChapters } from "../histologia/chapters"
import { questions as bio } from "../bioquimica"
import { chapters as bioChapters } from "../bioquimica/chapters"
import { questions as micro } from "../microbiologia"
import { chapters as microChapters } from "../microbiologia/chapters"
import { questions as semio } from "../semiologia"
import { chapters as semioChapters } from "../semiologia/chapters"
import { questions as hayek } from "../filosofia-de-hayek"
import { chapters as hayekChapters } from "../filosofia-de-hayek/chapters"
import { histologiaFlashcards } from "../flashcards/histologia/cards"
import bioCards from "../flashcards/bioquimica/cards"
import semioCards from "../flashcards/semiologia/cards"
import hayekCards from "../flashcards/filosofia-de-hayek/cards"
import procesoCards from "../flashcards/proceso-economico-i/cards"
import procesoIICards from "../flashcards/proceso-economico-ii/cards"
import { procesoEconomicoIIChapters } from "../flashcards/proceso-economico-ii/chapters"
import { procesoIQuestions, procesoIIQuestions, procesoIChapters } from "../proceso-economico"
import { citoIIPrePartialFlashcards, citoIIPrePartialQuestions } from "../prePartial/citoII"
import { CITO_II_FIRST_PARTIAL, citoIPrePartialQuestions } from "../prePartial/citoI"
import { citoIPrePartialFlashcards } from "../prePartial/citoIFlashcards"
import { CITO_II_THIRD_PARTIAL, citoIIIPrePartialQuestions } from "../prePartial/citoIII"
import { citoIIIPrePartialFlashcards } from "../prePartial/citoIIIFlashcards"
import { CITO_II_FOURTH_PARTIAL, citoIVPrePartialQuestions } from "../prePartial/citoIV"
import { citoIVPrePartialFlashcards } from "../prePartial/citoIVFlashcards"
import { materialesBank } from "../materiales-dentales"

const base = [
  { id: "histologia", title: "Histología", subject: "Histología", questions: histo, chapters: histoChapters, flashcards: histologiaFlashcards },
  { id: "bioquimica", title: "Bioquímica", subject: "Bioquímica", questions: bio, chapters: bioChapters, flashcards: bioCards },
  { id: "microbiologia", title: "Microbiología", subject: "Microbiología", questions: micro, chapters: microChapters, flashcards: [] },
  { id: "semiologia", title: "Semiología", subject: "Semiología", questions: semio, chapters: semioChapters, flashcards: semioCards },
  materialesBank,
  { id: "filosofia-de-hayek", title: "Filosofía de Hayek", subject: "Filosofía", questions: hayek, chapters: hayekChapters, flashcards: hayekCards },
  { id: "proceso-economico-i", title: "Proceso Económico I", subject: "Proceso Económico I", questions: procesoIQuestions, chapters: procesoIChapters, flashcards: procesoCards },
  { id: "proceso-economico-ii", title: "Proceso Económico II", subject: "Proceso Económico II", questions: procesoIIQuestions, chapters: procesoEconomicoIIChapters, flashcards: procesoIICards },
  { id: CITO_II_FIRST_PARTIAL, title: CITO_II_FIRST_PARTIAL, subject: "Histología", kind: "prepartial", questions: citoIPrePartialQuestions, chapters: [], flashcards: citoIPrePartialFlashcards },
  { id: "Parcial 2 · Cito II", title: "Parcial 2 · Cito II", subject: "Histología", kind: "prepartial", questions: citoIIPrePartialQuestions, chapters: [], flashcards: citoIIPrePartialFlashcards },
  { id: CITO_II_THIRD_PARTIAL, title: CITO_II_THIRD_PARTIAL, subject: "Histología", kind: "prepartial", questions: citoIIIPrePartialQuestions, chapters: [], flashcards: citoIIIPrePartialFlashcards },
  { id: CITO_II_FOURTH_PARTIAL, title: CITO_II_FOURTH_PARTIAL, subject: "Histología", kind: "prepartial", questions: citoIVPrePartialQuestions, chapters: [], flashcards: citoIVPrePartialFlashcards }
] as unknown as StudyBank[]

export function resolveStudioBanks(stored: StudioStorage): StudyBank[] { return base.map(rawBank => {
  const seen = new Map<string, number>()
  const original = { ...rawBank, kind: rawBank.kind || "course", flashcards: rawBank.flashcards.map(card => { const occurrence = (seen.get(card.id) || 0) + 1; seen.set(card.id, occurrence); return occurrence === 1 ? card : { ...card, legacyId: card.id, id: `${card.id}--${occurrence}` } }) }
  const bank = applyBankPatch(original, stored.patches?.[rawBank.id])
  const saved = stored.banks.find(item => item.id === bank.id)
  const merged = { ...bank, kind: bank.kind || "course", ...saved }
  const chapters = new Map(bank.chapters.map(c => [c.id, c]))
  for (const c of [...(stored.patches?.[bank.id]?.chapters || []), ...(saved?.chapters || [])]) chapters.set(c.id, { ...chapters.get(c.id), ...c, image: c.image === "@legacy" ? rawBank.chapters.find(old => old.id === c.id)?.image || "" : c.image })
  // A saved list is authoritative, including deliberate removals.
  const selected = saved ? saved.chapters.map(c => chapters.get(c.id)!) : [...chapters.values()]
  const known = new Set(selected.map(c => c.id))
  for (const item of [...merged.questions, ...merged.flashcards]) if (!known.has(item.chapter)) {
    selected.push({ id: item.chapter, title: item.chapter, subtitle: "", description: "", image: "", accent: "from-violet-500/20 to-sky-500/20", questionCount: 0 }); known.add(item.chapter)
  }
  return { ...merged, chapters: selected.map(c => ({ ...c, questionCount: merged.questions.filter(q => q.chapter === c.id).length })) }
}).concat(stored.banks.filter(bank => !base.some(b => b.id === bank.id))).map(bank => bank.archived ? { ...bank, enabled: false } : bank) }

export const studioBanks = resolveStudioBanks(data as StudioData)
export function compactStudioData(full: StudioData) { return compactLibrary(full, resolveStudioBanks({ version: 1, banks: [] })) }

export function getStudyBank(id: string | null) { return studioBanks.find(bank => bank.id === id?.replace(/^bank:/, "")) }
export function getStudyQuestions(id: string | null): StudyQuestion[] { return getStudyBank(id)?.questions || [] }
export const extraStudioBanks = studioBanks.filter(bank => bank.enabled !== false && bank.kind === "course" && !base.some(b => b.id === bank.id))
