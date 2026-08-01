import data from "./subjects.json"

import type { HomeContent } from "./types"

export const homeContent = data as HomeContent
export const homeSubjects = homeContent.subjects

export type {
  HomeContent,
  HomeSubject,
  SubjectDestination
} from "./types"
