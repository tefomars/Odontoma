import { createManualQuizBank, type ManualQuizSeed } from "../manualQuiz"

const seeds: ManualQuizSeed[] = [
  {
    id: "cap13-001",
    topic: "Pared del corazón",
    difficulty: "medium",
    question: "En un corte de pared ventricular se observa una capa interna con endotelio, tejido conjuntivo subendotelial y algunas células musculares lisas. ¿Qué capa es?",
    correct: "Endocardio.",
    distractors: ["Miocardio.", "Epicardio.", "Pericardio fibroso."],
    explanation: "El endocardio reviste las cavidades cardíacas y se continúa con la túnica íntima de los vasos."
  },
  {
    id: "cap13-002",
    topic: "Pared del corazón",
    difficulty: "easy",
    question: "¿En qué cavidad alcanza mayor espesor el miocardio debido a la resistencia que debe vencer?",
    correct: "Ventrículo izquierdo.",
    distractors: ["Ventrículo derecho.", "Aurícula izquierda.", "Aurícula derecha."],
    explanation: "El ventrículo izquierdo impulsa sangre a la circulación sistémica y por ello posee el miocardio más grueso."
  },
  {
    id: "cap13-003",
    topic: "Pared del corazón",
    difficulty: "medium",
    question: "Una superficie cardíaca presenta mesotelio sobre tejido conjuntivo con vasos coronarios y adipocitos. ¿Qué región se está observando?",
    correct: "Epicardio.",
    distractors: ["Endocardio.", "Miocardio.", "Esqueleto fibroso."],
    explanation: "El epicardio es la hoja visceral del pericardio seroso y contiene mesotelio, vasos, nervios y grasa."
  },
  {
    id: "cap13-004",
    topic: "Esqueleto fibroso y válvulas",
    difficulty: "medium",
    question: "¿Qué propiedad del esqueleto fibroso cardíaco contribuye a que aurículas y ventrículos no se despolaricen simultáneamente?",
    correct: "Aísla eléctricamente el miocardio auricular del ventricular.",
    distractors: ["Sostiene las valvas en los orificios cardíacos.", "Ofrece inserción a fibras del miocardio.", "Evita la dilatación excesiva de los orificios valvulares."],
    explanation: "El tejido conjuntivo denso del esqueleto fibroso actúa como aislante; el haz auriculoventricular constituye la vía normal de conducción entre ambas regiones."
  },
  {
    id: "cap13-005",
    topic: "Esqueleto fibroso y válvulas",
    difficulty: "hard",
    question: "En una válvula cardíaca, ¿qué asociación entre capa y composición es correcta?",
    correct: "Fibrosa — tejido conjuntivo denso continuo con los anillos fibrosos.",
    distractors: ["Fibrosa — tejido conjuntivo laxo rico en proteoglucanos.", "Esponjosa — haces densos de colágeno tipo I.", "Ventricular — tejido conjuntivo laxo sin fibras elásticas."],
    explanation: "La fibrosa forma el núcleo resistente de la válvula; la esponjosa contiene tejido conjuntivo laxo rico en proteoglucanos."
  },
  {
    id: "cap13-006",
    topic: "Válvulas cardíacas",
    difficulty: "medium",
    question: "¿Por qué las válvulas cardíacas pueden nutrirse sin poseer una red vascular extensa en condiciones normales?",
    correct: "Su tejido es relativamente delgado y recibe nutrientes por difusión desde la sangre.",
    distractors: ["Los vasa vasorum penetran uniformemente toda la valva.", "La fibrosa contiene una red capilar continua propia.", "Los vasos coronarios desembocan directamente en la esponjosa."],
    explanation: "Las valvas son avasculares en gran parte y se nutren por difusión desde la sangre que baña sus superficies."
  },
  {
    id: "cap13-007",
    topic: "Sistema de conducción",
    difficulty: "medium",
    question: "Una célula subendocárdica es grande, pálida y contiene pocas miofibrillas desplazadas hacia la periferia. ¿Cuál es su función principal?",
    correct: "Conducir con rapidez el impulso por los ventrículos.",
    distractors: ["Secretar péptido natriurético auricular.", "Formar el armazón colágeno de una válvula.", "Fagocitar restos del miocardio."],
    explanation: "La descripción corresponde a una fibra de Purkinje, especializada en conducción rápida."
  },
  {
    id: "cap13-008",
    topic: "Sistema de conducción",
    difficulty: "hard",
    question: "¿Qué secuencia sigue normalmente el impulso después de originarse en el nodo sinoauricular?",
    correct: "Miocardio auricular → nodo auriculoventricular → haz auriculoventricular → fibras de Purkinje.",
    distractors: ["Nodo auriculoventricular → miocardio auricular → fibras de Purkinje → nodo sinoauricular.", "Fibras de Purkinje → nodo sinoauricular → haz auriculoventricular → aurículas.", "Miocardio ventricular → nodo auriculoventricular → aurículas → fibras de Purkinje."],
    explanation: "El nodo sinoauricular inicia el impulso, que atraviesa aurículas, nodo AV, haz AV y sistema de Purkinje."
  },
  {
    id: "cap13-009",
    topic: "Regulación cardíaca",
    difficulty: "medium",
    question: "¿Qué cambio produce la estimulación parasimpática sobre el corazón?",
    correct: "Disminuye la frecuencia cardíaca.",
    distractors: ["Aumenta la fuerza ventricular por acción β1.", "Acelera la conducción mediante noradrenalina.", "Eleva directamente la presión por vasoconstricción coronaria."],
    explanation: "La estimulación vagal colinérgica reduce la frecuencia y enlentece la conducción nodal."
  },
  {
    id: "cap13-010",
    topic: "Regulación cardíaca",
    difficulty: "hard",
    question: "El estiramiento auricular por aumento del volumen sanguíneo favorece la liberación de un péptido. ¿Cuál es su efecto esperado?",
    correct: "Aumentar la excreción renal de sodio y agua.",
    distractors: ["Retener sodio mediante activación de aldosterona.", "Elevar la volemia por acción antidiurética.", "Contraer arteriolas para aumentar la poscarga."],
    explanation: "El péptido natriurético auricular promueve natriuresis, diuresis y reducción de la presión arterial."
  },
  {
    id: "cap13-011",
    topic: "Capas de la pared vascular",
    difficulty: "easy",
    question: "¿Qué túnica vascular contiene el endotelio y su lámina basal?",
    correct: "Túnica íntima.",
    distractors: ["Túnica media.", "Túnica adventicia.", "Vasa vasorum."],
    explanation: "La íntima comprende endotelio, lámina basal y tejido subendotelial variable."
  },
  {
    id: "cap13-012",
    topic: "Capas de la pared vascular",
    difficulty: "medium",
    question: "Al comparar una arteria muscular con una vena acompañante, ¿qué rasgo favorece identificar la arteria?",
    correct: "Una túnica media proporcionalmente más gruesa y organizada.",
    distractors: ["Una luz siempre mayor y colapsada.", "Válvulas frecuentes en toda su longitud.", "Una adventicia que constituye casi toda la pared."],
    explanation: "Las arterias musculares se distinguen por su media prominente; las venas suelen tener luz amplia y adventicia dominante."
  },
  {
    id: "cap13-013",
    topic: "Capas de la pared vascular",
    difficulty: "medium",
    question: "En un vaso grande, los vasos pequeños que penetran desde la adventicia para nutrir la pared corresponden a:",
    correct: "Vasa vasorum.",
    distractors: ["Anastomosis arteriovenosas.", "Capilares linfáticos ciegos.", "Fenestraciones endoteliales."],
    explanation: "Los vasa vasorum irrigan las porciones externas de la pared de vasos demasiado gruesos para nutrirse solo por difusión luminal."
  },
  {
    id: "cap13-014",
    topic: "Endotelio vascular",
    difficulty: "hard",
    question: "Un endotelio intacto evita la agregación plaquetaria principalmente mediante la liberación de:",
    correct: "Óxido nítrico y prostaciclina.",
    distractors: ["Endotelina y tromboxano A2.", "Factor de von Willebrand y colágeno.", "Angiotensina II y aldosterona."],
    explanation: "El NO y la prostaciclina son vasodilatadores e inhibidores de la activación plaquetaria."
  },
  {
    id: "cap13-015",
    topic: "Endotelio vascular",
    difficulty: "medium",
    question: "¿Qué producto almacenado en los cuerpos de Weibel-Palade participa en la adhesión plaquetaria?",
    correct: "Factor de von Willebrand.",
    distractors: ["Fibrinógeno plasmático.", "Troponina cardíaca.", "Colágeno tipo II."],
    explanation: "Los cuerpos de Weibel-Palade almacenan factor de von Willebrand y P-selectina."
  },
  {
    id: "cap13-016",
    topic: "Endotelio vascular",
    difficulty: "hard",
    question: "Si aumenta el esfuerzo de cizallamiento sobre el endotelio, ¿qué respuesta ayuda a ajustar el calibre vascular?",
    correct: "Activación de eNOS y producción de óxido nítrico.",
    distractors: ["Liberación de endotelina y contracción del músculo liso.", "Exocitosis de factor de von Willebrand y adhesión plaquetaria.", "Aumento de la actividad de la enzima convertidora de angiotensina."],
    explanation: "La eNOS endotelial genera NO, que difunde al músculo liso y favorece su relajación."
  },
  {
    id: "cap13-017",
    topic: "Arterias elásticas",
    difficulty: "medium",
    question: "¿Qué componente permite que la aorta mantenga el flujo durante la diástole?",
    correct: "Las numerosas láminas elásticas de la túnica media.",
    distractors: ["Las válvulas de la túnica íntima.", "Los fascículos longitudinales de la adventicia.", "Las fenestraciones de sus capilares."],
    explanation: "Las láminas elásticas almacenan energía en sístole y recuperan su forma durante la diástole."
  },
  {
    id: "cap13-018",
    topic: "Arterias elásticas",
    difficulty: "hard",
    question: "En una arteria elástica, ¿por qué la lámina elástica interna puede ser difícil de distinguir?",
    correct: "Se confunde con las múltiples láminas elásticas de la túnica media.",
    distractors: ["Está ausente porque las arterias elásticas carecen de íntima.", "Se fusiona con la lámina elástica externa de la adventicia.", "Queda oculta por una túnica media formada solo por músculo liso."],
    explanation: "La abundancia de láminas elásticas en la media hace que la lámina elástica interna no sobresalga como en una arteria muscular."
  },
  {
    id: "cap13-019",
    topic: "Arterias musculares",
    difficulty: "medium",
    question: "Una arteria presenta una lámina elástica interna ondulada muy evidente y numerosas capas de músculo liso. ¿Cómo se clasifica?",
    correct: "Arteria muscular.",
    distractors: ["Arteria elástica.", "Arteriola terminal.", "Vénula poscapilar."],
    explanation: "La lámina elástica interna prominente y la media muscular caracterizan a las arterias musculares."
  },
  {
    id: "cap13-020",
    topic: "Arterias musculares",
    difficulty: "medium",
    question: "¿Cuál es la función principal de las arterias musculares dentro del árbol vascular?",
    correct: "Distribuir sangre y regular su llegada a órganos concretos.",
    distractors: ["Realizar la mayor parte del intercambio gaseoso.", "Almacenar linfa antes de devolverla a las venas.", "Generar el impulso eléctrico del corazón."],
    explanation: "Su músculo liso permite ajustar el diámetro y distribuir el flujo entre distintos territorios."
  },
  {
    id: "cap13-021",
    topic: "Arteriolas",
    difficulty: "hard",
    question: "Una pequeña variación del radio arteriolar modifica mucho la resistencia periférica. ¿Qué rasgo estructural permite este control?",
    correct: "Una o dos capas de músculo liso que rodean una luz pequeña.",
    distractors: ["Múltiples láminas elásticas concéntricas.", "Válvulas bicúspides en la íntima.", "Una adventicia con músculo longitudinal dominante."],
    explanation: "Las arteriolas son los principales vasos de resistencia y su músculo liso controla el radio luminal."
  },
  {
    id: "cap13-022",
    topic: "Arteriolas",
    difficulty: "medium",
    question: "¿Qué estructura regula la entrada de sangre a un lecho capilar verdadero?",
    correct: "Esfínter precapilar.",
    distractors: ["Válvula venosa.", "Lámina elástica externa.", "Cuerpo de Weibel-Palade."],
    explanation: "Los esfínteres precapilares son anillos de músculo liso que controlan la perfusión de capilares verdaderos."
  },
  {
    id: "cap13-023",
    topic: "Capilares",
    difficulty: "medium",
    question: "¿Qué tipo de capilar se espera en músculo, pulmón y sistema nervioso central?",
    correct: "Capilar continuo.",
    distractors: ["Capilar fenestrado.", "Sinusoide discontinuo.", "Vénula de endotelio alto."],
    explanation: "Los capilares continuos poseen endotelio y lámina basal continuos y predominan en esos tejidos."
  },
  {
    id: "cap13-024",
    topic: "Capilares",
    difficulty: "medium",
    question: "¿Qué especialización facilita el intercambio rápido en glándulas endocrinas, intestino y riñón?",
    correct: "Fenestraciones en las células endoteliales.",
    distractors: ["Láminas elásticas concéntricas.", "Válvulas pares en la luz.", "Cartílago en la túnica media."],
    explanation: "Los capilares fenestrados presentan poros que aumentan la permeabilidad para líquidos y solutos."
  },
  {
    id: "cap13-025",
    topic: "Capilares",
    difficulty: "hard",
    question: "¿Cuál combinación identifica mejor un sinusoide?",
    correct: "Luz irregular amplia, endotelio discontinuo y lámina basal incompleta.",
    distractors: ["Luz estrecha uniforme, endotelio continuo y media muscular gruesa.", "Luz colapsada, válvulas y adventicia dominante.", "Luz circular, fenestraciones con diafragma y lámina basal continua."],
    explanation: "Los sinusoides permiten el paso de macromoléculas e incluso células y aparecen, por ejemplo, en hígado, bazo y médula ósea."
  },
  {
    id: "cap13-026",
    topic: "Capilares",
    difficulty: "hard",
    question: "¿Qué mecanismo permite a una molécula hidrosoluble pequeña atravesar un capilar continuo sin pasar por la membrana de la célula endotelial?",
    correct: "Paso por hendiduras intercelulares.",
    distractors: ["Transcitosis mediante vesículas endoteliales.", "Difusión a través de la membrana endotelial.", "Paso por fenestraciones con diafragma."],
    explanation: "Además de transcitosis y difusión, el intercambio puede ocurrir por las uniones o hendiduras intercelulares según el lecho."
  },
  {
    id: "cap13-027",
    topic: "Pericitos",
    difficulty: "medium",
    question: "Tras una lesión microvascular, ¿qué célula asociada al capilar puede contribuir a la reparación y compartir su lámina basal?",
    correct: "Pericito.",
    distractors: ["Fibroblasto perivascular.", "Macrófago residente.", "Célula muscular lisa arteriolar."],
    explanation: "Los pericitos rodean capilares y vénulas pequeñas, son contráctiles y poseen potencial de diferenciación."
  },
  {
    id: "cap13-028",
    topic: "Anastomosis arteriovenosas",
    difficulty: "hard",
    question: "Durante la conservación de calor en la piel, ¿qué cambio dentro de una anastomosis arteriovenosa desvía sangre de los capilares superficiales?",
    correct: "Apertura de anastomosis arteriovenosas que desvían sangre hacia vénulas.",
    distractors: ["Cierre del canal arteriovenoso y perfusión obligada del lecho capilar.", "Relajación de los esfínteres precapilares y aumento del flujo superficial.", "Dilatación selectiva de los capilares cutáneos sin derivación venosa."],
    explanation: "Las anastomosis arteriovenosas permiten derivar sangre sin atravesar el lecho capilar y participan en termorregulación."
  },
  {
    id: "cap13-029",
    topic: "Vénulas",
    difficulty: "medium",
    question: "¿En qué segmento vascular ocurre con mayor frecuencia la salida de leucocitos durante la inflamación?",
    correct: "Vénulas poscapilares.",
    distractors: ["Arterias elásticas.", "Arteriolas musculares.", "Venas grandes."],
    explanation: "Las vénulas poscapilares son el sitio principal de diapédesis y respuesta a mediadores vasoactivos."
  },
  {
    id: "cap13-030",
    topic: "Venas",
    difficulty: "medium",
    question: "¿Qué característica ayuda a las venas de los miembros inferiores a vencer la gravedad?",
    correct: "Válvulas formadas por pliegues de la túnica íntima.",
    distractors: ["Fenestraciones de la túnica media.", "Láminas elásticas numerosas como las de la aorta.", "Esfínteres precapilares dentro de la adventicia."],
    explanation: "Las válvulas impiden el flujo retrógrado y trabajan junto con la bomba muscular."
  },
  {
    id: "cap13-031",
    topic: "Venas",
    difficulty: "hard",
    question: "En una vena mediana, ¿qué túnica suele constituir la mayor parte de la pared?",
    correct: "Túnica adventicia.",
    distractors: ["Túnica íntima.", "Túnica media.", "Lámina elástica interna."],
    explanation: "Las venas medianas tienen media delgada y una adventicia relativamente gruesa."
  },
  {
    id: "cap13-032",
    topic: "Venas grandes",
    difficulty: "hard",
    question: "¿Qué disposición muscular es típica de la adventicia de las venas grandes como la cava?",
    correct: "Haces longitudinales de músculo liso.",
    distractors: ["Capas circulares predominantes en la túnica media.", "Haces longitudinales situados en la túnica íntima.", "Ausencia completa de músculo liso en la pared."],
    explanation: "La adventicia de grandes venas contiene haces longitudinales prominentes de músculo liso."
  },
  {
    id: "cap13-033",
    topic: "Vasos sanguíneos atípicos",
    difficulty: "hard",
    question: "La vena central suprarrenal contiene músculo longitudinal prominente. Según el texto, ¿en qué túnica se localiza?",
    correct: "Túnica media.",
    distractors: ["Túnica íntima.", "Túnica adventicia.", "Lámina basal endotelial."],
    explanation: "La vena central suprarrenal es una excepción: su túnica media posee haces longitudinales prominentes de músculo liso."
  },
  {
    id: "cap13-034",
    topic: "Vasos sanguíneos atípicos",
    difficulty: "medium",
    question: "¿Qué adaptación caracteriza a las arterias cerebrales dentro del cráneo?",
    correct: "Pared relativamente delgada y lámina elástica interna bien desarrollada.",
    distractors: ["Media muy gruesa con numerosas láminas elásticas.", "Adventicia dominante con haces longitudinales de músculo liso.", "Lámina elástica externa más gruesa que la interna."],
    explanation: "Las arterias cerebrales poseen rasgos particulares, incluida una pared delgada y lámina elástica interna prominente."
  },
  {
    id: "cap13-035",
    topic: "Vasos linfáticos",
    difficulty: "medium",
    question: "¿Qué rasgo permite distinguir un capilar linfático inicial de un capilar sanguíneo continuo?",
    correct: "Comienza en fondo ciego y carece de una lámina basal continua.",
    distractors: ["Presenta endotelio continuo con uniones oclusivas y lámina basal completa.", "Posee pericitos abundantes dentro de una lámina basal compartida.", "Tiene fenestraciones regulares con lámina basal continua."],
    explanation: "Los capilares linfáticos son fondos de saco muy permeables, con uniones laxas y lámina basal incompleta."
  },
  {
    id: "cap13-036",
    topic: "Vasos linfáticos",
    difficulty: "hard",
    question: "Al aumentar la presión del líquido intersticial, ¿cómo facilitan la entrada de líquido los filamentos de anclaje linfáticos?",
    correct: "Tiran de las células endoteliales y abren solapas intercelulares.",
    distractors: ["Contraen una media muscular continua.", "Cierran los poros para evitar edema.", "Transforman el líquido intersticial en plasma."],
    explanation: "Los filamentos fijan el endotelio al tejido circundante y evitan el colapso, favoreciendo la apertura de solapas."
  },
  {
    id: "cap13-037",
    topic: "Vasos linfáticos",
    difficulty: "medium",
    question: "¿Dónde retorna finalmente a la circulación sanguínea la mayor parte de la linfa?",
    correct: "En la unión de las venas yugular interna y subclavia.",
    distractors: ["En la raíz de la aorta.", "En las arterias coronarias.", "Dentro de los sinusoides hepáticos."],
    explanation: "El conducto torácico y el conducto linfático derecho desembocan en los ángulos venosos."
  },
  {
    id: "cap13-038",
    topic: "Ateroesclerosis",
    difficulty: "hard",
    question: "¿Cuál es la secuencia más coherente en el inicio de una placa ateroesclerótica?",
    correct: "Disfunción endotelial → entrada y oxidación de LDL → adhesión de monocitos → células espumosas.",
    distractors: ["Entrada de monocitos → lesión endotelial → salida de LDL → desaparición de células espumosas.", "Oxidación de LDL → restitución endotelial → inhibición de monocitos → regresión inmediata.", "Adhesión plaquetaria → depósito de HDL → migración de monocitos → eliminación total de lípidos."],
    explanation: "La lesión o disfunción endotelial favorece acumulación lipídica, reclutamiento de monocitos y formación de células espumosas."
  },
  {
    id: "cap13-039",
    topic: "Ateroesclerosis",
    difficulty: "medium",
    question: "¿Qué célula de la pared arterial migra hacia la íntima y contribuye a la cubierta fibrosa de una placa?",
    correct: "Célula muscular lisa.",
    distractors: ["Macrófago derivado de monocito.", "Fibroblasto adventicial.", "Célula endotelial madura."],
    explanation: "Las células musculares lisas migran, proliferan y sintetizan matriz extracelular en la íntima."
  },
  {
    id: "cap13-040",
    topic: "Ateroesclerosis",
    difficulty: "hard",
    question: "¿Qué complicación aguda puede seguir a la rotura de la cubierta fibrosa de una placa coronaria?",
    correct: "Formación de un trombo que ocluye la arteria.",
    distractors: ["Crecimiento estable de la cubierta sin exposición del núcleo lipídico.", "Aumento de HDL sin activación de la coagulación.", "Remodelado compensador que conserva una superficie endotelial intacta."],
    explanation: "La exposición del material trombogénico de la placa puede desencadenar trombosis y síndrome coronario agudo."
  },
  {
    id: "cap13-041",
    topic: "Hipertensión",
    difficulty: "hard",
    question: "En hipertensión crónica, ¿qué cambio adapta la pared de las arteriolas a la presión elevada pero estrecha su luz?",
    correct: "Engrosamiento de la pared por hipertrofia e hiperplasia del músculo liso.",
    distractors: ["Adelgazamiento uniforme de la media con aumento de la luz.", "Pérdida de matriz sin respuesta del músculo liso.", "Dilatación permanente sin modificación de la relación pared-luz."],
    explanation: "El remodelado arteriolar aumenta la relación pared-luz y mantiene elevada la resistencia vascular."
  },
  {
    id: "cap13-042",
    topic: "Coronariopatía",
    difficulty: "medium",
    question: "¿Por qué una obstrucción coronaria puede dañar rápidamente el miocardio?",
    correct: "Los cardiomiocitos tienen gran demanda de oxígeno y escasas reservas energéticas.",
    distractors: ["El miocardio carece por completo de capilares.", "Las arterias coronarias solo transportan sangre durante la sístole.", "El endocardio impide toda difusión de nutrientes."],
    explanation: "La alta actividad metabólica hace al miocardio muy sensible a la reducción del flujo coronario."
  },
  {
    id: "cap13-043",
    topic: "Identificación cardíaca",
    difficulty: "hard",
    question: "En una lámina se observan fibras estriadas ramificadas, núcleos centrales y discos intercalares. ¿Qué tejido es?",
    correct: "Músculo cardíaco.",
    distractors: ["Músculo esquelético.", "Músculo liso vascular.", "Tejido conjuntivo valvular."],
    explanation: "La ramificación, los núcleos centrales y los discos intercalares identifican cardiomiocitos."
  },
  {
    id: "cap13-044",
    topic: "Identificación vascular",
    difficulty: "hard",
    question: "Dos vasos viajan juntos. Uno conserva una luz redondeada y tiene media gruesa; el otro muestra luz irregular y adventicia más notoria. ¿Cuál es el segundo?",
    correct: "Una vena.",
    distractors: ["Una arteria muscular.", "Una arteriola.", "Un capilar continuo."],
    explanation: "Las venas suelen colapsarse, poseen luz irregular y una adventicia proporcionalmente prominente."
  },
  {
    id: "cap13-045",
    topic: "Identificación microvascular",
    difficulty: "medium",
    question: "Un vaso tiene una luz apenas mayor que un eritrocito y su pared está formada solo por endotelio y lámina basal. ¿Cuál es?",
    correct: "Capilar.",
    distractors: ["Arteriola.", "Vénula muscular.", "Arteria elástica."],
    explanation: "La pared capilar carece de túnicas musculares y se reduce esencialmente a endotelio y lámina basal."
  },
  {
    id: "cap13-046",
    topic: "Integración cardiovascular",
    difficulty: "hard",
    question: "¿Qué recorrido ordena correctamente los vasos desde el de mayor presión hasta el principal sitio de retorno capacitante?",
    correct: "Arteria elástica → arteria muscular → arteriola → capilar → vénula → vena.",
    distractors: ["Vena → vénula → capilar → arteriola → arteria muscular → aorta.", "Arteriola → arteria elástica → capilar → vena → vénula → arteria muscular.", "Capilar → arteria muscular → vénula → arteria elástica → vena → arteriola."],
    explanation: "La sangre sale del corazón por arterias, atraviesa la microcirculación y retorna por el sistema venoso."
  },
  {
    id: "cap13-047",
    topic: "Integración cardiovascular",
    difficulty: "hard",
    question: "¿Qué cambio favorece edema aun cuando la pared capilar permanezca intacta?",
    correct: "Aumento de la presión hidrostática venosa.",
    distractors: ["Aumento del drenaje linfático.", "Disminución de la presión capilar.", "Incremento de proteínas plasmáticas."],
    explanation: "Una presión venosa elevada aumenta la presión hidrostática capilar y la filtración de líquido al intersticio."
  },
  {
    id: "cap13-048",
    topic: "Integración cardiovascular",
    difficulty: "hard",
    question: "Si se bloquea la síntesis endotelial de óxido nítrico, ¿qué respuesta vascular inmediata es más probable?",
    correct: "Aumento del tono del músculo liso y vasoconstricción relativa.",
    distractors: ["Disminución del tono por mayor disponibilidad de GMPc.", "Relajación selectiva del músculo liso por activación de eNOS.", "Inhibición adicional de la agregación plaquetaria por exceso de NO."],
    explanation: "Al disminuir el NO se pierde una señal vasodilatadora importante y predomina mayor tono vascular."
  }
]

export const cap13Questions = createManualQuizBank("Capítulo 13", seeds)
