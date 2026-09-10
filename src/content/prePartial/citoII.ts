import type { Flashcard } from "@/content/flashcards/histologia/cards"
import { createManualQuizBank, type ManualQuizSeed } from "@/content/histologia/manualQuiz"

type Fact = {
  id: number
  question: string
  answer: string
}

const facts: Fact[] = [
  {
    "id": 1,
    "question": "¿Cuál es la célula más abundante de la epidermis y qué proteína produce principalmente?",
    "answer": "Queratinocito; produce queratina."
  },
  {
    "id": 2,
    "question": "Célula epidérmica derivada de la cresta neural, localizada en el estrato basal y encargada de producir melanina.",
    "answer": "Melanocito."
  },
  {
    "id": 3,
    "question": "¿Qué célula epidérmica cumple función de presentación de antígenos y tiene aspecto dendrítico?",
    "answer": "Célula de Langerhans."
  },
  {
    "id": 4,
    "question": "Célula del estrato basal relacionada con la sensibilidad cutánea.",
    "answer": "Célula de Merkel."
  },
  {
    "id": 5,
    "question": "¿Cuáles son los dos anexos cutáneos relacionados con la unidad pilosebácea?",
    "answer": "Folículo piloso y glándula sebácea."
  },
  {
    "id": 6,
    "question": "Compare glándulas sudoríparas ecrinas y apocrinas según función y localización.",
    "answer": "Ecrinas: termorregulación. Apocrinas: regiones específicas como axila, areola y región anogenital; asociadas también a sudor emocional."
  },
  {
    "id": 7,
    "question": "Mencione funciones del sistema tegumentario.",
    "answer": "Barrera protectora, regulación térmica, sensibilidad, función inmunitaria, función endocrina y excreción glandular."
  },
  {
    "id": 8,
    "question": "Ordene los estratos de la epidermis desde profundo hacia superficial.",
    "answer": "Basal, espinoso, granuloso, lúcido —solo piel gruesa— y córneo."
  },
  {
    "id": 9,
    "question": "¿Qué estrato contiene células madre epidérmicas y se apoya sobre la membrana basal?",
    "answer": "Estrato basal."
  },
  {
    "id": 10,
    "question": "¿Qué estrato posee queratinocitos con evaginaciones unidas por desmosomas?",
    "answer": "Estrato espinoso."
  },
  {
    "id": 11,
    "question": "¿Qué estrato contiene gránulos de queratohialina?",
    "answer": "Estrato granuloso."
  },
  {
    "id": 12,
    "question": "¿Qué caracteriza al estrato córneo?",
    "answer": "Células anucleadas llenas de queratina."
  },
  {
    "id": 13,
    "question": "¿Cuáles son los dos factores principales que forman la barrera epidérmica contra el agua?",
    "answer": "Depósito de proteínas insolubles en la cara interna de la membrana plasmática y capa lipídica externa."
  },
  {
    "id": 14,
    "question": "La descamación del estrato córneo depende de la degradación de los desmosomas.",
    "answer": "Verdadero."
  },
  {
    "id": 15,
    "question": "¿Cuál es la diferencia principal entre piel gruesa y piel delgada?",
    "answer": "La piel gruesa tiene epidermis más gruesa, sobre todo estrato córneo, carece de folículos pilosos y se encuentra en palmas y plantas. La piel delgada tiene epidermis más delgada y posee folículos pilosos."
  },
  {
    "id": 16,
    "question": "¿Cuáles son las capas principales de la piel?",
    "answer": "Epidermis y dermis. La hipodermis está profunda a la dermis y contiene tejido adiposo."
  },
  {
    "id": 17,
    "question": "¿Cómo se llaman las dos capas de la dermis?",
    "answer": "Dermis papilar y dermis reticular."
  },
  {
    "id": 18,
    "question": "¿Qué capa de la dermis contiene tejido conjuntivo laxo, vasos sanguíneos y terminaciones nerviosas?",
    "answer": "Dermis papilar."
  },
  {
    "id": 19,
    "question": "¿Qué capa de la dermis contiene haces gruesos de colágeno y líneas de tensión?",
    "answer": "Dermis reticular."
  },
  {
    "id": 20,
    "question": "Las papilas dérmicas son evaginaciones del tejido epitelial hacia la dermis.",
    "answer": "Falso. Son evaginaciones del tejido conjuntivo dérmico."
  },
  {
    "id": 21,
    "question": "¿Qué estructuras aumentan la unión entre epidermis y dermis?",
    "answer": "Papilas dérmicas y crestas epidérmicas/interpapilares."
  },
  {
    "id": 22,
    "question": "Mencione las cuatro capas generales de la pared del tubo digestivo.",
    "answer": "Mucosa, submucosa, muscular externa y serosa/adventicia."
  },
  {
    "id": 23,
    "question": "¿Cuáles son los tres componentes de la mucosa digestiva?",
    "answer": "Epitelio de revestimiento, lámina propia y muscular de la mucosa."
  },
  {
    "id": 24,
    "question": "La mucosa digestiva cumple funciones de protección, absorción y secreción.",
    "answer": "Verdadero."
  },
  {
    "id": 25,
    "question": "¿Qué plexo nervioso se encuentra en la submucosa?",
    "answer": "Plexo de Meissner."
  },
  {
    "id": 26,
    "question": "¿Qué plexo se localiza entre las capas de la muscular externa?",
    "answer": "Plexo mientérico o de Auerbach."
  },
  {
    "id": 27,
    "question": "Los esfínteres digestivos se forman por engrosamiento de la serosa.",
    "answer": "Falso. Se forman por engrosamiento de la capa circular de músculo liso."
  },
  {
    "id": 28,
    "question": "¿Cómo se llama la mezcla líquida y pulposa formada en el estómago tras mezclar el bolo con secreciones gástricas?",
    "answer": "Quimo."
  },
  {
    "id": 29,
    "question": "¿Qué glándulas gástricas producen el jugo gástrico?",
    "answer": "Glándulas fúndicas o gástricas propias."
  },
  {
    "id": 30,
    "question": "Mencione componentes principales del jugo gástrico.",
    "answer": "Ácido clorhídrico, pepsina, factor intrínseco y moco."
  },
  {
    "id": 31,
    "question": "¿Qué células gástricas secretan ácido clorhídrico y factor intrínseco?",
    "answer": "Células parietales."
  },
  {
    "id": 32,
    "question": "¿Qué células gástricas poseen gránulos de zimógeno y secretan pepsinógeno?",
    "answer": "Células principales."
  },
  {
    "id": 33,
    "question": "¿Qué estructuras aumentan la superficie de absorción en el intestino delgado?",
    "answer": "Pliegues circulares, vellosidades y microvellosidades."
  },
  {
    "id": 34,
    "question": "¿Qué epitelio reviste la mucosa del intestino delgado?",
    "answer": "Epitelio cilíndrico simple."
  },
  {
    "id": 35,
    "question": "¿Qué células intestinales absorben y transportan sustancias hacia vasos sanguíneos o linfáticos?",
    "answer": "Enterocitos."
  },
  {
    "id": 36,
    "question": "¿Qué células intestinales secretan mucina?",
    "answer": "Células caliciformes."
  },
  {
    "id": 37,
    "question": "¿Qué células secretan sustancias antimicrobianas y modulan la inmunidad innata?",
    "answer": "Células de Paneth."
  },
  {
    "id": 38,
    "question": "¿Qué células producen hormonas endocrinas y paracrinas gastrointestinales?",
    "answer": "Células enteroendocrinas."
  },
  {
    "id": 39,
    "question": "¿Qué células cubren placas de Peyer y participan en el transporte de antígenos?",
    "answer": "Células M."
  },
  {
    "id": 40,
    "question": "¿Qué glándulas submucosas son características del duodeno?",
    "answer": "Glándulas de Brunner."
  },
  {
    "id": 41,
    "question": "¿Qué secretan las glándulas de Brunner?",
    "answer": "Secreción alcalina con moco, glucoproteínas neutras y alcalinas, bicarbonato, y células con características de producción de zimógeno."
  },
  {
    "id": 42,
    "question": "¿Cuál es la principal característica histológica del duodeno?",
    "answer": "Glándulas submucosas de Brunner."
  },
  {
    "id": 43,
    "question": "¿Cuál es la principal característica histológica del íleon?",
    "answer": "Placas de Peyer."
  },
  {
    "id": 44,
    "question": "¿Cuál es una característica importante del intestino grueso en comparación con el intestino delgado?",
    "answer": "Carece de vellosidades y posee abundantes glándulas intestinales con células caliciformes."
  },
  {
    "id": 45,
    "question": "¿Cuáles son regiones del intestino grueso?",
    "answer": "Ciego, colon, recto y conducto anal."
  },
  {
    "id": 46,
    "question": "Sobre intestino grueso, mencione características correctas.",
    "answer": "Contiene glándulas intestinales, absorbe agua y electrolitos, carece de vellosidades y posee abundantes células caliciformes."
  },
  {
    "id": 47,
    "question": "¿Cuáles son los tres tipos de mucosa de la cavidad bucal?",
    "answer": "Masticatoria, de revestimiento y especializada."
  },
  {
    "id": 48,
    "question": "¿Dónde se encuentra la mucosa masticatoria y qué epitelio posee?",
    "answer": "Encía y paladar duro; epitelio plano estratificado queratinizado o paraqueratinizado."
  },
  {
    "id": 49,
    "question": "¿Qué mucosa se relaciona con el gusto?",
    "answer": "Mucosa especializada de la superficie dorsal de la lengua."
  },
  {
    "id": 50,
    "question": "¿Cuáles papilas linguales no tienen botones gustativos?",
    "answer": "Papilas filiformes."
  },
  {
    "id": 51,
    "question": "¿Cuáles papilas linguales sí pueden contener botones gustativos?",
    "answer": "Fungiformes, caliciformes y foliadas."
  },
  {
    "id": 52,
    "question": "La superficie dorsal de la lengua se divide por una depresión en forma de V llamada surco terminal.",
    "answer": "Verdadero."
  },
  {
    "id": 53,
    "question": "¿Qué característica muscular permite la gran movilidad de la lengua?",
    "answer": "Músculo estriado organizado en fascículos en tres planos."
  },
  {
    "id": 54,
    "question": "¿Qué tejidos especializados forman el diente?",
    "answer": "Esmalte, dentina, cemento y pulpa."
  },
  {
    "id": 55,
    "question": "¿Qué es la predentina?",
    "answer": "Matriz orgánica recién sintetizada por odontoblastos, aún no mineralizada."
  },
  {
    "id": 56,
    "question": "¿Qué espacio del diente está ocupado por la pulpa dental?",
    "answer": "Cavidad o cámara pulpar."
  },
  {
    "id": 57,
    "question": "¿Cuál es la secuencia del desarrollo dental?",
    "answer": "Lámina dental, brote, casquete y campana."
  },
  {
    "id": 58,
    "question": "¿Qué tejidos dentales derivan del ectomesenquima asociado a células de la cresta neural?",
    "answer": "Dentina, cemento, ligamento periodontal y hueso alveolar."
  },
  {
    "id": 59,
    "question": "El cemento es vascular y tiene alta concentración de flúor.",
    "answer": "Falso. El cemento es avascular."
  },
  {
    "id": 60,
    "question": "Mencione funciones del periodonto.",
    "answer": "Adhesión dental, remodelación ósea, propiocepción, erupción, irrigación e inervación."
  },
  {
    "id": 61,
    "question": "El epitelio de unión se fija al diente mediante material tipo lámina basal y hemidesmosomas.",
    "answer": "Verdadero."
  },
  {
    "id": 62,
    "question": "¿Cuál es la unidad secretora básica de una glándula salival?",
    "answer": "Sialona."
  },
  {
    "id": 63,
    "question": "¿Qué glándula salival mayor es la más grande y de secreción serosa?",
    "answer": "Parótida."
  },
  {
    "id": 64,
    "question": "¿Qué glándula salival mayor tiene conducto de Wharton?",
    "answer": "Submandibular."
  },
  {
    "id": 65,
    "question": "¿Qué glándula salival mayor está debajo de la lengua y posee varios conductos pequeños?",
    "answer": "Sublingual."
  },
  {
    "id": 66,
    "question": "¿Qué función tienen las células mioepiteliales en glándulas salivales?",
    "answer": "Contraerse para ayudar a expulsar la secreción hacia los conductos."
  },
  {
    "id": 67,
    "question": "Mencione funciones de la saliva.",
    "answer": "Humedece la mucosa bucal, inicia digestión de hidratos de carbono por amilasa, controla microbiota, participa en inmunidad y amortigua el pH."
  },
  {
    "id": 68,
    "question": "Los conductos intercalados están revestidos por epitelio cilíndrico estratificado.",
    "answer": "Falso. Están revestidos principalmente por epitelio cúbico simple."
  },
  {
    "id": 69,
    "question": "¿Qué órgano glandular es el más grande del organismo, está cubierto por cápsula de Glisson y participa en almacenamiento, metabolismo y distribución de sustancias?",
    "answer": "Hígado."
  },
  {
    "id": 70,
    "question": "¿Qué estructura almacena y concentra la bilis?",
    "answer": "Vesícula biliar."
  },
  {
    "id": 71,
    "question": "¿Qué órgano retroperitoneal tiene función exocrina y endocrina?",
    "answer": "Páncreas."
  },
  {
    "id": 72,
    "question": "¿Qué secreción exocrina produce el hígado?",
    "answer": "Bilis."
  },
  {
    "id": 73,
    "question": "¿Qué transporta la bilis hacia el intestino para su eliminación?",
    "answer": "Productos de desecho y productos degradados."
  },
  {
    "id": 74,
    "question": "¿Cuál es el abastecimiento sanguíneo dual del hígado?",
    "answer": "Vena porta hepática y arteria hepática."
  },
  {
    "id": 75,
    "question": "¿Qué vaso aporta cerca del 75% de la irrigación hepática?",
    "answer": "Vena porta hepática."
  },
  {
    "id": 76,
    "question": "¿Qué vaso aporta sangre oxigenada al hígado?",
    "answer": "Arteria hepática."
  },
  {
    "id": 77,
    "question": "¿Qué estructuras forman la tríada portal?",
    "answer": "Rama de la vena porta, rama de la arteria hepática y conducto biliar."
  },
  {
    "id": 78,
    "question": "¿Cuál es la dirección del flujo de bilis respecto a la sangre hepática?",
    "answer": "Flujo opuesto."
  },
  {
    "id": 79,
    "question": "¿Qué células forman la mayor parte del parénquima hepático y realizan la mayoría de funciones fisiológicas?",
    "answer": "Hepatocitos."
  },
  {
    "id": 80,
    "question": "¿Qué células hepáticas pertenecen al sistema fagocítico mononuclear?",
    "answer": "Células de Kupffer."
  },
  {
    "id": 81,
    "question": "¿Qué función cumplen las células de Kupffer?",
    "answer": "Fagocitan bacterias, eritrocitos dañados/envejecidos y desechos en los sinusoides hepáticos."
  },
  {
    "id": 82,
    "question": "¿Qué células almacenan vitamina A en el espacio perisinusoidal?",
    "answer": "Células de Ito o células hepáticas estrelladas."
  },
  {
    "id": 83,
    "question": "¿Qué estructura se encuentra entre el endotelio sinusoidal y los hepatocitos?",
    "answer": "Espacio de Disse o espacio perisinusoidal."
  },
  {
    "id": 84,
    "question": "¿Qué célula hepática almacena vitamina A y puede participar en fibrosis hepática?",
    "answer": "Célula hepática estrellada o célula de Ito."
  },
  {
    "id": 85,
    "question": "¿Cómo se llama el sistema de conductos por donde fluye y se modifica la bilis?",
    "answer": "Árbol biliar."
  },
  {
    "id": 86,
    "question": "¿Cómo se llaman las células epiteliales que revisten los conductos biliares?",
    "answer": "Colangiocitos."
  },
  {
    "id": 87,
    "question": "Relacione la unidad hepática con su descripción: * Vénula hepática terminal en el centro. * Conducto biliar interlobulillar como eje. * Unidad funcional dividida en zonas 1, 2 y 3.",
    "answer": "Lobulillo clásico; lobulillo portal; acino hepático."
  },
  {
    "id": 88,
    "question": "¿Qué zona del acino hepático recibe primero sangre oxigenada y nutrientes?",
    "answer": "Zona 1."
  },
  {
    "id": 89,
    "question": "¿Qué zona del acino hepático es más vulnerable a isquemia y lesiones tóxicas?",
    "answer": "Zona 3."
  },
  {
    "id": 90,
    "question": "¿Qué hormona pancreática disminuye la glucosa sanguínea?",
    "answer": "Insulina."
  },
  {
    "id": 91,
    "question": "¿Qué hormona pancreática aumenta la glucosa sanguínea?",
    "answer": "Glucagón."
  },
  {
    "id": 92,
    "question": "¿Qué estructuras forman la porción endocrina del páncreas?",
    "answer": "Islotes de Langerhans."
  },
  {
    "id": 93,
    "question": "¿Qué células componen los islotes pancreáticos?",
    "answer": "Células alfa, beta, delta y PP."
  },
  {
    "id": 94,
    "question": "¿Qué células pancreáticas secretan insulina?",
    "answer": "Células beta."
  },
  {
    "id": 95,
    "question": "¿Qué células pancreáticas secretan glucagón?",
    "answer": "Células alfa."
  },
  {
    "id": 96,
    "question": "¿Cuál es la principal diferencia entre páncreas exocrino y endocrino?",
    "answer": "El exocrino secreta enzimas digestivas hacia conductos; el endocrino secreta hormonas hacia la sangre."
  },
  {
    "id": 97,
    "question": "¿Qué células forman las unidades secretoras del páncreas exocrino?",
    "answer": "Células acinares."
  },
  {
    "id": 98,
    "question": "¿Qué células se localizan al inicio del sistema de conductos pancreáticos?",
    "answer": "Células centroacinares."
  },
  {
    "id": 99,
    "question": "La producción pancreática exocrina incluye precursores enzimáticos digestivos.",
    "answer": "Verdadero."
  },
  {
    "id": 100,
    "question": "¿Qué función general tienen los islotes de Langerhans?",
    "answer": "Producir hormonas endocrinas que regulan principalmente la glucosa sanguínea."
  }
]

