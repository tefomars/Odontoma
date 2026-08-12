import cap4Image from "../../assets/chapters/cap4.png"
import cap5Image from "../../assets/chapters/cap5.png"
import cap6Image from "../../assets/chapters/cap6.png"
import cap7Image from "../../assets/chapters/cap7.png"
import cap8Image from "../../assets/chapters/cap8.png"
import logoImage from "../../assets/logo.png"
import { cap13Questions } from "./cap13/questions"
import { cap14Questions } from "./cap14/questions"
import { cap15Questions } from "./cap15/questions"
import { hemostasiaQuestions } from "./articulos/hemostasiaQuestions"

export const chapters = [
  {
    id: "Capítulo 4",
    title: "Capítulo 4",
    subtitle: "Tejidos básicos",
    description:
      "Origen embrionario, organización general y clasificación de los tejidos básicos.",
    image: cap4Image,
    questionCount: 65,
    accent: "from-sky-500/20 to-cyan-500/20"
  },

  {
    id: "Capítulo 5",
    title: "Capítulo 5",
    subtitle: "Tejido epitelial",
    description:
      "Epitelios, polaridad celular, uniones, membrana basal, especializaciones y glándulas.",
    image: cap5Image,
    questionCount: 237,
    accent: "from-violet-500/20 to-fuchsia-500/20"
  },

  {
    id: "Capítulo 6",
    title: "Capítulo 6",
    subtitle: "Tejido conjuntivo",
    description:
      "Células, fibras, sustancia fundamental, variedades del tejido conjuntivo e integración clínica.",
    image: cap6Image,
    questionCount: 322,
    accent: "from-emerald-500/20 to-teal-500/20"
  },

  {
    id: "Capítulo 7",
    title: "Capítulo 7",
    subtitle: "Cartílago",
    description:
      "Cartílago hialino, elástico, fibrocartílago, condrocitos, matriz, crecimiento y correlaciones clínicas.",
    image: cap7Image,
    questionCount: 150,
    accent: "from-amber-500/20 to-orange-500/20"
  },

  {
    id: "Capítulo 8",
    title: "Capítulo 8",
    subtitle: "Tejido óseo",
    description:
      "Matriz ósea, células, mineralización, osteonas, osificación, remodelación y reparación.",
    image: cap8Image,
    questionCount: 372,
    accent: "from-rose-500/20 to-red-500/20"
  },

  {
    id: "Capítulo 9",
    title: "Capítulo 9",
    subtitle: "Próximo capítulo",
    description:
      "Contenido pendiente de carga.",
    image:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1200&auto=format&fit=crop",
    questionCount: 0,
    accent: "from-slate-500/20 to-zinc-500/20"
  },

  {
    id: "Capítulo 10",
    title: "Capítulo 10",
    subtitle: "Próximo capítulo",
    description:
      "Contenido pendiente de carga.",
    image:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1200&auto=format&fit=crop",
    questionCount: 0,
    accent: "from-slate-500/20 to-zinc-500/20"
  },

  {
    id: "Capítulo 11",
    title: "Capítulo 11",
    subtitle: "Próximo capítulo",
    description:
      "Contenido pendiente de carga.",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop",
    questionCount: 0,
    accent: "from-slate-500/20 to-zinc-500/20"
  },

  {
    id: "Capítulo 12",
    title: "Capítulo 12",
    subtitle: "Próximo capítulo",
    description:
      "Contenido pendiente de carga.",
    image:
      "https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=1200&auto=format&fit=crop",
    questionCount: 0,
    accent: "from-slate-500/20 to-zinc-500/20"
  },

  {
    id: "Capítulo 13",
    title: "Capítulo 13",
    subtitle: "Sistema cardiovascular",
    description:
      "Corazón, pared vascular, arterias, capilares, venas, vasos atípicos y vasos linfáticos.",
    image: logoImage,
    questionCount: cap13Questions.length,
    accent: "from-red-500/20 to-rose-500/20"
  },

  {
    id: "Capítulo 14",
    title: "Capítulo 14",
    subtitle: "Sistema inmunitario y tejido linfático",
    description:
      "Inmunidad, células inmunitarias, presentación antigénica, linfocitos, timo, ganglios, bazo y MALT.",
    image: logoImage,
    questionCount: cap14Questions.length,
    accent: "from-emerald-500/20 to-cyan-500/20"
  },

  {
    id: "Capítulo 15",
    title: "Capítulo 15",
    subtitle: "Sistema tegumentario",
    description:
      "Piel, estratos epidérmicos, células, inervación, pelo, glándulas, uñas y correlaciones clínicas.",
    image: logoImage,
    questionCount: cap15Questions.length,
    accent: "from-amber-500/20 to-rose-500/20"
  },

  {
    id: "Artículo · Hemostasia y trombosis",
    title: "Artículo",
    subtitle: "Hemostasia y trombosis",
    description:
      "Endotelio, plaquetas, coagulación, anticoagulantes, fibrinólisis y tríada de Virchow según Robbins.",
    image: logoImage,
    questionCount: hemostasiaQuestions.length,
    accent: "from-amber-500/20 to-orange-500/20"
  }
]

export const histologiaChapters = chapters
