# Parcial 1 · Cito II — repaso independiente

Agregado el 7 de noviembre de 2026. Ross/Pawlina, capítulos 13 y 14 del texto
en inglés proporcionado, y el extracto de Robbins de hemostasia y trombosis,
páginas impresas 79–86. El nombre del archivo PDF no determina su edición:
sus metadatos indican *Robbins Basic Pathology, 9th Edition*.

## Alcance y estilo

- 108 preguntas: 90 de cuatro alternativas y 18 verdadero/falso (9 verdaderas,
  9 falsas). Cada área aporta 30 MC y 6 V/F: cardiovascular, linfático y hemostasia.
- 150 tarjetas esenciales en 15 subtemas: 50 cardiovasculares, 60 linfáticas y
  40 de hemostasia. Preguntas completas, recuerdo directo y respuestas breves.
- Los parciales recordados orientan temas y nivel, no son una clave validada.
  Enunciados y alternativas nuevos; no se reproduce el examen pasado.
- Distractores escritos por pregunta, próximos en estructura o mecanismo y
  comparables en detalle. Las precisiones van en la explicación, no como pista
  añadida solo a la respuesta correcta. No hay opciones de todas/ninguna.
- Las V/F se conservan en el quiz; las tarjetas preguntan directamente el concepto.
- No se incluyeron identificaciones de flechas cuyas imágenes no se adjuntaron.
  Sí hay reconocimiento mediante descripciones histológicas nuevas.
- No se agregan recomendaciones terapéuticas, dosis ni un temario clínico externo.
  Se priorizan conceptos para una última vuelta, no reemplazar los capítulos.

## Comprobación de puntos sensibles

Localizadores por subsección/tabla/figura; no usar líneas del OCR como páginas.

| Fuente | Punto verificado y criterio aplicado |
| --- | --- |
| Ross 13, heart wall/conducting system | La palidez de Purkinje corresponde principalmente a citoplasma central rico en glucógeno, no a glucógeno nuclear. La red ventricular es subendocárdica; no generalizar esa localización a todos los nodos. |
| Ross 13, heart valves | Cúspides habitualmente avasculares, nutrición por difusión; puede haber vasos basales. Fibrosa, esponjosa y capa elástica son capas conjuntivas, no tres endotelios. No afirmar incapacidad absoluta de reparación. |
| Ross 13, regulación cardíaca y fig. 13.12 | β1 simpático; cronotropismo es frecuencia, el positivo la aumenta. EDHF hiperpolariza músculo liso y favorece relajación. M2 es la principal respuesta muscarínica cardíaca. |
| Ross 13, arterias y microvasculatura | Arteriolas de una o dos capas musculares; capilar fenestrado con lámina basal continua, distinto del discontinuo hepático. Arteria/vena se define por dirección, no por oxigenación. |
| Ross 14, tabla 14.2 | IgG placentaria, IgA secretora, IgM inicial/complemento, IgD e IgM receptoras, IgE/mastocitos. Primaria HUMORAL involucra B; no excluir T de toda respuesta primaria. |
| Ross 14, tabla 14.3 | IL-2 expansión T; IL-5 eosinófilos; IL-8 quimiotaxis neutrófila; IL-7 precursores B/T; IL-12 NK/TH1; IL-13 favorece IgE, pero IL-4 también, por lo que no se utiliza como distractor falso para esa función. |
| Ross 14, presentación y selección | MHC II en APC y reconocimiento por CD4, no exclusivo de dendríticas. Centros germinativos: respuesta B dependiente de antígeno, no maduración inicial B. Distinguir selección positiva de negativa. |
| Ross 14, timo/ganglio/bazo | Epiteliorreticulares V medulares y VI/Hassall; HEV poscapilares y homing por quimiocinas; PALS T, nódulos B y cordones de Billroth en pulpa roja. |
| Robbins, pp. 79–82, figs. 3–5 a 3–8 | Plaquetas anucleadas; vWF protege VIII, no VII; GpIb/adhesión distinto de GpIIb-IIIa/agregación. Cascada es una secuencia, no una única proenzima. Incluye cofactores no enzimáticos. |
| Robbins, pp. 82–83 | TP explora VII y vía común; factor tisular III es reactivo, no factor plasmático medido. TTPa explora XII, XI, IX, VIII y vía común. Fibrina es producto; XIIIa estabiliza por enlaces cruzados. |
| Robbins, pp. 82–84, figs. 3–9 a 3–11 | Antitrombina inhibe IIa, IXa, Xa, XIa y XIIa: estos factores no se llaman antitrombóticos. C/S inactiva Va/VIIIa; TFPI limita Xa y complejo TF–VIIa. |
| Robbins, pp. 83–86, figs. 3–11 a 3–12 | t-PA activa plasminógeno; plasmina degrada fibrina, α2-antiplasmina frena plasmina libre y PAI frena activadores. Tríada de Virchow y estasis sin equiparar dímero D a un diagnóstico único. |

La especificación M2, no explícita en el pasaje OCR cardíaco utilizado, se
corroboró en [Neural Regulation of Cardiac Rhythm](https://www.ncbi.nlm.nih.gov/books/NBK597441/).
Es corroboración del concepto solicitado, no ampliación del temario.

## Integración y mantenimiento

`citoI.ts` define el quiz y nombre estable; `citoIFlashcards.ts`, las tarjetas.
`studio/catalog.ts` registra ambos como `kind: "prepartial"`, materia `Histología`,
que la app presenta como Citohistología. El Builder usa el mismo catálogo.
No se modifican capítulos normales, preguntas escritas ni explicaciones del dueño.

El parcial se incorpora automáticamente al final acumulativo: cuatro parciales,
393 preguntas fuente. El final no duplica bancos editables; su progreso tiene
IDs independientes. Editar aquí repercute en la combinación derivada.

Las claves MC están almacenadas primero y el motor común mezcla posiciones
sin perder su correspondencia. No repartir letras manualmente en el contenido.
IDs estables `quiz-cito1-001`…`108` y `prepartial-cito1-card-001`…`150`:
no renumerarlos al ordenar o quitar tarjetas/preguntas.

`citoI.test.ts` comprueba cantidades, claves, duplicados, longitud comparativa,
mezcla, registro y guardado/recarga de ediciones, bajas y orden en el Builder.
`cumulative.test.ts` prueba composición y selección acumulativa. Estas pruebas
no certifican exactitud académica ni plausibilidad semántica: requieren revisión
editorial del contenido y sus fuentes.
