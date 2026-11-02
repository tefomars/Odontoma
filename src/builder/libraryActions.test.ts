import { describe, expect, it } from "vitest"
import { archiveLibraryBank, restoreLibraryBank } from "./libraryActions"
import { compactStudioData, resolveStudioBanks } from "@/content/studio/catalog"
import type { StudioData, StudyBank } from "@/content/studio/schema"

describe("quitar materias de la biblioteca de forma recuperable", () => {
  const original = resolveStudioBanks({ version: 1, banks: [] })
  const custom: StudyBank = { id: "prueba-farmacologia", title: "Farmacología", subject: "Farmacología", kind: "course", chapters: [], questions: [], flashcards: [] }
  const library: StudioData = { version: 1, banks: [...original, custom] }

  it("quita solo la materia elegida, sin mutar el borrador anterior", () => {
    const next = archiveLibraryBank(library, "histologia")
    expect(next.banks[0]).toMatchObject({ archived: true, enabled: false })
    expect(next.banks[0].questions).toEqual(library.banks[0].questions)
    expect(next.banks[0].flashcards).toEqual(library.banks[0].flashcards)
    expect(next.banks.slice(1)).toEqual(library.banks.slice(1))
    expect(library.banks[0].archived).toBeUndefined()
  })

  it("persiste tanto materias originales como nuevas y permite recuperarlas", () => {
    const removed = archiveLibraryBank(archiveLibraryBank(library, "histologia"), custom.id)
    const saved = compactStudioData(removed)
    expect(saved.patches?.histologia).toMatchObject({ archived: true, enabled: false })
    expect(saved.banks[0]).toMatchObject({ id: custom.id, archived: true, enabled: false })
    const restored = resolveStudioBanks(saved)
    expect(restored.filter(b => b.archived).map(b => b.id)).toEqual(["histologia", custom.id])
    const recovered = restoreLibraryBank({ version: 1, banks: restored }, custom.id)
    expect(recovered.banks.find(b => b.id === custom.id)).toMatchObject({ archived: false, enabled: true })
    expect(recovered.banks[0].archived).toBe(true)
    expect(resolveStudioBanks(compactStudioData(recovered)).find(b => b.id === custom.id)?.archived).toBe(false)
  })
})
