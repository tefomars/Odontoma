import type { Flashcard } from "@/content/flashcards/histologia/cards"
import { CITO_II_FOURTH_PARTIAL } from "./citoIV"

type Group = {
  topic: string
  cards: readonly (readonly [front: string, back: string])[]
}

// Preguntas de recuerdo directo; no son enunciados V/F ni conversiones
// automáticas del quiz. Mantener grupos de diez e IDs publicados estables.
const groups: readonly Group[] = [
  {
    topic: "Endocrino · hipotálamo e hipófisis",
    cards: [
      ["¿Cómo llega una señal paracrina a su célula diana vecina?", "Por difusión local en el tejido, sin necesitar la circulación general."],
      ["¿Por qué una glándula endocrina puede liberar hormonas sin conducto excretor?", "Las vierte al intersticio y de allí pasan a los vasos sanguíneos."],
      ["¿Qué estructura enlaza la regulación endocrina con el control del sistema nervioso autónomo?", "El hipotálamo."],
      ["¿Por qué se altera el control de la adenohipófisis al interrumpir sus venas porta?", "Dejan de llegar por esa vía las señales reguladoras del hipotálamo."],
      ["¿De qué primordio embrionario procede el lóbulo anterior hipofisario?", "De la bolsa de Rathke, originada en ectodermo oral."],
      ["Si se retira la inhibición dopaminérgica de las lactótropas, ¿qué pasa con la prolactina?", "Aumenta su liberación."],
      ["¿Qué hormona permite identificar funcionalmente a una somatótropa?", "La hormona del crecimiento, GH."],
      ["¿Qué función reguladora se atribuye a la red de foliculoestrelladas de la adenohipófisis?", "Coordinar señales locales que modulan la liberación hormonal."],
      ["¿Qué conexión intercelular une la red de células foliculoestrelladas?", "Uniones comunicantes con conexina 43."],
      ["¿Dónde se sintetizan las hormonas que luego almacena la pars nervosa?", "En neuronas hipotalámicas de los núcleos supraóptico y paraventricular."],
    ],
  },
  {
    topic: "Endocrino · neurosecreción y tiroides",
    cards: [
      ["¿Qué representan los acúmulos neurosecretores que dilatan axones en la pars nervosa?", "Cuerpos de Herring, con material hormonal almacenado."],
      ["¿Qué cambio renal permite a la ADH reducir la pérdida de agua?", "Aumenta la reabsorción de agua en los conductos colectores."],
      ["¿Qué tienen de particular las reservas hormonales tiroideas frente a las de otras glándulas endocrinas?", "Se almacenan en gran cantidad fuera de las células, en el coloide folicular."],
      ["¿Dónde se sintetiza la proteína que forma la tiroglobulina antes de pasar por el Golgi?", "En el retículo endoplasmático rugoso del tirocito."],
      ["¿Qué transportador capta el yoduro en el lado sanguíneo del tirocito?", "El cotransportador sodio/yoduro NIS, en la membrana basolateral."],
      ["¿Cómo pasa el yoduro del tirocito al coloide folicular?", "A través de pendrina en la membrana apical."],
      ["¿Qué enzima tiroidea interviene en oxidación del yoduro, yodación y acoplamiento?", "La peroxidasa tiroidea, TPO."],
      ["¿Cómo difieren los acoplamientos que forman T3 y T4?", "T3: MIT + DIT. T4: DIT + DIT."],
      ["¿Por qué la tiroglobulina captada por la vía lisosómica permite liberar T3 y T4?", "Su proteólisis separa las hormonas de la proteína que las almacenaba."],
      ["¿Qué receptor desvía tiroglobulina hacia una vía transepitelial que evita su degradación lisosómica?", "Megalina."],
    ],
  },
  {
    topic: "Endocrino · calcio y pineal",
    cards: [
      ["¿Qué hormona hipofisaria estimula la actividad de las células foliculares tiroideas?", "TSH o tirotropina."],
      ["¿Qué población tiroidea produce calcitonina sin alcanzar la luz folicular?", "Las células C o parafoliculares."],
      ["¿Cómo cambia la secreción de PTH cuando desciende el calcio sanguíneo?", "Aumenta para contribuir a recuperar la calcemia."],
      ["¿Qué combinación renal de PTH conserva calcio y reduce fosfato sanguíneo?", "Más reabsorción de calcio y más excreción de fosfato."],
      ["¿Cómo favorece PTH la absorción intestinal de calcio a través del riñón?", "Estimula la formación de calcitriol, que aumenta la absorción intestinal."],
      ["¿Por qué PTH puede aumentar resorción ósea sin unirse directamente al osteoclasto?", "Actúa sobre el linaje osteoblástico, que promueve señales RANKL–RANK."],
      ["¿Qué explica la intensa eosinofilia de las células oxífilas paratiroideas?", "Su abundancia de mitocondrias."],
      ["¿Qué alteración neuromuscular puede producir una hipocalcemia intensa por pérdida de función paratiroidea?", "Tetania, por aumento de la excitabilidad neuromuscular."],
      ["¿Cómo influye la oscuridad en la secreción de los pinealocitos?", "Favorece el aumento de melatonina."],
      ["¿De dónde procede embrionariamente la pineal?", "Del neuroectodermo del techo posterior del tercer ventrículo."],
    ],
  },
  {
    topic: "Endocrino · suprarrenal",
    cards: [
      ["¿Cómo se relacionan las tres zonas corticales suprarrenales con sus productos principales?", "Glomerular: mineralocorticoides; fasciculada: glucocorticoides; reticular: andrógenos."],
      ["¿Qué disposición celular permite reconocer la fasciculada suprarrenal en H&E?", "Cordones largos radiales de espongiocitos, separados por sinusoides."],
      ["¿Qué hormona adenohipofisaria estimula especialmente la secreción de cortisol?", "ACTH."],
      ["¿Qué señal del sistema renina–angiotensina estimula la secreción de aldosterona?", "Angiotensina II."],
      ["¿Qué hace la aldosterona con el transporte renal de sodio y potasio?", "Aumenta reabsorción de Na+ y secreción de K+."],
      ["¿Por qué las cromafines se comparan con neuronas simpáticas posganglionares modificadas?", "Reciben fibras simpáticas preganglionares y liberan catecolaminas a la sangre."],
      ["¿Qué neurotransmisor de las fibras preganglionares estimula a las cromafines?", "Acetilcolina."],
      ["¿Qué conversión de catecolaminas favorecen los glucocorticoides que llegan a la médula suprarrenal?", "Noradrenalina en adrenalina."],
      ["¿Por qué no encontrar una médula definida en la suprarrenal fetal no significa ausencia de cromafines?", "Las cromafines ya existen, pero están dispersas entre las células corticales fetales."],
      ["¿Para qué intercambian precursores esteroideos la suprarrenal fetal y la placenta?", "Para completar rutas enzimáticas que cada órgano no puede realizar por sí solo."],
    ],
  },
  {
    topic: "Masculino · diferenciación y células testiculares",
    cards: [
      ["¿En qué precursores testiculares se expresa SRY al iniciarse la diferenciación masculina?", "En las células de pre-Sertoli."],
      ["¿Qué señal de Sertoli fetales provoca regresión de los conductos paramesonéfricos?", "El factor inhibidor mülleriano, MIF o AMH."],
      ["¿Qué andrógeno estimula la diferenciación de los conductos de Wolff?", "La testosterona."],
      ["¿Por qué una deficiencia de 5α-reductasa compromete la diferenciación de genitales externos masculinos?", "Porque disminuye la conversión de testosterona en DHT."],
      ["¿Qué producto de Leydig, además de testosterona, favorece el descenso testicular?", "INSL3, proteína similar a la insulina 3."],
      ["¿Por qué el plexo pampiniforme favorece una temperatura testicular inferior a la corporal?", "Intercambia calor a contracorriente con la sangre de la arteria testicular."],
      ["¿Qué cristales citoplasmáticos pueden ayudar a reconocer células de Leydig?", "Cristales de Reinke."],
      ["¿Cómo se distribuyen las dianas testiculares de LH y FSH?", "LH actúa sobre Leydig; FSH, sobre Sertoli."],
      ["¿Qué secreción de Sertoli limita por retroalimentación la producción de FSH?", "Inhibina B."],
      ["¿Por qué un tumor de Leydig puede acompañarse de ginecomastia?", "Puede producir estrógenos además de andrógenos."],
    ],
  },
  {
    topic: "Masculino · meiosis y remodelación espermática",
    cards: [
      ["¿Qué uniones separan el compartimento basal del adluminal en el túbulo seminífero?", "Uniones ocluyentes entre células de Sertoli."],
      ["¿Por qué la barrera hematotesticular ayuda a evitar respuestas contra células germinales?", "Aísla antígenos de células germinales adluminales del sistema inmunitario."],
      ["¿Qué contenido cromosómico y de ADN tiene el espermatocito primario después de la replicación?", "2n y 4c de ADN; Ross expresa la cantidad de ADN como 4d."],
      ["Al terminar meiosis I masculina, ¿qué célula se obtiene y cuánto ADN conserva?", "Espermatocito secundario: 1n y 2c de ADN."],
      ["Al terminar meiosis II masculina, ¿qué contenido tiene cada espermátide?", "1n y 1c de ADN."],
      ["¿Qué distingue la espermiogénesis de las divisiones meióticas?", "Remodela espermátides en espermatozoides sin nuevas divisiones."],
      ["¿Cómo se origina el acrosoma durante la fase de Golgi de la espermiogénesis?", "Por fusión de gránulos proacrosómicos procedentes del Golgi."],
      ["¿Qué cambio del acrosoma caracteriza la fase de casquete de la espermiogénesis?", "Se extiende como un casquete sobre la porción anterior del núcleo."],
      ["¿Qué ocurre con el citoplasma sobrante al madurar una espermátide?", "Forma cuerpos residuales que fagocitan las células de Sertoli."],
      ["¿Cómo se llama la liberación de los espermatozoides desde Sertoli hacia la luz tubular?", "Espermiación."],
    ],
  },
  {
    topic: "Masculino · espermatozoide y conductos",
    cards: [
      ["¿Qué vaina permite distinguir la pieza intermedia de la principal del espermatozoide?", "La pieza intermedia tiene vaina mitocondrial; la principal, vaina fibrosa."],
      ["¿Qué queda en la pieza terminal de la cola al desaparecer las vainas accesorias?", "El axonema rodeado por la membrana plasmática."],
      ["¿Qué vía intratesticular comunica túbulos seminíferos y conductillos eferentes?", "Túbulos rectos y red testicular, en ese orden."],
      ["¿Qué combinación celular da contorno festoneado a la luz de los conductillos eferentes?", "Alternancia de células altas ciliadas y bajas absorbentes."],
      ["¿Qué tipo de epitelio describe este Ross en los conductillos eferentes?", "Cilíndrico seudoestratificado, con células ciliadas y absorbentes."],
      ["¿Cómo se mueve el contenido de los conductillos eferentes?", "Por batido ciliar y contracción de la capa muscular lisa."],
      ["¿Por qué los estereocilios del epidídimo no impulsan espermatozoides mediante batido?", "Porque son microvellosidades largas, no cilios móviles."],
      ["¿Qué cambio funcional adquieren los espermatozoides durante su tránsito epididimario?", "Maduración y capacidad de motilidad."],
      ["¿Dónde completa normalmente el espermatozoide su capacitación para fecundar?", "En el tracto reproductor femenino, después de la maduración epididimaria."],
      ["¿Cómo se ordena la muscular del deferente desde la luz hacia fuera?", "Longitudinal interna → circular media → longitudinal externa."],
    ],
  },
  {
    topic: "Masculino · glándulas y función eréctil",
    cards: [
      ["¿Qué glándula aporta al semen la principal fuente de fructosa para el metabolismo espermático?", "La vesícula seminal."],
      ["¿Qué conductos se unen para formar el conducto eyaculador?", "El conducto de la vesícula seminal y la porción terminal del deferente."],
      ["¿Qué enzima prostática incorporada al semen se conoce por las siglas PSA?", "El antígeno prostático específico, una serinproteasa."],
      ["¿Qué zona prostática explica la obstrucción uretral inicial típica de la hiperplasia benigna?", "La zona transicional, que rodea la uretra prostática."],
      ["¿Por qué el tacto rectal puede detectar lesiones de la zona prostática donde predominan carcinomas?", "Porque la zona periférica ocupa regiones posteriores y laterales, próximas al recto."],
      ["¿Qué glándulas accesorias liberan la secreción mucosa preseminal?", "Las glándulas bulbouretrales o de Cowper."],
      ["¿Cómo se disponen las tres masas principales de tejido eréctil del pene?", "Dos cuerpos cavernosos dorsales y un cuerpo esponjoso ventral."],
      ["¿Qué cambio del músculo liso inicia la expansión cavernosa durante la erección?", "Relajación mediada por la vía parasimpática y óxido nítrico."],
      ["¿Por qué la expansión cavernosa dificulta la salida de sangre venosa?", "Comprime vénulas y venas contra la túnica albugínea."],
      ["¿Qué control autónomo predomina en la emisión del contenido seminal hacia la uretra?", "El simpático, mediante contracciones del músculo liso."],
    ],
  },
  {
    topic: "Femenino · ovario y ovulación",
    cards: [
      ["¿Qué forma tienen las células que rodean al ovocito en un folículo primordial?", "Son planas y forman una sola capa."],
      ["¿Qué cambio de las células foliculares identifica el paso a folículo primario?", "Se vuelven cúbicas; inicialmente forman una sola capa."],
      ["¿Qué detención meiótica conserva el ovocito de un folículo primordial?", "Profase I, en el estadio de diploteno o dictioteno."],
      ["¿Qué representa el cuerpo de Balbiani dentro del ovocito?", "Un acúmulo localizado de Golgi, retículo, mitocondrias y otros orgánulos."],
      ["¿Cómo cooperan teca interna y granulosa para producir estrógenos?", "La teca aporta andrógenos bajo LH; la granulosa los aromatiza bajo FSH."],
      ["¿Qué cavidad distingue un folículo antral de uno preantral?", "El antro, lleno de líquido folicular."],
      ["¿Qué aumento hormonal desencadena los acontecimientos que culminan en la ovulación?", "El pico de LH."],
      ["¿En qué estado meiótico sale normalmente del ovario la célula que será fecundada?", "Como ovocito secundario detenido en metafase II."],
      ["¿De qué capas del folículo roto proceden las células del cuerpo lúteo?", "De granulosa y teca interna, que se luteinizan."],
      ["¿Qué esteroide caracteriza el predominio hormonal de la fase lútea?", "La progesterona, producida junto con estrógenos por el cuerpo lúteo."],
    ],
  },
  {
    topic: "Femenino · ciclo y trompa uterina",
    cards: [
      ["¿Qué esteroides estimulan la fase proliferativa endometrial?", "Los estrógenos."],
      ["¿Qué patrón glandular endometrial se asocia al predominio de progesterona?", "Glándulas tortuosas con secreción y estroma edematoso."],
      ["¿De qué reserva glandular se regenera el endometrio tras menstruar?", "De las porciones glandulares conservadas en el estrato basal."],
      ["¿Qué diferencia arterial acompaña al estrato basal y al funcional del endometrio?", "Arterias rectas para el basal y espirales para el funcional."],
      ["¿Qué retirada hormonal desencadena los cambios menstruales al involucionar el cuerpo lúteo?", "La caída de progesterona y estrógenos."],
      ["Sin fecundación ni implantación, ¿cuánto tiempo permanece activo el cuerpo lúteo en la descripción de Ross?", "Aproximadamente diez días después de la ovulación."],
      ["¿Qué señal trofoblástica mantiene al cuerpo lúteo en el embarazo temprano?", "La hCG."],
      ["¿En qué se transforma finalmente el cuerpo lúteo que involuciona?", "En el cuerpo albicans, una cicatriz hialina."],
      ["¿Qué dos poblaciones funcionales componen el epitelio simple de la trompa uterina?", "Células ciliadas y células no ciliadas secretoras."],
      ["¿En qué segmento tubárico ocurre habitualmente la fecundación?", "En la ampolla."],
    ],
  },
  {
    topic: "Femenino · implantación y placenta",
    cards: [
      ["¿Qué población del blastocisto origina los tejidos del embrión propiamente dicho?", "La masa celular interna o embrioblasto, no el trofoblasto."],
      ["¿Qué capa trofoblástica aporta células mediante mitosis durante la implantación?", "El citotrofoblasto."],
      ["¿Qué capa trofoblástica multinucleada invade inicialmente el endometrio?", "El sincitiotrofoblasto."],
      ["¿Qué tejidos constituyen las porciones fetal y materna de la placenta definitiva?", "Corion frondoso fetal y decidua basal materna."],
      ["¿Dónde está la sangre materna que baña las vellosidades placentarias?", "En el espacio intervelloso, fuera de los vasos fetales."],
      ["¿Qué aparición dentro del eje velloso permite clasificar una vellosidad como terciaria?", "Capilares fetales en su mesénquima."],
      ["¿Cómo se distribuyen los vasos umbilicales que llevan sangre hacia la placenta y de regreso?", "Dos arterias llevan sangre fetal a la placenta; una vena la devuelve al feto."],
      ["¿Por qué la gestación deja de depender del cuerpo lúteo como fuente principal de progesterona?", "La placenta adquiere producción suficiente de esteroides para mantenerla."],
      ["¿Cómo difiere la cobertura peritoneal posterior de la anterior del útero?", "El perimetrio cubre toda la cara posterior y solo parte de la anterior."],
      ["¿Qué revestimiento protege la luz vaginal frente a fricción?", "Epitelio plano estratificado no queratinizado."],
    ],
  },
  {
    topic: "Femenino · cérvix, vulva y lactancia",
    cards: [
      ["Si la vagina carece de glándulas propias, ¿qué fuente aporta principalmente su lubricación mucosa?", "Las glándulas del cuello uterino; las vestibulares aportan lubricación adicional."],
      ["¿Cómo cambia el revestimiento al pasar del canal cervical al ectocérvix?", "De cilíndrico simple a plano estratificado no queratinizado."],
      ["¿Qué distingue a los labios menores respecto al pelo y la grasa de su eje?", "Carecen de pelo y de tejido adiposo en su eje conjuntivo."],
      ["¿Qué función se atribuye a la secreción de las glándulas de Montgomery en la areola?", "Lubricar y proteger la piel, dificultando el crecimiento microbiano."],
      ["¿Qué anticuerpo predomina en la protección pasiva aportada por el calostro?", "IgA secretora."],
      ["¿Cómo se liberan las proteínas de la leche desde el epitelio mamario?", "Por exocitosis, mediante secreción merocrina."],
      ["¿Cómo se liberan los lípidos lácteos respecto a membrana y citoplasma celular?", "Por secreción apocrina: salen rodeados de membrana y una pequeña porción de citoplasma."],
      ["¿Qué hormona hipofisaria favorece la producción de leche por las células alveolares?", "La prolactina."],
      ["¿Qué hormona moviliza leche ya formada al contraer las células mioepiteliales?", "La oxitocina."],
      ["¿Dónde se sitúan las células mioepiteliales respecto al epitelio mamario y su lámina basal?", "Entre las células epiteliales y la lámina basal."],
    ],
  },
]

export const citoIVPrePartialFlashcards: Flashcard[] = groups.flatMap((group, groupIndex) =>
  group.cards.map(([front, back], cardIndex) => ({
    id: `prepartial-cito4-card-${String(groupIndex * 10 + cardIndex + 1).padStart(3, "0")}`,
    subject: "Citohistología",
    book: "Repaso pre-parcial",
    chapter: CITO_II_FOURTH_PARTIAL,
    topic: group.topic,
    subtopic: "Conceptos esenciales",
    front,
    back,
    tags: ["Repaso pre-parcial", CITO_II_FOURTH_PARTIAL, group.topic],
  }))
)
