import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"

import logoImage from "@/assets/logo.png"
import { histologiaChapters } from "@/content/histologia/chapters"

import {
  isFsrsCardDue
} from "@/lib/fsrs"

import {
  loadFsrsStorage
} from "@/lib/flashcardStorage"

import {
  getDefaultFlashcards,
  getMyFlashcards,
  type FlashcardSource
} from "@/lib/flashcardDecks"

import {
  filterActiveFlashcards,
  loadSuspendedFlashcardIds
} from "@/lib/suspendedFlashcards"

import { relayWheelToPanel } from "@/lib/nestedScroll"

type Props = {
  subject?: string
  onBack: () => void
  onShowSuspended: () => void
  onSelectTopic: (
    topic: string,
    source: FlashcardSource
  ) => void
  onSelectSubtopic: (
    topic: string,
    subtopic: string,
    source: FlashcardSource
  ) => void
}

type BigGroup = {
  title: string
  description: string
  subtopics: string[]
}

type ChapterMenu = {
  chapter: string
  title: string
  groups: BigGroup[]
}

type ChapterCourseGroup = {
  title?: string
  range?: string
  menus: ChapterMenu[]
  emptyMessage?: string
}

const HISTOLOGY_CHAPTER_IMAGES = new Map(
  histologiaChapters.map(chapter => [chapter.id, chapter.image])
)

