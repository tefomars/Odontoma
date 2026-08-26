import cellImage from "@/assets/chapters/cap4.png"
import inflammationImage from "@/assets/chapters/cap14.jpg"
import clinicalImage from "@/assets/chapters/cap13.jpg"
import lesionsImage from "@/assets/chapters/cap15.jpg"
import { semiologiaQuestions } from "./questions"

const count = (chapter: string) =>
  semiologiaQuestions.filter(question => question.chapter === chapter).length

export const chapters = [
  {
    id: "Bloque 1",
    title: "Bloque 1",
    subtitle: "Fundamentos y lesión celular",
    description: "Salud, enfermedad, genética, adaptación, necrosis, apoptosis y gangrena.",
    image: cellImage,
    questionCount: count("Bloque 1"),
    accent: "from-violet-500/25 to-rose-500/10"
  },
  {
    id: "Bloque 2",
    title: "Bloque 2",
    subtitle: "Inflamación y hematología",
    description: "Exudado, migración leucocitaria, fagocitosis, células gigantes y plaquetas.",
    image: inflammationImage,
    questionCount: count("Bloque 2"),
    accent: "from-rose-500/25 to-amber-500/10"
  },
  {
    id: "Bloque 3",
    title: "Bloque 3",
    subtitle: "Historia clínica y sistemas",
    description: "Ficha clínica, ASA, medicamentos, diabetes, Sjögren y revisión por sistemas.",
    image: clinicalImage,
    questionCount: count("Bloque 3"),
    accent: "from-sky-500/25 to-cyan-500/10"
  },
  {
    id: "Bloque 4",
    title: "Bloque 4",
    subtitle: "Examen clínico y lesiones",
    description: "Palpación, ganglios y lesiones cutáneas, vasculares, pigmentadas y labiales.",
    image: lesionsImage,
    questionCount: count("Bloque 4"),
    accent: "from-emerald-500/25 to-teal-500/10"
  }
]