function topicFor(id: number) {
  if (id <= 21) return "Sistema tegumentario"
  if (id <= 46) return "Tubo digestivo"
  if (id <= 68) return "Cavidad bucal, dientes y glándulas salivales"
  return "Hígado, vías biliares y páncreas"
}

/**
 * These are deliberately isolated from the standard flashcard and quiz banks.
 * They are intended only for a short, high-yield pre-exam review.
 */
const directRecallPrompts: Record<number, string> = {
  14: "¿De qué depende la descamación fisiológica del estrato córneo?",
  20: "¿De qué tejido proceden las papilas dérmicas?",
  24: "¿Qué tres funciones generales cumple la mucosa digestiva?",
  27: "¿Qué capa se engrosa para formar los esfínteres digestivos?",
  52: "¿Cómo se llama la depresión en V que divide la superficie dorsal de la lengua?",
  59: "¿Cómo es la vascularización del cemento dental?",
  61: "¿Mediante qué estructuras se fija el epitelio de unión al diente?",
  68: "¿Qué epitelio reviste principalmente los conductos intercalados salivales?",
  99: "¿Qué tipo de sustancias incluye la secreción exocrina pancreática?"
}

const directRecallAnswers: Record<number, string> = {
  14: "La degradación de los desmosomas.",
  24: "Protección, absorción y secreción.",
  52: "Surco terminal.",
  61: "Material tipo lámina basal y hemidesmosomas.",
  99: "Precursores enzimáticos digestivos."
}