const CHAPTER_MENUS: ChapterMenu[] = [
  {
    chapter: "Capítulo 4",
    title: "Tejidos",
    groups: [
      {
        title: "Generalidades",
        description: "Concepto de tejido, clasificación y criterios generales.",
        subtopics: [
          "Fundamentos de los tejidos",
          "Clasificación de los tejidos",
          "Identificación de los tejidos"
        ]
      },
      {
        title: "Tejidos básicos",
        description: "Epitelial, conjuntivo, muscular y nervioso.",
        subtopics: [
          "Epitelio",
          "Tejido conjuntivo",
          "Tejido muscular",
          "Tejido nervioso"
        ]
      },
      {
        title: "Histogénesis y derivados",
        description: "Capas germinales, derivados embrionarios y teratomas.",
        subtopics: [
          "Histogénesis de los tejidos",
          "Derivados ectodérmicos",
          "Derivados mesodérmicos",
          "Derivados endodérmicos",
          "Teratomas"
        ]
      }
    ]
  },
  {
    chapter: "Capítulo 5",
    title: "Tejido epitelial",
    groups: [
      {
        title: "Generalidades",
        description: "Bases del epitelio, clasificación, funciones y polaridad.",
        subtopics: [
          "Fundamentos del tejido epitelial",
          "Tejido epitelioide",
          "Barrera epitelial",
          "Clasificación de los epitelios",
          "Epitelio seudoestratificado",
          "Urotelio",
          "Epitelios con nombres especiales",
          "Funciones epiteliales",
          "Polaridad celular",
          "Metaplasia epitelial",
          "Membranas mucosas y serosas"
        ]
      },
      {
        title: "Membrana apical",
        description: "Microvellosidades, estereocilios, cilios y ciliogénesis.",
        subtopics: [
          "Región apical",
          "Microvellosidades",
          "Estereocilios",
          "Cilios",
          "Cilios móviles",
          "Cuerpo basal",
          "Cilios primarios",
          "Cilios nodales",
          "Ciliogénesis",
          "Discinesia ciliar primaria"
        ]
      },
      {
        title: "Membrana lateral",
        description: "Complejos de unión, zónulas, desmosomas e interdigitaciones.",
        subtopics: [
          "Región lateral",
          "Complejo de unión",
          "Uniones ocluyentes",
          "Uniones adherentes",
          "Zónula adherente",
          "Zónuladherente",
          "Fascia adherente",
          "Desmosomas",
          "Uniones comunicantes",
          "Interdigitaciones laterales",
          "Patógenos y complejos de unión"
        ]
      },
      {
        title: "Membrana basal",
        description: "Lámina basal, colágeno IV, adhesiones focales y hemidesmosomas.",
        subtopics: [
          "Región basal",
          "Membrana basal",
          "Lámina basal",
          "Lámina reticular",
          "Colágeno tipo IV",
          "Otros colágenos de lámina basal",
          "Autoensamblado de lámina basal",
          "Funciones de la lámina basal",
          "Adhesiones focales",
          "Hemidesmosomas",
          "Pliegues basales"
        ]
      },
      {
        title: "Glándulas",
        description: "Glándulas exocrinas/endocrinas, secreción y renovación epitelial.",
        subtopics: [
          "Glándulas",
          "Glándulas exocrinas",
          "Glándulas endocrinas",
          "Señalización paracrina",
          "Señalización autocrina",
          "Mecanismos de secreción exocrina",
          "Secreción merocrina",
          "Secreción apocrina",
          "Secreción holocrina",
          "Glándulas unicelulares",
          "Glándulas multicelulares",
          "Clasificación de glándulas exocrinas",
          "Secreciones mucosas",
          "Secreciones serosas",
          "Glándulas mixtas",
          "Células mioepiteliales",
          "Renovación epitelial"
        ]
      }
    ]
  },
  {
    chapter: "Capítulo 6",
    title: "Tejido conjuntivo",
    groups: [
      {
        title: "Generalidades",
        description: "Concepto, clasificación, tejido embrionario y tejido conjuntivo adulto.",
        subtopics: [
          "Fundamentos del tejido conjuntivo",
          "Clasificación del tejido conjuntivo",
          "Tejido conjuntivo embrionario",
          "Mesénquima",
          "Tejido conjuntivo mucoso",
          "Tejido conjuntivo del adulto",
          "Tejido conjuntivo laxo",
          "Tejido conjuntivo denso irregular",
          "Tejido conjuntivo denso regular",
          "Tendones",
          "Ligamentos",
          "Aponeurosis",
          "Comparación laxo-denso",
          "Histología 101"
        ]
      },
      {
        title: "Fibras",
        description: "Colágenas, reticulares, elásticas y tipos de colágeno.",
        subtopics: [
          "Fibras del tejido conjuntivo",
          "Fibras de colágeno",
          "Fibrillas de colágeno",
          "Tipos de colágeno",
          "Colágenos fibrilares",
          "Colágenos FACIT",
          "Colágeno tipo IV",
          "Colágeno tipo VII",
          "Colágeno tipo XVII",
          "Colágeno tipo XVIII",
          "Biosíntesis del colágeno",
          "Degradación del colágeno",
          "Colagenopatías",
          "Fibras reticulares",
          "Fibras elásticas",
          "Material elástico",
          "Comparación de fibras"
        ]
      },
      {
        title: "Matriz extracelular",
        description: "Sustancia fundamental, GAG, proteoglucanos y glucoproteínas multiadhesivas.",
        subtopics: [
          "Matriz extracelular",
          "Sustancia fundamental",
          "Glucosaminoglucanos",
          "Proteoglucanos",
          "Agregados de proteoglucanos",
          "Glucoproteínas multiadhesivas",
          "Fibronectina",
          "Laminina",
          "Tenascina",
          "MEC y comunicación celular",
          "MEC y migración celular",
          "MEC y barrera",
          "Integración fibras-MEC"
        ]
      },
      {
        title: "Células",
        description: "Fibroblastos, macrófagos, mastocitos, adipocitos y células inmunes.",
        subtopics: [
          "Células del tejido conjuntivo",
          "Fibroblastos",
          "Miofibroblastos",
          "Macrófagos",
          "Sistema fagocítico mononuclear",
          "Mastocitos",
          "Basófilos",
          "Adipocitos",
          "Células madre adultas",
          "Pericitos",
          "Linfocitos",
          "Células plasmáticas",
          "Neutrófilos",
          "Eosinófilos",
          "Monocitos",
          "Integración células-MEC"
        ]
      },
      {
        title: "Inflamación y reparación",
        description: "Inflamación, cicatrización, fibrosis, edema y fotoenvejecimiento.",
        subtopics: [
          "Inflamación",
          "Reparación del tejido conjuntivo",
          "Cicatrización",
          "Fibrosis",
          "Fotoenvejecimiento",
          "Edema",
          "Identificación histológica",
          "Comparaciones clave"
        ]
      }
    ]
  },
  {
    chapter: "Capítulo 7",
    title: "Cartílago",
    groups: [
      {
        title: "Generalidades",
        description: "Concepto, funciones, tipos y estructura general del cartílago.",
        subtopics: [
          "Fundamentos del cartílago",
          "Tipos de cartílago",
          "Cartílago hialino",
          "Condrocitos",
          "Regiones de matriz",
          "Pericondrio",
          "Histología 101"
        ]
      },
      {
        title: "Cartílago hialino",
        description: "Matriz, localización, función, cartílago articular y artrosis.",
        subtopics: [
          "Matriz del cartílago hialino",
          "Cartílago hialino: localización",
          "Cartílago hialino: función",
          "Cartílago articular",
          "Artrosis"
        ]
      },
      {
        title: "Cartílago elástico",
        description: "Elastina, pericondrio, localización y función elástica.",
        subtopics: [
          "Cartílago elástico"
        ]
      },
      {
        title: "Fibrocartílago",
        description: "Colágeno tipo I, condrocitos, fibroblastos y discos articulares.",
        subtopics: [
          "Fibrocartílago",
          "Fibrocartílago: localización",
          "Disco intervertebral"
        ]
      },
      {
        title: "Desarrollo y crecimiento",
        description: "Condrogénesis, crecimiento por aposición e intersticial.",
        subtopics: [
          "Condrogénesis",
          "Crecimiento del cartílago",
          "Crecimiento por aposición",
          "Crecimiento intersticial"
        ]
      },
      {
        title: "Reparación y clínica",
        description: "Reparación limitada, condroclastos, condrosarcoma y comparaciones.",
        subtopics: [
          "Reparación del cartílago",
          "Condrosarcoma",
          "Comparación de cartílagos"
        ]
      }
    ]
  },
  {
    chapter: "Capítulo 8",
    title: "Tejido óseo",
    groups: [
      {
        title: "Generalidades",
        description: "Matriz ósea, proteínas, lagunas, canalículos y hueso como órgano.",
        subtopics: [
          "Fundamentos del tejido óseo",
          "Matriz ósea",
          "Proteínas no colágenas",
          "Preparación histológica del hueso",
          "Lagunas y canalículos",
          "Hueso como órgano",
          "Clasificación de huesos"
        ]
      },
      {
        title: "Organización del hueso",
        description: "Hueso compacto, esponjoso, periostio, endostio, irrigación y osteonas.",
        subtopics: [
          "Hueso compacto y esponjoso",
          "Periostio",
          "Endostio",
          "Irrigación ósea",
          "Tejido óseo maduro",
          "Tejido óseo inmaduro",
          "Comparación hueso maduro-inmaduro",
          "Osteona",
          "Hueso esponjoso maduro"
        ]
      },
      {
        title: "Células óseas",
        description: "Osteoprogenitoras, osteoblastos, osteocitos, revestimiento y osteoclastos.",
        subtopics: [
          "Células óseas",
          "Células osteoprogenitoras",
          "Osteoblastos",
          "Osteoide",
          "Osteocitos",
          "Células de revestimiento óseo",
          "Osteoclastos",
          "Comparación de células óseas"
        ]
      },
      {
        title: "Formación y crecimiento",
        description: "Osificación intramembranosa, endocondral, disco epifisario y crecimiento.",
        subtopics: [
          "Formación del hueso",
          "Osificación intramembranosa",
          "Osificación endocondral",
          "Centro secundario de osificación",
          "Disco epifisario",
          "Zonas del disco epifisario",
          "Zona de reserva",
          "Zona de proliferación",
          "Zona de hipertrofia",
          "Zona de cartílago calcificado",
          "Zona de resorción",
          "Crecimiento óseo",
          "Comparación de osificación",
          "Regulación del crecimiento óseo"
        ]
      },
      {
        title: "Mineralización y regulación",
        description: "Mineralización, vesículas matriciales, hormonas, vitaminas y metabolismo.",
        subtopics: [
          "Mineralización ósea",
          "Vesículas matriciales",
          "Hormonas y hueso",
          "Hueso como órgano endocrino",
          "Factores nutricionales",
          "Remodelado óseo"
        ]
      },
      {
        title: "Clínica y reparación",
        description: "Osteoporosis, reparación ósea, artropatías e integración del capítulo.",
        subtopics: [
          "Osteoporosis",
          "Reparación ósea",
          "Artropatías",
          "Integración del capítulo"
        ]
      }
    ]
  },
  {
    chapter: "Capítulo 9",
    title: "Tejido adiposo",
    groups: [
      {
        title: "Generalidades",
        description: "Concepto, adipocitos, triglicéridos, funciones y tipos de tejido adiposo.",
        subtopics: [
          "Fundamentos del tejido adiposo",
          "Tipos de tejido adiposo",
          "Tejido adiposo blanco",
          "Tejido adiposo pardo"
        ]
      },
      {
        title: "Tejido adiposo blanco",
        description: "Adipocito unilocular, adipocinas, leptina, diferenciación y metabolismo.",
        subtopics: [
          "Adipocinas",
          "Leptina",
          "Metabolismo de esteroides",
          "Obesidad y adipocinas",
          "Diferenciación del adipocito blanco",
          "Lipoblastos",
          "Adipocito unilocular"
        ]
      },
      {
        title: "Regulación metabólica",
        description: "Eje encefaloenteroadiposo, hambre, saciedad, insulina y movilización lipídica.",
        subtopics: [
          "Regulación del tejido adiposo",
          "Regulación a corto plazo",
          "Grelina",
          "Péptido YY",
          "Regulación a largo plazo",
          "Insulina y tejido adiposo",
          "Movilización lipídica",
          "Obesidad"
        ]
      },
      {
        title: "Tejido adiposo pardo",
        description: "Adipocito multilocular, diferenciación, UCP, termogénesis y regulación simpática.",
        subtopics: [
          "Adipocito multilocular",
          "Diferenciación del adipocito pardo",
          "UCP",
          "Termogénesis",
          "Regulación simpática del tejido adiposo pardo"
        ]
      },
      {
        title: "Transdiferenciación y clínica",
        description: "Pardeamiento, PET, tumores adiposos y comparaciones clave.",
        subtopics: [
          "Transdiferenciación adiposa",
          "PET y tejido adiposo pardo",
          "Tumores del tejido adiposo",
          "Comparación tejido adiposo blanco-pardo",
          "Histología 101"
        ]
      }
    ]
  },
  {
    chapter: "Capítulo 10",
    title: "Sangre",
    groups: [
      {
        title: "Generalidades",
        description: "Sangre, plasma, hematócrito, suero, frotis y composición general.",
        subtopics: [
          "Fundamentos de la sangre",
          "Hematócrito",
          "Composición celular de la sangre",
          "Plasma",
          "Albúmina",
          "Globulinas",
          "Fibrinógeno",
          "Suero",
          "Líquido intersticial",
          "Frotis sanguíneo",
          "Leucocitos: clasificación básica"
        ]
      },
      {
        title: "Eritrocitos",
        description: "Morfología, membrana, hemoglobina, HbA1c, anemia y grupos sanguíneos.",
        subtopics: [
          "Eritrocitos",
          "Membrana del eritrocito",
          "Hemoglobina",
          "HbA1c",
          "Anemia",
          "Drepanocitosis",
          "Grupos sanguíneos ABO",
          "Grupos sanguíneos Rh"
        ]
      },
      {
        title: "Leucocitos",
        description: "Neutrófilos, eosinófilos, basófilos, linfocitos, monocitos y comparación morfológica.",
        subtopics: [
          "Leucocitos",
          "Neutrófilos",
          "Gránulos de neutrófilos",
          "Diapédesis",
          "Fagocitosis neutrofílica",
          "Estallido respiratorio",
          "Eosinófilos",
          "Basófilos",
          "Linfocitos",
          "Linfocitos T",
          "Linfocitos B",
          "Linfocitos NK",
          "Monocitos",
          "Comparación de leucocitos"
        ]
      },
      {
        title: "Plaquetas y hemostasia",
        description: "Trombocitos, zonas plaquetarias, gránulos, activación, hemostasia y hemograma.",
        subtopics: [
          "Trombocitos",
          "Zonas del trombocito",
          "Zona periférica del trombocito",
          "Zona estructural del trombocito",
          "Zona de orgánulos del trombocito",
          "Zona de membrana del trombocito",
          "Hemostasia plaquetaria",
          "Hemograma"
        ]
      },
      {
        title: "Hematopoyesis",
        description: "Médula ósea, linajes, eritropoyesis, trombopoyesis, granulocitopoyesis y citocinas.",
        subtopics: [
          "Hematopoyesis",
          "Hematopoyesis fetal",
          "Teoría monofilética",
          "Factores hematopoyéticos",
          "Eritropoyesis",
          "Cinética eritrocitaria",
          "Trombopoyesis",
          "Comparación eritropoyesis-trombopoyesis",
          "Granulocitopoyesis",
          "Mieloblasto",
          "Promielocito",
          "Mielocito",
          "Metamielocito",
          "Célula en banda",
          "Granulocito maduro",
          "Cinética de la granulocitopoyesis",
          "Monopoyesis",
          "Linfopoyesis",
          "Citocinas hematopoyéticas"
        ]
      },
      {
        title: "Médula ósea e integración",
        description: "Sinusoides, cordones hematopoyéticos, médula amarilla y repaso integrado.",
        subtopics: [
          "Médula ósea",
          "Sinusoides medulares",
          "Células adventicias medulares",
          "Cordones hematopoyéticos",
          "Médula ósea amarilla",
          "Examen de médula ósea",
          "Celularidad medular",
          "Integración de hematopoyesis",
          "Repaso morfológico",
          "Comparaciones clave",
          "Histología 101"
        ]
      }
    ]
  },
  {
    chapter: "Capítulo 11",
    title: "Tejido muscular",
    groups: [
      {
        title: "Generalidades",
        description: "Tipos musculares, miofilamentos, sarcoplasma y organización básica.",
        subtopics: [
          "Fundamentos del tejido muscular",
          "Filamentos delgados",
          "Filamentos gruesos",
          "Sarcoplasma",
          "Miocitos",
          "Actina y miosina",
          "Clasificación del músculo",
          "Músculo estriado",
          "Músculo liso",
          "Músculo esquelético",
          "Músculo estriado visceral",
          "Músculo cardíaco",
          "Comparación de tipos musculares"
        ]
      },
      {
        title: "Músculo esquelético",
        description: "Fibra muscular, sarcolema, endomisio, perimisio, epimisio y tipos de fibras.",
        subtopics: [
          "Músculo esquelético: fibra muscular",
          "Músculo esquelético: núcleos",
          "Sarcolema",
          "Organización del músculo esquelético",
          "Endomisio",
          "Perimisio",
          "Epimisio",
          "Comparación endomisio-perimisio-epimisio",
          "Fibras musculares esqueléticas",
          "Tipos de fibras esqueléticas",
          "Fibras tipo I",
          "Fibras tipo IIa",
          "Fibras tipo IIb",
          "Comparación de fibras esqueléticas",
          "Metabolismo muscular",
          "Identificación histológica"
        ]
      },
      {
        title: "Sarcómero y contracción",
        description: "Miofibrillas, bandas, líneas, filamentos, troponina, tropomiosina y puentes transversales.",
        subtopics: [
          "Miofibrillas",
          "Miofilamentos",
          "Retículo sarcoplasmático",
          "Sarcómero",
          "Banda A",
          "Banda I",
          "Banda H",
          "Línea M",
          "Línea Z",
          "Estados del sarcómero",
          "Organización hexagonal",
          "Filamento delgado",
          "Troponina",
          "Tropomiosina",
          "Filamento grueso",
          "Proteínas accesorias",
          "Distrofina",
          "Ciclo de puentes transversales",
          "Adhesión actomiosina",
          "Separación actomiosina",
          "Flexión actomiosina",
          "Generación de fuerza",
          "Readhesión actomiosina",
          "Regulación de la contracción",
          "Cisternas terminales",
          "Túbulos T",
          "Tríada",
          "Acoplamiento excitación-contracción",
          "Relajación muscular",
          "Comparación sarcomérica"
        ]
      },
      {
        title: "Inervación y reparación",
        description: "Unión neuromuscular, unidad motora, propiocepción, células satélite y distrofias.",
        subtopics: [
          "Inervación motora",
          "Unión neuromuscular",
          "Unidad motora",
          "Inervación y atrofia",
          "Miastenia grave",
          "Inervación sensitiva",
          "Huso muscular",
          "Órgano tendinoso de Golgi",
          "Comparación propioceptores",
          "Histogénesis del músculo esquelético",
          "Células satélite",
          "Reparación del músculo esquelético",
          "Renovación muscular",
          "Distrofias musculares",
          "Integración músculo esquelético"
        ]
      },
      {
        title: "Músculo cardíaco",
        description: "Cardiomiocitos, discos intercalares, díadas, contracción, conducción y lesión cardíaca.",
        subtopics: [
          "Músculo cardíaco",
          "Discos intercalares",
          "Díadas cardíacas",
          "Contracción cardíaca",
          "Sistema de conducción cardíaco",
          "Fibras de Purkinje",
          "Nodo SA y nodo AV",
          "Lesión cardíaca",
          "Comparación cardíaco-esquelético"
        ]
      },
      {
        title: "Músculo liso",
        description: "Cavéolas, cuerpos densos, calmodulina, MLCK, contracción, relajación y renovación.",
        subtopics: [
          "Músculo liso",
          "Cavéolas",
          "Aparato contráctil del músculo liso",
          "Cuerpos densos",
          "Filamentos intermedios del músculo liso",
          "Filamentos gruesos del músculo liso",
          "Contracción del músculo liso",
          "Estimulación del músculo liso",
          "Relajación del músculo liso",
          "Función secretora del músculo liso",
          "Renovación del músculo liso",
          "Diferenciación del músculo liso",
          "Músculo liso vascular",
          "Músculo liso visceral",
          "Identificación histológica del músculo liso",
          "Histología 101"
        ]
      }
    ]
  },
  {
    chapter: "Capítulo 12",
    title: "Sistema nervioso",
    groups: [
      {
        title: "Generalidades",
        description: "Divisiones del sistema nervioso, vías, tejido nervioso, neuronas y glía básica.",
        subtopics: [
          "Fundamentos del sistema nervioso",
          "División anatómica del sistema nervioso",
          "Sistema nervioso central",
          "Sistema nervioso periférico",
          "Vías nerviosas",
          "Arco reflejo",
          "División funcional del sistema nervioso",
          "Sistema nervioso somático",
          "Sistema nervioso autónomo",
          "Efectores autónomos",
          "Tejido neuroendocrino",
          "Composición del tejido nervioso",
          "Funciones de la glía",
          "Neuroglía central",
          "Neuroglía periférica"
        ]
      },
      {
        title: "Neuronas",
        description: "Tipos neuronales, soma, dendritas, axón, Nissl, cono axónico y regeneración.",
        subtopics: [
          "Neuronas",
          "Neuronas sensitivas",
          "Motoneuronas",
          "Interneuronas",
          "Componentes de la neurona",
          "Soma neuronal",
          "Axón",
          "Dendritas",
          "Sinapsis",
          "Clasificación anatómica de neuronas",
          "Neuronas multipolares",
          "Neuronas bipolares",
          "Neuronas seudounipolares",
          "Comparación de neuronas",
          "Corpúsculos de Nissl",
          "Cono axónico",
          "Actividad neuronal",
          "Regeneración neuronal",
          "Parkinson"
        ]
      },
      {
        title: "Dendritas, axón y sinapsis",
        description: "Espinas dendríticas, segmento inicial, microtúbulos, transporte neuronal y transmisión sináptica.",
        subtopics: [
          "Dendritas",
          "Espinas dendríticas",
          "Axón",
          "Cono axónico",
          "Segmento inicial del axón",
          "Polaridad neuronal",
          "Microtúbulos neuronales",
          "Microtúbulos axónicos",
          "Microtúbulos dendríticos",
          "Síntesis proteica axónica local",
          "Transporte neuronal",
          "Transporte anterógrado",
          "Transporte retrógrado",
          "Transporte lento anterógrado",
          "Transporte rápido",
          "Transporte rápido anterógrado",
          "Transporte rápido retrógrado",
          "Transporte dendrítico",
          "Transporte neuronal y enfermedad",
          "Sinapsis",
          "Sinapsis morfológicas",
          "Sinapsis axodendrítica",
          "Sinapsis axosomática",
          "Sinapsis axoaxónica",
          "Clasificación funcional de sinapsis",
          "Sinapsis químicas",
          "Sinapsis eléctricas",
          "Sinapsis química",
          "Elemento presináptico",
          "Vesículas sinápticas",
          "Zona activa",
          "Hendidura sináptica",
          "Membrana postsináptica",
          "Transmisión sináptica",
          "Receptores postsinápticos",
          "Comparación sináptica"
        ]
      },
      {
        title: "Neuroglía y mielina",
        description: "Schwann, células satélite, astrocitos, oligodendrocitos, microglía, ependimocitos y conducción.",
        subtopics: [
          "Neuroglía",
          "Neuroglía periférica",
          "Células de Schwann",
          "Mielina periférica",
          "Nódulo de Ranvier",
          "Incisuras de Schmidt-Lanterman",
          "Axones no mielinizados del SNP",
          "Células satélite",
          "Células neurogliales entéricas",
          "Neuroglía central",
          "Astrocitos",
          "Astrocitos protoplasmáticos",
          "Astrocitos fibrosos",
          "Oligodendrocitos",
          "Mielina central",
          "Microglía",
          "Ependimocitos",
          "Conducción del impulso",
          "Enfermedades desmielinizantes",
          "Origen de células nerviosas",
          "Comparación de glía"
        ]
      },
      {
        title: "Sistema nervioso periférico",
        description: "Nervios periféricos, ganglios, endoneuro, perineuro, epineuro, receptores y SNA.",
        subtopics: [
          "Organización del SNP",
          "Nervios periféricos",
          "Ganglios periféricos",
          "Ganglios sensitivos",
          "Ganglios autónomos",
          "Motoneuronas periféricas",
          "Tejido conjuntivo del nervio",
          "Endoneuro",
          "Perineuro",
          "Epineuro",
          "Endoneuro y vascularización",
          "Comparación endoneuro-perineuro-epineuro",
          "Receptores aferentes",
          "Exterorreceptores",
          "Interorreceptores",
          "Propiorreceptores",
          "Terminaciones nerviosas libres",
          "Terminaciones encapsuladas",
          "Sistema nervioso autónomo",
          "Vía eferente autónoma",
          "División simpática",
          "División parasimpática",
          "División entérica",
          "Neurotransmisores autónomos",
          "Comparación simpático-parasimpático",
          "Comparación somático-autónomo",
          "Identificación histológica del nervio periférico"
        ]
      },
      {
        title: "Sistema nervioso central",
        description: "Sustancia gris y blanca, médula espinal, barrera hematoencefálica, LCR y lesión neuronal.",
        subtopics: [
          "Sistema nervioso central",
          "Sustancia gris",
          "Neurópilo",
          "Sustancia blanca",
          "Tractos del SNC",
          "Núcleos del SNC",
          "Corteza cerebral",
          "Corteza cerebelosa",
          "Médula espinal",
          "Raíz dorsal",
          "Raíz ventral",
          "Astas medulares",
          "Sustancia blanca medular",
          "Tronco encefálico",
          "Barrera hematoencefálica",
          "Líquido cefalorraquídeo",
          "Plexo coroideo",
          "Lesión neuronal",
          "Degeneración walleriana",
          "Degeneración retrógrada",
          "Degeneración traumática",
          "Cromatólisis",
          "Regeneración en SNP",
          "Regeneración en SNC",
          "Gliosis",
          "Comparación lesión SNP-SNC",
          "Identificación histológica del SNC",
          "Integración del capítulo",
          "Histología 101"
        ]
      }
    ]
  },
  {
    chapter: "Capítulo 13",
    title: "Sistema cardiovascular",
    groups: [
      {
        title: "Fundamentos del sistema cardiovascular",
        description: "Página 432 · Componentes, microcirculación, circuitos pulmonar y sistémico, y sistemas porta.",
        subtopics: [
          "Fundamentos cardiovasculares",
          "Microcirculación",
          "Circulación pulmonar",
          "Circulación sistémica",
          "Sistemas porta"
        ]
      },
      {
        title: "Corazón",
        description: "Páginas 433-439 · Pared, válvulas y regulación intrínseca y sistémica de la frecuencia cardíaca.",
        subtopics: [
          "Organización del corazón",
          "Flujo cardíaco",
          "Esqueleto fibroso cardíaco",
          "Vasos coronarios",
          "Pared cardíaca",
          "Epicardio",
          "Miocardio",
          "Endocardio",
          "Pericardio",
          "Taponamiento cardíaco",
          "Tabiques cardíacos",
          "Válvulas cardíacas",
          "Fibrosa valvular",
          "Esponjosa valvular",
          "Ventricular valvular",
          "Células intersticiales valvulares",
          "Cuerdas tendinosas",
          "Sistema de conducción cardíaco",
          "Regulación intrínseca",
          "Nodo sinoauricular",
          "Nodo auriculoventricular",
          "Haz auriculoventricular",
          "Fibras de Purkinje",
          "Células nodales",
          "Disfunción sinusal",
          "Arritmias",
          "Regulación cardíaca",
          "Receptores cardiovasculares"
        ]
      },
      {
        title: "Características generales de las arterias y las venas",
        description: "Páginas 440-446 · Capas de la pared vascular y funciones del endotelio vascular.",
        subtopics: [
          "Túnicas vasculares",
          "Túnica íntima",
          "Túnica media",
          "Túnica adventicia",
          "Vasa vasorum",
          "Nervi vasorum",
          "Endotelio vascular",
          "Hemostasia endotelial",
          "Óxido nítrico",
          "Endotelina",
          "Regulación vasomotora"
        ]
      },
      {
        title: "Arterias",
        description: "Páginas 447-451 · Arterias grandes elásticas, medianas musculares, pequeñas y arteriolas.",
        subtopics: [
          "Clasificación arterial",
          "Arterias elásticas",
          "Envejecimiento aórtico",
          "Arterias musculares",
          "Arterias pequeñas",
          "Arteriolas",
          "Esfínteres precapilares",
          "Metarteriolas"
        ]
      },
      {
        title: "Capilares",
        description: "Páginas 452-454 · Clasificación, pericitos y aspectos funcionales del intercambio capilar.",
        subtopics: [
          "Capilares",
          "Clasificación capilar",
          "Capilares continuos",
          "Capilares fenestrados",
          "Capilares discontinuos",
          "Pericitos",
          "Intercambio capilar",
          "Densidad capilar"
        ]
      },
      {
        title: "Anastomosis arteriovenosas",
        description: "Página 455 · Derivaciones directas entre arterias y venas y su función termorreguladora.",
        subtopics: [
          "Anastomosis arteriovenosas"
        ]
      },
      {
        title: "Venas",
        description: "Páginas 455-457 · Vénulas, venas pequeñas, medianas y grandes, válvulas y comparación arterial.",
        subtopics: [
          "Clasificación venosa",
          "Vénulas poscapilares",
          "Vénulas musculares",
          "Vénulas de endotelio alto",
          "Venas pequeñas",
          "Venas medianas",
          "Válvulas venosas",
          "Venas grandes",
          "Comparación arteria-vena"
        ]
      },
      {
        title: "Vasos sanguíneos atípicos",
        description: "Página 458 · Coronarias, senos durales, safena magna y vena central suprarrenal.",
        subtopics: [
          "Vasos sanguíneos atípicos"
        ]
      },
      {
        title: "Vasos linfáticos",
        description: "Páginas 459-461 · Capilares, conductos, válvulas y mecanismos del flujo linfático.",
        subtopics: [
          "Vasos linfáticos",
          "Capilares linfáticos",
          "Conductos linfáticos",
          "Vasos linfáticos mayores",
          "Flujo linfático"
        ]
      },
      {
        title: "Correlaciones clínicas",
        description: "Cuadros 13-1 a 13-3 · Ateroesclerosis, hipertensión y coronariopatía.",
        subtopics: [
          "Ateroesclerosis",
          "Hipertensión",
          "Coronariopatía"
        ]
      },
      {
        title: "Histología 101 e identificación",
        description: "Página 462 y láminas 32-35 · Reconocimiento bidireccional de estructuras y lesiones.",
        subtopics: [
          "Identificación cardíaca",
          "Identificación vascular",
          "Identificación arterial",
          "Identificación microvascular",
          "Identificación venosa",
          "Identificación linfática",
          "Identificación clínica",
          "Identificación comparativa"
        ]
      }
    ]
  },
  {
    chapter: "Capítulo 14",
    title: "Sistema inmunitario y tejidos y órganos linfáticos",
    groups: [
      {
        title: "Fundamentos de los sistemas inmunitario y linfático",
        description: "Páginas 472-474 · Organización, antígenos, inmunidad innata y adaptativa, y tipos de respuesta.",
        subtopics: [
          "Fundamentos inmunitarios",
          "Órganos linfáticos",
          "Origen de células inmunitarias",
          "Células inmunitarias",
          "Linfocitos",
          "Antígenos",
          "Inmunidad innata",
          "Inmunidad adaptativa",
          "Inmunidad humoral",
          "Inmunidad celular",
          "Diferenciación linfocitaria",
          "Circulación linfocitaria",
          "Respuesta primaria y secundaria"
        ]
      },
      {
        title: "Células del sistema inmunitario",
        description: "Páginas 474-481 · Linfocitos T, B y NK, subpoblaciones y anticuerpos.",
        subtopics: [
          "Células de sostén inmunitario",
          "Células de Langerhans",
          "Linfocitos T",
          "Linfocitos TH1",
          "Linfocitos TH2",
          "Linfocitos TH17",
          "Linfocitos T CD8+",
          "Linfocitos T reguladores",
          "Linfocitos T γδ",
          "LITAM",
          "Linfocitos B",
          "Anticuerpos",
          "Inmunoglobulinas",
          "Linfocitos NK"
        ]
      },
      {
        title: "Marcadores CD",
        description: "Tabla 14-1 · Identificación celular, receptores, adhesión, coestimulación y funciones de las moléculas CD.",
        subtopics: [
          "Marcadores CD"
        ]
      },
      {
        title: "Activación de los linfocitos T y B",
        description: "Páginas 481-485 · MHC, procesamiento, coestimulación, citotoxicidad, citocinas e inmunosupresión.",
        subtopics: [
          "MHC",
          "Procesamiento antigénico",
          "Activación de linfocitos T",
          "Citotoxicidad T",
          "Activación de linfocitos B",
          "Citocinas",
          "Inmunosupresores"
        ]
      },
      {
        title: "Interleucinas",
        description: "Tabla 14-3 · Principales fuentes, células diana y acciones de IL-1 a IL-20.",
        subtopics: [
          "Interleucinas"
        ]
      },
      {
        title: "Células presentadoras de antígenos",
        description: "Páginas 485-488 · Presentación antigénica, células dendríticas y activación M1/M2 de macrófagos.",
        subtopics: [
          "Células presentadoras de antígeno",
          "Macrófagos M1 y M2"
        ]
      },
      {
        title: "Vasos, tejido linfático difuso y nódulos",
        description: "Páginas 488-493 · Vasos linfáticos, MALT, folículos, amígdalas, placas de Peyer y apéndice.",
        subtopics: [
          "Vasos linfáticos",
          "Tejido linfático difuso",
          "MALT",
          "Nódulos linfáticos",
          "Amígdalas y placas de Peyer"
        ]
      },
      {
        title: "Ganglios linfáticos",
        description: "Páginas 493-498 · Arquitectura, malla reticular, VEA, quimiocinas, respuesta y salida linfocitaria.",
        subtopics: [
          "Ganglio linfático",
          "Malla reticular del ganglio",
          "Vénulas de endotelio alto",
          "Tráfico linfocitario",
          "Respuesta ganglionar"
        ]
      },
      {
        title: "Timo, barrera hematotímica y educación",
        description: "Páginas 498-503 · Arquitectura tímica, seis tipos epiteliorreticulares, barrera y selección de timocitos.",
        subtopics: [
          "Timo",
          "Células epiteliorreticulares",
          "Corpúsculos de Hassall",
          "Macrófagos tímicos",
          "Barrera hematotímica",
          "Educación tímica"
        ]
      },
      {
        title: "Bazo y circulación sanguínea",
        description: "Páginas 502-509 · Pulpa blanca y roja, senos, circulación abierta y funciones inmunohematológicas.",
        subtopics: [
          "Bazo",
          "Pulpa blanca",
          "Pulpa roja",
          "Senos esplénicos",
          "Circulación esplénica",
          "Funciones del bazo",
          "Comparación de órganos"
        ]
      },
      {
        title: "Correlaciones clínicas",
        description: "Cuadros 14-1 a 14-4 · Origen T/B, hipersensibilidad inmediata, VIH/sida y linfadenitis reactiva.",
        subtopics: [
          "Hipersensibilidad tipo I",
          "VIH y sida",
          "Linfadenitis reactiva"
        ]
      },
      {
        title: "Identificación histológica",
        description: "Láminas 36-41 · Reconocimiento bidireccional de amígdala, ganglio, timo y bazo.",
        subtopics: [
          "Identificación histológica"
        ]
      }
    ]
  },
  {
    chapter: "Capítulo 15",
    title: "Sistema tegumentario",
    groups: [
      {
        title: "Fundamentos y tipos de piel",
        description: "Páginas 524-526 · Organización, funciones y diferencias entre piel gruesa y delgada.",
        subtopics: [
          "Fundamentos tegumentarios",
          "Piel gruesa y delgada"
        ]
      },
      {
        title: "Estratos de la epidermis",
        description: "Páginas 526-529 · Capas epidérmicas, células y cambios durante la queratinización.",
        subtopics: [
          "Estratos epidérmicos",
          "Estrato basal",
          "Estrato espinoso",
          "Estrato granuloso",
          "Estratos lúcido y córneo"
        ]
      },
      {
        title: "Dermis e hipodermis",
        description: "Páginas 527-529 · Unión dermoepidérmica, capas dérmicas, tejido subcutáneo y músculos cutáneos.",
        subtopics: [
          "Unión dermoepidérmica",
          "Dermis papilar y reticular",
          "Hipodermis y músculos cutáneos"
        ]
      },
      {
        title: "Queratinocitos y barrera epidérmica",
        description: "Páginas 529-533 · Diferenciación, descamación, cuerpos laminares y envolturas de la barrera.",
        subtopics: [
          "Tipos celulares epidérmicos",
          "Diferenciación de queratinocitos",
          "Descamación y gradiente de pH",
          "Cuerpos laminares",
          "Envolturas celular y lipídica"
        ]
      },
      {
        title: "Melanocitos y color de la piel",
        description: "Páginas 532-535 · Unidad melanoepidérmica, melanogénesis, transferencia y pigmentación.",
        subtopics: [
          "Melanocitos y melanogénesis",
          "Color de la piel"
        ]
      },
      {
        title: "Células de Langerhans y Merkel",
        description: "Páginas 535-536 · Vigilancia inmunitaria, mecanorrecepción y rasgos identificadores.",
        subtopics: [
          "Células de Langerhans",
          "Células de Merkel"
        ]
      },
      {
        title: "Inervación cutánea",
        description: "Páginas 536-541 · Terminaciones libres y receptores para tacto, presión, vibración y estiramiento.",
        subtopics: [
          "Terminaciones nerviosas libres",
          "Receptores encapsulados"
        ]
      },
      {
        title: "Folículos pilosos y pelo",
        description: "Páginas 541-545 · Organización folicular, células madre, tallo y ciclo de crecimiento.",
        subtopics: [
          "Fundamentos de anexos cutáneos",
          "Folículo piloso",
          "Células madre foliculares",
          "Tallo del pelo",
          "Ciclo y tipos de pelo"
        ]
      },
      {
        title: "Glándulas sebáceas",
        description: "Páginas 544-546 · Unidad pilosebácea, secreción holocrina, sebo y acné.",
        subtopics: ["Glándulas sebáceas"]
      },
      {
        title: "Glándulas sudoríparas ecrinas",
        description: "Páginas 546-549 · Adenómero, conducto, tipos celulares, sudor y termorregulación.",
        subtopics: ["Glándulas sudoríparas ecrinas"]
      },
      {
        title: "Glándulas sudoríparas apocrinas",
        description: "Páginas 549-550 · Distribución, estructura, secreción y diferencias con las ecrinas.",
        subtopics: ["Glándulas sudoríparas apocrinas"]
      },
      {
        title: "Uñas",
        description: "Página 550 · Placa, matriz, lecho, lúnula, eponiquio e hiponiquio.",
        subtopics: ["Placa y aparato ungueal"]
      },
      {
        title: "Correlaciones clínicas",
        description: "Cuadros 15-1 a 15-6 · Cáncer cutáneo, cirugía de Mohs, sudoración y reparación.",
        subtopics: [
          "Cáncer cutáneo",
          "Cirugía de Mohs",
          "Sudoración y enfermedad",
          "Reparación cutánea"
        ]
      },
      {
        title: "Histología 101 e identificación",
        description: "Página 552 y láminas 42-47 · Reconocimiento de piel y sus anexos en cortes histológicos.",
        subtopics: ["Identificación histológica"]
      }
    ]
  },
  {
    chapter: "Capítulo 16",
    title: "Sistema digestivo I: cavidad bucal",
    groups: [
      { title: "Fundamentos y cavidad bucal", description: "Organización del sistema digestivo, espacios bucales, amígdalas y mucosa.", subtopics: ["Fundamentos digestivos", "Organización de la cavidad bucal", "Mucosa bucal"] },
      { title: "Lengua, papilas y gusto", description: "Músculo lingual, papilas, botones gustativos y transducción de los cinco sabores.", subtopics: ["Organización lingual", "Papilas linguales", "Botones gustativos", "Transducción gustativa"] },
      { title: "Dientes y desarrollo", description: "Denticiones, germen dental, órgano adamantino y secuencia de formación.", subtopics: ["Organización y denticiones", "Desarrollo dentario"] },
      { title: "Esmalte y amelogénesis", description: "Bastones, ameloblastos, etapas secretora y de maduración y proteínas de matriz.", subtopics: ["Estructura del esmalte", "Amelogénesis"] },
      { title: "Cemento, dentina y pulpa", description: "Tejidos mineralizados, odontoblastos, túbulos, líneas incrementales y cavidad pulpar.", subtopics: ["Cemento", "Dentina", "Pulpa dental"] },
      { title: "Periodonto y encía", description: "Ligamento periodontal, hueso alveolar, epitelio de unión y soporte dental.", subtopics: ["Periodonto y encía"] },
      { title: "Acinos y conductos salivales", description: "Sialona, células serosas, mucosas y mioepiteliales, y modificación ductal.", subtopics: ["Acinos y células mioepiteliales", "Conductos salivales"] },
      { title: "Glándulas mayores y saliva", description: "Parótida, submandibular, sublingual, composición, digestión y defensa salival.", subtopics: ["Glándulas salivales mayores", "Saliva"] },
      { title: "Clínica e identificación", description: "Caries, tumores salivales y reconocimiento histológico de estructuras clave.", subtopics: ["Clínica e identificación"] }
    ]
  },
  {
    chapter: "Capítulo 17",
    title: "Sistema digestivo II: tubo digestivo",
    groups: [
      { title: "Pared y control del tubo digestivo", description: "Capas, amplificación de superficie, plexos entéricos, motilidad y esfínteres.", subtopics: ["Organización general de la pared", "Amplificación, mucosa y motilidad", "Plexos y esfínteres"] },
      { title: "Esófago", description: "Mucosa protectora, transición muscular, glándulas, cubierta externa e inervación.", subtopics: ["Mucosa y organización", "Glándulas e inervación"] },
      { title: "Estómago: mucosa y protección", description: "Regiones, pliegues, fovéolas, barrera moco-bicarbonato y citoprotección.", subtopics: ["Regiones, pliegues y mucosa superficial", "Barrera y citoprotección gástrica"] },
      { title: "Glándulas y células gástricas", description: "Glándulas fúndicas, células principales y parietales, ácido y correlaciones clínicas.", subtopics: ["Glándulas fúndicas", "Células de las glándulas fúndicas", "Secreción de ácido y clínica gástrica"] },
      { title: "Hormonas, cardias y píloro", description: "Sistema enteroendocrino, hormonas gastrointestinales, glándulas regionales y renovación.", subtopics: ["Sistema enteroendocrino", "Hormonas gastrointestinales", "Cardias, píloro y renovación"] },
      { title: "Intestino delgado: superficie y células", description: "Pliegues, vellosidades, criptas, enterocitos, células de Paneth, caliciformes y M.", subtopics: ["Organización y superficie", "Enterocitos y transporte", "Células de la mucosa intestinal"] },
      { title: "Absorción e inmunidad intestinal", description: "Digestión de nutrientes, transporte epitelial, IgA, GALT y placas de Peyer.", subtopics: ["Digestión y absorción", "Inmunidad mucosa"] },
      { title: "Duodeno, motilidad y renovación", description: "Glándulas de Brunner, segmentación, peristaltismo y recambio del epitelio.", subtopics: ["Submucosa, motilidad y renovación"] },
      { title: "Colon", description: "Mucosa, criptas, células, lámina propia, tenias, haustras y motilidad colónica.", subtopics: ["Organización de la mucosa colónica", "Lámina propia, muscular y serosa"] },
      { title: "Apéndice, recto y ano", description: "Rasgos diferenciales, transición epitelial, glándulas y esfínteres.", subtopics: ["Apéndice, recto y conducto anal"] },
      { title: "Inflamación y cáncer colorrectal", description: "Linfáticos, pólipos, secuencia adenoma-carcinoma y signos clínicos.", subtopics: ["Inflamación y cáncer colorrectal"] }
    ]
  },
  {
    chapter: "Artículo · Hemostasia y trombosis",
    title: "Hemostasia y trombosis",
    groups: [
      {
        title: "Hemorragia y conceptos generales",
        description: "Consecuencias de la hemorragia, hemostasia normal y definición de trombosis.",
        subtopics: ["Hemorragia y conceptos generales"]
      },
      {
        title: "Secuencia de la hemostasia normal",
        description: "Vasoconstricción, tapón primario, fibrina y contrarregulación.",
        subtopics: ["Secuencia de la hemostasia normal"]
      },
      {
        title: "Endotelio antitrombótico",
        description: "PGI2, NO, antitrombina III, trombomodulina, proteína C/S, TFPI y t-PA.",
        subtopics: ["Endotelio antitrombótico"]
      },
      {
        title: "Endotelio protrombótico",
        description: "Activación endotelial, factor tisular, pérdida de trombomodulina y PAI.",
        subtopics: ["Endotelio protrombótico"]
      },
      {
        title: "Plaquetas y gránulos",
        description: "Origen, función, gránulos alfa y cuerpos densos.",
        subtopics: ["Plaquetas y gránulos"]
      },
      {
        title: "Adhesión plaquetaria",
        description: "Colágeno, vWF, GpIb, von Willebrand y Bernard-Soulier.",
        subtopics: ["Adhesión plaquetaria"]
      },
      {
        title: "Activación plaquetaria",
        description: "Liberación granular, calcio, ADP, TxA2 y cambios de membrana.",
        subtopics: ["Activación plaquetaria"]
      },
      {
        title: "Agregación y tapón estable",
        description: "GpIIb/IIIa, fibrinógeno, Glanzmann, trombina y consolidación del tapón.",
        subtopics: ["Agregación y tapón estable"]
      },
      {
        title: "Interacción plaqueta-endotelio",
        description: "Balance PGI2-TxA2, óxido nítrico y acción de aspirina.",
        subtopics: ["Interacción plaqueta-endotelio"]
      },
      {
        title: "Cascada de coagulación",
        description: "Principios, vías intrínseca y extrínseca, calcio, vitamina K y fibrina.",
        subtopics: ["Cascada de coagulación"]
      },
      {
        title: "Pruebas de coagulación",
        description: "PT, PTT, factores evaluados, procedimiento y monitorización terapéutica.",
        subtopics: ["Pruebas de coagulación"]
      },
      {
        title: "Trombina y receptores PAR",
        description: "Activación celular, inflamación y retroalimentación de la coagulación.",
        subtopics: ["Trombina y receptores PAR"]
      },
      {
        title: "Anticoagulantes naturales",
        description: "Antitrombina, proteínas C/S, TFPI y restricción espacial del coágulo.",
        subtopics: ["Anticoagulantes naturales"]
      },
      {
        title: "Fibrinólisis",
        description: "Plasmina, activadores, inhibidores, productos de degradación y dímero D.",
        subtopics: ["Fibrinólisis"]
      },
      {
        title: "Trombosis y tríada de Virchow",
        description: "Lesión endotelial, flujo anormal, hipercoagulabilidad y disfunción endotelial.",
        subtopics: ["Trombosis y tríada de Virchow"]
      },
      {
        title: "Flujo anormal y trombosis",
        description: "Turbulencia, estasis y ejemplos cardiovasculares y hematológicos.",
        subtopics: ["Flujo anormal y trombosis"]
      }
    ]
  }
]

