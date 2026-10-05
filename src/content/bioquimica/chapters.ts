import { questionCountsByChapter } from "."
import glycolysisImage from "@/assets/bioquimica/glycolysis.svg"
import krebsImage from "@/assets/bioquimica/krebs.png"
import electronTransportImage from "@/assets/bioquimica/electron-transport.svg"
import glycogenImage from "@/assets/bioquimica/selection/glycogen.jpg"
import gluconeogenesisImage from "@/assets/bioquimica/selection/gluconeogenesis.jpg"
import pentosePhosphateImage from "@/assets/bioquimica/selection/pentose-phosphate.jpg"
import betaOxidationImage from "@/assets/bioquimica/selection/beta-oxidation.jpg"
import ketogenesisImage from "@/assets/bioquimica/selection/ketogenesis.jpg"
import fattyAcidSynthesisImage from "@/assets/bioquimica/selection/fatty-acid-synthesis.jpg"
import eicosanoidsImage from "@/assets/bioquimica/selection/eicosanoids.jpg"
import lipoproteinsImage from "@/assets/bioquimica/selection/lipoproteins.jpg"
import cholesterolImage from "@/assets/bioquimica/selection/cholesterol.jpg"

const entries = [
  ["Glucólisis", "Glucólisis", "Control, rendimiento, destinos del piruvato y reoxidación de NADH.", glycolysisImage],
  ["Ciclo de Krebs", "Ciclo de Krebs", "Reacciones de control, rendimiento, anaplerosis e integración metabólica.", krebsImage],
  ["Cadena respiratoria", "Cadena respiratoria y fosforilación oxidativa", "Complejos, lanzaderas, gradiente de protones, ATP sintasa e inhibidores.", electronTransportImage],
  ["Metabolismo del glucógeno", "Glucogénesis y glucogenólisis", "Síntesis, degradación, regulación hormonal y diferencias entre hígado y músculo.", glycogenImage],
  ["Gluconeogénesis", "Gluconeogénesis", "Precursores, bypases, regulación y ciclos de Cori y glucosa-alanina.", gluconeogenesisImage],
  ["Vía de las pentosas", "Vía de las pentosas fosfato", "NADPH, ribosa-5-fosfato, fases, G6PD e integración con glucólisis.", pentosePhosphateImage],
  ["Beta oxidación", "Beta oxidación de ácidos grasos", "Movilización, carnitina, reacciones, rendimiento, ácidos grasos impares e insaturados.", betaOxidationImage],
  ["Cetogénesis", "Cetogénesis", "Cuerpos cetónicos, síntesis hepática, utilización extrahepática y cetoacidosis.", ketogenesisImage],
  ["Síntesis de ácidos grasos", "Síntesis de ácidos grasos", "Citrato, acetil-CoA carboxilasa, NADPH y ácido graso sintasa.", fattyAcidSynthesisImage],
  ["Eicosanoides", "Eicosanoides", "Ácido araquidónico, COX, LOX, prostaglandinas y AINEs.", eicosanoidsImage],
  ["Lipoproteínas", "Lipoproteínas", "Quilomicrones, VLDL, LDL, HDL, LPL y LCAT.", lipoproteinsImage],
  ["Colesterol", "Colesterol", "Síntesis, HMG-CoA reductasa, SREBP y derivados.", cholesterolImage]
] as const

const eyebrowByChapterId: Record<string, string> = {
  "Glucólisis": "Vía central de la glucosa",
  "Ciclo de Krebs": "Ciclo del ácido cítrico",
  "Cadena respiratoria": "Cadena respiratoria",
  "Metabolismo del glucógeno": "Metabolismo del glucógeno",
  "Gluconeogénesis": "Síntesis de glucosa",
  "Vía de las pentosas": "Vía de las pentosas",
  "Beta oxidación": "Beta oxidación",
  "Cetogénesis": "Cuerpos cetónicos",
  "Síntesis de ácidos grasos": "Lipogénesis",
  "Eicosanoides": "Mediadores lipídicos",
  "Lipoproteínas": "Transporte de lípidos",
  "Colesterol": "Metabolismo del colesterol"
}

export const chapters = entries.map(([id, title, description, image], index) => ({
  id,
  title,
  eyebrow: eyebrowByChapterId[id],
  subtitle: index < 3 ? "Primer parcial" : index < 8 ? "Segundo parcial" : "Tercer parcial",
  description,
  image,
  questionCount: questionCountsByChapter[id],
  accent: index < 3 ? "from-emerald-500/25 to-teal-500/10" : index < 8 ? "from-amber-500/25 to-orange-500/10" : "from-sky-500/25 to-indigo-500/10"
}))
