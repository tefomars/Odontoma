import { createManualQuizBank, type ManualQuizSeed } from "../manualQuiz"

const seeds: ManualQuizSeed[] = [
  {
    id: "cap14-001",
    topic: "Fundamentos inmunitarios",
    difficulty: "medium",
    question: "Una respuesta aparece en minutos, reconoce patrones compartidos por muchos microbios y no mejora tras exposiciones repetidas. ¿A qué sistema pertenece?",
    correct: "Inmunidad innata.",
    distractors: ["Inmunidad adaptativa humoral.", "Memoria inmunitaria secundaria.", "Selección clonal de linfocitos B."],
    explanation: "La inmunidad innata es rápida, reconoce patrones conservados y carece de memoria específica clásica."
  },
  {
    id: "cap14-002",
    topic: "Fundamentos inmunitarios",
    difficulty: "medium",
    question: "¿Qué propiedad distingue mejor a la respuesta adaptativa secundaria de la primaria?",
    correct: "Es más rápida e intensa por la presencia de células de memoria.",
    distractors: ["Depende únicamente de neutrófilos sin receptores específicos.", "Ocurre sin expansión de clones celulares.", "Produce siempre menos anticuerpos y de menor afinidad."],
    explanation: "Las células de memoria permiten una respuesta secundaria más veloz, potente y eficaz."
  },
  {
    id: "cap14-003",
    topic: "Órganos linfáticos",
    difficulty: "easy",
    question: "¿Cuál pareja está formada solo por órganos linfáticos primarios?",
    correct: "Médula ósea y timo.",
    distractors: ["Bazo y ganglio linfático.", "Amígdala y placa de Peyer.", "Ganglio linfático y timo."],
    explanation: "En los órganos primarios los linfocitos se desarrollan y maduran sin estímulo antigénico."
  },
  {
    id: "cap14-004",
    topic: "Circulación linfocitaria",
    difficulty: "hard",
    question: "Un linfocito virgen abandona la sangre para explorar un ganglio. ¿Por qué estructura ingresa con mayor frecuencia?",
    correct: "Vénula de endotelio alto.",
    distractors: ["Seno subcapsular aferente.", "Arteria trabecular.", "Conducto torácico dentro del ganglio."],
    explanation: "Las VEA permiten la extravasación selectiva de linfocitos desde la sangre al parénquima ganglionar."
  },
  {
    id: "cap14-005",
    topic: "Linfocitos T",
    difficulty: "medium",
    question: "¿Qué combinación describe a un linfocito T colaborador convencional?",
    correct: "CD3+, CD4+ y reconocimiento de péptidos presentados por MHC II.",
    distractors: ["CD3−, CD20+ y reconocimiento por inmunoglobulina de membrana.", "CD3+, CD8+ y reconocimiento exclusivo de MHC II.", "CD56+, CD16+ y ausencia de receptor TCR."],
    explanation: "Los T colaboradores expresan CD3 y CD4 y reconocen péptidos unidos a MHC II."
  },
  {
    id: "cap14-006",
    topic: "Linfocitos T CD8+",
    difficulty: "hard",
    question: "Una célula infectada presenta péptidos virales en MHC I. ¿Qué célula puede destruirla de forma específica?",
    correct: "Linfocito T citotóxico CD8+.",
    distractors: ["Linfocito T colaborador CD4+.", "Célula plasmática madura.", "Célula reticular del timo."],
    explanation: "Los T CD8+ reconocen complejos péptido-MHC I y desencadenan apoptosis de la célula diana."
  },
  {
    id: "cap14-007",
    topic: "Citotoxicidad T",
    difficulty: "hard",
    question: "¿Qué secuencia explica la vía citotóxica mediada por gránulos?",
    correct: "Perforina forma poros y las granzimas activan apoptosis.",
    distractors: ["Fas de la célula T se une a FasL de la diana y bloquea apoptosis.", "El complemento entra en la célula T y libera granzimas hacia el plasma.", "Las granzimas forman el poro y la perforina se une al ADN nuclear."],
    explanation: "La perforina facilita la entrada de granzimas, que activan vías apoptóticas."
  },
  {
    id: "cap14-008",
    topic: "Linfocitos T reguladores",
    difficulty: "medium",
    question: "¿Qué consecuencia es más probable si falla gravemente la función de los linfocitos T reguladores?",
    correct: "Pérdida de tolerancia y aumento de autoinmunidad.",
    distractors: ["Incapacidad para generar linfocitos T CD8+ citotóxicos.", "Pérdida selectiva de la síntesis de IgM por células plasmáticas.", "Ausencia de fagocitosis por neutrófilos durante infecciones agudas."],
    explanation: "Los T reguladores suprimen respuestas excesivas y ayudan a mantener tolerancia frente a lo propio."
  },
  {
    id: "cap14-009",
    topic: "Linfocitos TH1",
    difficulty: "hard",
    question: "¿Qué respuesta se asocia mejor con un perfil TH1?",
    correct: "Activación de macrófagos frente a microorganismos intracelulares.",
    distractors: ["Producción de IgE y activación de eosinófilos contra helmintos.", "Reclutamiento predominante de neutrófilos frente a bacterias extracelulares.", "Supresión de respuestas adaptativas mediante IL-10 y TGF-β."],
    explanation: "Los TH1 producen, entre otras citocinas, IFN-γ y favorecen inmunidad celular y activación macrofágica."
  },
  {
    id: "cap14-010",
    topic: "Linfocitos TH2",
    difficulty: "hard",
    question: "Un paciente presenta respuesta intensa contra helmintos con eosinófilos e IgE. ¿Qué subpoblación T predomina?",
    correct: "TH2.",
    distractors: ["TH1.", "TH17.", "T CD8+ citotóxica."],
    explanation: "Los TH2 favorecen respuestas mediadas por IgE, mastocitos y eosinófilos."
  },
  {
    id: "cap14-011",
    topic: "Linfocitos TH17",
    difficulty: "hard",
    question: "¿Qué función caracteriza principalmente a los linfocitos TH17?",
    correct: "Reclutar neutrófilos y reforzar barreras frente a bacterias y hongos.",
    distractors: ["Activar macrófagos contra microorganismos intracelulares.", "Favorecer IgE y eosinófilos contra helmintos.", "Suprimir clones autorreactivos mediante citocinas reguladoras."],
    explanation: "Las citocinas de TH17 promueven inflamación neutrofílica y defensa de superficies."
  },
  {
    id: "cap14-012",
    topic: "Linfocitos B",
    difficulty: "medium",
    question: "Después de activarse y recibir ayuda adecuada, ¿en qué célula efectora se diferencia un linfocito B para secretar anticuerpos?",
    correct: "Célula plasmática.",
    distractors: ["Célula dendrítica folicular.", "Linfocito NK.", "Macrófago M1."],
    explanation: "Las células plasmáticas son la forma efectora secretora de inmunoglobulinas del linfocito B."
  },
  {
    id: "cap14-013",
    topic: "Inmunoglobulinas",
    difficulty: "medium",
    question: "¿Qué inmunoglobulina aparece primero en una respuesta primaria y forma pentámeros en plasma?",
    correct: "IgM.",
    distractors: ["IgG.", "IgA.", "IgE."],
    explanation: "La IgM es la primera inmunoglobulina secretada en la respuesta primaria y circula como pentámero."
  },
  {
    id: "cap14-014",
    topic: "Inmunoglobulinas",
    difficulty: "medium",
    question: "¿Qué inmunoglobulina predomina en secreciones mucosas y suele presentarse como dímero?",
    correct: "IgA.",
    distractors: ["IgD.", "IgG.", "IgM."],
    explanation: "La IgA secretora protege superficies mucosas y se transporta como dímero con componente secretor."
  },
  {
    id: "cap14-015",
    topic: "Inmunoglobulinas",
    difficulty: "hard",
    question: "¿Qué clase de anticuerpo atraviesa la placenta y aporta inmunidad pasiva al feto?",
    correct: "IgG.",
    distractors: ["IgM.", "IgA.", "IgE."],
    explanation: "La IgG cruza la placenta mediante transporte mediado por receptor."
  },
  {
    id: "cap14-016",
    topic: "Linfocitos NK",
    difficulty: "hard",
    question: "Una célula tumoral reduce mucho la expresión de MHC I. ¿Qué población puede reconocer esta ausencia sin sensibilización previa?",
    correct: "Linfocitos NK.",
    distractors: ["Linfocitos B vírgenes.", "Células plasmáticas.", "Células epiteliorreticulares tipo VI."],
    explanation: "Las NK detectan el desequilibrio entre señales activadoras e inhibitorias, incluida la pérdida de MHC I."
  },
  {
    id: "cap14-017",
    topic: "Marcadores CD",
    difficulty: "medium",
    question: "En una biopsia, ¿qué marcador apoya que una célula pertenece al linaje T?",
    correct: "CD3.",
    distractors: ["CD19.", "CD20.", "CD21."],
    explanation: "CD3 forma parte del complejo asociado al TCR y es un marcador pan-T."
  },
  {
    id: "cap14-018",
    topic: "Marcadores CD",
    difficulty: "hard",
    question: "¿Qué pareja marcador-población está correctamente asociada?",
    correct: "CD20 — linfocito B.",
    distractors: ["CD3 — linfocito B maduro.", "CD4 — linfocito NK convencional.", "CD8 — linfocito T colaborador."],
    explanation: "CD20 es un marcador característico de linfocitos B maduros."
  },
  {
    id: "cap14-019",
    topic: "MHC",
    difficulty: "hard",
    question: "¿Cuál asociación entre molécula presentadora, origen del péptido y linfocito es correcta?",
    correct: "MHC I — péptido citosólico — linfocito T CD8+.",
    distractors: ["MHC II — péptido citosólico — linfocito T CD8+.", "MHC I — antígeno endocitado — linfocito T CD4+.", "MHC II — péptido endosómico — linfocito T CD8+."],
    explanation: "MHC I presenta péptidos endógenos a T CD8+; MHC II presenta péptidos exógenos procesados a T CD4+."
  },
  {
    id: "cap14-020",
    topic: "Procesamiento antigénico",
    difficulty: "hard",
    question: "Una célula dendrítica fagocita una bacteria y activa un T colaborador. ¿Dónde se cargó normalmente el péptido bacteriano?",
    correct: "En una molécula MHC II dentro de compartimentos endosómicos.",
    distractors: ["En una molécula MHC I dentro del retículo endoplasmático.", "En una molécula CD1 cargada exclusivamente con péptidos.", "En MHC II directamente sobre la membrana sin procesamiento vesicular."],
    explanation: "Los antígenos endocitados se procesan en vesículas y se cargan en MHC II."
  },
  {
    id: "cap14-021",
    topic: "Activación de linfocitos T",
    difficulty: "hard",
    question: "¿Por qué el reconocimiento del complejo péptido-MHC por sí solo puede no activar plenamente a un linfocito T virgen?",
    correct: "También requiere una señal coestimuladora, como B7-CD28.",
    distractors: ["También requiere unión de CD8 a cualquier molécula MHC II.", "Debe recibir primero anticuerpos secretados por el mismo linfocito T.", "Necesita que la APC pierda sus moléculas B7 antes del contacto."],
    explanation: "La activación eficaz necesita señal antigénica y coestimulación; su ausencia puede inducir anergia."
  },
  {
    id: "cap14-022",
    topic: "Activación de linfocitos B",
    difficulty: "hard",
    question: "En una respuesta B dependiente de T, ¿qué interacción favorece cambio de isotipo y memoria?",
    correct: "CD40 del linfocito B con CD40L del linfocito T colaborador.",
    distractors: ["CD28 del linfocito B con B7 del linfocito T.", "CD8 del linfocito B con MHC I del linfocito T.", "Fas del linfocito B con FasL como señal principal de cambio de isotipo."],
    explanation: "La señal CD40-CD40L, junto con citocinas, es esencial para una respuesta humoral madura."
  },
  {
    id: "cap14-023",
    topic: "Células presentadoras de antígeno",
    difficulty: "medium",
    question: "¿Qué célula es especialmente eficaz para iniciar respuestas de linfocitos T vírgenes?",
    correct: "Célula dendrítica.",
    distractors: ["Eritrocito.", "Adipocito blanco.", "Fibra muscular lisa."],
    explanation: "Las células dendríticas capturan antígeno en tejidos y migran a órganos linfáticos para presentarlo."
  },
  {
    id: "cap14-024",
    topic: "Macrófagos M1 y M2",
    difficulty: "hard",
    question: "¿Qué perfil corresponde a un macrófago M1 activado clásicamente?",
    correct: "Microbicida, proinflamatorio y productor de especies reactivas y citocinas.",
    distractors: ["Reparador, antiinflamatorio y promotor de fibrosis.", "Secretor exclusivo de inmunoglobulinas.", "Formador de la barrera hematotímica."],
    explanation: "Los M1 participan en defensa microbiana e inflamación; los M2 favorecen resolución y reparación."
  },
  {
    id: "cap14-025",
    topic: "Interleucinas",
    difficulty: "hard",
    question: "Un macrófago libera una citocina que induce fiebre y favorece activación linfocitaria. ¿Cuál es?",
    correct: "IL-1.",
    distractors: ["IL-4.", "IL-5.", "IL-10."],
    explanation: "IL-1 es una citocina proinflamatoria con acción pirógena y efectos sobre múltiples células inmunitarias."
  },
  {
    id: "cap14-026",
    topic: "Interleucinas",
    difficulty: "hard",
    question: "¿Qué interleucina actúa como factor de crecimiento autocrino importante para linfocitos T activados?",
    correct: "IL-2.",
    distractors: ["IL-1.", "IL-8.", "IL-12."],
    explanation: "La IL-2 impulsa proliferación y supervivencia de linfocitos T después de su activación."
  },
  {
    id: "cap14-027",
    topic: "Interleucinas",
    difficulty: "hard",
    question: "¿Qué asociación funcional es correcta?",
    correct: "IL-5 — crecimiento y activación de eosinófilos.",
    distractors: ["IL-2 — diferenciación selectiva de eosinófilos.", "IL-4 — activación clásica de macrófagos M1.", "IL-10 — amplificación de la inflamación por neutrófilos."],
    explanation: "IL-5 es clave para eosinófilos; IL-4 favorece respuestas TH2 e IgE, e IL-10 es antiinflamatoria."
  },
  {
    id: "cap14-028",
    topic: "Vasos linfáticos",
    difficulty: "medium",
    question: "¿Qué vaso lleva linfa no filtrada hacia el seno subcapsular de un ganglio?",
    correct: "Vaso linfático aferente.",
    distractors: ["Vaso linfático eferente.", "Vénula de endotelio alto.", "Arteria trabecular."],
    explanation: "Los aferentes atraviesan la cápsula y entregan linfa al seno subcapsular."
  },
  {
    id: "cap14-029",
    topic: "MALT",
    difficulty: "medium",
    question: "¿Qué característica diferencia al tejido linfático difuso de un ganglio linfático?",
    correct: "No está rodeado por una cápsula completa y se integra con la mucosa.",
    distractors: ["Está encapsulado por completo y recibe numerosos vasos aferentes.", "Se organiza siempre en corteza, paracorteza y médula.", "Filtra linfa antes de que esta alcance los epitelios mucosos."],
    explanation: "El MALT y el tejido linfático difuso protegen mucosas sin constituir siempre órganos encapsulados."
  },
  {
    id: "cap14-030",
    topic: "Nódulos linfáticos",
    difficulty: "hard",
    question: "Un nódulo presenta centro germinal pálido y corona periférica oscura. ¿Qué indica este aspecto?",
    correct: "Es un nódulo secundario con proliferación y selección de linfocitos B.",
    distractors: ["Es un nódulo primario compuesto por linfocitos B vírgenes uniformes.", "Es una zona T activada que sustituyó por completo el folículo B.", "Es un folículo involucionado sin proliferación ni selección celular."],
    explanation: "El centro germinal aparece tras activación antigénica y contiene B proliferantes y células auxiliares."
  },
  {
    id: "cap14-031",
    topic: "Amígdalas y placas de Peyer",
    difficulty: "hard",
    question: "¿Qué rasgo permite distinguir una amígdala palatina de un ganglio linfático?",
    correct: "Epitelio plano estratificado con criptas profundas.",
    distractors: ["Seno subcapsular continuo alrededor de todo el órgano.", "Pulpa roja con sinusoides llenos de eritrocitos.", "Lobulillos con corteza y médula tímicas."],
    explanation: "La amígdala palatina está revestida por epitelio plano estratificado que forma criptas."
  },
  {
    id: "cap14-032",
    topic: "Ganglio linfático",
    difficulty: "medium",
    question: "¿Dónde se concentran principalmente los nódulos de linfocitos B en un ganglio?",
    correct: "Corteza superficial.",
    distractors: ["Paracorteza.", "Senos medulares.", "Hilio vascular."],
    explanation: "La corteza superficial es zona B; la paracorteza es zona T y la médula contiene cordones y senos."
  },
  {
    id: "cap14-033",
    topic: "Ganglio linfático",
    difficulty: "hard",
    question: "Una inmunodeficiencia selectiva de linfocitos T produciría mayor reducción celular en:",
    correct: "Paracorteza ganglionar.",
    distractors: ["Centros germinales corticales.", "Cordones medulares ricos en plasmocitos.", "Seno subcapsular."],
    explanation: "La paracorteza es el compartimento dependiente de linfocitos T."
  },
  {
    id: "cap14-034",
    topic: "Malla reticular del ganglio",
    difficulty: "hard",
    question: "¿Qué estructura guía el tránsito de linfocitos y distribuye pequeñas moléculas desde la linfa dentro del ganglio?",
    correct: "Sistema de conductos formado por células y fibras reticulares.",
    distractors: ["Los senos linfáticos revestidos por endotelio discontinuo.", "Las vénulas de endotelio alto de la paracorteza.", "Los vasos linfáticos eferentes del hilio."],
    explanation: "La red reticular organiza el estroma y forma conductos que transportan señales y antígenos pequeños."
  },
  {
    id: "cap14-035",
    topic: "Timo",
    difficulty: "medium",
    question: "¿Qué rasgo histológico identifica al timo frente a un ganglio linfático?",
    correct: "Lobulillos con corteza oscura, médula clara y corpúsculos de Hassall.",
    distractors: ["Nódulos con centros germinales en la corteza.", "Seno subcapsular con vasos aferentes.", "Pulpa blanca y pulpa roja alrededor de arterias."],
    explanation: "El timo es lobulado, carece de nódulos B y presenta corpúsculos de Hassall en la médula."
  },
  {
    id: "cap14-036",
    topic: "Células epiteliorreticulares",
    difficulty: "hard",
    question: "¿Qué característica demuestra que el estroma del timo no es una red típica de células reticulares conjuntivas?",
    correct: "Sus células epiteliorreticulares se unen por desmosomas y contienen filamentos intermedios.",
    distractors: ["Sus células producen abundantes fibras reticulares extracelulares como los fibroblastos ganglionares.", "Su estroma está formado por macrófagos libres sin uniones intercelulares.", "Sus células son endoteliales y delimitan una red continua de sinusoides."],
    explanation: "El estroma tímico deriva de epitelio y está formado por células epiteliorreticulares, no por fibras reticulares en el parénquima."
  },
  {
    id: "cap14-037",
    topic: "Barrera hematotímica",
    difficulty: "hard",
    question: "¿Cuál componente pertenece a la barrera hematotímica de la corteza?",
    correct: "Endotelio capilar continuo con uniones estrechas y células epiteliorreticulares tipo I.",
    distractors: ["Sinusoides discontinuos y células de Kupffer.", "Vénulas fenestradas y corpúsculos de Hassall.", "Epitelio plano estratificado con criptas."],
    explanation: "La barrera separa timocitos inmaduros de antígenos circulantes mediante endotelio continuo, láminas basales, macrófagos y células tipo I."
  },
  {
    id: "cap14-038",
    topic: "Educación tímica",
    difficulty: "hard",
    question: "Durante la selección positiva, ¿qué timocitos sobreviven?",
    correct: "Los que reconocen con afinidad adecuada moléculas MHC propias.",
    distractors: ["Los que no pueden interactuar con ningún MHC.", "Los que reaccionan intensamente contra antígenos propios.", "Solo los que ya secretan inmunoglobulinas."],
    explanation: "La selección positiva conserva células capaces de reconocer MHC propio; la negativa elimina autorreactividad intensa."
  },
  {
    id: "cap14-039",
    topic: "Educación tímica",
    difficulty: "hard",
    question: "¿Qué resultado busca principalmente la selección negativa tímica?",
    correct: "Eliminar timocitos con alta afinidad por antígenos propios.",
    distractors: ["Convertir linfocitos T en linfocitos B.", "Inducir producción de IgM en la corteza.", "Permitir que todos los clones autorreactivos salgan a sangre."],
    explanation: "La selección negativa establece tolerancia central al retirar clones peligrosamente autorreactivos."
  },
  {
    id: "cap14-040",
    topic: "Corpúsculos de Hassall",
    difficulty: "medium",
    question: "Al identificar corpúsculos de Hassall en una lámina, ¿en qué región del órgano deben estar?",
    correct: "Médula del timo.",
    distractors: ["Centro germinal del ganglio.", "Pulpa roja del bazo.", "Cripta de la amígdala palatina."],
    explanation: "Son remolinos concéntricos de células epiteliorreticulares tipo VI en la médula tímica."
  },
  {
    id: "cap14-041",
    topic: "Bazo",
    difficulty: "medium",
    question: "¿Qué diferencia funcional fundamental separa al bazo de los ganglios linfáticos?",
    correct: "El bazo filtra sangre; los ganglios filtran linfa.",
    distractors: ["El bazo filtra linfa; los ganglios filtran sangre.", "El bazo recibe vasos linfáticos aferentes; los ganglios solo vasos eferentes.", "El bazo carece de macrófagos; los ganglios concentran todos los macrófagos corporales."],
    explanation: "El bazo vigila antígenos sanguíneos y elimina células sanguíneas envejecidas."
  },
  {
    id: "cap14-042",
    topic: "Pulpa blanca",
    difficulty: "hard",
    question: "En la pulpa blanca, ¿qué región rica en linfocitos T rodea directamente a la arteria central?",
    correct: "Vaina linfática periarterial.",
    distractors: ["Cordón de Billroth.", "Seno venoso esplénico.", "Zona de células plasmáticas medulares."],
    explanation: "La PALS es el compartimento T de la pulpa blanca; los nódulos asociados son zonas B."
  },
  {
    id: "cap14-043",
    topic: "Pulpa roja",
    difficulty: "hard",
    question: "¿Qué estructuras forman la pulpa roja del bazo?",
    correct: "Cordones esplénicos y sinusoides venosos.",
    distractors: ["Corteza, paracorteza y senos subcapsulares.", "Criptas epiteliales y centros germinales.", "Lobulillos corticales y corpúsculos de Hassall."],
    explanation: "La pulpa roja contiene cordones de Billroth separados por sinusoides."
  },
  {
    id: "cap14-044",
    topic: "Senos esplénicos",
    difficulty: "hard",
    question: "¿Por qué los eritrocitos envejecidos tienen dificultad para volver a entrar en los sinusoides esplénicos?",
    correct: "Han perdido flexibilidad y no atraviesan bien las hendiduras entre células endoteliales alargadas.",
    distractors: ["Aumentan su deformabilidad y atraviesan demasiado rápido las hendiduras.", "Quedan unidos a vénulas de endotelio alto mediante selectinas.", "No pueden abandonar la pulpa blanca porque expresan receptores de quimiocinas."],
    explanation: "La circulación abierta obliga a los eritrocitos a deformarse para atravesar las hendiduras de los sinusoides."
  },
  {
    id: "cap14-045",
    topic: "Hipersensibilidad tipo I",
    difficulty: "hard",
    question: "¿Qué evento desencadena la degranulación inmediata de un mastocito en una alergia ya sensibilizada?",
    correct: "Entrecruzamiento por el antígeno de IgE unida a receptores FcεRI.",
    distractors: ["Unión de IgG a MHC I del mastocito.", "Reconocimiento de colágeno por CD8.", "Pérdida de todos los gránulos antes del contacto antigénico."],
    explanation: "El antígeno multivalente entrecruza IgE de membrana y activa la liberación de mediadores."
  },
  {
    id: "cap14-046",
    topic: "VIH y sida",
    difficulty: "hard",
    question: "¿Qué alteración explica mejor la inmunodeficiencia progresiva causada por VIH?",
    correct: "Pérdida de linfocitos T CD4+ y deterioro coordinado de respuestas celulares y humorales.",
    distractors: ["Defecto aislado de maduración de linfocitos B con recuento CD4 normal.", "Pérdida selectiva de neutrófilos sin infección de células mononucleares.", "Bloqueo del complemento con expansión progresiva de linfocitos CD4+."],
    explanation: "El VIH infecta principalmente células CD4+ y compromete la coordinación de múltiples ramas inmunitarias."
  },
  {
    id: "cap14-047",
    topic: "Linfadenitis reactiva",
    difficulty: "hard",
    question: "Un ganglio doloroso muestra centros germinales grandes pero conserva su arquitectura general. ¿Qué interpretación es más probable?",
    correct: "Hiperplasia folicular reactiva.",
    distractors: ["Sustitución completa por una neoplasia monoclonal.", "Involución tímica fisiológica.", "Infarto de pulpa roja esplénica."],
    explanation: "La estimulación antigénica puede ampliar centros germinales sin borrar la arquitectura ganglionar."
  },
  {
    id: "cap14-048",
    topic: "Identificación histológica",
    difficulty: "hard",
    question: "Una lámina muestra una arteria central rodeada por tejido linfático y, alrededor, abundantes sinusoides llenos de eritrocitos. ¿Qué órgano es?",
    correct: "Bazo.",
    distractors: ["Timo.", "Ganglio linfático.", "Amígdala palatina."],
    explanation: "La combinación de pulpa blanca periarterial y pulpa roja con sinusoides identifica el bazo."
  }
]

export const cap14Questions = createManualQuizBank("Capítulo 14", seeds)