const categoryAnswers: Record<string, string[]> = {
  "Sistema tegumentario": [
    "Queratinocito; produce queratina.",
    "Melanocito.",
    "Célula de Langerhans.",
    "Célula de Merkel.",
    "Estrato basal.",
    "Estrato espinoso.",
    "Estrato granuloso.",
    "Dermis papilar.",
    "Dermis reticular.",
    "Papilas dérmicas y crestas epidérmicas/interpapilares."
  ],
  "Tubo digestivo": [
    "Plexo de Meissner.",
    "Plexo mientérico o de Auerbach.",
    "Quimo.",
    "Células parietales.",
    "Células principales.",
    "Enterocitos.",
    "Células caliciformes.",
    "Células de Paneth.",
    "Células enteroendocrinas.",
    "Células M.",
    "Glándulas de Brunner.",
    "Placas de Peyer."
  ],
  "Cavidad bucal, dientes y glándulas salivales": [
    "Mucosa masticatoria.",
    "Mucosa especializada.",
    "Papilas filiformes.",
    "Papilas fungiformes, caliciformes y foliadas.",
    "Predentina.",
    "Cavidad o cámara pulpar.",
    "Sialona.",
    "Parótida.",
    "Submandibular.",
    "Sublingual.",
    "Células mioepiteliales."
  ],
  "Hígado, vías biliares y páncreas": [
    "Hígado.",
    "Vesícula biliar.",
    "Páncreas.",
    "Vena porta hepática.",
    "Arteria hepática.",
    "Hepatocitos.",
    "Células de Kupffer.",
    "Células de Ito o células hepáticas estrelladas.",
    "Espacio de Disse o espacio perisinusoidal.",
    "Colangiocitos.",
    "Zona 1.",
    "Zona 3.",
    "Insulina.",
    "Glucagón.",
    "Células alfa.",
    "Células beta.",
    "Células acinares.",
    "Células centroacinares."
  ]
}

// For statements and lists, distractors must preserve their length and grammar.
// Each variation changes a nearby histologic feature, not the entire concept.
const closeMutations: Record<string, Array<Array<[string, string]>>> = {
  "Sistema tegumentario": [
    [["queratina", "melanina"], ["epidermis", "dermis"], ["basal", "granuloso"]],
    [["ecrinas", "apocrinas"], ["termorregulación", "secreción sebácea"], ["palmas y plantas", "axila y región anogenital"]],
    [["dermis papilar", "dermis reticular"], ["tejido conjuntivo laxo", "haces gruesos de colágeno"], ["córneo", "espinoso"]],
    [["folículos pilosos", "glándulas sebáceas"], ["piel gruesa", "piel delgada"], ["palmas y plantas", "axila y región anogenital"], ["epidermis", "hipodermis"]]
  ],
  "Tubo digestivo": [
    [["alcalina", "ácida"], ["bicarbonato", "ácido clorhídrico"], ["moco", "pepsinógeno"], ["zimógeno", "hormonas peptídicas"]],
    [["Meissner", "Auerbach"], ["submucosa", "muscular externa"], ["vellosidades", "glándulas intestinales"], ["duodeno", "íleon"]],
    [["parietales", "principales"], ["ácido clorhídrico", "pepsinógeno"], ["células caliciformes", "enterocitos"], ["Paneth", "enteroendocrinas"]],
    [["mucosa", "submucosa"], ["serosa", "adventicia"], ["absorción", "motilidad"], ["secreción", "propulsión"]]
  ],
  "Cavidad bucal, dientes y glándulas salivales": [
    [["queratinizado", "no queratinizado"], ["paladar duro", "paladar blando"], ["filiformes", "fungiformes"], ["caliciformes", "foliadas"]],
    [["dentina", "esmalte"], ["cemento", "pulpa"], ["odontoblastos", "ameloblastos"], ["avascular", "vascular"]],
    [["Parótida", "Submandibular"], ["Wharton", "Stenon"], ["cúbico simple", "cilíndrico estratificado"], ["mioepiteliales", "enteroendocrinas"]],
    [["lengua", "paladar"], ["pulpa", "dentina"], ["esmalte", "cemento"], ["periodontal", "alveolar"]]
  ],
  "Hígado, vías biliares y páncreas": [
    [["vena porta", "arteria hepática"], ["arteria hepática", "vena porta"], ["opuesto", "paralelo"], ["Zona 1", "Zona 3"]],
    [["Kupffer", "Ito"], ["vitamina A", "glucógeno"], ["Disse", "conducto biliar"], ["colangiocitos", "hepatocitos"]],
    [["insulina", "glucagón"], ["beta", "alfa"], ["exocrino", "endocrino"], ["conductos", "capilares"]],
    [["hígado", "páncreas"], ["bilis", "jugo pancreático"], ["sinusoides", "canalículos biliares"], ["isquemia", "hiperglucemia"]]
  ]
}