function encodeSubtopicGroup(
  subtopics: string[]
) {
  return `__subtopics:${subtopics.join("||")}`
}

function formatDuePreview(dueDate: string) {

  const diffMinutes =
    Math.max(
      1,
      Math.ceil(
        (new Date(dueDate).getTime() - Date.now()) / 60000
      )
    )

  if (diffMinutes < 60) {
    return `en ${diffMinutes} min`
  }

  const diffHours =
    Math.ceil(diffMinutes / 60)

  if (diffHours < 24) {
    return `en ${diffHours} hora${diffHours === 1 ? "" : "s"}`
  }

  const diffDays =
    Math.ceil(diffHours / 24)

  if (diffDays < 30) {
    return `en ${diffDays} día${diffDays === 1 ? "" : "s"}`
  }

  const diffMonths =
    Math.ceil(diffDays / 30)

  return `en ${diffMonths} mes${diffMonths === 1 ? "" : "es"}`
}

function getNextDueDate(
  cardIds: string[],
  cardsProgress: Record<string, any>
) {

  const dates =
    cardIds
      .map(id => cardsProgress[id]?.dueDate)
      .filter(Boolean)
      .map(date => new Date(date).getTime())
      .filter(time => time > Date.now())
      .sort((a, b) => a - b)

  if (dates.length === 0) return null

  return new Date(dates[0]).toISOString()
}

