import { CITO_II_THIRD_PARTIAL } from "./citoIII"
import { studioBanks } from "../studio/catalog"

export const prePartialBanks = studioBanks.filter(bank => bank.kind === "prepartial" && bank.enabled !== false)

export function getPrePartialBank(id: string) {
  // La etiqueta anterior puede permanecer en una sesión de examen guardada.
  const currentId = id === "Parcial 3 · Cito III" ? CITO_II_THIRD_PARTIAL : id
  return prePartialBanks.find(bank => bank.id === currentId)
}