function closeStatementDistractors(fact: Fact) {
  if (fact.answer.length < 45) return []

  const variations = closeMutations[topicFor(fact.id)] ?? []
  const replacements = variations.flat()
  const changed = replacements
    .map(([from, to]) => fact.answer.replace(new RegExp(from, "gi"), to))
    .filter(option => option !== fact.answer)

  return changed
    .filter(option => option !== fact.answer)
    .filter((option, index, list) => list.indexOf(option) === index)
    .slice(0, 3)
}

function distinctDistractors(fact: Fact) {
  const corrected = trueFalseDistractors[fact.id]
  if (corrected) return corrected

  const authored = authoredDistractors[fact.id]
  if (authored) return authored

  const custom = customDistractors[fact.id]
  if (custom) return custom

  const close = closeStatementDistractors(fact)
  if (close.length === 3) return close as [string, string, string]

  const pool = categoryAnswers[topicFor(fact.id)] ?? []
  const selected = pool.filter(answer => answer !== fact.answer).slice(0, 3)
  while (selected.length < 3) selected.push("No corresponde a la estructura o función consultada.")
  return selected as [string, string, string]
}

// Authored question-by-question alternatives. These deliberately do not pull
// from a generic answer pool: every option is a nearby, plausible confusion.
const authoredDistractors: Record<number, [string, string, string]> = {
  1: ["Melanocito; produce melanina.", "Célula de Langerhans; presenta antígenos.", "Célula de Merkel; participa en mecanorrecepción."],
  2: ["Célula de Langerhans derivada de médula ósea y presentadora de antígenos.", "Queratinocito basal que transfiere queratina a células vecinas.", "Célula de Merkel asociada a terminaciones nerviosas sensitivas."],
  3: ["Melanocito del estrato basal que sintetiza melanina.", "Célula de Merkel basal que interviene en sensibilidad táctil.", "Queratinocito espinoso unido por desmosomas."],
  4: ["Melanocito basal encargado de la síntesis de melanina.", "Célula de Langerhans suprabasal que presenta antígenos.", "Queratinocito granular que forma gránulos de queratohialina."],
  5: ["Folículo piloso y glándula sudorípara ecrina.", "Glándula sebácea y glándula sudorípara apocrina.", "Músculo erector del pelo y glándula sudorípara ecrina."],
  6: ["Ecrinas: secreción oleosa hacia el folículo piloso; apocrinas: termorregulación general.", "Ecrinas: axila y región anogenital; apocrinas: palmas y plantas para termorregulación.", "Ecrinas: secreción asociada al folículo; apocrinas: secreción acuosa en toda la superficie corporal."],
  7: ["Barrera protectora, producción de células sanguíneas y digestión de lípidos.", "Regulación térmica, filtración renal y producción de bilis.", "Sensibilidad, locomoción, almacenamiento de glucógeno y hematopoyesis."],
  8: ["Basal, espinoso, lúcido, granuloso y córneo.", "Espinoso, basal, granuloso, lúcido y córneo.", "Basal, granuloso, espinoso, lúcido y córneo."],
  9: ["Estrato espinoso, apoyado sobre la membrana basal.", "Estrato granuloso, con células madre epidérmicas.", "Estrato lúcido, con células madre epidérmicas."],
  10: ["Estrato basal, con queratinocitos unidos por desmosomas prominentes.", "Estrato granuloso, con evaginaciones unidas por hemidesmosomas.", "Estrato córneo, con queratinocitos nucleados unidos por desmosomas."],
  11: ["Estrato espinoso, con gránulos de queratohialina.", "Estrato basal, con gránulos de queratohialina.", "Estrato lúcido, con gránulos de queratohialina."],
  12: ["Células nucleadas con gránulos de queratohialina.", "Células cúbicas con abundantes melanocitos.", "Células dendríticas con función de presentación antigénica."],
  13: ["Depósito de proteínas insolubles en la cara externa y capa lipídica interna.", "Depósito de queratohialina interna y capa lipídica externa.", "Depósito de proteínas solubles internas y capa lipídica externa."],
  15: ["Piel gruesa con folículos pilosos en axila; piel delgada sin folículos en palmas.", "Piel gruesa con estrato córneo delgado en palmas; piel delgada con estrato córneo grueso.", "Piel gruesa definida por dermis reticular más delgada y glándulas sebáceas."],
  16: ["Epidermis, hipodermis y dermis; la dermis contiene tejido adiposo.", "Dermis y serosa; la epidermis se ubica profunda a la hipodermis.", "Epidermis y mucosa; la hipodermis forma parte de la epidermis."],
  17: ["Dermis basal y dermis espinosa.", "Dermis granulosa y dermis córnea.", "Dermis mucosa y dermis submucosa."],
  18: ["Dermis reticular, con tejido conjuntivo laxo y capilares superficiales.", "Hipodermis, con haces de colágeno y terminaciones nerviosas superficiales.", "Estrato basal, con tejido conjuntivo laxo y vasos sanguíneos."],
  19: ["Dermis papilar, con haces gruesos de colágeno y líneas de tensión.", "Hipodermis, con haces de colágeno y líneas de tensión.", "Estrato espinoso, con haces gruesos de colágeno y líneas de tensión."],
  21: ["Papilas dérmicas y glándulas sebáceas.", "Crestas epidérmicas y glándulas sudoríparas.", "Folículos pilosos y dermis reticular." ]
  ,22: ["Mucosa, muscular de la mucosa, submucosa y serosa.", "Epitelio, lámina propia, muscular externa y adventicia.", "Mucosa, subserosa, muscular interna y serosa."],
  23: ["Epitelio de revestimiento, submucosa y muscular externa.", "Epitelio de revestimiento, lámina propia y muscular externa.", "Lámina propia, plexo de Meissner y muscular de la mucosa."],
  25: ["Plexo mientérico de Auerbach, entre capas musculares.", "Plexo subepitelial, en la lámina propia.", "Plexo celíaco, en la serosa."],
  26: ["Plexo de Meissner, en la submucosa.", "Plexo subepitelial, en la lámina propia.", "Plexo celíaco, en la adventicia."],
  28: ["Quilo.", "Bolo alimenticio.", "Jugo gástrico."],
  29: ["Glándulas cardiales.", "Glándulas pilóricas.", "Glándulas de Brunner."],
  30: ["Ácido clorhídrico, pepsinógeno, moco y gastrina.", "Bicarbonato, pepsina, factor intrínseco y moco.", "Ácido clorhídrico, amilasa, factor intrínseco y moco."],
  31: ["Células principales, que secretan pepsinógeno.", "Células mucosas del cuello, que secretan moco.", "Células enteroendocrinas, que secretan gastrina."],
  32: ["Células parietales, que secretan HCl y factor intrínseco.", "Células mucosas del cuello, que secretan mucina.", "Células enteroendocrinas, que secretan hormonas."],
  33: ["Vellosidades, criptas y glándulas de Brunner.", "Microvellosidades, placas de Peyer y criptas.", "Pliegues longitudinales, vellosidades y haustras."],
  34: ["Epitelio plano estratificado queratinizado.", "Epitelio cúbico simple.", "Epitelio cilíndrico pseudoestratificado."],
  35: ["Células caliciformes, que secretan mucina.", "Células de Paneth, que secretan defensinas.", "Células enteroendocrinas, que secretan hormonas."],
  36: ["Enterocitos, que absorben nutrientes.", "Células de Paneth, que secretan péptidos antimicrobianos.", "Células M, que transportan antígenos."],
  37: ["Células caliciformes, que producen mucina.", "Células M, que transportan antígenos hacia placas de Peyer.", "Enterocitos, que absorben nutrientes."],
  38: ["Células de Paneth, que secretan sustancias antimicrobianas.", "Células caliciformes, que secretan mucina.", "Enterocitos, que transportan nutrientes."],
  39: ["Células de Paneth, ubicadas en criptas intestinales.", "Células caliciformes, secretoras de mucina.", "Enterocitos, con microvellosidades."],
  40: ["Glándulas pilóricas.", "Glándulas fúndicas.", "Glándulas de Lieberkühn."],
  41: ["Secreción ácida con pepsinógeno, glucoproteínas neutras, ácido clorhídrico y células con características parietales.", "Secreción alcalina con moco, glucoproteínas ácidas, bicarbonato y células con características de producción hormonal.", "Secreción alcalina con moco, glucoproteínas neutras y alcalinas, ácido clorhídrico y células con características de producción de zimógeno."],
  42: ["Vellosidades altas con abundantes placas de Peyer.", "Glándulas fúndicas profundas en la mucosa.", "Ausencia de vellosidades con criptas rectas."],
  43: ["Glándulas submucosas de Brunner.", "Vellosidades más largas que en yeyuno.", "Criptas gástricas profundas."],
  44: ["Posee vellosidades cortas y pocas células caliciformes.", "Posee glándulas de Brunner en la submucosa.", "Presenta placas de Peyer en toda la pared."],
  45: ["Duodeno, yeyuno, íleon y colon.", "Ciego, yeyuno, colon y recto.", "Colon, hígado, recto y conducto anal."],
  46: ["Presenta vellosidades y absorbe principalmente nutrientes.", "Carece de glándulas intestinales y secreta HCl.", "Posee glándulas de Brunner y placas de Peyer como rasgo dominante."]
  ,47: ["Masticatoria, glandular y especializada.", "De revestimiento, serosa y especializada.", "Masticatoria, respiratoria y gustativa."],
  48: ["Paladar blando y mucosa alveolar; epitelio plano estratificado no queratinizado.", "Encía y mejilla; epitelio cilíndrico simple.", "Lengua ventral y paladar duro; epitelio pseudoestratificado."],
  49: ["Mucosa masticatoria de la encía y paladar duro.", "Mucosa de revestimiento de mejillas y labios.", "Mucosa glandular de la submucosa lingual."],
  50: ["Papilas fungiformes.", "Papilas caliciformes.", "Papilas foliadas."],
  51: ["Filiformes, fungiformes y caliciformes.", "Filiformes, foliadas y circunvaladas exclusivamente.", "Fungiformes, filiformes y foliadas."],
  53: ["Músculo liso organizado en dos planos perpendiculares.", "Músculo estriado organizado en fascículos en un solo plano.", "Músculo cardíaco organizado en fascículos en tres planos."],
  54: ["Esmalte, dentina, ligamento periodontal y pulpa.", "Esmalte, cemento, hueso alveolar y pulpa.", "Dentina, cemento, encía y pulpa."],
  55: ["Matriz mineralizada formada por ameloblastos.", "Matriz orgánica mineralizada formada por cementoblastos.", "Matriz acelular del esmalte antes de la erupción."],
  56: ["Conducto radicular.", "Espacio periodontal.", "Cámara de esmalte."],
  57: ["Lámina dental, casquete, brote y campana.", "Brote, lámina dental, campana y casquete.", "Lámina dental, brote, campana y casquete."],
  58: ["Esmalte, dentina, cemento y pulpa dental.", "Dentina, esmalte, ligamento periodontal y hueso alveolar.", "Cemento, pulpa, esmalte y epitelio de unión."],
  60: ["Amelogénesis, secreción salival, gusto y termorregulación.", "Formación de esmalte, digestión de carbohidratos y fonación.", "Producción de dentina, secreción de bilis y propiocepción."],
  62: ["Acino seroso.", "Conducto intercalado.", "Lobulillo salival."],
  63: ["Submandibular, mixta con predominio seroso.", "Sublingual, predominantemente mucosa.", "Glándula de Von Ebner, serosa lingual."],
  64: ["Parótida.", "Sublingual.", "Glándula salival menor labial."],
  65: ["Parótida, con un conducto principal largo.", "Submandibular, con conducto de Wharton.", "Glándula de Von Ebner, con conductos hacia surcos linguales."],
  66: ["Secretar amilasa hacia la luz de los acinos.", "Modificar electrolitos dentro de los conductos estriados.", "Presentar antígenos en la lámina propia."],
  67: ["Inicia la digestión proteica por pepsina y acidifica el pH bucal.", "Emulsifica lípidos por sales biliares y elimina toda microbiota.", "Inicia digestión de lípidos por lipasa pancreática y produce factor intrínseco." ]
  ,69: ["Páncreas, cubierto por cápsula de Glisson.", "Bazo, órgano glandular mayor del organismo.", "Vesícula biliar, órgano principal de metabolismo."],
  70: ["Conducto biliar común.", "Hígado.", "Páncreas exocrino."],
  71: ["Hígado.", "Vesícula biliar.", "Bazo."],
  72: ["Jugo pancreático.", "Moco alcalino.", "Factor intrínseco."],
  73: ["Hormonas pancreáticas y enzimas digestivas.", "Nutrientes absorbidos hacia la vena porta.", "Eritrocitos envejecidos hacia la médula ósea."],
  74: ["Vena hepática y arteria hepática.", "Vena porta hepática y vena hepática.", "Arteria hepática y conducto biliar común."],
  75: ["Arteria hepática.", "Vena hepática.", "Conducto biliar."],
  76: ["Vena porta hepática.", "Vena hepática terminal.", "Conducto biliar interlobulillar."],
  77: ["Rama de vena hepática, rama de arteria hepática y conducto biliar.", "Rama de vena porta, vénula central y conducto biliar.", "Rama de vena porta, rama de arteria hepática y sinusoide."],
  78: ["En la misma dirección que la sangre, hacia la vénula central.", "Desde la vena central hacia los espacios porta.", "Desde los conductos biliares hacia los sinusoides."],
  79: ["Células de Kupffer.", "Colangiocitos.", "Células de Ito."],
  80: ["Hepatocitos.", "Colangiocitos.", "Células de Ito."],
  81: ["Secretan bilis y almacenan vitamina A en el espacio de Disse.", "Fagocitan bacterias y eritrocitos exclusivamente en el espacio de Disse.", "Forman la mayor parte del parénquima y producen colágeno."],
  82: ["Células de Kupffer.", "Colangiocitos.", "Hepatocitos."],
  83: ["Espacio portal.", "Canalículo biliar.", "Vénula hepática terminal."],
  84: ["Célula de Kupffer.", "Colangiocito.", "Hepatocito."],
  85: ["Sistema porta hepático.", "Sistema de sinusoides hepáticos.", "Sistema de canalículos de Disse."],
  86: ["Hepatocitos.", "Células de Kupffer.", "Células de Ito."],
  87: ["Lobulillo portal; lobulillo clásico; acino hepático.", "Acino hepático; lobulillo portal; lobulillo clásico.", "Lobulillo clásico; acino hepático; lobulillo portal."],
  88: ["Zona 3.", "Zona 2.", "Vénula hepática terminal."],
  89: ["Zona 1.", "Zona 2.", "Espacio porta."],
  90: ["Glucagón.", "Somatostatina.", "Polipéptido pancreático."],
  91: ["Insulina.", "Somatostatina.", "Polipéptido pancreático."],
  92: ["Acinos pancreáticos.", "Conductos intercalados pancreáticos.", "Células centroacinares."],
  93: ["Células acinares, centroacinares, ductales y PP.", "Células alfa, acinares, parietales y delta.", "Células beta, principales, delta y PP."],
  94: ["Células alfa.", "Células delta.", "Células PP."],
  95: ["Células beta.", "Células delta.", "Células PP."],
  96: ["El exocrino secreta hormonas a sangre; el endocrino enzimas a conductos.", "El exocrino secreta enzimas a capilares; el endocrino hormonas a conductos.", "El exocrino secreta bilis; el endocrino moco a sangre."],
  97: ["Células centroacinares.", "Células beta de los islotes.", "Colangiocitos."],
  98: ["Células acinares.", "Células beta.", "Células ductales estriadas."],
  100: ["Producir enzimas digestivas para el duodeno.", "Almacenar y concentrar bilis.", "Fagocitar eritrocitos envejecidos en sinusoides."]
}