function getDueCount(
  cards: any[],
  progress: Record<string, any>
) {
  return cards.filter(card =>
    isFsrsCardDue(
      card.id,
      progress
    )
  ).length
}


function cardMatchesSelectedSubject(
  card: any,
  subject: string
) {
  const cardSubject =
    String(card.subject || "").toLowerCase()

  if (subject === "proceso-economico-i") {
    return (
      cardSubject === "proceso económico i" ||
      cardSubject === "proceso economico i" ||
      cardSubject === "proceso-economico-i"
    )
  }

  if (subject === "filosofia-de-hayek") {
    const cardBook =
      String(card.book || "").toLowerCase()

    return (
      cardSubject === "filosofía" ||
      cardSubject === "filosofia" ||
      cardSubject === "filosofía de hayek" ||
      cardSubject === "filosofia de hayek" ||
      cardSubject === "filosofia-de-hayek" ||
      cardBook === "hayek"
    )
  }

  if (subject === "semiologia") {
    return (
      cardSubject === "semiología" ||
      cardSubject === "semiologia"
    )
  }

  return (
    cardSubject === "" ||
    cardSubject === "histología" ||
    cardSubject === "histologia"
  )
}


const HAYEK_MENUS: ChapterMenu[] = [
  {
    chapter: "Parcial 1",
    title: "Parcial 1",
    groups: [
      {
        title: "Liberalismo, libertad y sistemas políticos",
        description: "Liberalismo, antecedentes, libertad individual, autoritarismo y totalitarismo.",
        subtopics: [
          "Liberalismo",
          "Expresiones del liberalismo",
          "Antecedentes",
          "Libertad",
          "Libertad individual",
          "Sistemas políticos",
          "Autoritarismo y totalitarismo"
        ]
      },
      {
        title: "Metodología, fenómenos sociales y Hayek",
        description: "Historicismo, Escuela Austriaca, fenómenos sociales, biografía de Hayek y socialismo.",
        subtopics: [
          "Metodología social",
          "Historicismo y Escuela Austriaca",
          "Fenómenos sociales",
          "Fenómenos naturales y sociales",
          "Hayek y socialismo",
          "Biografía y obras",
          "Tipos de socialismo"
        ]
      },
      {
        title: "Mente, razón y conocimiento",
        description: "Mente, razón limitada, conocimiento disperso, tipos de conocimiento y problema económico.",
        subtopics: [
          "Mente y razón",
          "Mente, cerebro y memoria",
          "Razón limitada",
          "Conocimiento en sociedad",
          "Tipos de conocimiento",
          "Problema económico",
          "Problema social"
        ]
      },
      {
        title: "Orden espontáneo e instituciones",
        description: "Orden social, cosmos, taxis, nomos, thesis, instituciones y organizaciones.",
        subtopics: [
          "Teoría del orden",
          "Concepto de orden",
          "Orden espontáneo",
          "Orden deliberado",
          "Condiciones del orden",
          "Instituciones y organizaciones",
          "Instituciones",
          "Organizaciones",
          "Cosmos, taxis, nomos y thesis",
          "Cosmos y taxis",
          "Nomos y thesis"
        ]
      },
      {
        title: "Nomocracia, catalaxia y demarquía",
        description: "Nomocracia, teleocracia, catalaxia, economía y límites al poder democrático.",
        subtopics: [
          "Nomocracia y teleocracia",
          "Nomocracia",
          "Teleocracia",
          "Catalaxia y economía",
          "Catalaxia",
          "Economía",
          "Demarquía"
        ]
      }
    ]
  },
  {
    chapter: "Parcial 2",
    title: "Parcial 2",
    groups: [
      {
        title: "Libertad, coacción y ley",
        description: "Libertad individual, libertad política, coacción, arbitrariedad, derecho y reglas generales.",
        subtopics: [
          "Libertad y libertades",
          "Libertad individual",
          "Libertad política",
          "Libertad interior",
          "Libertad como poder",
          "Libertades concretas",
          "Coacción y ley",
          "Coacción",
          "Coacción estatal",
          "Arbitrariedad",
          "Derecho y permiso",
          "Reglas generales"
        ]
      },
      {
        title: "Razón, tradición, civilización y progreso",
        description: "Razón limitada, tradiciones, conocimiento disperso, civilización, progreso y aprendizaje social.",
        subtopics: [
          "Libertad, razón y tradición",
          "Razón limitada",
          "Razón humilde",
          "Tradiciones",
          "Tradiciones de libertad",
          "Tradición británica",
          "Tradición inglesa",
          "Tradición francesa",
          "Civilización y conocimiento",
          "Civilización",
          "Conocimiento incorporado",
          "Ignorancia y conocimiento disperso",
          "Ignorancia útil",
          "Aprendizaje social",
          "Progreso",
          "Progreso como descubrimiento",
          "Progreso y desigualdad",
          "Progreso y descontento",
          "Progreso desigual",
          "Progreso incómodo"
        ]
      },
      {
        title: "Responsabilidad, igualdad, valor y mérito",
        description: "Responsabilidad personal, igualdad ante la ley, igualdad material, valor, mérito y justicia distributiva.",
        subtopics: [
          "Responsabilidad y libertad",
          "Responsabilidad",
          "Igualdad, valor y mérito",
          "Igualdad",
          "Igualdad ante la ley",
          "Igualdad de oportunidades",
          "Igualdad material",
          "Igualdad y diferencias humanas",
          "Valor y mérito",
          "Mérito y valor",
          "Justicia distributiva",
          "Justicia redistributiva"
        ]
      },
      {
        title: "Democracia, gobierno mayoritario y sociedad libre",
        description: "Democracia limitada, demarquía, opinión pública, demagogia, problemas sociales y límites al gobierno.",
        subtopics: [
          "Gobierno mayoritario",
          "Liberalismo y democracia",
          "Democracia como medio",
          "Democracia dogmática",
          "Democracia limitada",
          "Demarquía",
          "Demagogia",
          "Opinión pública",
          "Sociedad libre",
          "Orden social",
          "Problemas sociales",
          "Paternalismo",
          "Tragedia de los comunes",
          "Comunidad y sociedad",
          "Familia y herencia",
          "Determinismo y voluntarismo"
        ]
      },
      {
        title: "Trabajo, independencia y cultura",
        description: "Asalariados, empresarios, independencia económica, Estado empleador, mecenazgo y cultura.",
        subtopics: [
          "Trabajo e independencia",
          "Trabajo por cuenta ajena",
          "Libertad del asalariado",
          "Asalariado e independiente",
          "Actividad independiente",
          "Empresario independiente",
          "Independencia económica",
          "Riqueza independiente",
          "Estado empleador",
          "Sociedad de empleados",
          "Mentalidad asalariada",
          "Mentalidad independiente",
          "Mecenazgo privado",
          "Cultura y autarquía",
          "Ocio creador",
          "Esfera privada",
          "Sociedad estacionaria",
          "Sociedad progresiva"
        ]
      }
    ]
  },
  {
    chapter: "Conceptos Importantes",
    title: "Conceptos Importantes",
    groups: [
      {
        title: "Derecho, ley y justicia",
        description: "Ley, legislación, mandatos, normas, libertad, derecho y justicia social.",
        subtopics: [
          "Derecho, ley y justicia",
          "Derecho y libertad",
          "Derecho y justicia",
          "Justicia"
        ]
      },
      {
        title: "Sociedad, civilización y progreso",
        description: "Tribu, sociedad extensa, civilización, progreso, élites, minorías independientes y ética societaria.",
        subtopics: [
          "Sociedad, civilización y progreso",
          "Sociedad y civilización",
          "Progreso",
          "Ética societaria"
        ]
      },
      {
        title: "Mente, igualdad, valor y trabajo",
        description: "Mente, civilización, valor, mérito, asalariados, empresarios e independencia económica.",
        subtopics: [
          "Mente y civilización",
          "Igualdad, valor y mérito",
          "Trabajo e independencia"
        ]
      }
    ]
  }
]


