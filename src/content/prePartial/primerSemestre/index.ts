import { citoIParcial1 } from "./parcial1"
import { citoIParcial2 } from "./parcial2"
import { citoIParcial3 } from "./parcial3"
import { citoIParcial4 } from "./parcial4"
import { citoIMuscular } from "./muscular"

export { CITO_I_SUBJECT } from "./model"
export const citoIRegularBanks = [citoIParcial1, citoIParcial2, citoIParcial3, citoIParcial4]
export const citoIFirstSemesterBanks = [...citoIRegularBanks, citoIMuscular]
