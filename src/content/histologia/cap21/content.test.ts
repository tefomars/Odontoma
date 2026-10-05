import { describe, expect, it } from "vitest"

import { cap21Flashcards } from "@/content/flashcards/histologia/cap21"
import { histologiaFlashcards } from "@/content/flashcards/histologia/cards"
import { chapters } from "@/content/histologia/chapters"
import { questionCountsByChapter, questions } from "@/content/histologia"
import { cap21Questions } from "./questions"

describe("capítulo 21 de Histología", () => {
  it("aparece como apartado de opción múltiple con su banco completo", () => {
    expect(chapters.find(chapter => chapter.id === "Capítulo 21")?.questionCount).toBe(34)
    expect(questionCountsByChapter["Capítulo 21"]).toBe(34)
    expect(questions.filter(question => question.chapter === "Capítulo 21")).toHaveLength(34)
    expect(cap21Questions).toHaveLength(34)
    expect(new Set(cap21Questions.map(question => question.id)).size).toBe(34)
    expect(new Set(cap21Questions.map(question => question.topic)).size).toBe(6)

    for (const question of cap21Questions) {
      expect(question.type).toBe("single")
      expect(question.options).toHaveLength(4)
      expect(new Set(question.options).size).toBe(4)
      expect(question.correctAnswers).toEqual([0])
      expect(question.explanation.trim().length).toBeGreaterThan(20)
    }
  })

  it("registra 188 flashcards agrupadas por órgano y sin IDs repetidos", () => {
    expect(cap21Flashcards).toHaveLength(188)
    expect(histologiaFlashcards.filter(card => card.chapter === "Capítulo 21")).toHaveLength(188)
    expect(new Set(cap21Flashcards.map(card => card.id)).size).toBe(188)
    expect(new Set(cap21Flashcards.map(card => card.subtopic)).size).toBe(6)
    expect(cap21Flashcards.every(card => card.front.trim() && card.back.trim())).toBe(true)
  })
})
