import type { Flashcard } from "@/content/flashcards/histologia/cards"
import { CITO_II_FIRST_PARTIAL } from "./citoI"

type Group = { topic: string; cards: readonly (readonly [front: string, back: string])[] }

// Recuerdo activo independiente del quiz. Cada grupo conserva diez IDs estables.
const cardiovascular: readonly Group[] = [
  {
    topic: "Cardiovascular · circulación y pared cardíaca",
    cards: [
      ["¿A qué cavidad retorna la sangre que se oxigenó en los pulmones?", "A la aurícula izquierda, por las venas pulmonares."],
      ["¿A qué circuito envía sangre el ventrículo derecho?", "A la circulación pulmonar, por el tronco y las arterias pulmonares."],
      ["¿Por qué el ventrículo izquierdo necesita una pared más gruesa?", "Debe generar mayor presión para impulsar sangre por la circulación sistémica."],
      ["¿Qué ocurre con el músculo cardíaco durante la sístole?", "Se contrae."],
      ["¿Qué ocurre con el músculo cardíaco durante la diástole?", "Se relaja, permitiendo el llenado de las cavidades."],
      ["¿Qué revestimiento está en contacto con la sangre dentro de las cavidades cardíacas?", "El endotelio del endocardio."],
      ["¿Qué capa de la pared cardíaca aporta la mayor fuerza contráctil?", "El miocardio."],
      ["¿Qué capa cardíaca tiene mesotelio y puede contener grasa y vasos coronarios?", "El epicardio, hoja visceral del pericardio seroso."],
      ["¿Cómo se denominan las prominencias musculares irregulares de la superficie ventricular interna?", "Trabéculas carnosas."],
      ["¿Qué papel eléctrico tiene el esqueleto fibroso entre aurículas y ventrículos?", "Los aísla eléctricamente; el haz AV constituye la vía normal que atraviesa ese aislamiento."],
    ],
  },
  {
    topic: "Cardiovascular · conducción y control autónomo",
    cards: [
      ["¿Qué región inicia habitualmente el ritmo cardíaco sin necesitar un impulso nervioso por cada latido?", "El nodo sinoauricular."],
      ["¿Qué estructura lleva el impulso desde el nodo AV a través del esqueleto fibroso?", "El haz auriculoventricular o de His."],
      ["¿En qué región del endocardio se distribuyen las fibras de Purkinje ventriculares?", "En la capa subendocárdica."],
      ["¿Qué hace pálido el centro citoplasmático de Purkinje en H&E?", "Abundante glucógeno y escasez relativa de miofibrillas centrales."],
      ["¿Qué reserva de Purkinje explica su positividad con PAS?", "El glucógeno citoplasmático."],
      ["¿Dónde se concentran las miofibrillas dentro de las células de Purkinje?", "En la periferia celular."],
      ["¿Qué receptor adrenérgico media principalmente el aumento simpático de frecuencia cardíaca?", "El receptor β1."],
      ["¿Qué receptor cardíaco responde a acetilcolina vagal reduciendo la frecuencia?", "El receptor muscarínico M2."],
      ["¿Cómo se distinguen cronotropismo e inotropismo cardíacos?", "Cronotropismo: frecuencia; inotropismo: fuerza de contracción."],
      ["¿Por qué la estimulación autónoma no es el origen de cada latido normal?", "El sistema de conducción genera automatismo propio; la inervación modifica su actividad."],
    ],
  },
  {
    topic: "Cardiovascular · valvas y túnicas",
    cards: [
      ["¿De qué tejido son las capas internas principales de una valva cardíaca?", "De tejido conjuntivo, recubierto por endocardio en sus superficies."],
      ["¿Qué propiedad mecánica aporta la fibrosa de una valva?", "Resistencia a la tracción mediante su colágeno."],
      ["¿Cómo contribuye la esponjosa al funcionamiento valvular?", "Amortigua vibraciones y aporta flexibilidad por su matriz rica en proteoglucanos."],
      ["¿Qué permiten las fibras elásticas de la atrialis o ventricularis de una valva?", "Extensión y retroceso durante el ciclo cardíaco."],
      ["¿Cómo se nutre la porción avascular de una cúspide cardíaca normal?", "Por difusión desde la sangre que baña sus superficies."],
      ["¿Qué unen las cuerdas tendinosas a los músculos papilares?", "Las valvas auriculoventriculares mitral y tricúspide."],
      ["¿Qué constituye la parte luminal esencial de la túnica íntima vascular?", "Endotelio con su lámina basal y tejido subendotelial variable."],
      ["¿Qué capa vascular concentra el músculo liso que cambia el calibre?", "La túnica media."],
      ["¿Qué capa fija un vaso al tejido circundante y puede alojar vasa vasorum?", "La túnica adventicia."],
      ["¿Qué define a una arteria o vena independientemente de su oxigenación?", "La arteria aleja sangre del corazón y la vena la devuelve hacia él."],
    ],
  },
  {
    topic: "Cardiovascular · arterias y venas",
    cards: [
      ["¿Cuántas capas de músculo liso suelen definir la media arteriolar?", "Una o dos capas."],
      ["¿Cómo cambia la resistencia arteriolar cuando aumenta su diámetro por relajación?", "Disminuye."],
      ["¿Cómo sostienen las arterias elásticas el flujo entre latidos?", "Por retroceso elástico después de distenderse durante la sístole."],
      ["¿Qué rasgo de la media favorece identificar una arteria muscular en vez de elástica?", "Predominio de músculo liso frente a numerosas láminas elásticas."],
      ["¿Qué criterio histológico separa arteriolas de pequeñas arterias?", "El número de capas de músculo liso de la media; las pequeñas arterias tienen más."],
      ["Frente a su arteria acompañante, ¿cómo suele verse una vena en un corte?", "Con pared más delgada y luz más amplia, a menudo irregular o colapsada."],
      ["¿Qué revestimiento cubre el eje conjuntivo de las válvulas venosas?", "Endotelio, continuo con el revestimiento de la vena."],
      ["¿Por qué los grandes vasos necesitan vasa vasorum además de sangre en su luz?", "La difusión luminal no basta para nutrir las regiones externas de su pared."],
      ["¿Qué estructuras llevan inervación autónoma a la pared de los vasos?", "Los nervi vasorum."],
      ["¿Qué disposición de lechos capilares caracteriza a un sistema porta?", "Dos redes capilares en serie, comunicadas por un vaso interpuesto."],
    ],
  },
  {
    topic: "Cardiovascular · microvasculatura y endotelio",
    cards: [
      ["¿Cuáles son los tres patrones estructurales principales de capilares sanguíneos?", "Continuos, fenestrados y discontinuos o sinusoidales."],
      ["¿Cómo es la lámina basal de un capilar fenestrado pese a los poros endoteliales?", "Continua; las fenestraciones corresponden al endotelio."],
      ["¿Qué patrón capilar es característico de hígado, bazo y médula ósea?", "Discontinuo o sinusoidal, con especializaciones según el órgano."],
      ["¿Qué patrón endotelial se relaciona con la barrera hematoencefálica?", "Capilares continuos con uniones ocluyentes especializadas."],
      ["¿Qué célula perivascular comparte lámina basal con el endotelio y estabiliza capilares?", "El pericito."],
      ["¿En qué segmento vascular ocurre principalmente la salida de leucocitos durante inflamación?", "En vénulas poscapilares."],
      ["¿Qué especialización venular permite gran ingreso de linfocitos desde sangre a ganglios?", "Las vénulas de endotelio alto o HEV."],
      ["¿Qué cambio de membrana muscular produce EDHF al abrir canales de K+?", "Hiperpolarización, que favorece relajación vascular."],
      ["¿Qué segundo mensajero aumenta el NO al activar guanilato ciclasa vascular?", "GMP cíclico o cGMP."],
      ["¿Qué rasgo del origen de un capilar linfático facilita recoger líquido intersticial?", "Comienza en fondo ciego, con solapas endoteliales y filamentos de anclaje."],
    ],
  },
]