const customDistractors: Record<number, [string, string, string]> = {
  6: [
    "Ecrinas: secreción oleosa hacia el folículo piloso. Apocrinas: termorregulación predominante en palmas y plantas.",
    "Ecrinas: secreción asociada principalmente a axila y región anogenital. Apocrinas: termorregulación general.",
    "Ecrinas: secreción de sebo. Apocrinas: secreción acuosa independiente de regiones específicas."
  ],
  8: [
    "Basal, espinoso, lúcido, granuloso y córneo.",
    "Espinoso, basal, granuloso, lúcido y córneo.",
    "Basal, granuloso, espinoso, lúcido y córneo."
  ],
  13: [
    "Depósito de proteínas insolubles en la cara externa de la membrana plasmática y capa lipídica interna.",
    "Depósito de queratohialina en la cara interna de la membrana plasmática y capa lipídica externa.",
    "Depósito de proteínas solubles en la cara interna de la membrana plasmática y capa lipídica externa."
  ],
  15: [
    "La piel gruesa posee folículos pilosos y se encuentra en axila y región anogenital; la piel delgada carece de ellos.",
    "La piel gruesa tiene estrato córneo delgado y se localiza en palmas y plantas; la piel delgada tiene estrato córneo más grueso.",
    "La piel gruesa se define por una dermis reticular más delgada y presencia de glándulas sebáceas."
  ],
  30: [
    "Ácido clorhídrico, pepsinógeno, moco y gastrina.",
    "Bicarbonato, pepsina, factor intrínseco y moco.",
    "Ácido clorhídrico, amilasa, factor intrínseco y moco."
  ],
  41: [
    "Secreción ácida con pepsinógeno, glucoproteínas neutras, ácido clorhídrico y células con características parietales.",
    "Secreción alcalina con moco, glucoproteínas ácidas, bicarbonato y células con características de producción hormonal.",
    "Secreción alcalina con moco, glucoproteínas neutras y alcalinas, ácido clorhídrico y células con características de producción de zimógeno."
  ],
  58: [
    "Esmalte, dentina, cemento y pulpa dental.",
    "Dentina, esmalte, ligamento periodontal y hueso alveolar.",
    "Cemento, pulpa, esmalte y epitelio de unión."
  ],
  67: [
    "Humedece la mucosa bucal, inicia digestión de proteínas por pepsina, controla microbiota y acidifica el pH.",
    "Humedece la mucosa bucal, inicia digestión de hidratos de carbono por amilasa y carece de función inmunitaria.",
    "Lubrica la mucosa, inicia digestión de lípidos por lipasa pancreática y elimina la microbiota bucal."
  ],
  74: [
    "Vena hepática y arteria hepática.",
    "Vena porta hepática y vena hepática.",
    "Arteria hepática y conducto biliar común."
  ],
  77: [
    "Rama de la vena hepática, rama de la arteria hepática y conducto biliar.",
    "Rama de la vena porta, vénula hepática terminal y conducto biliar.",
    "Rama de la vena porta, rama de la arteria hepática y sinusoide hepático."
  ],
  81: [
    "Secretan bilis hacia canalículos y almacenan vitamina A en el espacio perisinusoidal.",
    "Fagocitan bacterias y eritrocitos dañados exclusivamente en el espacio de Disse.",
    "Producen colágeno y forman la mayor parte del parénquima hepático."
  ],
  87: [
    "Lobulillo portal; lobulillo clásico; acino hepático.",
    "Acino hepático; lobulillo portal; lobulillo clásico.",
    "Lobulillo clásico; acino hepático; lobulillo portal."
  ],
  96: [
    "El exocrino secreta hormonas hacia la sangre; el endocrino secreta enzimas digestivas hacia conductos.",
    "El exocrino secreta enzimas digestivas hacia capilares; el endocrino secreta hormonas hacia conductos.",
    "El exocrino secreta bilis hacia conductos; el endocrino secreta moco hacia la sangre."
  ]
}

