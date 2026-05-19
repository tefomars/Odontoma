export type Flashcard = {
  id: string
  subject: string
  book: string
  chapter: string
  topic: string
  subtopic: string
  front: string
  back: string
  tags: string[]
}

export const histologiaFlashcards: Flashcard[] = [
  {
    id: "histo-cap5-epitelio-001",
    subject: "Histología",
    book: "Ross",
    chapter: "Capítulo 5",
    topic: "Tejido epitelial",
    subtopic: "Generalidades",
    front: "¿Qué característica general define al tejido epitelial?",
    back: "Está formado por células muy próximas entre sí, con escasa matriz extracelular, polaridad celular y apoyo sobre una membrana basal.",
    tags: ["epitelio", "tejido epitelial", "membrana basal"]
  },
  {
    id: "histo-cap5-epitelio-002",
    subject: "Histología",
    book: "Ross",
    chapter: "Capítulo 5",
    topic: "Tejido epitelial",
    subtopic: "Generalidades",
    front: "¿Por qué el epitelio se considera avascular?",
    back: "Porque no contiene vasos sanguíneos propios; recibe nutrientes por difusión desde el tejido conjuntivo subyacente.",
    tags: ["epitelio", "vascularización"]
  },
  {
    id: "histo-cap6-conjuntivo-001",
    subject: "Histología",
    book: "Ross",
    chapter: "Capítulo 6",
    topic: "Tejido conjuntivo",
    subtopic: "Componentes",
    front: "¿Cuáles son los componentes principales del tejido conjuntivo?",
    back: "Células, fibras y sustancia fundamental. En conjunto forman la matriz extracelular característica del tejido conjuntivo.",
    tags: ["conjuntivo", "matriz extracelular"]
  }
]
