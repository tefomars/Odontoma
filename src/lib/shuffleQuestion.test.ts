import { describe, expect, it } from "vitest"

import {
  shuffleQuestion,
  shuffleQuestionsBalanced
} from "./shuffleQuestion"

function question(id: string, optionCount = 4) {
  return {
    id,
    options: Array.from(
      { length: optionCount },
      (_, index) => index === 0 ? `correct-${id}` : `distractor-${id}-${index}`
    ),
    correctAnswers: [0]
  }
}

describe("question option shuffling", () => {
  it("keeps the correct answer attached to its option", () => {
    const original = question("one")
    const shuffled = shuffleQuestion(original)

    expect(shuffled.options[shuffled.correctAnswers[0]]).toBe("correct-one")
    expect(original.options[0]).toBe("correct-one")
  })

  it("balances four-option answers across a session", () => {
    const shuffled = shuffleQuestionsBalanced(
      Array.from({ length: 40 }, (_, index) => question(`four-${index}`))
    )
    const counts = [0, 0, 0, 0]

    for (const item of shuffled) {
      counts[item.correctAnswers[0]] += 1
      expect(item.options[item.correctAnswers[0]]).toBe(`correct-${item.id}`)
    }

    expect(counts).toEqual([10, 10, 10, 10])
  })

  it("balances true-or-false answers separately", () => {
    const shuffled = shuffleQuestionsBalanced(
      Array.from({ length: 10 }, (_, index) => question(`binary-${index}`, 2))
    )
    const counts = [0, 0]

    for (const item of shuffled) {
      counts[item.correctAnswers[0]] += 1
      expect(item.options[item.correctAnswers[0]]).toBe(`correct-${item.id}`)
    }

    expect(counts).toEqual([5, 5])
  })
})
