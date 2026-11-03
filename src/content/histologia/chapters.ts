import cap1Image from "../../assets/chapters/cap1.jpg"
import cap2Image from "../../assets/bioquimica/selection/beta-oxidation.jpg"
import cap3Image from "../../assets/chapters/cap3.jpg"
import cap4Image from "../../assets/chapters/cap4.png"
import { cap1Questions } from "./cap1/questions"
import { cap2Questions } from "./cap2/questions"
import { cap3Questions } from "./cap3/questions"
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
import cap19Image from "../../assets/chapters/cap19.png"
import cap21Image from "../../assets/chapters/cap21.jpg"
import cap22Image from "../../assets/chapters/cap22.jpg"
import cap23Image from "../../assets/chapters/cap23.jpg"
import coagulationCascadeImage from "../../assets/chapters/coagulation-cascade.jpg"
import { cap13Questions } from "./cap13/questions"
import { cap14Questions } from "./cap14/questions"
import { cap15Questions } from "./cap15/questions"
import { cap16Questions } from "./cap16/questions"
import { cap17Questions } from "./cap17/questions"
import { cap18Questions } from "./cap18/questions"
import { cap19Questions } from "./cap19/questions"
import { cap20Questions } from "./cap20/questions"
import { cap21Questions } from "./cap21/questions"
import { cap22Questions } from "./cap22/questions"
import { cap23Questions } from "./cap23/questions"
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
    id: "Capítulo 1",
    title: "Capítulo 1",
    subtitle: "Métodos de estudio histológico",
    description:
      "Fijación, procesamiento, tinciones, histoquímica, inmunomarcación, técnicas moleculares y microscopía.",
    image: cap1Image,
    questionCount: cap1Questions.length,
    accent: "from-teal-500/20 to-indigo-500/20"
  },
  {
    id: "Capítulo 2",
    title: "Capítulo 2",
    subtitle: "Citoplasma celular",
    description: "Membrana, tráfico vesicular, orgánulos, degradación, citoesqueleto e inclusiones.",
    image: cap2Image,
    questionCount: cap2Questions.length,
    accent: "from-cyan-500/20 to-violet-500/20"
  },
  {
    id: "Capítulo 3",
    title: "Capítulo 3",
    subtitle: "Núcleo celular",
    description: "Cromatina, nucléolo, envoltura y poros nucleares, ciclo celular, mitosis, meiosis y muerte celular.",
    image: cap3Image,
    questionCount: cap3Questions.length,
    accent: "from-indigo-500/20 to-rose-500/20"
  },
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
    id: "Capítulo 19",
    title: "Capítulo 19",
    subtitle: "Sistema respiratorio",
    description:
      "Cavidades nasales, vías de conducción, bronquiolos, alvéolos, surfactante y circulación pulmonar.",
    image: cap19Image,
    questionCount: cap19Questions.length,
    accent: "from-cyan-500/20 to-sky-500/20"
  },
  {
    id: "Capítulo 20",
    title: "Capítulo 20",
    subtitle: "Aparato urinario",
    description:
      "Riñón, nefrona, filtración glomerular, función tubular, vías urinarias y micción.",
    image: cap19Image,
    questionCount: cap20Questions.length,
    accent: "from-sky-500/20 to-indigo-500/20"
  },
  {
    id: "Capítulo 21",
    title: "Capítulo 21",
    subtitle: "Órganos endocrinos",
    description:
      "Hipófisis, pineal, tiroides, paratiroides y glándulas suprarrenales.",
    image: cap21Image,
    questionCount: cap21Questions.length,
    accent: "from-violet-500/20 to-cyan-500/20"
  },

  {
    id: "Capítulo 22",
    title: "Capítulo 22",
    subtitle: "Aparato reproductor masculino",
    description:
      "Testículo, espermatogénesis, células de Sertoli, vías espermáticas, glándulas accesorias y pene.",
    image: cap22Image,
    questionCount: cap22Questions.length,
    accent: "from-indigo-500/20 to-rose-500/20"
  },
  {
    id: "Capítulo 23",
    title: "Capítulo 23",
    subtitle: "Aparato reproductor femenino",
    description:
      "Ovario, folículos, ovulación, trompas, ciclo endometrial, cuello uterino, placenta, vagina, vulva y glándula mamaria.",
    image: cap23Image,
    questionCount: cap23Questions.length,
    accent: "from-rose-500/20 to-violet-500/20"
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
