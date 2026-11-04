import { describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { groupWrittenDecks, moveWrittenDeck, removeWrittenCategory, setWrittenCategories, writtenCategoryId } from "./categories"
import { normalizeWrittenForSave, validateWrittenContent } from "./validation"
import type { OpenQuizContent, OpenQuizDeck } from "./types"
import official from "./data.json"
import OpenQuizDecksScreen from "@/components/OpenQuizDecksScreen"
import { addWrittenContent, type ContentCreation } from "@/builder/contentCreation"

const deck = (id: string, partial?: number): OpenQuizDeck => ({ id, title: id, subject: "Clase", partial, questions: [{ id: `q-${id}`, prompt: "Pregunta", modelAnswer: "Respuesta", acceptedPoints: ["Punto"], explanation: "Explicación" }] })
const fixture = (): OpenQuizContent => ({ classes: [{ id: "class", name: "Clase", symbol: "X", color: "#123456" }], decks: [deck("A", 1), deck("B", 2), deck("C", 1), deck("D")] })
const request: ContentCreation = { type: "written", kind: "course", subject: "Clase", title: "Nuevo", bankId: "", newBank: false, chapterId: "", newChapter: false, chapterTitle: "", deckId: "new", newDeck: true, image: "", quizAccess: false, flashcardAccess: false, sectionId: "", items: [] }

describe("categorías libres y orden manual de escritas", () => {
  it("conserva la agrupación y el orden del contenido oficial sin migrar preguntas", () => {
    const before = structuredClone(official)
    for (const subject of new Set(official.decks.map(deck => deck.subject))) {
      const decks = official.decks.filter(deck => deck.subject === subject)
      const grouped = groupWrittenDecks(decks)
      expect([...grouped.categories.flatMap(category => category.decks), ...grouped.ungrouped].map(deck => deck.id).sort()).toEqual(decks.map(deck => deck.id).sort())
    }
    expect(official).toEqual(before)
    expect(groupWrittenDecks(fixture().decks).categories.map(category => category.name)).toEqual(["Parcial 1", "Parcial 2"])
  })
  it("usa nombres libres y respeta el orden definido, no el alfabético o numérico", () => {
    const data = fixture()
    const categories = [{ id: "year", name: "Año 2027" }, { id: "partial:2", name: "Parcial 12" }, { id: "partial:1", name: "Z - Práctica" }]
    const next = setWrittenCategories(data, "Clase", categories)
    const groups = groupWrittenDecks(next.decks, next.classes![0].categories)
    expect(groups.categories.map(category => category.name)).toEqual(categories.map(category => category.name))
    expect(groups.categories[0].decks).toEqual([])
    expect(groups.categories[2].decks.map(deck => deck.id)).toEqual(["A", "C"])
    expect(validateWrittenContent(next)).toEqual([])
    expect(next.decks).toBe(data.decks)
  })
  it("mueve solo cuestionarios hermanos sin cambiar contenido, IDs ni otras clases", () => {
    const data = fixture()
    data.decks.splice(1, 0, { ...deck("Otra"), subject: "Otra clase" })
    const next = moveWrittenDeck(data, "C", -1)
    expect(groupWrittenDecks(next.decks.filter(deck => deck.subject === "Clase")).categories[0].decks.map(deck => deck.id)).toEqual(["C", "A"])
    expect(next.decks[1]).toBe(data.decks[1])
    expect([...next.decks].sort((a, b) => a.id.localeCompare(b.id))).toEqual([...data.decks].sort((a, b) => a.id.localeCompare(b.id)))
    expect(moveWrittenDeck(next, "C", -1)).toBe(next)
    expect(moveWrittenDeck(next, "missing", 1)).toBe(next)
    expect(moveWrittenDeck(next, "C", 1)).toEqual(data)
  })
  it("mueve también cuestionarios sin categoría", () => {
    const data = fixture(); data.decks.push(deck("E"))
    expect(groupWrittenDecks(moveWrittenDeck(data, "E", -1).decks).ungrouped.map(deck => deck.id)).toEqual(["E", "D"])
  })
  it("quitar una categoría conserva exámenes y evita que el título antiguo la reactive", () => {
    const data = fixture(); data.decks[0].title = "Primer Parcial - A"
    const next = removeWrittenCategory(data, "Clase", "partial:1")
    expect(next.decks).toHaveLength(data.decks.length)
    expect(next.decks.map(deck => deck.questions)).toEqual(data.decks.map(deck => deck.questions))
    expect(writtenCategoryId(next.decks[0])).toBeNull()
    expect(groupWrittenDecks(next.decks, next.classes![0].categories).ungrouped.map(deck => deck.id)).toEqual(["A", "C", "D"])
    expect(validateWrittenContent(next)).toEqual([])
  })
  it("una categoría explícita tiene prioridad sobre el parcial antiguo", () => {
    expect(writtenCategoryId({ ...deck("A", 1), categoryId: "year" })).toBe("year")
    expect(writtenCategoryId({ ...deck("A", 1), categoryId: null })).toBeNull()
  })
  it("rechaza categorías duplicadas, dañadas y referencias a categorías de otra clase", () => {
    const data = fixture()
    data.classes![0].categories = [{ id: "x", name: "Año 1" }, { id: "x", name: " año 1 " }]
    expect(validateWrittenContent(data).join(" ")).toContain("repetido")
    data.classes![0].categories = [{ id: "x", name: "" }]
    expect(validateWrittenContent(data).join(" ")).toContain("vacío")
    data.classes![0].categories = []
    data.decks[0].categoryId = "outside"
    expect(validateWrittenContent(data).join(" ")).toContain("la categoría no existe")
    expect(validateWrittenContent({ classes: [{ ...data.classes![0], categories: [null] }], decks: [] }).join(" ")).toContain("categoría inválida")
  })
  it("guarda y restaura categorías, orden y todo el contenido de las preguntas", () => {
    const data = setWrittenCategories(fixture(), "Clase", [{ id: "partial:2", name: "Año 2" }, { id: "partial:1", name: "Año 1" }])
    const next = moveWrittenDeck(data, "C", -1)
    const restored = JSON.parse(JSON.stringify(normalizeWrittenForSave(next)))
    expect(restored).toEqual(next)
    expect(validateWrittenContent(restored)).toEqual([])
    expect(restored.classes[0].categories[0].name).toBe("Año 2")
  })
  it("el asistente crea categorías al importar y reutiliza nombres existentes", () => {
    const first = addWrittenContent(fixture(), { ...request, categoryName: "Año 2027" }, () => crypto.randomUUID())
    const after = addWrittenContent(first, { ...request, deckId: "new2", categoryName: " año 2027 " }, () => crypto.randomUUID())
    expect(after.classes![0].categories!.filter(category => category.name === "Año 2027")).toHaveLength(1)
    expect(after.decks.at(-1)!.categoryId).toBe(after.decks.at(-2)!.categoryId)
    expect(validateWrittenContent(after)).toEqual([])
    expect(after.decks.slice(0, 4)).toEqual(fixture().decks)
  })
  it("importar a un cuestionario existente no cambia su carpeta ni duplica categorías", () => {
    const data = addWrittenContent(fixture(), { ...request, categoryName: "Año 1" }, () => crypto.randomUUID())
    const next = addWrittenContent(data, { ...request, newDeck: false, categoryName: "Ignorar", items: [{ prompt: "Nueva", modelAnswer: "Respuesta" }] }, () => crypto.randomUUID())
    expect(next.classes).toEqual(data.classes)
    expect(next.decks.at(-1)!.categoryId).toBe(data.decks.at(-1)!.categoryId)
    expect(next.decks.at(-1)!.questions).toHaveLength(1)
  })
  it("el asistente puede crear categorías en una clase nueva o elegir Sin categoría", () => {
    const first = addWrittenContent({ classes: [], decks: [] }, { ...request, categoryName: "Parcial 12" }, () => crypto.randomUUID())
    expect(first.classes![0].categories![0].name).toBe("Parcial 12")
    expect(validateWrittenContent(first)).toEqual([])
    const legacy = addWrittenContent(fixture(), { ...request, categoryName: "Parcial 2" }, () => crypto.randomUUID())
    expect(legacy.decks.at(-1)!.categoryId).toBe("partial:2")
    const ungrouped = addWrittenContent(fixture(), { ...request, categoryName: "" }, () => crypto.randomUUID())
    expect(ungrouped.decks.at(-1)!.categoryId).toBeNull()
  })
  it("muestra nombres y orden manual en la app y conserva una pantalla por nivel", () => {
    const data = setWrittenCategories(fixture(), "Clase", [{ id: "partial:2", name: "Año 2" }, { id: "partial:1", name: "Año 1" }])
    const render = (category: string | null) => renderToStaticMarkup(<OpenQuizDecksScreen classes={data.classes!} decks={data.decks} selectedClass="Clase" selectedPartial={category} onSelectClass={() => {}} onSelectPartial={() => {}} onBack={() => {}} onMainMenu={() => {}} onStart={() => {}} />)
    const html = render(null)
    expect(html.indexOf("Año 2")).toBeLessThan(html.indexOf("Año 1"))
    const page = render("partial:1")
    expect(page).toContain("Categorías")
    expect(page.indexOf(">A</h2>")).toBeLessThan(page.indexOf(">C</h2>"))
    expect(page).not.toContain(">B</h2>")
  })
})
