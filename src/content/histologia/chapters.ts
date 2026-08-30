import cap4Image from "../../assets/chapters/cap4.png"
import cap5Image from "../../assets/chapters/cap5.png"
import cap6Image from "../../assets/chapters/cap6.png"
import cap7Image from "../../assets/chapters/cap7.png"
import cap8Image from "../../assets/chapters/cap8.png"
import cap9Image from "../../assets/chapters/cap9.jpg"
import cap10Image from "../../assets/chapters/cap10.jpg"
import cap11Image from "../../assets/chapters/cap11.jpg"
import cap12Image from "../../assets/chapters/cap12.jpg"
import cap13Image from "../../assets/chapters/cap13.jpg"
import cap14Image from "../../assets/chapters/cap14.jpg"
import cap15Image from "../../assets/chapters/cap15.jpg"
import cap16Image from "../../assets/chapters/cap16.jpg"
import cap17Image from "../../assets/chapters/cap17.jpg"
import cap18Image from "../../assets/chapters/cap18.jpg"
import coagulationCascadeImage from "../../assets/chapters/coagulation-cascade.jpg"
import { cap13Questions } from "./cap13/questions"
import { cap14Questions } from "./cap14/questions"
import { cap15Questions } from "./cap15/questions"
import { cap16Questions } from "./cap16/questions"
import { cap17Questions } from "./cap17/questions"
import { cap18Questions } from "./cap18/questions"
import { cap4Questions } from "./cap4/questions"
import { cap5Questions } from "./cap5/questions"
import { cap6Questions } from "./cap6/questions"
import { cap7Questions } from "./cap7/questions"
import { cap8Questions } from "./cap8/questions"
import { cap9Questions } from "./cap9/questions"
import { cap10Questions } from "./cap10/questions"
import { cap11Questions } from "./cap11/questions"
import { cap12Questions } from "./cap12/questions"
import { hemostasiaQuestions } from "./articulos/hemostasiaQuestions"

