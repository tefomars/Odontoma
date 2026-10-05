const secondaryDestinations = new Set([
  "filosofia-de-hayek",
  "proceso-economico-i"
])

export function groupSubjectSections<T extends { destination: string }>(subjects: readonly T[]) {
  const primary: T[] = []
  const secondary: T[] = []
  const upcoming: T[] = []

  for (const subject of subjects) {
    if (secondaryDestinations.has(subject.destination)) {
      secondary.push(subject)
    } else if (subject.destination === "coming-soon") {
      upcoming.push(subject)
    } else {
      primary.push(subject)
    }
  }

  return { primary, secondary, upcoming }
}
