import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { cap2Flashcards } from "@/content/flashcards/histologia/cap2"
import { cap3Flashcards } from "@/content/flashcards/histologia/cap3"
import { histologiaFlashcards } from "@/content/flashcards/histologia/cards"
import { chapters } from "@/content/histologia/chapters"
import { questionCountsByChapter, questions } from "@/content/histologia"
import { getStudyBank } from "@/content/studio/catalog"
import { validateStudio } from "@/content/studio/schema"
import { shuffleQuestionsBalanced } from "@/lib/shuffleQuestion"
import { cap2Questions } from "./questions"
import { cap3Questions } from "../cap3/questions"

const cases = [
  { chapterId: "Capítulo 2", title: "Citoplasma celular", cards: cap2Flashcards, quiz: cap2Questions, cardCount: 420, questionCount: 140, topics: 8, subtopics: 27 },
  { chapterId: "Capítulo 3", title: "Núcleo celular", cards: cap3Flashcards, quiz: cap3Questions, cardCount: 268, questionCount: 100, topics: 7, subtopics: 18 },
] as const

for (const data of cases) describe(`${data.chapterId}: contenido e integración`, () => {
  it("registra portada, preguntas y conteos en la app", () => {
    const chapter = chapters.find(item => item.id === data.chapterId)!
    expect(chapter.subtitle).toBe(data.title)
    expect(chapter.image).toBeTruthy()
    expect(chapter.questionCount).toBe(data.questionCount)
    expect(questionCountsByChapter[data.chapterId]).toBe(data.questionCount)
    expect(questions.filter(item => item.chapter === data.chapterId)).toEqual(data.quiz)
  })

  it("conserva tarjetas específicas, breves, únicas y con subtemas", () => {
    expect(data.cards).toHaveLength(data.cardCount)
    expect(histologiaFlashcards.filter(card => card.chapter === data.chapterId)).toEqual(data.cards)
    expect(new Set(data.cards.map(card => card.id)).size).toBe(data.cardCount)
    expect(new Set(data.cards.map(card => card.front)).size).toBe(data.cardCount)
    expect(new Set(data.cards.map(card => card.topic)).size).toBe(data.topics)
    expect(new Set(data.cards.map(card => card.subtopic)).size).toBe(data.subtopics)
    for (const card of data.cards) {
      expect(card.front).toMatch(/^¿.+\?$/)
      expect(card.front).not.toMatch(/según (?:los apuntes|el (?:libro|texto|capítulo))|menciona el capítulo|cosas correctas/i)
      expect(card.back.trim()).toBeTruthy()
      expect(card.back.split(/\s+/).length).toBeLessThanOrEqual(35)
      expect(card.tags).toContain(data.chapterId)
    }
  })

  it("incluye cuatro alternativas distintas y una explicación independiente", () => {
    expect(data.quiz).toHaveLength(data.questionCount)
    expect(new Set(data.quiz.map(question => question.id)).size).toBe(data.questionCount)
    expect(new Set(data.quiz.map(question => question.question)).size).toBe(data.questionCount)
    for (const question of data.quiz) {
      expect(question.type).toBe("single")
      expect(question.options).toHaveLength(4)
      expect(new Set(question.options.map(option => option.trim().toLowerCase())).size).toBe(4)
      expect(question.options.every(option => option.trim())).toBe(true)
      expect(question.correctAnswers).toEqual([0])
      expect(question.explanation.length).toBeGreaterThan(20)
      expect(data.cards.some(card => card.subtopic === question.topic)).toBe(true)
    }
  })

  it("preserva la clave al mezclar opciones y equilibra A, B, C y D", () => {
    const original = structuredClone(data.quiz)
    const shuffled = shuffleQuestionsBalanced(data.quiz)
    const counts = [0, 0, 0, 0]
    for (const question of shuffled) {
      const source = data.quiz.find(item => item.id === question.id)!
      const key = question.correctAnswers[0] as number
      counts[key]++
      expect(question.options[key]).toBe(source.options[0])
      expect([...question.options].sort()).toEqual([...source.options].sort())
    }
    expect(counts).toEqual(Array(4).fill(data.questionCount / 4))
    expect(data.quiz).toEqual(original)
  })

  it("hace accesibles todos los subtemas y no crea grupos vacíos", () => {
    const selector = readFileSync(new URL("../../../components/flashcards/FlashcardSelectScreen.tsx", import.meta.url), "utf8")
    const menu = selector.split(`chapter: "${data.chapterId}"`)[1]?.split('chapter: "')[0]
    expect(menu).toBeTruthy()
    const declared = [...menu.matchAll(/subtopics: \[([^\]]+)\]/g)].flatMap(match => JSON.parse(`[${match[1]}]`) as string[])
    expect(new Set(declared)).toEqual(new Set(data.cards.map(card => card.subtopic)))
    expect(declared).toHaveLength(data.subtopics)
  })

  it("ofrece el mismo contenido editable y validable en el builder", () => {
    const bank = getStudyBank("histologia")!
    const chapter = bank.chapters.find(item => item.id === data.chapterId)!
    const chapterCards = bank.flashcards.filter(card => card.chapter === data.chapterId)
    const chapterQuestions = bank.questions.filter(question => question.chapter === data.chapterId)
    expect(chapterCards).toEqual(data.cards)
    expect(chapterQuestions).toEqual(data.quiz)
    expect(validateStudio({ version: 1, banks: [{ ...bank, chapters: [chapter], questions: chapterQuestions, flashcards: chapterCards }] })).toEqual([])
  })
})

it("ordena los fundamentos y no introduce colisiones de identificadores", () => {
  expect(chapters.slice(0, 4).map(chapter => chapter.id)).toEqual(["Capítulo 1", "Capítulo 2", "Capítulo 3", "Capítulo 4"])
  const newCards = [...cap2Flashcards, ...cap3Flashcards]
  const newQuestions = [...cap2Questions, ...cap3Questions]
  const oldCardIds = new Set(histologiaFlashcards.filter(card => !["Capítulo 2", "Capítulo 3"].includes(card.chapter)).map(card => card.id))
  const oldQuestionIds = new Set(questions.filter(question => !["Capítulo 2", "Capítulo 3"].includes(question.chapter)).map(question => question.id))
  expect(new Set(newCards.map(card => card.id)).size).toBe(newCards.length)
  expect(new Set(newQuestions.map(question => question.id)).size).toBe(newQuestions.length)
  expect(newCards.some(card => oldCardIds.has(card.id))).toBe(false)
  expect(newQuestions.some(question => oldQuestionIds.has(question.id))).toBe(false)
})
