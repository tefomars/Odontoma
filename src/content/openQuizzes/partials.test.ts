import { describe, expect, it } from "vitest"

import { getOpenQuizPartial, groupOpenQuizDecks } from "./partials"
import type { OpenQuizDeck } from "./types"

function deck(title: string, partial?: number | null): OpenQuizDeck {
  return { id: title, title, subject: "Bioquímica", partial, questions: [] }
}

describe("open quiz partials", () => {
  it("recognizes the existing Bioquímica naming convention", () => {
    expect(getOpenQuizPartial(deck("Bioquímica Primer Parcial - Glucólisis"))).toBe(1)
    expect(getOpenQuizPartial(deck("Bioquímica Segundo Parcial - Cetogénesis"))).toBe(2)
    expect(getOpenQuizPartial(deck("Bioquímica Tercer Parcial - Colesterol"))).toBe(3)
  })

  it("lets the Builder override or remove a partial without renaming the quiz", () => {
    expect(getOpenQuizPartial(deck("Bioquímica Primer Parcial - Glucólisis", 3))).toBe(3)
    expect(getOpenQuizPartial(deck("Bioquímica Primer Parcial - Glucólisis", null))).toBeNull()
  })

  it("sorts partials and keeps quizzes without a partial available", () => {
    const grouped = groupOpenQuizDecks([
      deck("Bioquímica Tercer Parcial - Colesterol"),
      deck("Repaso general"),
      deck("Bioquímica Primer Parcial - Glucólisis")
    ])

    expect(grouped.partials.map(item => item.number)).toEqual([1, 3])
    expect(grouped.ungrouped.map(item => item.title)).toEqual(["Repaso general"])
  })
})