const _PROCESO_ECONOMICO_MENUS: ChapterMenu[] = [
  {
    chapter: "Parcial 1",
    title: "Parcial 1",
    groups: [
      {
        title: "Bienes, capital y producción",
        description: "Bienes de consumo, bienes de capital, estructura productiva y procesos de producción.",
        subtopics: [
          "Bienes",
          "Bienes de consumo",
          "Bienes de capital",
          "Estructura de producción",
          "Periodo de trabajo",
          "Periodo de maduración"
        ]
      },
      {
        title: "Cooperación, escasez y especialización",
        description: "Cooperación social, división del trabajo, escasez, ventaja absoluta y comparativa.",
        subtopics: [
          "Cooperación social",
          "División del trabajo",
          "Escasez",
          "Ventaja absoluta",
          "Ventaja comparativa",
          "FPP"
        ]
      },
      {
        title: "Mercado y teoría del valor",
        description: "Roles del mercado, consumidores, empresarios, dueños de recursos y teoría subjetiva del valor.",
        subtopics: [
          "Mercado",
          "Teoría del valor"
        ]
      },
      {
        title: "Oferta, demanda y precio de mercado",
        description: "Curvas, movimientos, desplazamientos, equilibrio, déficit y superávit.",
        subtopics: [
          "Demanda",
          "Oferta",
          "Déficit y superávit",
          "Precio de mercado",
          "Elasticidad"
        ]
      },
      {
        title: "Intervención, precios e impuestos",
        description: "Precio máximo, precio mínimo, incidencia impositiva y peso muerto.",
        subtopics: [
          "Precio máximo",
          "Precio mínimo",
          "Impuestos"
        ]
      }
    ]
  },
  {
    chapter: "Parcial 2",
    title: "Parcial 2",
    groups: [
      {
        title: "Ahorro, capital y capitalización",
        description: "Ahorro, formación de capital, máquinas, productividad, salarios reales y desempleo friccional.",
        subtopics: [
          "Ahorro y capital",
          "Capital",
          "Ahorro",
          "Capitalización"
        ]
      },
      {
        title: "Preferencia temporal, interés y crédito",
        description: "Interés originario, tasa de interés, ahorro, inversión y mercado de crédito.",
        subtopics: [
          "Preferencia temporal",
          "Interés",
          "Mercado de crédito"
        ]
      },
      {
        title: "Imputación, valor presente y cálculo económico",
        description: "Ley de imputación, valor presente, WACC, ROIC, ganancia y pérdida económica.",
        subtopics: [
          "Ley de imputación",
          "Valor presente",
          "Cálculo económico"
        ]
      },
      {
        title: "Ley de rendimientos y productividad marginal",
        description: "Producto total, medio, marginal, VPMg, contratación y rendimientos decrecientes.",
        subtopics: [
          "Ley de rendimientos",
          "Valor del producto marginal"
        ]
      },
      {
        title: "Función empresarial y cálculo empresarial",
        description: "Empresario, incertidumbre, riesgo, arbitraje, innovación, ganancia y pérdida.",
        subtopics: [
          "Función empresarial",
          "Empresario",
          "Riesgo e incertidumbre",
          "Cálculo empresarial"
        ]
      },
      {
        title: "Competencia, monopolio y poder de mercado",
        description: "Competencia perfecta, competencia austríaca, monopolio, barreras de entrada y poder de mercado.",
        subtopics: [
          "Competencia",
          "Competencia perfecta",
          "Competencia imperfecta",
          "Monopolio",
          "Poder de mercado",
          "Gobierno y competencia",
          "Precio de mercado"
        ]
      }
    ]
  }
]