// The original true/false facts become discrimination questions here: the
// alternatives change only a layer, tissue, direction, or related structure.
const trueFalseCorrect: Record<number, string> = {
  14: "La degradación de desmosomas permite la descamación del estrato córneo.",
  20: "Las papilas dérmicas son evaginaciones de tejido conjuntivo hacia la epidermis.",
  24: "La mucosa digestiva participa en protección, absorción y secreción.",
  27: "Los esfínteres se forman por engrosamiento de la capa circular de músculo liso.",
  52: "El surco terminal es una depresión en V de la superficie dorsal lingual.",
  59: "El cemento dental es avascular.",
  61: "El epitelio de unión se adhiere al diente mediante hemidesmosomas y material tipo lámina basal.",
  68: "Los conductos intercalados están revestidos principalmente por epitelio cúbico simple.",
  99: "La secreción pancreática exocrina incluye precursores de enzimas digestivas."
}

const trueFalseDistractors: Record<number, [string, string, string]> = {
  14: ["La degradación de hemidesmosomas permite la descamación del estrato córneo.", "La queratinización del estrato basal permite la descamación del estrato córneo.", "La síntesis de desmosomas permite la descamación del estrato córneo."],
  20: ["Las papilas dérmicas son evaginaciones epiteliales hacia la dermis.", "Las papilas dérmicas son invaginaciones de la dermis hacia la hipodermis.", "Las papilas dérmicas son pliegues de la membrana basal sin tejido conjuntivo."],
  24: ["La mucosa digestiva participa en protección, filtración y conducción.", "La mucosa digestiva participa solo en absorción y motilidad.", "La mucosa digestiva participa en secreción, hematopoyesis y absorción."],
  27: ["Los esfínteres se forman por engrosamiento de la capa longitudinal de músculo liso.", "Los esfínteres se forman por engrosamiento de la submucosa.", "Los esfínteres se forman por engrosamiento de la serosa."],
  52: ["El surco terminal es una depresión en V de la superficie ventral lingual.", "El surco terminal es una cresta transversal de la superficie dorsal lingual.", "El surco terminal delimita la raíz de la lengua en la superficie ventral."],
  59: ["El cemento dental es vascular y recibe vasos desde la pulpa.", "El cemento dental es vascular y forma conductos de Havers.", "El cemento dental es avascular solo en la región apical."],
  61: ["El epitelio de unión se adhiere al diente mediante desmosomas entre odontoblastos.", "El epitelio de unión se adhiere al diente mediante fibras de colágeno de la lámina propia.", "El epitelio de unión se adhiere al diente mediante uniones estrechas entre ameloblastos."],
  68: ["Los conductos intercalados están revestidos principalmente por epitelio cilíndrico estratificado.", "Los conductos intercalados están revestidos principalmente por epitelio plano estratificado.", "Los conductos intercalados están revestidos principalmente por epitelio de transición."],
  99: ["La secreción pancreática exocrina contiene principalmente hormonas hacia capilares.", "La secreción pancreática exocrina contiene anticuerpos hacia los islotes.", "La secreción pancreática exocrina contiene bilis producida por colangiocitos."]
}

