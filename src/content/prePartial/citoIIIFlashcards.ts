import type { Flashcard } from "@/content/flashcards/histologia/cards"
import { CITO_III_PARTIAL } from "./citoIII"

type Group = {
  topic: string
  cards: readonly (readonly [front: string, back: string])[]
}

// Repaso de última vuelta, independiente de los mazos regulares de Ross.
// Cap. 20: solo se usa el texto principal, anterior al apartado de láminas.
const groups: readonly Group[] = [
  {
    topic: "Vías aéreas superiores y olfato",
    cards: [
      ["¿Cuál es el último segmento de la porción conductora?", "El bronquiolo terminal."],
      ["¿Qué marca el inicio de la porción respiratoria?", "Alvéolos en la pared del bronquiolo respiratorio."],
      ["¿Cómo ayudan los cornetes nasales a acondicionar el aire?", "Aumentan la superficie de contacto y generan turbulencia sobre la mucosa vascularizada."],
      ["Del vestíbulo a la región respiratoria nasal, ¿cómo cambia el epitelio?", "De plano estratificado a cilíndrico seudoestratificado ciliado."],
      ["¿Qué célula del epitelio respiratorio mueve el moco hacia la faringe?", "La célula ciliada."],
      ["¿Qué célula respiratoria produce el moco superficial?", "La célula caliciforme."],
      ["¿Qué población regenera el epitelio respiratorio después de una lesión?", "Las células basales."],
      ["Una célula respiratoria con microvellosidades romas y contacto nervioso: ¿cuál es?", "La célula en cepillo."],
      ["¿Qué distingue a la mucosa olfatoria de la respiratoria en una lámina?", "Neuronas receptoras y glándulas serosas de Bowman; no abundan células caliciformes."],
      ["¿Qué segundo mensajero abre canales catiónicos tras activar un receptor olfatorio?", "AMP cíclico."],
    ],
  },
  {
    topic: "Laringe, tráquea y árbol bronquial",
    cards: [
      ["¿Qué prolongación neuronal forma los filetes del nervio olfatorio?", "El axón basal de la neurona olfatoria bipolar."],
      ["Tras un traumatismo de la lámina cribosa aparece anosmia. ¿Qué se dañó?", "Los axones de las neuronas olfatorias que la atraviesan."],
      ["¿Qué epitelio reviste los senos paranasales?", "Epitelio respiratorio seudoestratificado ciliado, generalmente más delgado."],
      ["¿Qué pliegues laríngeos vibran para producir la voz?", "Los pliegues vocales verdaderos."],
      ["¿Qué epitelio protege los pliegues vocales verdaderos frente a la fricción?", "Epitelio plano estratificado no queratinizado."],
      ["Un pliegue superior con glándulas mucosas, sin función principal de fonación: ¿cuál es?", "El pliegue ventricular o vestibular (falso)."],
      ["¿Qué une por detrás los extremos de los anillos traqueales en C?", "El músculo traqueal liso."],
      ["¿En qué capa de la tráquea se encuentran las glándulas seromucosas?", "En la submucosa."],
      ["Tráquea frente a bronquio intrapulmonar: ¿cómo cambia el cartílago?", "De anillos en C a placas cartilaginosas discontinuas."],
      ["Un conducto aéreo sin cartílago ni glándulas y aún sin alvéolos: ¿qué es?", "Un bronquiolo conductor."],
    ],
  },
  {
    topic: "Bronquiolos y alvéolos",
    cards: [
      ["Hacia el bronquiolo terminal, ¿qué células aumentan mientras disminuyen las ciliadas?", "Las células de Clara o club."],
      ["¿Cómo se reconoce una célula de Clara o club en el bronquiolo?", "No tiene cilios y muestra un ápice abombado; aporta secreciones protectoras."],
      ["¿Qué constituye un acino pulmonar en el capítulo?", "Un bronquiolo terminal y sus ramas respiratorias y alveolares."],
      ["¿Qué constituye una unidad bronquiolar respiratoria?", "Un bronquiolo respiratorio y los alvéolos que ventila."],
      ["Tipo I frente a tipo II: ¿cuál cubre casi toda la superficie alveolar?", "El neumocito tipo I, plano y muy extendido."],
      ["Tipo I frente a tipo II: ¿cuál es más numeroso?", "El neumocito tipo II, aunque cubre menos superficie."],
      ["Tras lesión del epitelio alveolar, ¿qué célula puede reponer también neumocitos tipo I?", "El neumocito tipo II."],
      ["¿En qué orgánulos almacena surfactante el neumocito tipo II?", "En cuerpos laminares."],
      ["¿Qué estructura comunica alvéolos vecinos y permite ventilación colateral?", "El poro alveolar de Kohn."],
      ["Una partícula llega al espacio alveolar: ¿qué célula puede fagocitarla?", "El macrófago alveolar."],
    ],
  },
  {
    topic: "Surfactante y barrera hematogaseosa",
    cards: [
      ["¿Qué efecto físico principal ejerce el surfactante alveolar?", "Disminuye la tensión superficial y facilita que los alvéolos permanezcan abiertos."],
      ["Entre las proteínas del surfactante, ¿cuáles ayudan sobre todo a organizar la película?", "Las proteínas tensoactivas B y C."],
      ["¿Qué proteína del surfactante participa en defensa y modulación inflamatoria?", "La proteína tensoactiva D (PTD)."],
      ["¿Qué células forman el lado aéreo y el lado sanguíneo de la barrera hematogaseosa delgada?", "Neumocito tipo I y endotelio capilar, respectivamente."],
      ["Entre neumocito I y endotelio, ¿qué estructuras completa la barrera delgada?", "Sus láminas basales, generalmente fusionadas."],
      ["¿Por qué un edema del tabique alveolar dificulta el intercambio gaseoso?", "Aumenta la distancia de difusión entre aire alveolar y sangre capilar."],
      ["¿Qué cubre externamente la pleura visceral?", "Mesotelio apoyado sobre tejido conjuntivo."],
      ["¿Qué proteína del surfactante regula principalmente su homeostasis?", "La proteína tensoactiva A (PTA)."],
      ["¿En qué región pulmonar ocurre el intercambio de gases con la sangre?", "En los alvéolos y su barrera hematogaseosa."],
      ["¿Por qué el bronquiolo terminal no participa directamente en intercambio gaseoso?", "Su pared carece de alvéolos; sigue siendo una vía conductora."],
    ],
  },
  {
    topic: "Organización renal y corpúsculo",
    cards: [
      ["Una pirámide medular con su corteza asociada forma ¿qué unidad?", "Un lóbulo renal."],
      ["En corteza, una banda de túbulos rectos y colectores sin corpúsculos: ¿qué es?", "Un rayo medular."],
      ["¿Qué agrega el túbulo urinario a la nefrona?", "El sistema de conductos colectores."],
      ["¿Qué polo del corpúsculo renal recibe y despide las arteriolas?", "El polo vascular."],
      ["¿Qué polo del corpúsculo se continúa con el túbulo proximal?", "El polo urinario."],
      ["¿Cuáles son los tres componentes del filtro glomerular?", "Endotelio fenestrado, membrana basal glomerular y diafragmas entre pedicelos de podocitos."],
      ["¿Qué distingue las fenestraciones del capilar glomerular?", "Carecen de diafragma."],
      ["¿Qué componente del filtro restringe especialmente moléculas aniónicas?", "Las cargas negativas de la membrana basal glomerular."],
      ["¿Qué proteína es clave en el diafragma de la ranura entre pedicelos?", "La nefrina."],
      ["¿Qué puede sugerir una albuminuria importante?", "Alteración de la barrera de filtración glomerular."],
    ],
  },
  {
    topic: "Mesangio y aparato yuxtaglomerular",
    cards: [
      ["¿Qué célula sostiene asas glomerulares y retira material atrapado por fagocitosis?", "La célula mesangial intraglomerular."],
      ["¿Qué tres elementos forman el aparato yuxtaglomerular?", "Mácula densa, células granulares yuxtaglomerulares y mesangiales extraglomerulares."],
      ["¿Qué detecta la mácula densa en el líquido del túbulo distal?", "La concentración de NaCl."],
      ["¿De qué tejido derivan las células granulares que liberan renina?", "Del músculo liso de la arteriola aferente."],
      ["¿Qué enzima secretan las células granulares yuxtaglomerulares?", "Renina."],
      ["¿Qué cambio tubular produce la aldosterona en células principales?", "Aumenta reabsorción de Na+ y secreción de K+."],
      ["¿Qué red vascular nace de eferentes yuxtamedulares y conserva el gradiente medular?", "Los vasos rectos."],
      ["De arteria renal a arteriola aferente, ¿cómo se ordenan las ramas interlobulares, arqueadas e interlobulillares?", "Interlobulares → arqueadas → interlobulillares."],
      ["¿Por qué las nefronas yuxtamedulares ayudan a concentrar la orina?", "Sus asas largas penetran profundamente en la médula."],
      ["¿Qué dos procesos tubulares modifican el ultrafiltrado hasta formar orina definitiva?", "Reabsorción y secreción."],
    ],
  },
  {
    topic: "Túbulos y concentración urinaria",
    cards: [
      ["En H&E, ¿qué rasgo permite reconocer un túbulo proximal?", "Luz borrosa por el borde en cepillo y citoplasma eosinófilo."],
      ["¿Qué transportadores llevan la glucosa desde la luz proximal hacia el intersticio?", "SGLT2 apical y GLUT2 basolateral."],
      ["¿Cómo recupera el túbulo proximal proteínas filtradas?", "Por endocitosis apical y degradación lisosómica."],
      ["Rama delgada descendente en médula hiperosmótica: ¿qué sale y qué ocurre con el filtrado?", "Sale agua; el líquido tubular se concentra."],
      ["Rama ascendente del asa: ¿por qué se diluye el líquido tubular?", "Sale NaCl, pero la pared es poco permeable al agua."],
      ["En un corte cortical, ¿qué rasgo distingue al túbulo distal del proximal?", "Luz más nítida por tener menos microvellosidades apicales."],
      ["¿En qué segmento se secreta uromodulina o proteína de Tamm-Horsfall?", "En la rama ascendente gruesa o túbulo recto distal."],
      ["¿Qué canal inserta la ADH en la membrana apical de células principales colectoras?", "Acuaporina 2 (AQP2)."],
      ["En acidosis, ¿qué célula colectora secreta H+ hacia la luz?", "La célula intercalada alfa."],
      ["¿Qué secreta hacia la luz una célula intercalada beta?", "Bicarbonato."],
    ],
  },
  {
    topic: "Función endocrina y vías urinarias",
    cards: [
      ["¿Qué hormona renal disminuida contribuye a anemia en enfermedad renal avanzada?", "La eritropoyetina."],
      ["¿Dónde ocurre la activación renal final de vitamina D a calcitriol?", "En el túbulo proximal."],
      ["¿Qué epitelio reviste uréteres y vejiga?", "El urotelio o epitelio de transición."],
      ["¿Qué células superficiales del urotelio conservan la barrera al distenderse la vejiga?", "Las células sombrilla."],
      ["¿Cómo aumenta la célula sombrilla su superficie apical durante el llenado?", "Fusiona vesículas fusiformes con su membrana apical."],
      ["¿Qué geometría del uréter intramural ayuda a impedir el reflujo al llenarse la vejiga?", "Su trayecto oblicuo a través de la pared vesical."],
      ["Para iniciar la micción, ¿qué pasa con el detrusor y el esfínter externo?", "Se contrae el detrusor y se relaja el esfínter externo."],
      ["¿Qué segmento de la uretra masculina atraviesa el esfínter externo?", "La uretra membranosa."],
      ["¿Qué capa muscular vesical expulsa la orina al contraerse?", "El músculo detrusor."],
      ["¿Por qué el ultrafiltrado del espacio de Bowman no equivale todavía a orina definitiva?", "Los túbulos reabsorben y secretan sustancias antes de la excreción."],
    ],
  },
]

export const citoIIIPrePartialFlashcards: Flashcard[] = groups.flatMap((group, groupIndex) =>
  group.cards.map(([front, back], cardIndex) => ({
    id: `prepartial-cito3-card-${String(groupIndex * 10 + cardIndex + 1).padStart(3, "0")}`,
    subject: "Citohistología",
    book: "Repaso pre-parcial",
    chapter: CITO_III_PARTIAL,
    topic: group.topic,
    subtopic: "Conceptos esenciales",
    front,
    back,
    tags: ["Repaso pre-parcial", "Cito III", group.topic],
  }))
)
