import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, expect, it, vi } from "vitest"
import { installLocalStorageMock } from "@/test/localStorageMock"
import FlashcardSelectScreen from "./FlashcardSelectScreen"

vi.mock("@/lib/flashcardStudyMode", () => ({ useFlashcardStudyMode: () => ["free"] }))
beforeEach(() => { installLocalStorageMock() })
it("free mode has its own counters and cannot silently switch to FSRS", () => {
  const noop = () => {}
  const html = renderToStaticMarkup(<FlashcardSelectScreen onBack={noop} onShowSuspended={noop} onSelectTopic={noop} onSelectSubtopic={noop}/>)
  expect(html).toContain("Completadas")
  expect(html).toContain("Solo flashcards")
  expect(html).not.toContain("Due primero")
  expect(html).not.toContain(">Reviews<")
})
