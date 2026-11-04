import type { StudyChapter } from "../studio/schema"
import { procesoIParcial1 } from "./i-parcial1"
import { procesoIParcial2 } from "./i-parcial2"
import { procesoIIParcial1 } from "./ii-parcial1"
import { procesoIIParcial2 } from "./ii-parcial2"
import { procesoIIFinal } from "./ii-final"

export const procesoIQuestions = [...procesoIParcial1, ...procesoIParcial2]
export const procesoIIQuestions = [...procesoIIParcial1, ...procesoIIParcial2, ...procesoIIFinal]

export const procesoIChapters: StudyChapter[] = [
  { id: "Parcial 1", title: "Parcial 1", subtitle: "Mercado, valor y precios", description: "Acción, división del trabajo, utilidad, oferta y demanda, elasticidad e intervención.", image: "", questionCount: procesoIParcial1.length, accent: "from-sky-500/20 to-cyan-500/10" },
  { id: "Parcial 2", title: "Parcial 2", subtitle: "Capital, cálculo y empresa", description: "Ahorro, interés, valor presente, productividad, función empresarial y competencia.", image: "", questionCount: procesoIParcial2.length, accent: "from-sky-500/20 to-cyan-500/10" },
]

// Clarifications used for the new quiz keys; these do not rewrite the user's
// flashcards or add terminology-dependent questions outside their course topics.
export const procesoQuizReferences = [
  "https://openstax.org/books/principles-microeconomics-3e/pages/5-3-elasticity-and-pricing",
  "https://openstax.org/books/principles-macroeconomics-3e/pages/3-4-price-ceilings-and-price-floors",
  "https://www.bankofengland.co.uk/quarterly-bulletin/2014/q1/money-creation-in-the-modern-economy",
  "https://www.bea.gov/resources/methodologies/us-international-economic-accounts-concepts-methods",
] as const
