import { createManualQuizBank, type ManualQuizSeed } from "../manualQuiz"

const seeds: ManualQuizSeed[] = [
  {
    id: "cap15-001",
    topic: "Fundamentos tegumentarios",
    difficulty: "easy",
    question: "¿Qué combinación describe correctamente el origen embrionario de las dos capas principales de la piel?",
    correct: "Epidermis del ectodermo y dermis del mesodermo.",
    distractors: ["Epidermis del mesodermo y dermis del endodermo.", "Epidermis de la cresta neural y dermis del ectodermo.", "Epidermis del endodermo y dermis de la cresta neural."],
    explanation: "La epidermis deriva del ectodermo superficial y la dermis procede principalmente del mesodermo."
  },
  {
    id: "cap15-002",
    topic: "Fundamentos tegumentarios",
    difficulty: "medium",
    question: "Además de actuar como barrera, ¿qué función endocrina cumple la piel al exponerse a radiación ultravioleta?",
    correct: "Inicia la síntesis de vitamina D.",
    distractors: ["Inicia la síntesis de hormona paratiroidea.", "Convierte colesterol en cortisol circulante.", "Produce retinoides activos como principal órgano endocrino."],
    explanation: "La radiación UV participa en la conversión de precursores cutáneos de vitamina D."
  },
  {
    id: "cap15-003",
    topic: "Piel gruesa y delgada",
    difficulty: "medium",
    question: "Una biopsia de la palma muestra epidermis muy desarrollada. ¿Qué hallazgo adicional sería congruente?",
    correct: "Estrato lúcido presente y ausencia de folículos pilosos.",
    distractors: ["Folículos abundantes, glándulas sebáceas y estrato lúcido ausente.", "Folículos ausentes, glándulas sebáceas abundantes y estrato córneo delgado.", "Folículos escasos, glándulas apocrinas numerosas y estrato granuloso ausente."],
    explanation: "La piel gruesa palmar y plantar carece de pelo y glándulas sebáceas, posee estrato lúcido y abundantes glándulas ecrinas."
  },
  {
    id: "cap15-004",
    topic: "Piel gruesa y delgada",
    difficulty: "hard",
    question: "¿Por qué la piel de la espalda puede ser anatómicamente más gruesa que la de la palma aunque se clasifique como piel delgada?",
    correct: "La clasificación gruesa/delgada se refiere a la epidermis, no al espesor total de la dermis.",
    distractors: ["La espalda posee un estrato lúcido más grueso que la palma.", "La palma carece de dermis y por eso siempre es más fina.", "La clasificación depende únicamente de la cantidad de tejido adiposo."],
    explanation: "La piel gruesa se define por su epidermis, mientras que el espesor total puede depender en gran medida de la dermis."
  },
  {
    id: "cap15-005",
    topic: "Estratos epidérmicos",
    difficulty: "medium",
    question: "¿Cuál es el orden correcto de los estratos epidérmicos desde la lámina basal hacia la superficie en piel gruesa?",
    correct: "Basal → espinoso → granuloso → lúcido → córneo.",
    distractors: ["Córneo → granuloso → basal → lúcido → espinoso.", "Basal → lúcido → espinoso → córneo → granuloso.", "Espinoso → basal → granuloso → córneo → lúcido."],
    explanation: "Ese es el trayecto de diferenciación de los queratinocitos en la piel gruesa."
  },
  {
    id: "cap15-006",
    topic: "Estrato basal",
    difficulty: "hard",
    question: "¿Qué combinación de uniones mantiene a los queratinocitos basales cohesionados y adheridos a la lámina basal?",
    correct: "Desmosomas entre células y hemidesmosomas hacia la lámina basal.",
    distractors: ["Hemidesmosomas entre células y sinapsis hacia la dermis.", "Uniones estrechas entre dermis y colágeno tipo I.", "Adherencias focales entre corneocitos y vasos sanguíneos."],
    explanation: "Los desmosomas unen queratinocitos vecinos y los hemidesmosomas fijan las células basales a la lámina basal."
  },
  {
    id: "cap15-007",
    topic: "Estrato basal",
    difficulty: "medium",
    question: "¿En qué estrato se localiza la principal población mitótica que renueva la epidermis?",
    correct: "Estrato basal.",
    distractors: ["Estrato lúcido.", "Estrato córneo.", "Dermis reticular."],
    explanation: "El estrato basal contiene células progenitoras y queratinocitos en división."
  },
  {
    id: "cap15-008",
    topic: "Estrato espinoso",
    difficulty: "medium",
    question: "El aspecto de “espinas” entre queratinocitos del estrato espinoso se debe principalmente a:",
    correct: "Desmosomas y retracción celular producida durante la preparación histológica.",
    distractors: ["Uniones estrechas que protruyen al separarse las células.", "Hemidesmosomas que unen entre sí queratinocitos suprabasales.", "Gránulos de queratohialina que ocupan los espacios intercelulares."],
    explanation: "Los puentes intercelulares visibles corresponden a sitios desmosómicos resaltados por la retracción del citoplasma."
  },
  {
    id: "cap15-009",
    topic: "Estrato granuloso",
    difficulty: "hard",
    question: "¿Qué cambio marca la transición del queratinocito hacia una célula superficial altamente queratinizada?",
    correct: "Acumulación de gránulos de queratohialina y liberación de lípidos de cuerpos laminares.",
    distractors: ["Disminución de filamentos de queratina y aumento sostenido de mitosis.", "Pérdida de desmosomas sin formación de una barrera lipídica.", "Acumulación de melanosomas y conservación completa del núcleo en la superficie."],
    explanation: "El estrato granuloso contiene queratohialina y cuerpos laminares esenciales para agregación de filamentos y barrera hídrica."
  },
  {
    id: "cap15-010",
    topic: "Estratos lúcido y córneo",
    difficulty: "medium",
    question: "¿Qué estrato aparece como una banda translúcida entre el granuloso y el córneo solo en piel gruesa?",
    correct: "Estrato lúcido.",
    distractors: ["Estrato basal.", "Dermis papilar.", "Hipodermis."],
    explanation: "El estrato lúcido es característico de palmas y plantas."
  },
  {
    id: "cap15-011",
    topic: "Estratos lúcido y córneo",
    difficulty: "hard",
    question: "¿Qué descripción corresponde a un corneocito maduro?",
    correct: "Célula aplanada sin núcleo, llena de queratina y rodeada por una envoltura resistente.",
    distractors: ["Célula cúbica mitótica adherida a capilares.", "Célula dendrítica con gránulos de Birbeck.", "Célula fusiforme que sintetiza colágeno dérmico."],
    explanation: "Los corneocitos son el producto final de la diferenciación queratinocítica y forman el estrato córneo."
  },
  {
    id: "cap15-012",
    topic: "Unión dermoepidérmica",
    difficulty: "hard",
    question: "¿Qué ventaja mecánica producen las crestas epidérmicas y papilas dérmicas interdigitadas?",
    correct: "Aumentan el área de contacto y resisten fuerzas de cizallamiento.",
    distractors: ["Reducen el contacto para facilitar el deslizamiento entre ambas capas.", "Sustituyen la lámina basal por fibras colágenas gruesas.", "Aíslan la epidermis de los capilares de las papilas dérmicas."],
    explanation: "La interdigitación fortalece la unión y amplía la superficie disponible para intercambio por difusión."
  },
  {
    id: "cap15-013",
    topic: "Dermis papilar y reticular",
    difficulty: "medium",
    question: "¿Qué rasgo distingue a la dermis papilar de la reticular?",
    correct: "Tejido conjuntivo laxo con fibras colágenas finas y capilares cercanos a la epidermis.",
    distractors: ["Haces gruesos de colágeno tipo I orientados en múltiples direcciones.", "Adipocitos organizados en lobulillos grandes.", "Queratinocitos anucleados unidos por corneodesmosomas."],
    explanation: "La dermis papilar es superficial y laxa; la reticular es tejido conjuntivo denso irregular."
  },
  {
    id: "cap15-014",
    topic: "Dermis papilar y reticular",
    difficulty: "hard",
    question: "Una incisión quirúrgica paralela a las líneas de Langer tiende a abrirse menos porque:",
    correct: "Sigue la orientación predominante de los haces colágenos dérmicos.",
    distractors: ["Secciona transversalmente los haces colágenos y libera su tensión máxima.", "Coincide con el trayecto de los vasos linfáticos superficiales.", "Se orienta paralela a todas las fibras elásticas y perpendicular al colágeno."],
    explanation: "Las líneas de tensión reflejan la orientación de los haces de colágeno de la dermis reticular."
  },
  {
    id: "cap15-015",
    topic: "Hipodermis y músculos cutáneos",
    difficulty: "medium",
    question: "¿Qué función cumple principalmente la hipodermis rica en tejido adiposo?",
    correct: "Amortiguación, aislamiento y almacenamiento energético.",
    distractors: ["Nutrición directa de la epidermis mediante una red capilar propia.", "Producción principal de colágeno y elastina de la dermis reticular.", "Renovación de queratinocitos mediante mitosis dentro del estrato córneo."],
    explanation: "La hipodermis fija la piel de forma móvil y aporta reserva, aislamiento y protección mecánica."
  },
  {
    id: "cap15-016",
    topic: "Tipos celulares epidérmicos",
    difficulty: "medium",
    question: "¿Qué célula constituye aproximadamente el 85 % de la epidermis?",
    correct: "Queratinocito.",
    distractors: ["Melanocito.", "Célula de Langerhans.", "Célula de Merkel."],
    explanation: "Los queratinocitos son la población predominante y forman la barrera epidérmica."
  },
  {
    id: "cap15-017",
    topic: "Diferenciación de queratinocitos",
    difficulty: "hard",
    question: "¿Cuál es la secuencia funcional más coherente durante la queratinización?",
    correct: "Síntesis de queratinas → agregación de filamentos → formación de envoltura → pérdida de núcleo y orgánulos.",
    distractors: ["Pérdida de desmosomas → mitosis superficial → recuperación del núcleo → síntesis de queratina.", "Formación de envoltura → degradación de queratinas → división en el estrato granuloso → descamación.", "Pérdida de núcleo → síntesis inicial de queratinas → regreso al estrato basal → agregación de filamentos."],
    explanation: "La diferenciación transforma un queratinocito viable en un corneocito anucleado resistente."
  },
  {
    id: "cap15-018",
    topic: "Diferenciación de queratinocitos",
    difficulty: "hard",
    question: "En condiciones normales, ¿cuánto tarda aproximadamente la renovación completa desde la división basal hasta la descamación?",
    correct: "Alrededor de 47 días.",
    distractors: ["Entre 1 y 2 horas.", "Aproximadamente 8 días.", "Cerca de 1 año."],
    explanation: "El texto integra unos 31 días hasta el estrato córneo, 14 días de permanencia y 1–2 días para descamación."
  },
  {
    id: "cap15-019",
    topic: "Descamación y gradiente de pH",
    difficulty: "hard",
    question: "¿Cómo favorece el pH ácido de la superficie cutánea la descamación controlada?",
    correct: "Regula la actividad de proteasas que degradan corneodesmosomas.",
    distractors: ["Inhibe por completo las proteasas y evita toda descamación.", "Disuelve los lípidos intercelulares para aumentar la pérdida de agua.", "Activa corneodesmosomas nuevos en la superficie para retener corneocitos."],
    explanation: "El gradiente de pH modula calicreínas y sus inhibidores para controlar la separación de corneocitos."
  },
  {
    id: "cap15-020",
    topic: "Descamación y gradiente de pH",
    difficulty: "hard",
    question: "Una mutación de SPINK5 reduce el inhibidor LEKTI. ¿Qué mecanismo contribuye al síndrome de Netherton?",
    correct: "Actividad proteasa excesiva y degradación prematura de uniones entre corneocitos.",
    distractors: ["Actividad proteasa insuficiente y retención excesiva de todos los corneocitos.", "Defecto aislado de tirosinasa con una barrera lipídica normal.", "Falta de cuerpos laminares sin cambios en las uniones intercelulares."],
    explanation: "LEKTI limita proteasas epidérmicas; su defecto altera la barrera y acelera descamación."
  },
  {
    id: "cap15-021",
    topic: "Cuerpos laminares",
    difficulty: "medium",
    question: "¿Qué producto liberan los cuerpos laminares hacia el espacio intercelular del estrato granuloso?",
    correct: "Lípidos que forman la barrera contra el agua.",
    distractors: ["Filagrina que permanece confinada dentro del núcleo.", "Melanina que forma la envoltura cornificada.", "Colágeno tipo I que reemplaza los espacios intercelulares."],
    explanation: "Sus lípidos se organizan en láminas intercelulares que limitan pérdida y entrada de agua."
  },
  {
    id: "cap15-022",
    topic: "Envolturas celular y lipídica",
    difficulty: "hard",
    question: "¿Qué proteína constituye la mayor parte de la envoltura celular cornificada?",
    correct: "Loricrina.",
    distractors: ["Vimentina.", "Hemoglobina.", "Desmina."],
    explanation: "La loricrina representa cerca del 80 % de la masa proteica de la envoltura celular cornificada."
  },
  {
    id: "cap15-023",
    topic: "Melanocitos y melanogénesis",
    difficulty: "medium",
    question: "¿De qué población embrionaria derivan los melanocitos?",
    correct: "Cresta neural.",
    distractors: ["Mesodermo paraxial.", "Endodermo del intestino anterior.", "Epitelio celómico."],
    explanation: "Los melanoblastos de la cresta neural migran hacia epidermis y folículos."
  },
  {
    id: "cap15-024",
    topic: "Melanocitos y melanogénesis",
    difficulty: "hard",
    question: "¿Qué reacción inicia la tirosinasa durante la síntesis de melanina?",
    correct: "Conversión de tirosina en DOPA.",
    distractors: ["Conversión de DOPA en tirosina como reacción final.", "Conversión de fenilalanina en queratina dentro del melanosoma.", "Degradación de eumelanina para producir tirosina."],
    explanation: "La tirosinasa cataliza pasos iniciales esenciales de la melanogénesis, incluida la formación de DOPA."
  },
  {
    id: "cap15-025",
    topic: "Melanocitos y melanogénesis",
    difficulty: "hard",
    question: "Un melanocito pigmenta a varias decenas de queratinocitos vecinos. ¿Cómo se denomina esta organización?",
    correct: "Unidad melanoepidérmica.",
    distractors: ["Unidad pilosebácea.", "Glomus arteriovenoso.", "Corpúsculo laminar."],
    explanation: "Un melanocito y los queratinocitos a los que transfiere melanosomas forman una unidad melanoepidérmica."
  },
  {
    id: "cap15-026",
    topic: "Color de la piel",
    difficulty: "hard",
    question: "Entre personas con distinta pigmentación cutánea, la diferencia principal no suele ser el número de melanocitos sino:",
    correct: "El tamaño, cantidad, distribución y persistencia de los melanosomas.",
    distractors: ["El número absoluto de melanocitos, que varía varias decenas de veces.", "La presencia de melanocitos solo en piel oscura y su ausencia en piel clara.", "La producción exclusiva de feomelanina en piel oscura y eumelanina en piel clara."],
    explanation: "La actividad melanocítica y el destino de melanosomas explican gran parte de las diferencias de color."
  },
  {
    id: "cap15-027",
    topic: "Color de la piel",
    difficulty: "hard",
    question: "En el albinismo oculocutáneo clásico puede haber melanocitos normales en número. ¿Qué defecto explica la hipopigmentación?",
    correct: "Alteración de la síntesis de melanina, con frecuencia por actividad deficiente de tirosinasa.",
    distractors: ["Ausencia completa de estrato basal.", "Exceso de cuerpos laminares en la dermis.", "Pérdida de receptores de presión profundos."],
    explanation: "El albinismo afecta la producción de melanina, no necesariamente la presencia de melanocitos."
  },
  {
    id: "cap15-028",
    topic: "Células de Langerhans",
    difficulty: "medium",
    question: "Una célula dendrítica epidérmica expresa MHC II y migra a ganglios tras captar antígeno. ¿Cuál es?",
    correct: "Célula de Langerhans.",
    distractors: ["Célula de Merkel.", "Queratinocito córneo.", "Sebocito maduro."],
    explanation: "Las células de Langerhans son presentadoras de antígeno de la epidermis."
  },
  {
    id: "cap15-029",
    topic: "Células de Langerhans",
    difficulty: "hard",
    question: "¿Qué estructura ultraestructural apoya la identificación de una célula de Langerhans?",
    correct: "Gránulos de Birbeck con aspecto de raqueta.",
    distractors: ["Gránulos de queratohialina gigantes.", "Discos intercalares ramificados.", "Miofilamentos organizados en sarcómeros."],
    explanation: "Los gránulos de Birbeck son característicos de las células de Langerhans."
  },
  {
    id: "cap15-030",
    topic: "Células de Merkel",
    difficulty: "hard",
    question: "¿Qué asociación explica la función de una célula de Merkel?",
    correct: "Contacto con una terminación aferente para formar un mecanorreceptor de tacto fino.",
    distractors: ["Asociación con queratinocitos para transferir melanosomas.", "Migración al ganglio para presentar antígenos a linfocitos T.", "Unión a células mioepiteliales para expulsar secreción glandular."],
    explanation: "Las células de Merkel se asocian con discos nerviosos y participan en mecanorrecepción."
  },
  {
    id: "cap15-031",
    topic: "Terminaciones nerviosas libres",
    difficulty: "medium",
    question: "¿Qué sensaciones pueden detectar las terminaciones nerviosas libres que ascienden hacia la epidermis?",
    correct: "Dolor, temperatura, prurito y tacto poco discriminativo.",
    distractors: ["Solo equilibrio y audición.", "Exclusivamente presión arterial sistémica.", "Únicamente tensión de tendones profundos."],
    explanation: "Las terminaciones libres son receptores no encapsulados con múltiples modalidades cutáneas."
  },
  {
    id: "cap15-032",
    topic: "Receptores encapsulados",
    difficulty: "hard",
    question: "Un receptor grande con láminas concéntricas en forma de cebolla se activa por presión profunda y vibración. ¿Cuál es?",
    correct: "Corpúsculo de Pacini.",
    distractors: ["Corpúsculo de Meissner.", "Disco de Merkel.", "Terminación nerviosa libre."],
    explanation: "Los corpúsculos de Pacini son receptores laminares profundos de adaptación rápida."
  },
  {
    id: "cap15-033",
    topic: "Receptores encapsulados",
    difficulty: "hard",
    question: "¿Qué receptor se localiza en papilas dérmicas de piel glabra y responde al tacto ligero?",
    correct: "Corpúsculo de Meissner.",
    distractors: ["Corpúsculo de Pacini.", "Terminación de Ruffini.", "Plexo de la raíz del pelo."],
    explanation: "Meissner se encuentra superficialmente en papilas dérmicas, especialmente en dedos, labios y otras áreas sensibles."
  },
  {
    id: "cap15-034",
    topic: "Receptores encapsulados",
    difficulty: "hard",
    question: "El estiramiento sostenido de la piel activa principalmente:",
    correct: "Terminaciones de Ruffini.",
    distractors: ["Corpúsculos de Meissner.", "Células de Langerhans.", "Glándulas ecrinas."],
    explanation: "Las terminaciones de Ruffini responden al estiramiento y la tensión cutánea."
  },
  {
    id: "cap15-035",
    topic: "Folículo piloso",
    difficulty: "hard",
    question: "En la base de un folículo en crecimiento, ¿qué relación es correcta?",
    correct: "La papila dérmica vascular nutre y regula a las células de la matriz del bulbo.",
    distractors: ["La papila dérmica se queratiniza y forma directamente la médula del pelo.", "La matriz permanece quiescente durante toda la fase anágena.", "Los melanocitos del bulbo pigmentan únicamente la vaina conjuntiva externa."],
    explanation: "La matriz proliferativa rodea la papila dérmica y origina pelo y vaina radicular interna."
  },
  {
    id: "cap15-036",
    topic: "Células madre foliculares",
    difficulty: "hard",
    question: "¿Por qué la región del abultamiento folicular es importante para la reparación cutánea?",
    correct: "Contiene células madre que pueden regenerar folículo y contribuir a la epidermis.",
    distractors: ["Contiene células terminalmente queratinizadas incapaces de proliferar.", "Origina exclusivamente el músculo erector sin contribuir al epitelio.", "Actúa como reservorio de sebocitos maduros que ya completaron secreción holocrina."],
    explanation: "El bulge alberga células madre epiteliales vinculadas también con la inserción del músculo erector."
  },
  {
    id: "cap15-037",
    topic: "Tallo del pelo",
    difficulty: "medium",
    question: "¿Cuál es el orden de las capas del tallo piloso desde el centro hacia afuera?",
    correct: "Médula → corteza → cutícula.",
    distractors: ["Cutícula → médula → corteza.", "Corteza → cutícula → médula.", "Médula → vaina externa → dermis."],
    explanation: "El tallo presenta médula central variable, corteza gruesa y cutícula superficial."
  },
  {
    id: "cap15-038",
    topic: "Ciclo y tipos de pelo",
    difficulty: "hard",
    question: "¿Qué fase del ciclo piloso corresponde a crecimiento activo con matriz proliferativa?",
    correct: "Anágena.",
    distractors: ["Catágena.", "Telógena.", "Descamativa."],
    explanation: "Anágena es la fase de crecimiento; catágena es involución y telógena es reposo."
  },
  {
    id: "cap15-039",
    topic: "Glándulas sebáceas",
    difficulty: "medium",
    question: "¿Qué mecanismo secretor utiliza una glándula sebácea?",
    correct: "Holocrino: la célula completa se desintegra y forma la secreción.",
    distractors: ["Merocrino: solo se libera contenido por exocitosis acuosa.", "Apocrino: siempre se desprende el polo apical visible.", "Endocrino: el sebo pasa directamente a capilares."],
    explanation: "Los sebocitos acumulan lípidos, degeneran y liberan todo su contenido como sebo."
  },
  {
    id: "cap15-040",
    topic: "Glándulas sebáceas",
    difficulty: "hard",
    question: "¿Qué combinación participa en el desarrollo del acné vulgar?",
    correct: "Exceso de sebo, obstrucción folicular y proliferación bacteriana con inflamación.",
    distractors: ["Disminución de sebo, apertura permanente del folículo y ausencia de inflamación.", "Exceso de sudor ecrino, dilatación del conducto y colonización del estrato córneo.", "Aumento de crecimiento piloso, drenaje folicular acelerado y reducción bacteriana."],
    explanation: "La unidad pilosebácea se obstruye y el sebo favorece proliferación bacteriana e inflamación."
  },
  {
    id: "cap15-041",
    topic: "Glándulas sudoríparas ecrinas",
    difficulty: "hard",
    question: "En el adenómero ecrino, ¿qué asociación celular es correcta?",
    correct: "Células claras — secreción acuosa y electrolitos.",
    distractors: ["Células oscuras — contracción de la lámina basal.", "Células mioepiteliales — síntesis principal de melanina.", "Células claras — producción holocrina de sebo."],
    explanation: "Las claras producen componente acuoso; las oscuras aportan glucoproteínas y las mioepiteliales ayudan a expulsar la secreción."
  },
  {
    id: "cap15-042",
    topic: "Glándulas sudoríparas ecrinas",
    difficulty: "hard",
    question: "¿Por qué el sudor ecrino que llega a la superficie es hipotónico respecto al plasma?",
    correct: "El conducto reabsorbe NaCl y es relativamente impermeable al agua.",
    distractors: ["El adenómero secreta únicamente agua destilada.", "El conducto agrega proteínas plasmáticas sin electrolitos.", "Los sebocitos extraen toda el agua antes de la secreción."],
    explanation: "La reabsorción ductal de sodio y cloro sin acompañamiento proporcional de agua vuelve hipotónico el sudor final."
  },
  {
    id: "cap15-043",
    topic: "Glándulas sudoríparas ecrinas",
    difficulty: "medium",
    question: "¿Qué división autonómica estimula la sudoración ecrina termorreguladora?",
    correct: "Simpática con neurotransmisión colinérgica.",
    distractors: ["Parasimpática exclusivamente adrenérgica.", "Somática mediante motoneuronas alfa.", "Entérica mediante serotonina intestinal."],
    explanation: "Es una excepción funcional: fibras simpáticas posganglionares liberan acetilcolina sobre glándulas ecrinas."
  },
  {
    id: "cap15-044",
    topic: "Glándulas sudoríparas apocrinas",
    difficulty: "hard",
    question: "¿Qué rasgo permite distinguir una glándula sudorípara apocrina de una ecrina en un corte?",
    correct: "Luz secretora mucho más amplia y conducto que desemboca en un folículo piloso.",
    distractors: ["Luz estrecha y conducto que se abre directamente en la superficie.", "Adenómero pequeño con células claras y oscuras bien diferenciadas.", "Conducto independiente del folículo y distribución abundante en palmas."],
    explanation: "Las apocrinas poseen adenómeros grandes, luz amplia y se relacionan con folículos en regiones específicas."
  },
  {
    id: "cap15-045",
    topic: "Glándulas sudoríparas apocrinas",
    difficulty: "hard",
    question: "A pesar de su nombre histórico, ¿qué mecanismo utiliza principalmente la glándula sudorípara apocrina humana?",
    correct: "Secreción merocrina por exocitosis.",
    distractors: ["Secreción holocrina con desintegración completa de la célula.", "Secreción apocrina demostrada por pérdida constante del polo apical.", "Secreción endocrina hacia capilares sin utilizar un conducto."],
    explanation: "El texto aclara que liberan su producto por exocitosis y no por pérdida apical demostrable."
  },
  {
    id: "cap15-046",
    topic: "Placa y aparato ungueal",
    difficulty: "hard",
    question: "¿Qué estructura produce la mayor parte de la placa ungueal?",
    correct: "Matriz ungueal.",
    distractors: ["Hiponiquio.", "Lecho ungueal distal.", "Eponiquio superficial."],
    explanation: "Las células de la matriz proliferan y se queratinizan para formar la placa."
  },
  {
    id: "cap15-047",
    topic: "Cáncer cutáneo",
    difficulty: "hard",
    question: "Una lesión pigmentada muestra asimetría, bordes irregulares, colores variados y crecimiento. ¿Qué diagnóstico debe descartarse prioritariamente?",
    correct: "Melanoma.",
    distractors: ["Glándula ecrina normal.", "Callo fisiológico.", "Corpúsculo de Meissner hipertrófico."],
    explanation: "Los criterios ABCD y la evolución ayudan a reconocer lesiones sospechosas de melanoma."
  },
  {
    id: "cap15-048",
    topic: "Cirugía de Mohs",
    difficulty: "hard",
    question: "¿Qué ventaja ofrece la cirugía micrográfica de Mohs en ciertos cánceres cutáneos?",
    correct: "Permite examinar sistemáticamente los márgenes mientras conserva el máximo tejido sano.",
    distractors: ["Extirpa un margen amplio fijo sin examinarlo durante el procedimiento.", "Destruye el tumor sin resecarlo y sin confirmar márgenes.", "Analiza solo una sección central aunque queden bordes laterales sin estudiar."],
    explanation: "La resección por etapas con control microscópico busca extirpar todo el tumor con mínima pérdida de tejido."
  },
  {
    id: "cap15-049",
    topic: "Sudoración y enfermedad",
    difficulty: "medium",
    question: "¿Cómo se denomina la producción excesiva de sudor que supera las necesidades termorreguladoras?",
    correct: "Hiperhidrosis.",
    distractors: ["Anhidrosis.", "Alopecia.", "Albinismo."],
    explanation: "La hiperhidrosis es sudoración excesiva; anhidrosis indica ausencia o reducción marcada."
  },
  {
    id: "cap15-050",
    topic: "Reparación cutánea",
    difficulty: "hard",
    question: "En una herida que destruye epidermis y parte de la dermis, ¿qué fuentes epiteliales pueden contribuir a reepitelizarla?",
    correct: "Queratinocitos de los bordes y células progenitoras de anexos cutáneos conservados.",
    distractors: ["Fibroblastos dérmicos que se convierten directamente en corneocitos.", "Melanocitos que proliferan y sustituyen por completo a los queratinocitos.", "Células endoteliales que migran a la superficie y forman estrato córneo."],
    explanation: "Los queratinocitos migran desde los márgenes y reservorios de folículos y glándulas si sobreviven."
  },
  {
    id: "cap15-051",
    topic: "Identificación histológica",
    difficulty: "hard",
    question: "Una muestra carece de pelo, tiene estrato córneo muy grueso, papilas dérmicas altas y abundantes conductos sudoríparos. ¿De dónde procede probablemente?",
    correct: "Palma o planta.",
    distractors: ["Cuero cabelludo.", "Axila con piel delgada.", "Párpado."],
    explanation: "Es el patrón clásico de piel gruesa glabra."
  },
  {
    id: "cap15-052",
    topic: "Identificación histológica",
    difficulty: "hard",
    question: "En la dermis se observa una glándula tubular enrollada con luz pequeña y conducto de epitelio cúbico estratificado. ¿Cuál es?",
    correct: "Glándula sudorípara ecrina.",
    distractors: ["Glándula sebácea.", "Glándula sudorípara apocrina.", "Folículo piloso en anágena."],
    explanation: "La luz secretora estrecha y el conducto cúbico estratificado favorecen la identificación de una ecrina."
  }
]

export const cap15Questions = createManualQuizBank("Capítulo 15", seeds)