function _buildTopicMenus(cards: any[]): ChapterMenu[] {
  const chapters =
    Array.from(
      new Set(
        cards
          .map(card => card.chapter)
          .filter(Boolean)
      )
    )

  return chapters.map(chapter => {
    const chapterCards =
      cards.filter(card => card.chapter === chapter)

    const topics =
      Array.from(
        new Set(
          chapterCards
            .map(card => card.topic || card.subtopic)
            .filter(Boolean)
        )
      )

    return {
      chapter,
      title: chapter,
      groups: topics.map(topic => {
        const topicCards =
          chapterCards.filter(card =>
            (card.topic || card.subtopic) === topic
          )

        const subtopics =
          Array.from(
            new Set(
              topicCards
                .map(card => card.subtopic)
                .filter(Boolean)
            )
          )

        return {
          title: topic,
          description: `${topicCards.length} tarjetas`,
          subtopics
        }
      })
    }
  })
}

export default function FlashcardSelectScreen({
  subject = "histologia",
  onBack,
  onShowSuspended,
  onSelectTopic,
  onSelectSubtopic
}: Props) {


  const storage =
    useMemo(
      () => loadFsrsStorage(),
      []
    )

  const defaultCards =
    useMemo(
      () =>
        filterActiveFlashcards(getDefaultFlashcards())
          .filter(card =>
            cardMatchesSelectedSubject(
              card,
              subject
            )
          ),
      [subject]
    )

  const myCards =
    useMemo(
      () => filterActiveFlashcards(getMyFlashcards()),
      []
    )

  const subjectTitle =
    subject === "proceso-economico-i"
      ? "Proceso Económico I"
      : subject === "filosofia-de-hayek"
        ? "Filosofía de Hayek"
        : subject === "semiologia"
          ? "Semiología"
        : "Histología"

  const subjectDescription =
    subject === "proceso-economico-i"
      ? "Elegí un parcial y repasá por temas."
      : subject === "filosofia-de-hayek"
        ? "Elegí un bloque y repasá sus conceptos principales."
        : subject === "semiologia"
          ? "Elegí un bloque y repasá por temas clínicos."
        : "Elegí un capítulo y repasá por bloques grandes."

  const generatedChapterMenus =
    useMemo(
      () => {
        const chapters =
          Array.from(
            new Set(
              defaultCards
                .map(card => card.chapter)
                .filter(Boolean)
            )
          )

        return chapters.map(chapter => {
          const chapterCards =
            defaultCards.filter(card => card.chapter === chapter)

          if (subject === "proceso-economico-i") {
            const subtopics =
              Array.from(
                new Set(
                  chapterCards
                    .map(card => card.subtopic)
                    .filter(Boolean)
                )
              )

            return {
              chapter,
              title: chapter,
              groups: subtopics.map(subtopic => {
                const subtopicCards =
                  chapterCards.filter(card =>
                    card.subtopic === subtopic
                  )

                return {
                  title: subtopic,
                  description: `${subtopicCards.length} tarjetas`,
                  subtopics: [subtopic]
                }
              })
            }
          }

          if (subject === "filosofia-de-hayek") {
            const topics =
              Array.from(
                new Set(
                  chapterCards
                    .map(card => card.topic || card.subtopic)
                    .filter(Boolean)
                )
              )

            return {
              chapter,
              title: chapter,
              groups: topics.map(topic => {
                const topicCards =
                  chapterCards.filter(card =>
                    (card.topic || card.subtopic) === topic
                  )

                const subtopics =
                  Array.from(
                    new Set(
                      topicCards
                        .map(card => card.subtopic)
                        .filter(Boolean)
                    )
                  )

                return {
                  title: topic,
                  description: `${topicCards.length} tarjetas`,
                  subtopics
                }
              })
            }
          }

          const subtopics =
            Array.from(
              new Set(
                chapterCards
                  .map(card => card.subtopic)
                  .filter(Boolean)
              )
            )

          return {
            chapter,
            title: chapter,
            groups: subtopics.map(subtopic => ({
              title: subtopic,
              description: `${chapterCards.filter(card => card.subtopic === subtopic).length} cartas`,
              subtopics: [subtopic]
            }))
          }
        })
      },
      [subject, defaultCards]
    )

  const availableChapterMenus =
    useMemo(
      () => {
        if (subject === "proceso-economico-i") {
          return generatedChapterMenus
        }

        if (subject === "filosofia-de-hayek") {
          return HAYEK_MENUS.filter(menu =>
            defaultCards.some(card => card.chapter === menu.chapter)
          )
        }

        const manualMenus =
          CHAPTER_MENUS.filter(menu =>
            defaultCards.some(card => card.chapter === menu.chapter)
          )

        if (manualMenus.length === 0) {
          return generatedChapterMenus
        }

        const manualChapters =
          new Set(manualMenus.map(menu => menu.chapter))

        return [
          ...manualMenus,
          ...generatedChapterMenus.filter(
            menu => !manualChapters.has(menu.chapter)
          )
        ]
      },
      [subject, defaultCards, generatedChapterMenus]
    )

  const chapterCourseGroups =
    useMemo<ChapterCourseGroup[]>(
      () => {
        if (subject !== "histologia") {
          return [
            {
              menus: availableChapterMenus
            }
          ]
        }

        const getChapterNumber =
          (chapter: string) =>
            Number(chapter.match(/\d+/)?.[0] || 0)

        const isArticle =
          (chapter: string) =>
            /^Art[ií]culo(?:\s|\b)/i.test(chapter)

        return [
          {
            title: "Citohistología I",
            range: "Capítulos 4–12",
            menus: availableChapterMenus.filter(menu => {
              const chapterNumber =
                getChapterNumber(menu.chapter)

              return (
                !isArticle(menu.chapter) &&
                chapterNumber >= 4 &&
                chapterNumber <= 12
              )
            })
          },
          {
            title: "Citohistología II",
            range: "Capítulo 13 en adelante",
            menus: availableChapterMenus.filter(
              menu =>
                !isArticle(menu.chapter) &&
                getChapterNumber(menu.chapter) >= 13
            )
          },
          {
            title: "Artículos",
            range: "Lecturas complementarias",
            menus: availableChapterMenus.filter(
              menu => isArticle(menu.chapter)
            ),
            emptyMessage:
              "Los artículos aparecerán aquí como decks independientes."
          }
        ].filter(group =>
          group.menus.length > 0 || Boolean(group.emptyMessage)
        )
      },
      [subject, availableChapterMenus]
    )

  const [selectedChapter, setSelectedChapter] =
    useState(
      availableChapterMenus[0]?.chapter || ""
    )

  const [mobileChapterMenu, setMobileChapterMenu] =
    useState<string | null>(null)

  const topicPanelRef =
    useRef<HTMLElement | null>(null)

  const currentMenu =
    availableChapterMenus.find(menu => menu.chapter === selectedChapter) ||
    availableChapterMenus[0]

  const mobileMenu =
    availableChapterMenus.find(menu => menu.chapter === mobileChapterMenu) ||
    null

  useEffect(() => {
    topicPanelRef.current?.scrollTo({
      top: 0,
      behavior: "auto"
    })
  }, [selectedChapter])

  const totalReviews =
    storage.reviews.length

  const suspendedCount =
    loadSuspendedFlashcardIds().length

  const defaultDue =
    getDueCount(
      defaultCards,
      storage.cards
    )

  const myDue =
    getDueCount(
      myCards,
      storage.cards
    )

  const nextDefaultDue =
    getNextDueDate(
      defaultCards.map(card => card.id),
      storage.cards
    )
  return (
    <main
      onWheel={event =>
        relayWheelToPanel(
          event,
          ".flashcard-topic-scroll"
        )
      }
      className="flashcard-book-shell bg-[#09090b]
      px-4
      py-5
      text-white
      sm:px-6
      lg:px-8
      lg:py-6
    ">
      <div className="flashcard-book-frame mx-auto
        max-w-6xl
      ">

        <div className="flashcard-book-topbar pb-3">
<button
          type="button"
          onClick={onBack}
          className="
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-950
            px-4
            py-2
            text-sm
            font-black
            text-zinc-400
            hover:bg-zinc-900
            hover:text-white
          "
        >
          ← Volver
        </button>
</div>

        <section className="flashcard-book-scroll flashcard-chapter-shell
          lg:flex
          lg:flex-col
          lg:overflow-hidden
          rounded-[2rem]
          border
          border-zinc-800
          bg-[#111113]
          p-5
          shadow-2xl
          shadow-black/30
          sm:p-6
          lg:p-6
        ">
          <div className="flashcard-chapter-static shrink-0">
          <div className="
            mb-3
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-start
            lg:justify-between
          ">
            <div>
              <div className="
                mb-2
                flex
                items-center
                gap-3
              ">
                <img
                  src={logoImage}
                  alt="Odontoma"
                  className="
                    h-12
                    w-12
                    object-contain
                  "
                />

                <div>
                  <p className="
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.25em]
                    text-violet-300
                  ">
                    Flashcards FSRS
                  </p>

                  <h1 className={`
                    mt-1
                    text-2xl
                    font-black
                    tracking-tight
                    sm:text-3xl
                    ${subject === "histologia" ? "lg:text-4xl" : "lg:text-2xl"}
                  `}>
                    {subjectTitle}
                  </h1>
                </div>
              </div>

              <p className="
                mt-2
                max-w-2xl
                text-sm
                leading-relaxed
                text-zinc-400
                sm:text-base
              ">
                {subjectDescription}
              </p>
            </div>

            <div className="
              grid
              gap-3
              sm:grid-cols-4
            ">
              <div className="
                rounded-3xl
                border
                border-zinc-800
                bg-zinc-950
                px-5
                py-4
              ">
                <p className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-zinc-500
                ">
                  Reviews
                </p>

                <p className="
                  mt-1
                  text-3xl
                  font-black
                  text-white
                ">
                  {totalReviews}
                </p>
              </div>

              <div className="
                rounded-3xl
                border
                border-zinc-800
                bg-zinc-950
                px-5
                py-4
              ">
                <p className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-zinc-500
                ">
                  Pendientes
                </p>

                <p className="
                  mt-1
                  text-3xl
                  font-black
                  text-white
                ">
                  {defaultDue + myDue}
                </p>
              </div>

              <button
                type="button"
                onClick={onShowSuspended}
                aria-label="Ver tarjetas suspendidas. Las tarjetas suspendidas no aparecen en los repasos."
                className="
                  relative
                  rounded-3xl
                  border
                  border-amber-500/30
                  bg-amber-500/10
                  px-5
                  py-4
                  text-left
                  hover:bg-amber-500/20
                "
              >
                <p className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.12em]
                  text-amber-300
                ">
                  Suspendidas
                </p>

                <p className="
                  mt-1
                  text-3xl
                  font-black
                  text-white
                ">
                  {suspendedCount}
                </p>

              </button>

              <button
                type="button"
                aria-label="Repasar primero las tarjetas vencidas que ya habías estudiado."
                onClick={() =>
                  onSelectTopic(
                    "__reviewed_due",
                    "default"
                  )
                }
                className="
                  relative
                  rounded-3xl
                  border
                  border-sky-500/30
                  bg-sky-500/10
                  px-5
                  py-4
                  text-left
                  hover:bg-sky-500/20
                "
              >
                <p className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.12em]
                  text-sky-300
                ">
                  Due primero
                </p>

                <p className="
                  mt-1
                  text-3xl
                  font-black
                  text-white
                ">
                  Repasar
                </p>

              </button>

            </div>
          </div>

          {defaultDue === 0 && nextDefaultDue && (
            <p className="
              mb-6
              rounded-2xl
              border
              border-emerald-500/20
              bg-emerald-500/10
              px-4
              py-3
              text-sm
              font-black
              text-emerald-300
            ">
              No hay pendientes ahora. Próximo review {formatDuePreview(nextDefaultDue)}.
            </p>
          )}
          </div>


          {availableChapterMenus.length === 0 && (
            <div className="
              rounded-[1.75rem]
              border
              border-sky-500/20
              bg-sky-500/10
              p-6
            ">
              <p className="
                text-xs
                font-black
                uppercase
                tracking-[0.22em]
                text-sky-300
              ">
                Flashcards
              </p>

              <h2 className="
                mt-3
                text-3xl
                font-black
                text-white
              ">
                Espacio creado
              </h2>

              <p className="
                mt-3
                max-w-2xl
                text-sm
                font-semibold
                leading-relaxed
                text-zinc-400
              ">
                Todavía no hay flashcards cargadas para esta materia. Cuando me mandes las tarjetas, las vamos a integrar acá con capítulos y subtemas igual que Histología.
              </p>
            </div>
          )}

          {availableChapterMenus.length > 0 && (
          <div className="flashcard-chapter-workspace
            grid
            min-h-0
            flex-1
            gap-5
            lg:grid-cols-[280px_1fr]
          ">
            <aside className="
              min-h-0
              overflow-hidden
              lg:flex
              lg:flex-col
              rounded-[1.75rem]
              border
              border-zinc-800
              bg-zinc-950
              p-4
            ">
              <p className="
                mb-3
                text-xs
                font-black
                uppercase
                tracking-[0.2em]
                text-zinc-500
              ">
                Capítulos
              </p>

              <div className="
                grid
                min-h-0
                content-start
                gap-2
                sm:max-h-none
                lg:flex-1
                lg:overflow-y-auto
              " data-independent-scroll>
                {chapterCourseGroups.map((courseGroup, groupIndex) => (
                  <div
                    key={courseGroup.title || "chapters"}
                    className="grid gap-2"
                  >
                    {courseGroup.title && (
                      <div className={`
                        px-2
                        pb-1
                        ${groupIndex > 0 ? "mt-5 border-t border-zinc-800 pt-5" : ""}
                      `}>
                        <p className="
                          text-xs
                          font-black
                          uppercase
                          tracking-[0.2em]
                          text-violet-300
                        ">
                          {courseGroup.title}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {courseGroup.range}
                        </p>
                      </div>
                    )}

                    {courseGroup.menus.map(menu => {
                      const chapterCards =
                        defaultCards.filter(card =>
                          card.chapter === menu.chapter
                        )

                      const chapterDue =
                        getDueCount(
                          chapterCards,
                          storage.cards
                        )

                      const isSelected =
                        menu.chapter === currentMenu?.chapter

                      const chapterImage =
                        subject === "histologia"
                          ? HISTOLOGY_CHAPTER_IMAGES.get(menu.chapter)
                          : undefined

                      return (
                        <button
                          key={menu.chapter}
                          type="button"
                          onClick={() => {
                            if (window.innerWidth < 1024) {
                              setMobileChapterMenu(menu.chapter)
                              return
                            }

                            setSelectedChapter(menu.chapter)
                          }}
                          className={`
                            group
                            relative
                            overflow-hidden
                            rounded-2xl
                            border
                            px-4
                            py-4
                            text-left
                            transition-all

                            ${
                              isSelected
                                ? "border-violet-500/40 bg-violet-500/15"
                                : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                            }
                          `}
                        >
                          {chapterImage && (
                            <>
                              <span
                                aria-hidden="true"
                                className="absolute inset-0 bg-cover bg-center opacity-50 transition-transform duration-500 group-hover:scale-105"
                                style={{ backgroundImage: `url(${chapterImage})` }}
                              />
                              <span
                                aria-hidden="true"
                                className={`absolute inset-0 bg-gradient-to-r ${
                                  isSelected
                                    ? "from-black/90 via-violet-950/75 to-black/35"
                                    : "from-black/95 via-black/75 to-black/40"
                                }`}
                              />
                            </>
                          )}

                          <span className="relative z-10 block">
                          <p className="
                            text-xs
                            font-black
                            uppercase
                            tracking-[0.18em]
                            text-zinc-300
                          ">
                            {menu.chapter}
                          </p>

                          <p className="
                            mt-2
                            text-lg
                            font-black
                            text-white
                          ">
                            {menu.title}
                          </p>

                          <p className="
                            mt-2
                            text-sm
                            font-semibold
                            text-zinc-300
                          ">
                            {chapterDue}/{chapterCards.length} pendientes
                          </p>
                          </span>
                        </button>
                      )
                    })}

                    {courseGroup.menus.length === 0 && courseGroup.emptyMessage && (
                      <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/50 px-4 py-4">
                        <p className="text-sm leading-relaxed text-zinc-500">
                          {courseGroup.emptyMessage}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </aside>

            <section
              ref={topicPanelRef}
              className="
              flashcard-topic-scroll
              hidden
              min-h-0
              rounded-[1.75rem]
              border
              border-zinc-800
              bg-zinc-950
              p-4
              lg:block
              lg:overflow-y-auto
            " data-independent-scroll>
              {currentMenu && (
                <>
                  <div className="
                    mb-4
                    flex
                    flex-col
                    gap-3
                    sm:flex-row
                    sm:items-end
                    sm:justify-between
                  ">
                    <div>
                      <p className="
                        text-xs
                        font-black
                        uppercase
                        tracking-[0.2em]
                        text-violet-300
                      ">
                        {currentMenu.chapter}
                      </p>

                      <h2 className="
                        mt-2
                        text-3xl
                        font-black
                        text-white
                      ">
                        {currentMenu.title}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onSelectTopic(
                          currentMenu.chapter,
                          "default"
                        )
                      }
                      className="
                        rounded-2xl
                        bg-violet-500/15
                        px-4
                        py-3
                        text-sm
                        font-black
                        text-violet-200
                        hover:bg-violet-500/25
                      "
                    >
                      Repasar todo el capítulo
                    </button>
                  </div>

                  <div className="
                    grid
                    gap-3
                  ">
                    {currentMenu.groups.map(group => {
                      const groupCards =
                        defaultCards.filter(card =>
                          card.chapter === currentMenu.chapter &&
                          (
                            group.subtopics.includes(card.subtopic) ||
                            group.subtopics.includes(card.topic)
                          )
                        )

                      const groupDue =
                        getDueCount(
                          groupCards,
                          storage.cards
                        )

                      return (
                        <button
                          key={group.title}
                          type="button"
                          disabled={groupCards.length === 0}
                          onClick={() =>
                            onSelectSubtopic(
                              currentMenu.chapter,
                              encodeSubtopicGroup(group.subtopics),
                              "default"
                            )
                          }
                          className={`
                            rounded-[1.5rem]
                            border
                            p-5
                            text-left
                            transition-all

                            ${
                              groupCards.length > 0
                                ? "border-zinc-800 bg-zinc-900 hover:border-violet-500/40 hover:bg-zinc-900/80"
                                : "cursor-not-allowed border-zinc-900 bg-zinc-950 opacity-50"
                            }
                          `}
                        >
                          <div className="
                            flex
                            items-start
                            justify-between
                            gap-4
                          ">
                            <div>
                              <h3 className="
                                text-2xl
                                font-black
                                text-white
                              ">
                                {group.title}
                              </h3>

                              <p className="
                                mt-2
                                text-sm
                                leading-relaxed
                                text-zinc-400
                              ">
                                {group.description}
                              </p>
                            </div>

                            <span className="
                              shrink-0
                              rounded-2xl
                              bg-black/30
                              px-3
                              py-2
                              text-sm
                              font-black
                              text-zinc-300
                            ">
                              {groupDue}/{groupCards.length}
                            </span>
                          </div>

                          <p className="
                            mt-4
                            text-xs
                            font-black
                            uppercase
                            tracking-[0.18em]
                            text-zinc-500
                          ">
                            {subject === "proceso-economico-i" || subject === "filosofia-de-hayek"
                              ? `${groupCards.length} tarjetas incluidas`
                              : `${group.subtopics.length} subtemas incluidos`}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </section>
          </div>
          )}
        </section>
      </div>


      {mobileMenu && (
        <div className="
          fixed
          inset-0
          z-[999]
          flex
          items-center
          justify-center
          bg-black/75
          p-4
          backdrop-blur-sm
          lg:hidden
        ">
          <div className="
            w-full
            max-w-md
            overflow-hidden
            rounded-[2rem]
            border
            border-zinc-800
            bg-[#111113]
            shadow-2xl
            shadow-black/70
          ">
            <div className="
              flex
              items-start
              justify-between
              gap-4
              border-b
              border-zinc-800
              p-5
            ">
              <div>
                <p className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.22em]
                  text-violet-300
                ">
                  {mobileMenu.chapter}
                </p>

                <h2 className="
                  mt-1
                  text-2xl
                  font-black
                  text-white
                ">
                  Elegí qué repasar
                </h2>

                <p className="
                  mt-1
                  text-sm
                  font-bold
                  text-zinc-400
                ">
                  {mobileMenu.title}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMobileChapterMenu(null)}
                className="
                  rounded-full
                  border
                  border-zinc-800
                  bg-zinc-950
                  px-3
                  py-1.5
                  text-sm
                  font-black
                  text-zinc-400
                "
              >
                ✕
              </button>
            </div>

            <div className="
              max-h-[65dvh]
              overflow-y-auto
              p-4
            ">
              <button
                type="button"
                onClick={() => {
                  onSelectTopic(
                    mobileMenu.chapter,
                    "default"
                  )
                  setMobileChapterMenu(null)
                }}
                className="
                  mb-3
                  w-full
                  rounded-2xl
                  border
                  border-violet-500/30
                  bg-violet-500/15
                  px-4
                  py-4
                  text-left
                  text-base
                  font-black
                  text-violet-100
                  active:scale-[0.99]
                "
              >
                Repasar todo el capítulo →
              </button>

              <div className="
                grid
                gap-3
              ">
                {mobileMenu.groups.map(group => {
                  const groupCards =
                    defaultCards.filter(card =>
                      card.chapter === mobileMenu.chapter &&
                      (
                        group.subtopics.includes(card.subtopic) ||
                        group.subtopics.includes(card.topic)
                      )
                    )

                  const groupDue =
                    getDueCount(
                      groupCards,
                      storage.cards
                    )

                  return (
                    <button
                      key={group.title}
                      type="button"
                      disabled={groupCards.length === 0}
                      onClick={() => {
                        onSelectSubtopic(
                          mobileMenu.chapter,
                          encodeSubtopicGroup(group.subtopics),
                          "default"
                        )
                        setMobileChapterMenu(null)
                      }}
                      className={`
                        w-full
                        rounded-2xl
                        border
                        p-4
                        text-left
                        active:scale-[0.99]

                        ${
                          groupCards.length > 0
                            ? "border-zinc-800 bg-zinc-900"
                            : "cursor-not-allowed border-zinc-900 bg-zinc-950 opacity-50"
                        }
                      `}
                    >
                      <div className="
                        flex
                        items-start
                        justify-between
                        gap-3
                      ">
                        <div>
                          <h3 className="
                            text-lg
                            font-black
                            text-white
                          ">
                            {group.title}
                          </h3>

                          <p className="
                            mt-1
                            text-sm
                            font-semibold
                            leading-relaxed
                            text-zinc-400
                          ">
                            {group.description}
                          </p>
                        </div>

                        <span className="
                          shrink-0
                          rounded-xl
                          bg-black/35
                          px-2.5
                          py-1.5
                          text-xs
                          font-black
                          text-zinc-200
                        ">
                          {groupDue}/{groupCards.length}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}
