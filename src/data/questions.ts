import { Question } from "../types/quiz"

export const questions: Question[] = [

  {
    id: "q1",

    chapter: "Capítulo 4",

    topic: "Tejidos básicos",

    difficulty: "easy",

    question:
      "¿Cuáles son los cuatro tejidos básicos del cuerpo?",

    options: [
      "Óseo, cartilaginoso, adiposo y sanguíneo",
      "Epitelial, conjuntivo, muscular y nervioso",
      "Glandular, vascular, linfático y nervioso",
      "Epitelial, óseo, sanguíneo y muscular"
    ],

    correctAnswer: 1,

    explanation:
      "Los cuatro tejidos básicos son epitelial, conjuntivo, muscular y nervioso.",

    tags: [
      "tejidos básicos",
      "clasificación"
    ]
  },

  {
    id: "q2",

    chapter: "Capítulo 5",

    topic: "Tejido epitelial",

    difficulty: "easy",

    question:
      "¿Qué característica es típica del tejido epitelial?",

    options: [
      "Abundante matriz extracelular",
      "Células separadas y vascularizadas",
      "Células muy cercanas y polaridad",
      "Presencia de condrocitos"
    ],

    correctAnswer: 2,

    explanation:
      "Las células epiteliales están muy próximas entre sí y poseen polaridad funcional y morfológica.",

    tags: [
      "epitelio",
      "polaridad",
      "tejido epitelial"
    ]
  },

  {
    id: "q3",

    chapter: "Capítulo 6",

    topic: "Tejido conjuntivo",

    difficulty: "easy",

    question:
      "¿Cuál es una característica fundamental del tejido conjuntivo?",

    options: [
      "Ausencia de matriz extracelular",
      "Células dentro de una matriz extracelular",
      "Solo tiene fibras",
      "No contiene vasos sanguíneos"
    ],

    correctAnswer: 1,

    explanation:
      "El tejido conjuntivo está compuesto por células y matriz extracelular.",

    tags: [
      "matriz extracelular",
      "tejido conjuntivo"
    ]
  }

]