export const chapters = [
  {
    id: "Capítulo 4",
    title: "Capítulo 4",
    subtitle: "Tejidos básicos",
    description:
      "Origen embrionario, organización general y clasificación de los tejidos básicos.",
    image: cap4Image,
    questionCount: cap4Questions.length,
    accent: "from-sky-500/20 to-cyan-500/20"
  },

  {
    id: "Capítulo 5",
    title: "Capítulo 5",
    subtitle: "Tejido epitelial",
    description:
      "Epitelios, polaridad celular, uniones, membrana basal, especializaciones y glándulas.",
    image: cap5Image,
    questionCount: cap5Questions.length,
    accent: "from-violet-500/20 to-fuchsia-500/20"
  },

  {
    id: "Capítulo 6",
    title: "Capítulo 6",
    subtitle: "Tejido conjuntivo",
    description:
      "Células, fibras, sustancia fundamental, variedades del tejido conjuntivo e integración clínica.",
    image: cap6Image,
    questionCount: cap6Questions.length,
    accent: "from-emerald-500/20 to-teal-500/20"
  },

  {
    id: "Capítulo 7",
    title: "Capítulo 7",
    subtitle: "Cartílago",
    description:
      "Cartílago hialino, elástico, fibrocartílago, condrocitos, matriz, crecimiento y correlaciones clínicas.",
    image: cap7Image,
    questionCount: cap7Questions.length,
    accent: "from-amber-500/20 to-orange-500/20"
  },

  {
    id: "Capítulo 8",
    title: "Capítulo 8",
    subtitle: "Tejido óseo",
    description:
      "Matriz ósea, células, mineralización, osteonas, osificación, remodelación y reparación.",
    image: cap8Image,
    questionCount: cap8Questions.length,
    accent: "from-rose-500/20 to-red-500/20"
  },

  {
    id: "Capítulo 9",
    title: "Capítulo 9",
    subtitle: "Tejido adiposo",
    description:
      "Tejido adiposo blanco y pardo, regulación endocrina, termogénesis y correlaciones clínicas.",
    image: cap9Image,
    questionCount: cap9Questions.length,
    accent: "from-amber-500/20 to-yellow-500/20"
  },

  {
    id: "Capítulo 10",
    title: "Capítulo 10",
    subtitle: "Tejido sanguíneo",
    description:
      "Plasma, células sanguíneas, plaquetas, hemograma, hematopoyesis y médula ósea.",
    image: cap10Image,
    questionCount: cap10Questions.length,
    accent: "from-red-500/20 to-rose-500/20"
  },

  {
    id: "Capítulo 11",
    title: "Capítulo 11",
    subtitle: "Tejido muscular",
    description:
      "Músculo esquelético, cardíaco y liso, contracción, inervación y reparación.",
    image: cap11Image,
    questionCount: cap11Questions.length,
    accent: "from-orange-500/20 to-red-500/20"
  },

  {
    id: "Capítulo 12",
    title: "Capítulo 12",
    subtitle: "Tejido nervioso",
    description:
      "Neuronas, neuroglía, mielina, sinapsis, SNP, SNC, sistema autónomo y respuesta a lesión.",
    image: cap12Image,
    questionCount: cap12Questions.length,
    accent: "from-indigo-500/20 to-sky-500/20"
  },

  {
    id: "Capítulo 13",
    title: "Capítulo 13",
    subtitle: "Sistema cardiovascular",
    description:
      "Corazón, pared vascular, arterias, capilares, venas, vasos atípicos y vasos linfáticos.",
    image: cap13Image,
    questionCount: cap13Questions.length,
    accent: "from-red-500/20 to-rose-500/20"
  },

  {
    id: "Capítulo 14",
    title: "Capítulo 14",
    subtitle: "Sistema inmunitario y tejido linfático",
    description:
      "Inmunidad, células inmunitarias, presentación antigénica, linfocitos, timo, ganglios, bazo y MALT.",
    image: cap14Image,
    questionCount: cap14Questions.length,
    accent: "from-emerald-500/20 to-cyan-500/20"
  },

  {
    id: "Capítulo 15",
    title: "Capítulo 15",
    subtitle: "Sistema tegumentario",
    description:
      "Piel, estratos epidérmicos, células, inervación, pelo, glándulas, uñas y correlaciones clínicas.",
    image: cap15Image,
    questionCount: cap15Questions.length,
    accent: "from-amber-500/20 to-rose-500/20"
  },

  {
    id: "Capítulo 16",
    title: "Capítulo 16",
    subtitle: "Sistema digestivo I",
    description:
      "Cavidad bucal, lengua, gusto, dientes, periodonto, glándulas salivales y saliva.",
    image: cap16Image,
    questionCount: cap16Questions.length,
    accent: "from-fuchsia-500/20 to-cyan-500/20"
  },

  {
    id: "Capítulo 17",
    title: "Capítulo 17",
    subtitle: "Sistema digestivo II",
    description:
      "Tubo digestivo, esófago, estómago, intestino delgado, intestino grueso y conducto anal.",
    image: cap17Image,
    questionCount: cap17Questions.length,
    accent: "from-emerald-500/20 to-amber-500/20"
  },

  {
    id: "Capítulo 18",
    title: "Capítulo 18",
    subtitle: "Sistema digestivo III",
    description:
      "Hígado, circulación y lobulillos hepáticos, vías biliares, vesícula biliar y páncreas.",
    image: cap18Image,
    questionCount: cap18Questions.length,
    accent: "from-amber-500/20 to-emerald-500/20"
  },

  {
    id: "Artículo · Hemostasia y trombosis",
    title: "Artículo",
    subtitle: "Hemostasia y trombosis",
    description:
      "Endotelio, plaquetas, coagulación, anticoagulantes, fibrinólisis y tríada de Virchow según Robbins.",
    image: coagulationCascadeImage,
    questionCount: hemostasiaQuestions.length,
    accent: "from-amber-500/20 to-orange-500/20"
  }
]

export const histologiaChapters = chapters
