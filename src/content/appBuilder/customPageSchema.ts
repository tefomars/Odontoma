export type CustomPageDestination =
  | "home"
  | "quizzes"
  | "flashcards"
  | "multiple-choice"
  | "open-ended"
  | "my-quizzes"
  | "coming-soon"
  | `custom-page:${string}`

export type CustomPageBlock = {
  id: string
  type: "heading" | "text" | "button" | "callout" | "divider"
  title?: string
  text?: string
  symbol?: string
  accentColor?: string
  destination?: CustomPageDestination
}

export type CustomPage = {
  id: string
  eyebrow: string
  title: string
  description: string
  accentColor: string
  blocks: CustomPageBlock[]
}

const knownDestinations = new Set([
  "home",
  "quizzes",
  "flashcards",
  "multiple-choice",
  "open-ended",
  "my-quizzes",
  "coming-soon"
])

function validText(value: unknown, maximum: number, required = false): value is string {
  return typeof value === "string" && value.length <= maximum && (!required || value.trim().length > 0)
}

function validColor(value: unknown) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)
}

export function isCustomPageDestination(value: unknown): value is CustomPageDestination {
  return typeof value === "string" &&
    (knownDestinations.has(value) || /^custom-page:[a-z0-9][a-z0-9-]{0,149}$/i.test(value))
}

export function validateCustomPages(value: unknown): value is CustomPage[] {
  if (!Array.isArray(value) || value.length > 100) return false
  const pageIds = new Set<string>()
  const blockIds = new Set<string>()

  return value.every(page => {
    if (!page || typeof page !== "object") return false
    const item = page as Partial<CustomPage>
    if (!validText(item.id, 150, true) || pageIds.has(item.id) ||
      !validText(item.eyebrow, 100, true) || !validText(item.title, 180, true) ||
      !validText(item.description, 1000) || !validColor(item.accentColor) ||
      !Array.isArray(item.blocks) || item.blocks.length > 200) return false
    pageIds.add(item.id)

    return item.blocks.every(block => {
      if (!block || typeof block !== "object") return false
      const candidate = block as Partial<CustomPageBlock>
      if (!validText(candidate.id, 150, true) || blockIds.has(candidate.id) ||
        !["heading", "text", "button", "callout", "divider"].includes(candidate.type || "") ||
        !validText(candidate.title || "", 300) || !validText(candidate.text || "", 4000) ||
        !validText(candidate.symbol || "", 20) ||
        (candidate.accentColor !== undefined && !validColor(candidate.accentColor)) ||
        (candidate.destination !== undefined && !isCustomPageDestination(candidate.destination))) return false
      blockIds.add(candidate.id)
      return true
    })
  })
}
