import cap18Image from "@/assets/chapters/micro-cap18.jpg"
import cap20Image from "@/assets/chapters/micro-cap20.jpg"
import { cap18Questions } from "./cap18/questions"
import { cap20Questions } from "./cap20/questions"

export const chapters = [
  {
    id: "Capítulo 18",
    title: "Capítulo 18",
    subtitle: "Relación agente infectante-hospedador",
    description: "Microbiota, enfermedad infecciosa, epidemiología, cadena de transmisión, mecanismos de agresión y toxinas.",
    image: cap18Image,
    questionCount: cap18Questions.length,
    accent: "from-teal-500/25 to-cyan-500/10"
  },
  {
    id: "Capítulo 20",
    title: "Capítulo 20",
    subtitle: "Ecología de la cavidad bucal",
    description: "Ecosistemas orales, dominios inmunes, saliva, sucesión ecológica, adherencia y biopelícula dental.",
    image: cap20Image,
    questionCount: cap20Questions.length,
    accent: "from-emerald-500/25 to-lime-500/10"
  }
]
