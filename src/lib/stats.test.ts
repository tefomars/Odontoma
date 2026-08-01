import { beforeEach, describe, expect, it } from "vitest"

import {
  loadStats,
  normalizeStats
} from "@/lib/stats"

import {
  installLocalStorageMock
} from "@/test/localStorageMock"

describe("stats storage", () => {
  beforeEach(() => {
    installLocalStorageMock()
  })

  it("recupera un estado seguro si localStorage está dañado", () => {
    localStorage.setItem("odontoma_stats", "{roto")

    expect(loadStats()).toEqual({
      totalAnswered: 0,
      totalCorrect: 0,
      tags: {},
      questions: {}
    })
  })

  it("normaliza números y descarta estructuras inválidas", () => {
    expect(normalizeStats({
      totalAnswered: "4",
      totalCorrect: -2,
      tags: { tejido: { correct: "3", incorrect: 1 } },
      questions: []
    })).toEqual({
      totalAnswered: 4,
      totalCorrect: 0,
      tags: { tejido: { correct: 3, incorrect: 1 } },
      questions: {}
    })
  })
})
