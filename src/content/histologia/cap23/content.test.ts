import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import { cap23Flashcards } from "@/content/flashcards/histologia/cap23"
import { histologiaFlashcards } from "@/content/flashcards/histologia/cards"
import { chapters } from "@/content/histologia/chapters"
import { questionCountsByChapter, questions } from "@/content/histologia"
import { getStudyBank } from "@/content/studio/catalog"
import { validateStudio } from "@/content/studio/schema"
import { shuffleQuestionsBalanced } from "@/lib/shuffleQuestion"
import { cap23Questions } from "./questions"

const chapterId = "Capítulo 23"

describe("capítulo 23: aparato reproductor femenino", () => {
  it("registra el capítulo con imagen y las 120 preguntas en la app", () => {
    const chapter = chapters.find(item => item.id === chapterId)
    expect(chapter?.subtitle).toBe("Aparato reproductor femenino")
    expect(chapter?.image).toBeTruthy()
    expect(chapter?.questionCount).toBe(120)
    expect(questionCountsByChapter[chapterId]).toBe(120)
    expect(questions.filter(question => question.chapter === chapterId)).toEqual(cap23Questions)
  })

  it("mantiene cuatro alternativas únicas, una clave y explicación por pregunta", () => {
    expect(cap23Questions).toHaveLength(120)
    expect(new Set(cap23Questions.map(question => question.id)).size).toBe(120)
    expect(new Set(cap23Questions.map(question => question.question)).size).toBe(120)
    for (const question of cap23Questions) {
      expect(question.type).toBe("single")
      expect(question.options).toHaveLength(4)
      expect(new Set(question.options.map(option => option.trim().toLowerCase())).size).toBe(4)
      expect(question.options.every(option => option.trim())).toBe(true)
      expect(question.correctAnswers).toEqual([0])
      expect(question.explanation.trim().length).toBeGreaterThan(20)
    }
  })

  it("conserva las claves al distribuir las respuestas entre A, B, C y D", () => {
    const original = structuredClone(cap23Questions)
    const shuffled = shuffleQuestionsBalanced(cap23Questions)
    const counts = [0, 0, 0, 0]
    for (const question of shuffled) {
      const source = cap23Questions.find(item => item.id === question.id)!
      const key = question.correctAnswers[0] as number
      counts[key] += 1
      expect(question.options[key]).toBe(source.options[0])
      expect([...question.options].sort()).toEqual([...source.options].sort())
    }
    expect(counts).toEqual([30, 30, 30, 30])
    expect(cap23Questions).toEqual(original)
  })

  it("incluye 415 tarjetas concretas y breves en ocho temas y veinte subtemas", () => {
    expect(cap23Flashcards).toHaveLength(415)
    expect(histologiaFlashcards.filter(card => card.chapter === chapterId)).toEqual(cap23Flashcards)
    expect(new Set(cap23Flashcards.map(card => card.id)).size).toBe(415)
    expect(new Set(cap23Flashcards.map(card => card.front)).size).toBe(415)
    expect(new Set(cap23Flashcards.map(card => card.topic)).size).toBe(8)
    expect(new Set(cap23Flashcards.map(card => card.subtopic)).size).toBe(20)
    for (const card of cap23Flashcards) {
      expect(card.front).toMatch(/^¿.+\?$/)
      expect(card.front).not.toMatch(/según (?:los apuntes|el (?:libro|texto|capítulo))|menciona el capítulo|cosas correctas/i)
      expect(card.back.trim().length).toBeGreaterThan(0)
      expect(card.back.split(/\s+/).length).toBeLessThanOrEqual(35)
      expect(card.tags).toContain(chapterId)
    }
  })

  it("hace accesibles todos los subtemas desde el selector de flashcards", () => {
    const selector = readFileSync(new URL("../../../components/flashcards/FlashcardSelectScreen.tsx", import.meta.url), "utf8")
    const menu = selector.split('chapter: "Capítulo 23"')[1]?.split('chapter: "Artículo')[0]
    expect(menu).toBeTruthy()
    for (const subtopic of new Set(cap23Flashcards.map(card => card.subtopic))) {
      expect(menu).toContain(JSON.stringify(subtopic))
    }
  })

  it("ofrece el mismo contenido editable en la biblioteca del builder", () => {
    const bank = getStudyBank("histologia")!
    const chapter = bank.chapters.find(item => item.id === chapterId)!
    const chapterQuestions = bank.questions.filter(question => question.chapter === chapterId)
    const chapterCards = bank.flashcards.filter(card => card.chapter === chapterId)
    expect(chapter.questionCount).toBe(120)
    expect(chapterQuestions).toEqual(cap23Questions)
    expect(chapterCards).toEqual(cap23Flashcards)
    expect(validateStudio({ version: 1, banks: [{ ...bank, chapters: [chapter], questions: chapterQuestions, flashcards: chapterCards }] })).toEqual([])
  })
})
