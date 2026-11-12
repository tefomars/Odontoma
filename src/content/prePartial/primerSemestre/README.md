# Repaso pre-parcial · Citohistología I

Creado el 9 de noviembre de 2026. Material de última vuelta, no sustituto de los
capítulos completos ni reproducción de exámenes anteriores. Los recopilatorios
privados orientaron el alcance, pero sus claves no se aceptaron automáticamente.
No se incluyen esos archivos privados ni imágenes de exámenes en el repositorio.

## Distribución acordada

| Banco | Alcance | Preguntas (MC + V/F) | Tarjetas |
|---|---|---:|---:|
| Parcial 1 · Cito I | Ross 1–3: técnicas, citoplasma, núcleo | 90 (74 + 16) | 90 |
| Parcial 2 · Cito I | Ross 4–6: tejidos, epitelio, conjuntivo | 94 (82 + 12) | 92 |
| Parcial 3 · Cito I | Ross 7–8 y artículos generales | 86 (74 + 12) | 84 |
| Parcial 4 · Cito I | Ross 9, 10 y 12: adiposo, sangre, nervioso | 96 (80 + 16) | 96 |
| Muscular | Ross 11, opcional | 30 (24 + 6) | 40 |
| Total | Cinco bancos independientes | 396 | 402 |

El final regular combina **366 preguntas** de P1–P4; excluye la recuperación
muscular por decisión del dueño. El final es derivado, no un banco duplicado.
El bloque se muestra como «Muscular»; conserva la clave interna
`Recuperación muscular · Cito I` para no perder el progreso guardado.

## Fuentes y límites editoriales

- Ross, archivo `rossenglish.txt` aportado por el dueño, capítulos 1–12.
- Nath y Menon, *Synovial Chondromatosis of the Temporomandibular Joint*,
  DOI 10.1007/s12663-019-01194-0 (publicación en línea 2019, volumen 2020).
- Fukutani et al., *Two Cases of Temporomandibular Synovial Chondromatosis
  Associated with Gli1 Gene Mutation*, 2022, DOI 10.3390/ijerph19084702.
- Ficarra y Beninati, *Bisphosphonate-related Osteonecrosis of the Jaws:
  An Update on Clinical, Pathological and Management Aspects*, 2007,
  DOI 10.1007/s12105-007-0033-2.
- Para no presentar recomendaciones históricas como protocolo vigente, se
  contrastó el enfoque general de seguridad con AAOMS, actualización MRONJ 2022:
  https://aaoms.org/wp-content/uploads/2024/03/mronj_position_paper.pdf

Los artículos aportan **10 preguntas** (8 MC + 2 V/F) y **12 tarjetas** dentro de
P3. Se priorizan concepto, origen, manifestaciones, imagen, correlato histológico,
mecanismo antirresortivo y prevención general. Se omiten códigos de mutaciones,
edades de pacientes, porcentajes de series pequeñas, dosis y técnicas quirúrgicas
particulares. La definición clásica de BRONJ se identifica como clásica; no es una
descripción exhaustiva de toda presentación moderna de MRONJ. No se indica
suspender medicamentos por cuenta propia ni se presenta CTX como garantía.

Se evitaron errores presentes en el material orientativo: confundir caveolina
con catalasa, llamar evaginaciones a las caveolas, intercambiar actina y
filamentos intermedios en uniones, atribuir RANKL a maduración de osteoblastos,
negar el papel renal de FGF23, definir trombocitopenia como déficit vitamínico,
llamar fibrinógeno a la proteína plasmática más abundante o reducir una unidad
motora a una fibra. La causalidad de GLI1 no se convierte en una afirmación
general a partir de dos casos.

## Estructura y mantenimiento

- `model.ts` empaqueta filas escritas individualmente; **no fabrica distractores**
  desde otras respuestas. Los MC tienen una clave inicial y tres distractores
  propios. El motor común baraja opciones y conserva la clave correcta.
- Cada módulo agrupa temas y tarjetas atómicas de recuerdo directo. Las tarjetas
  no son V/F ni una conversión literal de los enunciados del quiz.
- Los archivos `ampliacion1.ts` a `ampliacion4.ts` añaden objetivos de aprendizaje
  y tarjetas independientes para que cada parcial regular tenga 80–100 de cada
  tipo. Se agregan grupos con IDs propios: las filas anteriores no se renumeran.
  La recuperación opcional de un solo capítulo se conserva en 30 preguntas y 40
  tarjetas; no se infló su contenido para igualarla a los parciales regulares.
- Los IDs tienen un prefijo exclusivo de primer semestre y son estables. Añadir al
  final de un grupo o crear un grupo nuevo; no reordenar filas ya publicadas sin
  conservar sus IDs, pues estadísticas y FSRS dependen de ellos.
- Se registran en `studio/catalog.ts` como `kind: prepartial`, sujetos a los mismos
  patches, importación/exportación, backups y edición del Builder que Cito II.
- Su clase interna es `Citohistología I`. La clase histórica interna `Histología`
  permanece intacta y se muestra como `Citohistología II`; no migrar sus IDs.
- `organization.json` selecciona explícitamente solo P1–P4 para el final de Cito I.
  El dueño puede cambiarlo desde **Subdivisiones y organización → clase de repaso**.
- Los filtros, contadores, reinicio por parcial, sesiones, historial y swipe usan
  los mecanismos comunes. No necesitan un segundo sistema de almacenamiento.
- El temario visible procede de `chapters[].description`, editable en el Builder.
- Pruebas: `primerSemestre.test.tsx` cubre formatos, claves, alcance de finales,
  aislamiento del progreso, edición/compactación/restauración y los dos menús.

El contenido normal de Histología y los bancos de Cito II no se reescribieron.
