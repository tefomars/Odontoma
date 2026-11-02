import { expect, it } from "vitest"
import home from "../content/appBuilder/subjects.json"
import decks from "../content/appBuilder/flashcard-subjects.json"
import { syncBankAccessNames } from "./bankNames"
import type { HomeContent, FlashcardSubjectBlock } from "../content/appBuilder/types"

it("renombra solo accesos al banco, sin mutar entradas ni otros campos", () => {
  const before = structuredClone({ home, decks })
  const next = syncBankAccessNames(home as HomeContent, decks as FlashcardSubjectBlock[], "histologia", "Nuevo nombre")
  expect(next.home.subjects.find(c => c.destination === "histologia")?.title).toBe("Nuevo nombre")
  expect(next.decks.find(c => c.destination === "histologia")?.title).toBe("Nuevo nombre")
  expect(next.home.subjects.filter(c => c.destination !== "histologia")).toEqual(home.subjects.filter(c => c.destination !== "histologia"))
  expect(next.home.mainMenu).toEqual(home.mainMenu)
  expect({ home, decks }).toEqual(before)
  const original = home.subjects.find(c => c.destination === "histologia")!
  expect(next.home.subjects.find(c => c.id === original.id)).toEqual({ ...original, title: "Nuevo nombre" })
})
