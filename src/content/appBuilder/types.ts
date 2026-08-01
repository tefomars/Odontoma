export type SubjectDestination =
  | "histologia"
  | "filosofia-de-hayek"
  | "open-quizzes"
  | "coming-soon"

export type HomeSubject = {
  id: string
  title: string
  subtitle: string
  status: string
  accentColor: string
  destination: SubjectDestination
}

export type HomeContent = {
  subjects: HomeSubject[]
}
