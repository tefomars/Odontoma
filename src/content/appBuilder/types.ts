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

export type AppMenuCard = {
  id: string
  eyebrow: string
  title: string
  subtitle: string
  symbol: string
  accentColor: string
}

export type MainMenuContent = {
  eyebrow: string
  title: string
  cards: AppMenuCard[]
}

export type QuizMenuContent = {
  eyebrow: string
  title: string
  subtitle: string
  toolsLabel: string
  cards: AppMenuCard[]
}

export type HomeContent = {
  mainMenu: MainMenuContent
  quizMenu: QuizMenuContent
  subjects: HomeSubject[]
}