const lymphatic: readonly Group[] = [
  {
    topic: "Linfático · células y presentación antigénica",
    cards: [
      ["¿Qué célula derivada de B ejecuta la secreción abundante de anticuerpos?", "La célula plasmática."],
      ["¿Qué linfocitos reconocen péptidos presentados por MHC II para coordinar respuestas inmunitarias?", "Los T cooperadores CD4+."],
      ["¿Qué linfocitos reconocen péptidos citosólicos presentados por MHC I?", "Los T citotóxicos CD8+."],
      ["¿Qué vía clásica de MHC presenta proteínas captadas por endocitosis a T cooperadores?", "La vía de MHC II."],
      ["¿Qué poblaciones profesionales pueden presentar antígeno por MHC II?", "Células dendríticas, macrófagos y linfocitos B."],
      ["¿Qué distingue el reconocimiento antigénico de T del reconocimiento por el BCR?", "El TCR reconoce péptido presentado por MHC; el BCR puede reconocer antígeno nativo."],
      ["¿Por qué una NK citotóxica no se clasifica como linfocito T CD8+?", "Pertenece a inmunidad innata y no utiliza el TCR específico de los T."],
      ["¿Qué dos componentes granulares usan NK y T citotóxicos para eliminar células diana?", "Perforinas y granzimas."],
      ["¿Qué tarea general cumplen los linfocitos T reguladores?", "Limitar o suprimir respuestas inmunitarias."],
      ["¿Qué diferencia funcional básica separa a un linfocito virgen de uno de memoria?", "El virgen no ha respondido previamente a su antígeno; el de memoria persiste tras esa respuesta."],
    ],
  },
  {
    topic: "Linfático · inmunoglobulinas y memoria",
    cards: [
      ["¿Qué isotipos funcionan juntos como BCR en el linfocito B maduro virgen?", "IgM e IgD de membrana."],
      ["¿Qué isotipo es especialmente característico de los primeros anticuerpos de una respuesta humoral primaria?", "IgM."],
      ["¿Qué células explican la reducción de la latencia de la respuesta humoral secundaria?", "Los linfocitos B de memoria específicos."],
      ["¿Qué clase de anticuerpo suele predominar en una respuesta humoral secundaria?", "IgG."],
      ["¿Qué inmunoglobulina materna llega al feto a través de la placenta?", "IgG."],
      ["¿Qué clase de inmunoglobulina destaca en saliva, lágrimas y calostro?", "IgA."],
      ["¿Qué inmunoglobulina fijada a mastocitos permite la hipersensibilidad inmediata?", "IgE."],
      ["¿Qué inmunoglobulina de respuesta temprana es especialmente eficiente activando complemento?", "IgM."],
      ["¿Qué uso de IgD en B es más importante que su escasa presencia sérica?", "Su función como receptor antigénico de membrana."],
      ["¿Qué distingue la lesión tipo II de la tipo III respecto al blanco de los anticuerpos?", "Tipo II: antígenos celulares o de matriz; tipo III: depósito de inmunocomplejos solubles."],
    ],
  },
  {
    topic: "Linfático · interleucinas clave",
    cards: [
      ["¿Qué interleucina de macrófagos y otras células se relaciona con fiebre y activación inflamatoria?", "IL-1."],
      ["¿Qué interleucina favorece la expansión de T activados, incluso por acción autocrina?", "IL-2."],
      ["¿Qué interleucina estimula proliferación temprana de progenitores hematopoyéticos?", "IL-3."],
      ["¿Qué interleucina favorece diferenciación TH2 y puede promover síntesis de IgE?", "IL-4."],
      ["¿Qué interleucina favorece especialmente proliferación y diferenciación de eosinófilos?", "IL-5."],
      ["¿Qué interleucina contribuye al crecimiento de B activados y a diferenciación TH17?", "IL-6."],
      ["¿Qué interleucina estromal favorece desarrollo de precursores de linfocitos B y T?", "IL-7."],
      ["¿Qué interleucina actúa como señal quimiotáctica importante para neutrófilos?", "IL-8."],
      ["¿Qué interleucina limita síntesis de citocinas por T e inhibe funciones de macrófagos?", "IL-10."],
      ["¿Qué interleucina de dendríticas y macrófagos favorece NK y diferenciación TH1?", "IL-12."],
    ],
  },
  {
    topic: "Linfático · citocinas y mecanismos efectores",
    cards: [
      ["Además de IL-4, ¿qué interleucina modula B y favorece IgE y activación alternativa de macrófagos?", "IL-13."],
      ["¿Qué interleucina facilita crecimiento y activación de mastocitos?", "IL-9."],
      ["¿Qué interleucina estromal destaca por favorecer el crecimiento de megacariocitos?", "IL-11."],
      ["¿Qué citocina característica de TH17 estimula a epitelio, endotelio y fibroblastos a liberar otras citocinas?", "IL-17."],
      ["¿Qué interleucina de macrófagos activados favorece síntesis de IFN-γ por T y NK?", "IL-18."],
      ["¿Qué señal de TH1 favorece la activación clásica microbicida del macrófago?", "Interferón gamma, IFN-γ."],
      ["¿Qué funciones predominan en los macrófagos de activación alternativa?", "Regulación de inflamación y reparación con matriz, fibroblastos y angiogénesis."],
      ["¿Qué mecanismo explica liberar histamina pocos minutos después de entrecruzar IgE de un mastocito?", "Hipersensibilidad tipo I o inmediata."],
      ["¿Qué mecanismo de hipersensibilidad puede alterar la adhesión celular por autoanticuerpos?", "Tipo II, por disfunción mediada por anticuerpos."],
      ["¿Qué mecanismo de hipersensibilidad explica una reacción retardada mediada por células T?", "Tipo IV."],
    ],
  },
  {
    topic: "Linfático · ganglios y mucosas",
    cards: [
      ["¿Qué región ganglionar concentra la población T y carece de folículos?", "La paracorteza o corteza profunda."],
      ["¿Dónde predominan los nódulos B dentro de la corteza de un ganglio?", "En la corteza superficial o nodular."],
      ["¿Qué indica que un nódulo linfático haya desarrollado centro germinativo?", "Activación y proliferación de B en respuesta a antígeno."],
      ["¿Qué población predomina en el manto que rodea un centro germinativo?", "Linfocitos B pequeños, principalmente vírgenes."],
      ["¿Qué células secretoras de anticuerpos pueden encontrarse en cordones medulares ganglionares?", "Células plasmáticas."],
      ["¿Qué recorrido general sigue la linfa desde la entrada hasta la salida de un ganglio?", "Vasos aferentes → seno subcapsular → senos corticales y medulares → vasos eferentes."],
      ["¿Qué señales guían linfocitos para atravesar HEV e ingresar al ganglio?", "Quimiocinas y moléculas de adhesión endoteliales."],
      ["¿Qué hacen las dendríticas foliculares con el antígeno en vez de presentarlo como péptido por MHC II?", "Retienen antígeno nativo o complejos en su superficie para reconocimiento por B."],
      ["¿Qué relación entre epitelio y tejido linfático caracteriza las criptas palatinas?", "Invaginaciones de epitelio plano estratificado rodeadas por nódulos linfáticos."],
      ["¿Qué superficies se protegen con el tejido linfático asociado a mucosas?", "Mucosas expuestas, como las del tubo digestivo, vías respiratorias y aparato urogenital."],
    ],
  },
  {
    topic: "Linfático · timo y bazo",
    cards: [
      ["¿Qué capacidad debe demostrar un timocito para superar la selección positiva?", "Reconocer complejos de MHC propio con afinidad suficiente para recibir supervivencia."],
      ["¿Qué defecto de reconocimiento lleva a muerte por negligencia de un timocito?", "No reconocer adecuadamente MHC propio y no obtener señales de supervivencia."],
      ["¿Qué pretende eliminar la selección negativa del timo?", "Timocitos con reconocimiento excesivamente fuerte de autoantígenos."],
      ["¿Cómo se reconocen los núcleos de epiteliorreticulares V frente a los linfocitos medulares?", "Son más grandes y pálidos que los pequeños núcleos densos de los linfocitos."],
      ["¿Qué tipo epiteliorreticular se organiza en corpúsculos de Hassall?", "El tipo VI, en la médula tímica."],
      ["¿Qué barrera reduce la exposición de timocitos corticales a antígenos sanguíneos?", "La barrera hematotímica: capilar con uniones ocluyentes, entorno con macrófagos y epiteliorreticulares I."],
      ["¿Qué ocurre con el parénquima tímico al avanzar la edad?", "Involuciona y aumenta el tejido adiposo, sin que todo el timo desaparezca obligatoriamente."],
      ["¿Cómo se distribuyen T y B en la pulpa blanca esplénica?", "T en la vaina periarterial; B en los nódulos asociados."],
      ["¿Qué región esplénica contiene los cordones de Billroth y retira eritrocitos envejecidos?", "La pulpa roja."],
      ["¿Qué diferencia en la procedencia de antígenos distingue bazo y ganglio?", "El bazo vigila la sangre; el ganglio filtra antígenos transportados por la linfa."],
    ],
  },
]
const hemostasis: readonly Group[] = [
  {
    topic: "Hemostasia · endotelio y plaquetas",
    cards: [
      ["¿Qué refuerza el tapón plaquetario de hemostasia primaria durante la hemostasia secundaria?", "Una red de fibrina generada por la coagulación."],
      ["¿Por qué una plaqueta no tiene un núcleo funcional?", "Es un fragmento citoplasmático anucleado derivado de un megacariocito."],
      ["¿Qué mediadores endoteliales combinan vasodilatación con inhibición de agregación plaquetaria?", "Óxido nítrico y prostaciclina, PGI2."],
      ["¿Qué mediador de plaquetas activadas favorece vasoconstricción y agregación?", "Tromboxano A2, TxA2."],
      ["¿Qué puente molecular permite adhesión plaquetaria a colágeno expuesto?", "Colágeno → vWF → receptor plaquetario GpIb."],
      ["¿Qué puente molecular une plaquetas vecinas durante agregación?", "Fibrinógeno unido a receptores GpIIb/IIIa de ambas plaquetas."],
      ["¿Qué contenido prohemostático destacado liberan los gránulos densos plaquetarios?", "ADP y Ca2+, entre otros mediadores."],
      ["¿Qué proteínas de coagulación pueden almacenarse en gránulos α plaquetarios?", "Fibrinógeno y factores V y VIII, entre otras proteínas."],
      ["¿Por qué la exposición de fosfolípidos negativos favorece coagulación en una plaqueta activada?", "Facilita reunir calcio y factores en complejos catalíticos de superficie."],
      ["Además de adhesión, ¿qué factor transporta vWF en la sangre?", "El factor VIII."],
    ],
  },
  {
    topic: "Hemostasia · cascada y pruebas",
    cards: [
      ["¿Qué cofactor se asocia con VIIa para iniciar principalmente coagulación tras lesión vascular?", "El factor tisular o factor III."],
      ["¿En qué factor convergen las vías clásicas intrínseca y extrínseca?", "En X, que se activa a Xa."],
      ["¿Qué conversión realiza el complejo IXa–VIIIa o tenasa intrínseca?", "Activa el factor X a Xa."],
      ["¿Qué enzima y cofactor del complejo protrombinasa generan trombina?", "Xa con Va, sobre fosfolípidos y en presencia de Ca2+."],
      ["¿Qué sustrato escinde la trombina para producir monómeros de fibrina?", "Fibrinógeno, factor I."],
      ["¿Qué función cumple XIIIa después de formarse la fibrina?", "La estabiliza mediante enlaces cruzados."],
      ["¿Qué ramas de coagulación evalúa principalmente el tiempo de protrombina?", "La extrínseca y la común: VII; X, V, II e I."],
      ["¿Qué factores de la rama intrínseca explora el TTPa además de la vía común?", "XII, XI, IX y VIII."],
      ["¿Qué conjunto de factores forma la vía común clásica evaluada por TP y TTPa?", "X, V, II e I, con fibrinógeno como factor I."],
      ["¿Qué cuatro factores procoagulantes requieren modificación dependiente de vitamina K?", "II, VII, IX y X."],
    ],
  },
  {
    topic: "Hemostasia · regulación anticoagulante",
    cards: [
      ["¿Qué serinproteasas activadas de coagulación inhibe principalmente la antitrombina?", "Trombina IIa y factores IXa, Xa, XIa y XIIa."],
      ["¿Cómo potencian heparina y moléculas endoteliales similares el freno de coagulación?", "Aumentan la actividad de la antitrombina."],
      ["¿Qué cambio funcional ocurre cuando trombina se une a trombomodulina?", "Favorece la activación anticoagulante de proteína C."],
      ["¿Qué blancos inactiva la proteína C activada asistida por proteína S?", "Los cofactores Va y VIIIa."],
      ["¿Qué bloquea el inhibidor de la vía del factor tisular o TFPI?", "Factor Xa y el complejo factor tisular–VIIa."],
      ["¿Cómo cambia el balance hemostático cuando el endotelio aumenta factor tisular y PAI?", "Se vuelve más protrombótico: favorece coagulación y limita fibrinólisis."],
      ["¿Qué hace el citrato con el calcio de una muestra para pruebas de coagulación?", "Lo secuestra por quelación y evita coagulación espontánea."],
      ["¿Por qué usar factor tisular en el TP no equivale a medir factor III plasmático?", "Porque el laboratorio lo añade como reactivo iniciador."],
      ["¿Qué receptor permite a trombina activar directamente a las plaquetas?", "El receptor activado por proteasas o PAR."],
      ["¿Qué componente vascular puede cambiar entre funciones anticoagulantes y procoagulantes según su estado?", "El endotelio."],
    ],
  },
  {
    topic: "Hemostasia · fibrinólisis y trombosis",
    cards: [
      ["¿Qué precursor transforma t-PA para iniciar fibrinólisis?", "Plasminógeno en plasmina."],
      ["¿Por qué t-PA actúa con mayor eficacia sobre un coágulo que en circulación libre?", "Su asociación con fibrina aumenta su actividad local."],
      ["¿Qué enzima corta fibrina durante la disolución del coágulo?", "La plasmina."],
      ["¿Qué inhibidor neutraliza plasmina libre para limitar proteólisis distante?", "α2-antiplasmina."],
      ["¿Qué ocurre con la fibrinólisis si aumenta PAI endotelial?", "Disminuye, porque se inhiben activadores de plasminógeno."],
      ["¿Qué indica el origen molecular de un dímero D?", "Degradación de fibrina entrecruzada; no identifica por sí solo una causa clínica específica."],
      ["¿Qué tres tipos de alteración componen la tríada de Virchow?", "Lesión o disfunción endotelial, flujo anormal e hipercoagulabilidad."],
      ["¿Cómo favorece estasis la acumulación local de actividad procoagulante?", "Reduce el lavado de factores activados y la llegada de inhibidores."],
      ["¿Cómo puede la turbulencia favorecer trombosis además de crear estasis local?", "Puede lesionar o alterar funcionalmente el endotelio."],
      ["¿Qué distingue un tapón hemostático fisiológico de una trombosis patológica?", "El primero sella una lesión de forma localizada; la segunda forma un trombo inapropiado dentro del sistema vascular."],
    ],
  },
]
const groups = [...cardiovascular, ...lymphatic, ...hemostasis]

export const citoIPrePartialFlashcards: Flashcard[] = groups.flatMap((group, groupIndex) =>
  group.cards.map(([front, back], cardIndex) => ({
    id: `prepartial-cito1-card-${String(groupIndex * 10 + cardIndex + 1).padStart(3, "0")}`,
    subject: "Citohistología", book: "Repaso pre-parcial", chapter: CITO_II_FIRST_PARTIAL,
    topic: group.topic, subtopic: "Conceptos esenciales", front, back,
    tags: ["Repaso pre-parcial", CITO_II_FIRST_PARTIAL, group.topic],
  }))
)
