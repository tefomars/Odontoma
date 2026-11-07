# Parcial 4 · Cito II — repaso independiente

Agregado el 7 de noviembre de 2026. Capítulos 21, 22 y 23 del Ross/Pawlina en inglés
proporcionado por el dueño. El título mantiene **Cito II**, igual que los parciales
anteriores; IV indica el número de parcial, no Cito IV.

## Alcance y criterio editorial

- 96 preguntas: 78 de cuatro alternativas y 18 verdadero/falso; 32 por sistema.
- 120 flashcards esenciales: 40 por sistema, organizadas en 12 subtemas.
- Banco exclusivo de última vuelta; no modifica los capítulos normales ni escritos.
- Los parciales pasados y recuerdos colaborativos solo orientaron temas y nivel.
  No son una clave autorizada ni una predicción del siguiente examen.
- Preguntas, contextos y alternativas redactados para este banco. No se incluyeron
  capturas, enunciados completos del parcial ni sus opciones en esta documentación.
- Los distractores se redactan individualmente, con relaciones anatómicas/hormonales
  cercanas. La explicación lleva las precisiones, no una alternativa correcta más larga.
- Las V/F pueden tener una primera cláusula cierta y una segunda falsa: se explica
  exactamente el cambio. No asumir que un enunciado falso era un error del estudiante.
- Las tarjetas convierten esos conceptos en recuerdo directo, no en V/F encubiertas.
- Se dejaron fuera las reconstrucciones sin significado recuperable, por ejemplo
  la pregunta anticonceptiva incompleta, y las identificaciones de flechas sin imagen.
  Algunos conceptos de esas figuras se evalúan mediante descripciones nuevas.
- No se agregan dosis, guías de tratamiento ni tecnicismos de otras fuentes para
  resolver recuerdos ambiguos. El alcance de este repaso es histología de Ross.

## Comprobación bibliográfica de puntos sensibles

Localizador: subsección, tabla o figura del libro, no numeración de líneas del OCR.

| Tema | Localizador | Criterio aplicado |
| --- | --- | --- |
| Foliculoestrelladas | Cap. 21, pars distalis | Principalmente no hormonosecretoras; red reguladora, conexina 43; pueden formar agrupaciones/folículos pequeños. |
| Neurohipófisis | Cap. 21, pars nervosa; tabla 21.4 | Síntesis hipotalámica y almacenamiento/liberación neural; no presentar el paraventricular como fuente exclusiva de oxitocina. |
| Pineal | Cap. 21, figs. 21.11–12 y texto | Origen neuroectodérmico, pinealocitos y glía; melatonina favorecida por oscuridad. |
| Tiroides | Cap. 21, síntesis hormonal; fig. 21.17 | NIS basolateral, pendrina apical, TPO; megalina para tiroglobulina intacta, distinta de la vía lisosómica. |
| PTH | Cap. 21, funciones de paratiroides | Conserva calcio renal, aumenta fosfaturia y activación de vitamina D; acción osteoclástica indirecta. Hipocalcemia puede causar tetania. |
| Suprarrenal fetal | Cap. 21, fetal adrenal gland | Cromafines dispersas sin médula definitiva; cooperación enzimática fetoplacentaria para esteroides, no anticuerpos. |
| Diferenciación masculina | Cap. 22, development of the testis | SRY en pre-Sertoli; testosterona/Wolff, MIF/Müller y DHT/genitales externos son relaciones diferentes. |
| Leydig | Cap. 22, Leydig cells y correlación tumoral | INSL3 favorece descenso. Sus tumores pueden producir estrógenos y ginecomastia; no excluirlos por ser productores de andrógenos. |
| Meiosis | Cap. 22, spermatocyte phase; fig. 22.10 | Primario posreplicación 2n/4c, secundario 1n/2c, espermátide 1n/1c. El libro usa d en vez de c para cantidad de ADN. |
| Espermiogénesis | Cap. 22, figs. 22.11–12 y texto | Remodelación sin división; Golgi/acrosoma, casquete, pérdida de citoplasma. Distinguir de espermiación y capacitación. |
| Eferentes | Cap. 22, fig. 22.21 y lámina 88 | Este Ross describe epitelio cilíndrico seudoestratificado; células altas ciliadas alternan con bajas absorbentes. |
| Próstata | Cap. 22, fig. 22.27; correlación 22.4 | Hiperplasia principalmente transicional; periuretral puede contribuir. Carcinoma principalmente periférico. |
| Erección/emisión | Cap. 22, correlación 22.5 y conductos | Erección: parasimpático/NO/relajación. Emisión: simpático/músculo liso; no reducir toda la expulsión a un único componente autónomo. |
| Ovocito | Cap. 23, primordial/primary follicle; fig. 23.3 | Balbiani es acúmulo de orgánulos; ovocito primario detenido en profase I y secundario en metafase II. |
| Cuerpo lúteo | Cap. 23, corpus luteum of menstruation; correlación 23.3 | El texto da unos 10 días de actividad si no hay implantación. No igualarlo automáticamente a toda la duración de la fase lútea. |
| Rescate lúteo | Cap. 23, endocrinología placentaria | hCG mantiene el cuerpo lúteo durante embarazo temprano, no dependencia lútea durante toda la gestación. |
| Endometrio | Cap. 23, menstrual cycle; figs. 23.17–18 | Regeneración desde basal, proliferativa por estrógenos, secretora por progesterona, menstruación por retirada de esteroides. |
| Implantación | Cap. 23, blastocyst/implantation | Embrioblasto distinto del trofoblasto; citotrofoblasto mitótico, sincitiotrofoblasto invasor sin mitosis propias. |
| Placenta | Cap. 23, placenta | Corion frondoso fetal/decidua basal materna; sangre materna intervellosa y fetal intravascular. |
| Montgomery y lactancia | Cap. 23, mammary glands | Estructura intermedia no equivale a “secreción mixta”. Proteína merocrina, grasa apocrina, producción por prolactina y eyección por oxitocina. |

## Integración y mantenimiento

`citoIV.ts` contiene el quiz y la identidad estable del banco.
`citoIVFlashcards.ts` contiene las tarjetas. `studio/catalog.ts` registra ambos
como `kind: "prepartial"`, bajo la clase existente `Histología`, presentada como
Citohistología por la configuración de la app. No crear una clase duplicada.

App y Builder comparten ese catálogo; no necesitan copias del contenido. El menú
deriva títulos y cantidades, y conserva Nuevas/Incorrectas/Mezcla, 10/20/Todas,
avance por banco y reinicio acotado. No se modificó navegación ni FSRS.

El almacenamiento base pone la clave de cuatro alternativas primero. El motor
de sesiones existente la mezcla y conserva su correspondencia. No editar claves
para “repartir letras” en estos archivos.

No renumerar IDs ya utilizados al reordenar o quitar contenido. El Builder guarda
parches de altas, cambios, bajas y orden; `citoIV.test.ts` verifica ese recorrido.
Las pruebas verifican estructura e integración, **no certifican la exactitud
académica ni la plausibilidad semántica de un distractor**: mantener revisión humana.
