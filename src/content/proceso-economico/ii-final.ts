import { defineQuestions, type QuestionDraft } from "./questionBank"

const drafts: QuestionDraft[] = [
  ["001", "Propiedad privada", "Dos proyectos compiten por el mismo terreno. Con derechos transferibles y precios de mercado, ¿qué aportan los precios a esa decisión?", [
    "Una referencia para comparar usos alternativos de recursos escasos.",
    "Una medición exacta de la felicidad que cada proyecto producirá.",
    "Una garantía de que cualquier decisión del propietario será rentable.",
    "Una eliminación de la incertidumbre sobre las preferencias futuras.",
  ], "Los precios monetarios facilitan el cálculo entre alternativas heterogéneas. No miden directamente satisfacción ni convierten las decisiones en resultados ciertos."],
  ["002", "Propiedad privada", "Una persona puede decidir sobre una máquina, venderla y conservar los beneficios o soportar pérdidas de su uso. ¿Qué relación entre propiedad e incentivos aparece?", [
    "Las consecuencias de la decisión se vinculan con quien controla el recurso.",
    "La posibilidad de vender elimina el costo de oportunidad de conservarla.",
    "El control del recurso asegura beneficios aunque se use de forma ineficiente.",
    "La responsabilidad por pérdidas exige conocer todas las preferencias futuras.",
  ], "El control y las consecuencias económicas pueden incentivar cuidado y selección de usos. Esa vinculación no garantiza acierto ni conocimiento perfecto."],
  ["003", "Propiedad privada", "Se permite poseer bienes de consumo, pero todas las fábricas son administradas centralmente y no pueden comprarse ni venderse. Para el problema de cálculo de Mises, ¿qué distinción importa?", [
    "Poseer bienes de consumo no equivale a tener mercados de medios de producción.",
    "Poseer bienes de consumo genera automáticamente precios para todas las fábricas.",
    "Administrar fábricas centralmente elimina la necesidad de comparar usos de capital.",
    "Consumir bienes finales requiere que cada consumidor sea propietario de una fábrica.",
  ], "El argumento se refiere a precios de factores y bienes de capital intercambiados en mercados, no simplemente a que existan objetos de uso personal."],
  ["004", "Propiedad privada", "Una firma logra reducir costos y otra los aumenta al desperdiciar los mismos materiales. ¿Qué papel cumplen ganancias y pérdidas bajo competencia?", [
    "Señalan diferencias entre ingresos obtenidos y valor de recursos empleados.",
    "Miden diferencias exactas de utilidad subjetiva entre todos los consumidores.",
    "Aseguran que cada empresario conserve indefinidamente su posición inicial.",
    "Fijan el precio de cada recurso según las horas históricas incorporadas.",
  ], "El resultado económico informa sobre la relación entre valoraciones de productos y costos de sus medios. No es una medición cardinal de satisfacción ni una garantía de permanencia."],
  ["005", "Socialismo", "Un planificador conoce cuántas toneladas de acero requiere cada obra, pero no dispone de precios de mercado de los factores. Según el argumento del cálculo económico, ¿qué dificultad sigue presente?", [
    "Comparar el costo económico de alternativas físicamente diferentes y usos sacrificados.",
    "Sumar las toneladas de una misma clase de acero requeridas por dos obras.",
    "Distinguir técnicamente el acero de la madera por sus propiedades físicas.",
    "Registrar la cantidad de trabajadores que participan en cada proyecto propuesto.",
  ], "La viabilidad técnica no basta para escoger económicamente entre proyectos heterogéneos. La crítica de Mises se centra en valorar oportunidades sacrificadas sin mercados de factores."],
  ["006", "Socialismo", "Un sistema centralizado posee ingenieros capaces y maquinaria suficiente para varias alternativas, pero no para realizarlas todas. ¿Qué afirmación distingue capacidad técnica de asignación económica?", [
    "Saber producir cada alternativa no determina cuál conviene sacrificar.",
    "Saber producir cada alternativa demuestra que todas caben simultáneamente.",
    "Contar con ingenieros elimina la necesidad de elegir entre fines.",
    "Contar con máquinas convierte en gratuitos sus demás usos posibles.",
  ], "La escasez obliga a elegir incluso con conocimiento técnico. El problema económico incluye comparar fines y medios alternativos, no solo ejecutar procesos factibles."],
  ["007", "Socialismo", "Un defensor de Marx explica la concentración del capital y el conflicto entre burguesía y proletariado como fuerzas de transformación social. ¿Cómo debe interpretarse esa afirmación en el curso?", [
    "Como una tesis de la interpretación marxista sobre la dinámica del capitalismo.",
    "Como una definición de la competencia perfecta que excluye cualquier conflicto.",
    "Como una medición contable que demuestra la rentabilidad de cada empresa.",
    "Como una descripción de preferencias temporales sin relación con clases sociales.",
  ], "El contenido se reconoce como parte de una teoría histórica y social específica. Identificar la tesis no exige presentarla como hecho universal ni como identidad contable."],
  ["008", "Socialismo", "Una comunidad pequeña organiza voluntariamente toda su producción bajo reglas acordadas. ¿Qué distingue ese proyecto del argumento de una transición histórica inevitable al socialismo?", [
    "El primero depende de un acuerdo deliberado; el segundo afirma una dinámica histórica necesaria.",
    "El primero demuestra una dinámica histórica necesaria; el segundo depende solo de un contrato local.",
    "Ambos se distinguen únicamente por la moneda utilizada para registrar las compras internas.",
    "Ambos afirman que cualquier diferencia de preferencias desaparece cuando se comparte propiedad.",
  ], "Se contrasta un proyecto voluntario de organización con una pretensión de explicación histórica. No deben confundirse los medios de adhesión con una tesis de inevitabilidad."],
  ["009", "Socialismo", "En la distinción de Hayek, múltiples personas coordinan sus planes mediante reglas generales sin compartir un objetivo único. ¿Qué combinación corresponde a ese orden?", [
    "Cosmos y nomos: orden emergente bajo reglas generales de conducta.",
    "Taxis y thesis: organización dirigida mediante instrucciones para un objetivo común.",
    "Cosmos y thesis: jerarquía diseñada que asigna cada tarea concreta.",
    "Taxis y nomos: ausencia de reglas y de coordinación entre participantes.",
  ], "Cosmos designa el orden espontáneo y nomos las reglas generales asociadas. Una organización dirigida hacia fines concretos corresponde a la otra categoría conceptual."],
  ["010", "Socialismo", "Un plan anuncia mayor bienestar, pero no explica qué recursos reasignará ni qué bienes dejará de producir. ¿Qué evaluación económica falta, cualquiera que sea el sistema propuesto?", [
    "Comparar medios disponibles, costos de oportunidad y compatibilidad entre objetivos.",
    "Elegir un objetivo deseable para demostrar que su ejecución ya es viable.",
    "Reemplazar la comparación de recursos por la intensidad de las intenciones declaradas.",
    "Suponer que toda reasignación conserva intactos los demás usos de cada recurso.",
  ], "Los fines deseados no resuelven por sí solos el problema de medios escasos. Evaluar alternativas exige hacer visibles los sacrificios y las restricciones de coordinación."],
]

export const procesoIIFinal = defineQuestions("pe2-final", "Final", drafts)
