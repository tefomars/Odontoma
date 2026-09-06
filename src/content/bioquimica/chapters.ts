import { questionCountsByChapter } from "."
import glycolysisImage from "@/assets/bioquimica/glycolysis.svg"
import krebsImage from "@/assets/bioquimica/krebs.png"
import electronTransportImage from "@/assets/bioquimica/electron-transport.svg"
import glycogenImage from "@/assets/bioquimica/glycogen.svg"
import gluconeogenesisImage from "@/assets/bioquimica/gluconeogenesis.svg"
import pentosePhosphateImage from "@/assets/bioquimica/pentose-phosphate.svg"

const entries = [
  ["Glucólisis", "Glucólisis", "Control, rendimiento, destinos del piruvato y reoxidación de NADH.", glycolysisImage],
  ["Ciclo de Krebs", "Ciclo de Krebs", "Reacciones de control, rendimiento, anaplerosis e integración metabólica.", krebsImage],
  ["Cadena respiratoria", "Cadena respiratoria y fosforilación oxidativa", "Complejos, lanzaderas, gradiente de protones, ATP sintasa e inhibidores.", electronTransportImage],
  ["Metabolismo del glucógeno", "Glucogénesis y glucogenólisis", "Síntesis, degradación, regulación hormonal y diferencias entre hígado y músculo.", glycogenImage],
  ["Gluconeogénesis", "Gluconeogénesis", "Precursores, bypases, regulación y ciclos de Cori y glucosa-alanina.", gluconeogenesisImage],
  ["Vía de las pentosas", "Vía de las pentosas fosfato", "NADPH, ribosa-5-fosfato, fases, G6PD e integración con glucólisis.", pentosePhosphateImage]
] as const

export const chapters = entries.map(([id, title, description, image], index) => ({
  id,
  title,
  subtitle: index < 3 ? "Primer parcial" : "Segundo parcial",
  description,
  image,
  questionCount: questionCountsByChapter[id],
  accent: index < 3 ? "from-emerald-500/25 to-teal-500/10" : "from-amber-500/25 to-orange-500/10"
}))