function multipleChoicePrompt(fact: Fact) {
  const prompts: Record<number, string> = {
    14: "Sobre la descamación del estrato córneo, seleccioná la afirmación correcta:",
    20: "Sobre las papilas dérmicas, seleccioná la afirmación correcta:",
    24: "Sobre las funciones de la mucosa digestiva, seleccioná la afirmación correcta:",
    27: "Sobre la formación de los esfínteres digestivos, seleccioná la afirmación correcta:",
    52: "Sobre el surco terminal de la lengua, seleccioná la afirmación correcta:",
    59: "Sobre el cemento dental, seleccioná la afirmación correcta:",
    61: "Sobre el epitelio de unión, seleccioná la afirmación correcta:",
    68: "Sobre los conductos intercalados salivales, seleccioná la afirmación correcta:",
    99: "Sobre la secreción pancreática exocrina, seleccioná la afirmación correcta:"
  }
  return prompts[fact.id] ?? fact.question
}

const coreCitoIIPrePartialFlashcards: Flashcard[] = facts.map(fact => ({
  id: `prepartial-cito2-card-${fact.id}`,
  subject: "Citohistología",
  book: "Repaso pre-parcial",
  chapter: "Parcial 2 · Cito II",
  topic: topicFor(fact.id),
  subtopic: "Conceptos esenciales",
  front: directRecallPrompts[fact.id] ?? fact.question,
  back: directRecallAnswers[fact.id] ?? fact.answer.replace(/^Verdadero\.\s*/i, "").replace(/^Falso\.\s*/i, ""),
  tags: ["Repaso pre-parcial", "Cito II", topicFor(fact.id)]
}))

const diabetesEssentialFlashcards: Flashcard[] = [
  ["diabetes-01", "¿Cuál es el defecto fisiopatológico central de la diabetes mellitus tipo 1?", "Destrucción autoinmunitaria de células beta pancreáticas, con deficiencia absoluta de insulina."],
  ["diabetes-02", "¿Cuál es el defecto fisiopatológico central de la diabetes mellitus tipo 2?", "Resistencia a la insulina acompañada de deterioro progresivo de la secreción de insulina por células beta."],
  ["diabetes-03", "¿Una edad de 60 años basta para diagnosticar diabetes tipo 2?", "No. La edad puede orientar por epidemiología, pero el tipo se define con el contexto clínico, fisiopatología y estudios apropiados."],
  ["diabetes-04", "¿Qué combinación clínica clásica sugiere hiperglucemia?", "Poliuria, polidipsia y polifagia; puede acompañarse de pérdida de peso, fatiga o visión borrosa."],
  ["diabetes-05", "¿Por qué aparece poliuria en la hiperglucemia?", "La glucosa excede la capacidad de reabsorción renal y produce diuresis osmótica."],
  ["diabetes-06", "¿Por qué aparece polidipsia en la hiperglucemia?", "Como respuesta a la deshidratación y al aumento de osmolaridad causados por la diuresis osmótica."],
  ["diabetes-07", "¿Qué explica la polifagia con pérdida de peso en diabetes descompensada?", "Las células no utilizan eficazmente la glucosa; aumenta el catabolismo de grasa y músculo pese a la hiperglucemia."],
  ["diabetes-08", "¿Qué es la cetoacidosis diabética (CAD)?", "Emergencia metabólica por deficiencia importante de insulina: hiperglucemia, cetosis y acidosis metabólica."],
  ["diabetes-09", "¿Por qué la diabetes tipo 1 predispone a cetoacidosis?", "La deficiencia absoluta de insulina favorece lipólisis y cetogénesis sin freno suficiente."],
  ["diabetes-10", "¿Qué papel tiene la metformina en diabetes tipo 2?", "Es un fármaco de primera línea frecuente; reduce principalmente la producción hepática de glucosa y mejora la sensibilidad a insulina."],
  ["diabetes-11", "¿Cuándo es indispensable la insulina como tratamiento de sustitución?", "En diabetes tipo 1, porque existe deficiencia absoluta de insulina; también puede requerirse en otros escenarios clínicos."],
  ["diabetes-12", "¿Qué glucemia plasmática en ayunas es normal, prediabetes y diabetes?", "Normal: <100 mg/dL. Prediabetes: 100–125 mg/dL. Diabetes: ≥126 mg/dL."],
  ["diabetes-13", "¿Qué HbA1c es normal, prediabetes y diabetes?", "Normal: <5.7%. Prediabetes: 5.7–6.4%. Diabetes: ≥6.5%."],
  ["diabetes-14", "En una prueba oral de tolerancia a la glucosa de 75 g, ¿cuáles son los valores a 2 horas?", "Normal: <140 mg/dL. Prediabetes: 140–199 mg/dL. Diabetes: ≥200 mg/dL."],
  ["diabetes-15", "¿Cuándo una glucosa plasmática aleatoria apoya diagnóstico de diabetes?", "≥200 mg/dL cuando hay síntomas clásicos de hiperglucemia o crisis hiperglucémica."],
  ["diabetes-16", "¿Qué significa HbA1c?", "Refleja la exposición promedio a glucosa durante aproximadamente los 2–3 meses previos."],
  ["diabetes-17", "¿Cuándo suelen requerirse pruebas confirmatorias para diagnosticar diabetes?", "En ausencia de hiperglucemia inequívoca o síntomas clásicos con un resultado diagnóstico, se confirma con otra prueba anormal."],
  ["diabetes-18", "¿Por qué se llama prueba de tolerancia oral a la glucosa y no curva de resistencia?", "Evalúa cómo el organismo maneja una carga oral de glucosa; no mide directamente resistencia a la insulina."],
  ["diabetes-19", "¿Qué hormona reduce la glucemia y cuál la eleva?", "Insulina disminuye la glucemia; glucagón la eleva."],
  ["diabetes-20", "¿Qué órgano produce insulina y glucagón?", "El páncreas endocrino, en los islotes de Langerhans: células beta producen insulina y alfa producen glucagón."]
].map(([id, front, back]) => ({
  id: `prepartial-cito2-${id}`,
  subject: "Citohistología",
  book: "Repaso pre-parcial",
  chapter: "Parcial 2 · Cito II",
  topic: "Diabetes: clínica, fisiopatología y diagnóstico",
  subtopic: "Diabetes",
  front,
  back,
  tags: ["Repaso pre-parcial", "Cito II", "Diabetes"]
}))

export const citoIIPrePartialFlashcards: Flashcard[] = [
  ...coreCitoIIPrePartialFlashcards,
  ...diabetesEssentialFlashcards
]

const seeds: ManualQuizSeed[] = facts.map(fact => ({
  id: `prepartial-cito2-${fact.id}`,
  topic: topicFor(fact.id),
  difficulty: "medium",
  question: multipleChoicePrompt(fact),
  correct: trueFalseCorrect[fact.id] ?? fact.answer,
  distractors: distinctDistractors(fact),
  explanation: fact.answer
}))

const coreCitoIIPrePartialQuestions = createManualQuizBank(
  "Parcial 2 · Cito II",
  seeds
).map(question => {
  const fact = facts.find(item => `quiz-prepartial-cito2-${item.id}` === question.id)
  const isTrueFalse = fact && [14, 20, 24, 27, 52, 59, 61, 68, 99].includes(fact.id)

  if (!fact || !isTrueFalse) return question

  const isTrue = fact.answer.startsWith("Verdadero")

  return {
    ...question,
    question: fact.question,
    options: ["Verdadero", "Falso"],
    correctAnswers: [isTrue ? 0 : 1],
    explanation: isTrue
      ? trueFalseCorrect[fact.id]
      : fact.answer.replace(/^Falso\.\s*/i, "")
  }
})

