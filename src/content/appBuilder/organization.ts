import data from "./organization.json" with { type: "json" }
import type { Organization, SubjectSection } from "./organizationSchema"
export { validateOrganization } from "./organizationSchema"
export type { Organization, SubjectSection, ReviewClassStyle } from "./organizationSchema"
export const organization = data as Organization

export function defaultSection(destination: string): string {
  return destination === "coming-soon" ? "upcoming" : ["filosofia-de-hayek", "proceso-economico-i"].includes(destination.replace(/^bank:/, "")) ? "secondary" : "primary"
}

export function subjectSections<T extends { destination: string; sectionId?: string; hidden?: boolean }>(subjects: readonly T[], sections: SubjectSection[]) {
  const groups = sections.map(section => ({ ...section, items: [] as T[] }))
  for (const subject of subjects) {
    if (subject.hidden) continue
    const section = groups.find(g => g.id === (subject.sectionId || defaultSection(subject.destination))) || groups[0]
    section?.items.push(subject)
  }
  return groups
}

export function reviewClassPresentation(subject: string, config: Organization = organization) {
  return { title: subject === "Histología" ? "Citohistología" : subject, description: "Bancos exclusivos para repaso.", color: "#a78bfa", symbol: "⌬", ...config.reviewClasses?.[subject] }
}
