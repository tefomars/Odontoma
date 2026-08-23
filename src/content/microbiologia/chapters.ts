import cap14Image from "@/assets/chapters/cap14.jpg"
import cap18Image from "@/assets/chapters/micro-cap18.jpg"
import cap20Image from "@/assets/chapters/micro-cap20.jpg"
import { cap14Questions } from "./cap14/questions"
import { cap18Questions } from "./cap18/questions"
import { cap19Questions } from "./cap19/questions"
import { cap20Questions } from "./cap20/questions"

export const chapters = [
  {
    id: "Capítulo 14",
    title: "Capítulo 14",
    subtitle: "Inmunidad innata",
    description: "Barreras naturales, fagocitos, células NK, inflamación, reconocimiento de patrones y sistema del complemento.",
    image: cap14Image,
    questionCount: cap14Questions.length,
    accent: "from-violet-500/25 to-sky-500/10"
  },
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
    id: "Capítulo 19",
    title: "Capítulo 19",
    subtitle: "Vacunas e inmunización",
    description: "Tipos de vacunas, vías, componentes, eficacia, inmunización activa y pasiva, inmunoglobulinas y sueros.",
    image: cap14Image,
    questionCount: cap19Questions.length,
    accent: "from-amber-500/25 to-rose-500/10"
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
