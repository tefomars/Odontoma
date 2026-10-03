import { questionCountsByChapter } from "."
import glycolysisImage from "@/assets/bioquimica/glycolysis.svg"
import krebsImage from "@/assets/bioquimica/krebs.png"
import electronTransportImage from "@/assets/bioquimica/electron-transport.svg"
import glycogenImage from "@/assets/bioquimica/glycogen.svg"
import gluconeogenesisImage from "@/assets/bioquimica/gluconeogenesis.svg"
import pentosePhosphateImage from "@/assets/bioquimica/pentose-phosphate.svg"
import betaOxidationImage from "@/assets/bioquimica/beta-oxidation.svg"
import ketogenesisImage from "@/assets/bioquimica/ketogenesis.svg"
import fattyAcidSynthesisImage from "@/assets/bioquimica/fatty-acid-synthesis.svg"
import eicosanoidsImage from "@/assets/bioquimica/eicosanoids.svg"
import lipoproteinsImage from "@/assets/bioquimica/lipoproteins.svg"
import cholesterolImage from "@/assets/bioquimica/cholesterol.svg"

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

export const chapters = entries.map(([id, title, description, image], index) => ({
  id,
  title,
  subtitle: index < 3 ? "Primer parcial" : index < 8 ? "Segundo parcial" : "Tercer parcial",
  description,
  image,
  questionCount: questionCountsByChapter[id],
  accent: index < 3 ? "from-emerald-500/25 to-teal-500/10" : index < 8 ? "from-amber-500/25 to-orange-500/10" : "from-sky-500/25 to-indigo-500/10"
}))
