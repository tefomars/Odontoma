export type SubjectSection = { id: string; title: string; description: string; color: string }
export type ReviewClassStyle = { title: string; description?: string; symbol?: string; color?: string; finalExamEnabled?: boolean; finalExamTitle?: string; finalExamScope?: string; finalExamBankIds?: string[] }
export type Organization = { version: 1; quizzes: SubjectSection[]; flashcards: SubjectSection[]; reviewClasses?: Record<string, ReviewClassStyle> }
/** Older drafts/backups had no explicit semester selection. Preserve newer
 * selection fields, but respect an explicit [] or empty scope from the owner. */
export function inheritFinalExamSelection(incoming: Organization, current: Organization): Organization {
  const reviewClasses = { ...incoming.reviewClasses }
  for (const [subject, saved] of Object.entries(current.reviewClasses || {})) {
    if (saved.finalExamBankIds === undefined && saved.finalExamScope === undefined) continue
    const old = reviewClasses[subject]
    reviewClasses[subject] = {
      ...(old || saved),
      finalExamEnabled: old?.finalExamEnabled ?? saved.finalExamEnabled,
      finalExamTitle: old?.finalExamTitle ?? saved.finalExamTitle,
      finalExamBankIds: old?.finalExamBankIds ?? saved.finalExamBankIds,
      finalExamScope: old?.finalExamScope ?? saved.finalExamScope,
    }
  }
  return { ...incoming, reviewClasses }
}
export function validateOrganization(value: unknown): value is Organization {
  if (!value || typeof value !== "object") return false
  const org = value as Organization
  if (org.reviewClasses !== undefined && (!org.reviewClasses || typeof org.reviewClasses !== "object" || Array.isArray(org.reviewClasses) || Object.keys(org.reviewClasses).length > 100 || Object.values(org.reviewClasses).some(c => !c || typeof c.title !== "string" || !c.title.trim() || c.title.length > 180 || (c.description !== undefined && (typeof c.description !== "string" || c.description.length > 1000)) || (c.symbol !== undefined && (typeof c.symbol !== "string" || c.symbol.length > 20)) || (c.color !== undefined && !/^#[0-9a-f]{6}$/i.test(c.color)) || (c.finalExamScope !== undefined && (typeof c.finalExamScope !== "string" || c.finalExamScope.length > 180)) || (c.finalExamBankIds !== undefined && (!Array.isArray(c.finalExamBankIds) || c.finalExamBankIds.length > 200 || new Set(c.finalExamBankIds).size !== c.finalExamBankIds.length || c.finalExamBankIds.some(id => typeof id !== "string" || !id.trim() || id.length > 150))) || (c.finalExamEnabled !== undefined && typeof c.finalExamEnabled !== "boolean") || (c.finalExamTitle !== undefined && (typeof c.finalExamTitle !== "string" || !c.finalExamTitle.trim() || c.finalExamTitle.length > 180))))) return false
  return org.version === 1 && [org.quizzes, org.flashcards].every(sections => Array.isArray(sections) && sections.length > 0 && sections.length <= 80 && new Set(sections.map(s => s.id)).size === sections.length && sections.every(s => s && typeof s.id === "string" && /^[a-z0-9-]{1,150}$/i.test(s.id) && typeof s.title === "string" && s.title.trim() && s.title.length <= 180 && typeof s.description === "string" && s.description.length <= 1000 && /^#[0-9a-f]{6}$/i.test(s.color)))
}
