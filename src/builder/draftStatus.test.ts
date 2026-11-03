import { expect, it } from "vitest"
import { setDraftReport, getDraftReports } from "./draftStatus"

it("distingue carga, edición pendiente y deshacer a la versión guardada", () => {
  setDraftReport("home", false, false)
  expect(getDraftReports().find(r => r.area === "home")).toMatchObject({ ready: false, dirty: false })
  setDraftReport("home", true, true)
  setDraftReport("written", true, true)
  expect(getDraftReports().filter(r => r.dirty)).toHaveLength(2)
  setDraftReport("home", true, false)
  expect(getDraftReports().find(r => r.area === "home")).toMatchObject({ ready: true, dirty: false })
  expect(getDraftReports().find(r => r.area === "written")?.dirty).toBe(true)
  setDraftReport("written", true, false)
})

it("retains a recovery block until explicitly reviewed", () => {
  setDraftReport("library", true, true, "Revisar borrador antiguo")
  expect(getDraftReports().find(r => r.area === "library")?.blocked).toBe("Revisar borrador antiguo")
  setDraftReport("library", true, true)
  expect(getDraftReports().find(r => r.area === "library")?.blocked).toBeUndefined()
  setDraftReport("library", true, false)
})