const diabetesQuizSeeds: ManualQuizSeed[] = [
  { id: "diabetes-01", topic: "Diabetes: clínica, fisiopatología y diagnóstico", difficulty: "medium", question: "Una persona con poliuria, polidipsia, pérdida de peso y cetonas debe hacer sospechar primero:", correct: "Deficiencia marcada de insulina con riesgo de cetoacidosis diabética.", distractors: ["Resistencia a insulina compensada sin riesgo de cetosis.", "Hipoglucemia por exceso de insulina endógena.", "Alteración aislada de la glucosa sin compromiso metabólico."], explanation: "La combinación de síntomas catabólicos y cetosis exige valorar déficit importante de insulina y CAD." },
  { id: "diabetes-02", topic: "Diabetes: clínica, fisiopatología y diagnóstico", difficulty: "medium", question: "¿Qué mecanismo define mejor diabetes mellitus tipo 1?", correct: "Destrucción autoinmunitaria de células beta con deficiencia absoluta de insulina.", distractors: ["Resistencia periférica a insulina con secreción beta progresivamente insuficiente.", "Exceso de glucagón con células beta estructuralmente normales.", "Disminución de absorción intestinal de glucosa con insulina normal."], explanation: "La DM1 resulta de destrucción de células beta, habitualmente autoinmunitaria." },
  { id: "diabetes-03", topic: "Diabetes: clínica, fisiopatología y diagnóstico", difficulty: "medium", question: "¿Cuál patrón corresponde mejor a diabetes mellitus tipo 2?", correct: "Resistencia a insulina junto con deterioro progresivo de secreción de insulina.", distractors: ["Destrucción autoinmunitaria súbita con ausencia absoluta inicial de insulina.", "Producción excesiva de insulina con captación periférica aumentada.", "Falla primaria de glucagón sin alteración de sensibilidad a insulina."], explanation: "La DM2 combina resistencia a insulina con falla progresiva de células beta." },
  { id: "diabetes-04", topic: "Diabetes: clínica, fisiopatología y diagnóstico", difficulty: "medium", question: "¿Qué explica directamente la poliuria de la hiperglucemia?", correct: "Glucosuria que produce diuresis osmótica.", distractors: ["Aumento de ADH que concentra la orina.", "Disminución de filtración glomerular por hipovolemia.", "Exceso de insulina que bloquea reabsorción de agua."], explanation: "Al excederse la reabsorción renal de glucosa, la glucosuria arrastra agua." },
  { id: "diabetes-05", topic: "Diabetes: clínica, fisiopatología y diagnóstico", difficulty: "medium", question: "La polidipsia en diabetes descompensada se relaciona principalmente con:", correct: "Deshidratación y aumento de osmolaridad por diuresis osmótica.", distractors: ["Aumento de volumen intravascular por retención renal de agua.", "Disminución de osmolaridad por exceso de insulina.", "Secreción de bilis que incrementa la sed."], explanation: "La pérdida de agua y la hiperosmolaridad estimulan la sed." },
  { id: "diabetes-06", topic: "Diabetes: clínica, fisiopatología y diagnóstico", difficulty: "medium", question: "¿Qué tríada define cetoacidosis diabética?", correct: "Hiperglucemia, cetosis y acidosis metabólica.", distractors: ["Hipoglucemia, cetosis y alcalosis respiratoria.", "Hiperglucemia, glucosuria y alcalosis metabólica.", "Hiponatremia, hiperinsulinemia y acidosis respiratoria."], explanation: "La CAD es una emergencia metabólica por déficit importante de insulina." },
  { id: "diabetes-07", topic: "Diabetes: clínica, fisiopatología y diagnóstico", difficulty: "medium", question: "¿Cuál es el efecto principal de metformina?", correct: "Disminuye producción hepática de glucosa y mejora sensibilidad a insulina.", distractors: ["Sustituye insulina ausente mediante acción hormonal directa.", "Aumenta glucagón para movilizar glucosa hepática.", "Estimula lipólisis para tratar cetosis."], explanation: "La metformina reduce sobre todo la producción hepática de glucosa." },
  { id: "diabetes-08", topic: "Diabetes: clínica, fisiopatología y diagnóstico", difficulty: "medium", question: "¿En cuál situación la insulina es tratamiento de sustitución indispensable?", correct: "Diabetes tipo 1 con deficiencia absoluta de insulina.", distractors: ["Prediabetes aislada sin hiperglucemia clínica.", "Diabetes tipo 2 compensada solo con cambios de estilo de vida.", "Hipoglucemia reactiva sin diabetes."], explanation: "En DM1 la supervivencia requiere reemplazo de insulina." },
  { id: "diabetes-09", topic: "Diabetes: clínica, fisiopatología y diagnóstico", difficulty: "medium", question: "¿Qué resultado de glucosa plasmática en ayunas cumple criterio de diabetes?", correct: "126 mg/dL o más tras al menos 8 horas de ayuno.", distractors: ["100 mg/dL o más tras 8 horas de ayuno.", "110 mg/dL o más en cualquier momento del día.", "140 mg/dL o más dos horas después de comer."], explanation: "100–125 mg/dL indica prediabetes; diabetes se diagnostica con ≥126 mg/dL." },
  { id: "diabetes-10", topic: "Diabetes: clínica, fisiopatología y diagnóstico", difficulty: "medium", question: "¿Qué HbA1c cumple criterio de diabetes?", correct: "6.5% o más.", distractors: ["5.7% o más.", "6.0% o más.", "7.0% o más."], explanation: "5.7–6.4% corresponde a prediabetes; ≥6.5% a diabetes." },
  { id: "diabetes-11", topic: "Diabetes: clínica, fisiopatología y diagnóstico", difficulty: "medium", question: "En prueba oral de tolerancia con 75 g de glucosa, ¿qué valor a 2 horas indica diabetes?", correct: "200 mg/dL o más.", distractors: ["140 mg/dL o más.", "160 mg/dL o más.", "180 mg/dL o más."], explanation: "140–199 mg/dL es prediabetes; ≥200 mg/dL es diabetes." },
  { id: "diabetes-12", topic: "Diabetes: clínica, fisiopatología y diagnóstico", difficulty: "hard", question: "Una glucosa aleatoria de 205 mg/dL es diagnóstica de diabetes cuando se acompaña de:", correct: "Síntomas clásicos de hiperglucemia o crisis hiperglucémica.", distractors: ["Ayuno de al menos ocho horas, sin importar síntomas.", "HbA1c normal y ausencia de síntomas.", "Una comida reciente rica en carbohidratos."], explanation: "Con síntomas clásicos o crisis, una glucosa aleatoria ≥200 mg/dL es diagnóstica." },
  { id: "diabetes-13", topic: "Diabetes: clínica, fisiopatología y diagnóstico", difficulty: "medium", question: "En ausencia de hiperglucemia inequívoca, un resultado diagnóstico aislado generalmente debe:", correct: "Confirmarse con una segunda prueba anormal.", distractors: ["Clasificarse automáticamente como diabetes tipo 1.", "Ignorarse si el paciente no presenta poliuria.", "Interpretarse solo mediante glucosa aleatoria."], explanation: "Habitualmente se requiere confirmación en otro día o con otra prueba anormal." },
  { id: "diabetes-14", topic: "Diabetes: clínica, fisiopatología y diagnóstico", difficulty: "medium", question: "¿Qué describe mejor HbA1c?", correct: "Promedio aproximado de exposición a glucosa durante los 2–3 meses previos.", distractors: ["Glucosa plasmática exclusiva de las últimas 2 horas.", "Respuesta inmediata a una carga oral de 75 g.", "Producción basal de insulina durante un ayuno corto."], explanation: "HbA1c refleja glucosa promedio de los últimos 2–3 meses." },
  { id: "diabetes-15", topic: "Diabetes: clínica, fisiopatología y diagnóstico", difficulty: "medium", question: "¿Por qué la edad de 60 años no basta para diagnosticar DM2?", correct: "El tipo requiere integrar clínica, fisiopatología y estudios; edad es solo una pista epidemiológica.", distractors: ["Toda diabetes después de los 40 años es necesariamente tipo 2.", "La edad permite distinguir DM1 y DM2 sin necesidad de laboratorio.", "La diabetes tipo 1 solo puede aparecer antes de los 18 años."], explanation: "Edad sola no clasifica de forma fiable el tipo de diabetes." }
]

const diabetesQuizQuestions = createManualQuizBank("Parcial 2 · Cito II", diabetesQuizSeeds)

export const citoIIPrePartialQuestions = [
  ...coreCitoIIPrePartialQuestions,
  ...diabetesQuizQuestions
]
