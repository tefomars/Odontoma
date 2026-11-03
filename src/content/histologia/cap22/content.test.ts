import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import { cap22Flashcards } from "@/content/flashcards/histologia/cap22"
import { histologiaFlashcards } from "@/content/flashcards/histologia/cards"
import { chapters } from "@/content/histologia/chapters"
import { questionCountsByChapter, questions } from "@/content/histologia"
import { getStudyBank } from "@/content/studio/catalog"
import { validateStudio } from "@/content/studio/schema"
import { shuffleQuestionsBalanced } from "@/lib/shuffleQuestion"
import { cap22Questions } from "./questions"

const chapterId = "Capítulo 22"

describe("capítulo 22: aparato reproductor masculino", () => {
  it("registra el capítulo con imagen y las 100 preguntas en la app", () => {
    const chapter = chapters.find(item => item.id === chapterId)
    expect(chapter?.subtitle).toBe("Aparato reproductor masculino")
    expect(chapter?.image).toBeTruthy()
    expect(chapter?.questionCount).toBe(100)
    expect(questionCountsByChapter[chapterId]).toBe(100)
    expect(questions.filter(question => question.chapter === chapterId)).toEqual(cap22Questions)
  })

  it("mantiene cuatro alternativas únicas, una clave y explicación por pregunta", () => {
    expect(cap22Questions).toHaveLength(100)
    expect(new Set(cap22Questions.map(question => question.id)).size).toBe(100)
    expect(new Set(cap22Questions.map(question => question.question)).size).toBe(100)
    for (const question of cap22Questions) {
      expect(question.type).toBe("single")
      expect(question.options).toHaveLength(4)
      expect(new Set(question.options.map(option => option.trim().toLowerCase())).size).toBe(4)
      expect(question.options.every(option => option.trim())).toBe(true)
      expect(question.correctAnswers).toEqual([0])
      expect(question.explanation.trim().length).toBeGreaterThan(20)
    }
  })

  it("conserva las claves al distribuir las respuestas entre A, B, C y D", () => {
    const original = structuredClone(cap22Questions)
    const shuffled = shuffleQuestionsBalanced(cap22Questions)
    const counts = [0, 0, 0, 0]
    for (const question of shuffled) {
      const source = cap22Questions.find(item => item.id === question.id)!
      const key = question.correctAnswers[0] as number
      counts[key] += 1
      expect(question.options[key]).toBe(source.options[0])
      expect([...question.options].sort()).toEqual([...source.options].sort())
    }
    expect(counts).toEqual([25, 25, 25, 25])
    expect(cap22Questions).toEqual(original)
  })

  it("incluye 322 tarjetas concretas y breves en seis temas y quince subtemas", () => {
    expect(cap22Flashcards).toHaveLength(322)
    expect(histologiaFlashcards.filter(card => card.chapter === chapterId)).toEqual(cap22Flashcards)
    expect(new Set(cap22Flashcards.map(card => card.id)).size).toBe(322)
    expect(new Set(cap22Flashcards.map(card => card.front)).size).toBe(322)
    expect(new Set(cap22Flashcards.map(card => card.topic)).size).toBe(6)
    expect(new Set(cap22Flashcards.map(card => card.subtopic)).size).toBe(15)
    for (const card of cap22Flashcards) {
      expect(card.front).toMatch(/^¿.+\?$/)
      expect(card.front).not.toMatch(/según|menciona el capítulo|cosas correctas/i)
      expect(card.back.trim().length).toBeGreaterThan(0)
      expect(card.back.split(/\s+/).length).toBeLessThanOrEqual(35)
      expect(card.tags).toContain(chapterId)
    }
  })

  it("hace accesibles todos los subtemas desde el selector de flashcards", () => {
    const selector = readFileSync(new URL("../../../components/flashcards/FlashcardSelectScreen.tsx", import.meta.url), "utf8")
    const menu = selector.split('chapter: "Capítulo 22"')[1]?.split('chapter: "Artículo')[0]
    expect(menu).toBeTruthy()
    for (const subtopic of new Set(cap22Flashcards.map(card => card.subtopic))) {
      expect(menu).toContain(JSON.stringify(subtopic))
    }
  })

  it("ofrece el mismo contenido editable en la biblioteca del builder", () => {
    const bank = getStudyBank("histologia")!
    const chapter = bank.chapters.find(item => item.id === chapterId)!
    const chapterQuestions = bank.questions.filter(question => question.chapter === chapterId)
    const chapterCards = bank.flashcards.filter(card => card.chapter === chapterId)
    expect(chapter.questionCount).toBe(100)
    expect(chapterQuestions).toEqual(cap22Questions)
    expect(chapterCards).toEqual(cap22Flashcards)
    expect(validateStudio({ version: 1, banks: [{ ...bank, chapters: [chapter], questions: chapterQuestions, flashcards: chapterCards }] })).toEqual([])
  })
})
