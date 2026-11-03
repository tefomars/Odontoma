import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import { cap1Flashcards } from "@/content/flashcards/histologia/cap1"
import { histologiaFlashcards } from "@/content/flashcards/histologia/cards"
import { chapters } from "@/content/histologia/chapters"
import { questionCountsByChapter, questions } from "@/content/histologia"
import { getStudyBank } from "@/content/studio/catalog"
import { validateStudio } from "@/content/studio/schema"
import { shuffleQuestionsBalanced } from "@/lib/shuffleQuestion"
import { cap1Questions } from "./questions"

const chapterId = "Capítulo 1"

describe("capítulo 1: métodos de estudio histológico", () => {
  it("registra el capítulo con imagen y las 100 preguntas en la app", () => {
    const chapter = chapters.find(item => item.id === chapterId)
    expect(chapter?.subtitle).toBe("Métodos de estudio histológico")
    expect(chapter?.image).toBeTruthy()
    expect(chapter?.questionCount).toBe(100)
    expect(questionCountsByChapter[chapterId]).toBe(100)
    expect(questions.filter(question => question.chapter === chapterId)).toEqual(cap1Questions)
  })

  it("mantiene cuatro alternativas únicas, una clave y explicación por pregunta", () => {
    expect(cap1Questions).toHaveLength(100)
    expect(new Set(cap1Questions.map(question => question.id)).size).toBe(100)
    expect(new Set(cap1Questions.map(question => question.question)).size).toBe(100)
    for (const question of cap1Questions) {
      expect(question.type).toBe("single")
      expect(question.options).toHaveLength(4)
      expect(new Set(question.options.map(option => option.trim().toLowerCase())).size).toBe(4)
      expect(question.options.every(option => option.trim())).toBe(true)
      expect(question.correctAnswers).toEqual([0])
      expect(question.explanation.trim().length).toBeGreaterThan(20)
    }
  })

  it("conserva las claves al distribuir las respuestas entre A, B, C y D", () => {
    const original = structuredClone(cap1Questions)
    const shuffled = shuffleQuestionsBalanced(cap1Questions)
    const counts = [0, 0, 0, 0]
    for (const question of shuffled) {
      const source = cap1Questions.find(item => item.id === question.id)!
      const key = question.correctAnswers[0] as number
      counts[key] += 1
      expect(question.options[key]).toBe(source.options[0])
      expect([...question.options].sort()).toEqual([...source.options].sort())
    }
    expect(counts).toEqual([25, 25, 25, 25])
    expect(cap1Questions).toEqual(original)
  })

  it("incluye 291 tarjetas concretas y breves en siete temas y diecisiete subtemas", () => {
    expect(cap1Flashcards).toHaveLength(291)
    expect(histologiaFlashcards.filter(card => card.chapter === chapterId)).toEqual(cap1Flashcards)
    expect(new Set(cap1Flashcards.map(card => card.id)).size).toBe(291)
    expect(new Set(cap1Flashcards.map(card => card.front)).size).toBe(291)
    expect(new Set(cap1Flashcards.map(card => card.topic)).size).toBe(7)
    expect(new Set(cap1Flashcards.map(card => card.subtopic)).size).toBe(17)
    for (const card of cap1Flashcards) {
      expect(card.front).toMatch(/^¿.+\?$/)
      expect(card.front).not.toMatch(/según (?:los apuntes|el (?:libro|texto|capítulo))|menciona el capítulo|cosas correctas/i)
      expect(card.back.trim().length).toBeGreaterThan(0)
      expect(card.back.split(/\s+/).length).toBeLessThanOrEqual(35)
      expect(card.tags).toContain(chapterId)
    }
  })

  it("hace accesibles todos los subtemas desde el selector de flashcards", () => {
    const selector = readFileSync(new URL("../../../components/flashcards/FlashcardSelectScreen.tsx", import.meta.url), "utf8")
    const menu = selector.split('chapter: "Capítulo 1"')[1]?.split('chapter: "Capítulo 4"')[0]
    expect(menu).toBeTruthy()
    for (const subtopic of new Set(cap1Flashcards.map(card => card.subtopic))) {
      expect(menu).toContain(JSON.stringify(subtopic))
    }
  })

  it("ofrece el mismo contenido editable en la biblioteca del builder", () => {
    const bank = getStudyBank("histologia")!
    const chapter = bank.chapters.find(item => item.id === chapterId)!
    const chapterQuestions = bank.questions.filter(question => question.chapter === chapterId)
    const chapterCards = bank.flashcards.filter(card => card.chapter === chapterId)
    expect(chapter.questionCount).toBe(100)
    expect(chapterQuestions).toEqual(cap1Questions)
    expect(chapterCards).toEqual(cap1Flashcards)
    expect(validateStudio({ version: 1, banks: [{ ...bank, chapters: [chapter], questions: chapterQuestions, flashcards: chapterCards }] })).toEqual([])
  })
})
