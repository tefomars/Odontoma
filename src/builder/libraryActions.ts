import type { StudioData } from "@/content/studio/schema"

export function archiveLibraryBank(data: StudioData, id: string): StudioData {
  return { ...data, banks: data.banks.map(bank => bank.id === id ? { ...bank, archived: true, enabled: false } : bank) }
}

export function restoreLibraryBank(data: StudioData, id: string): StudioData {
  return { ...data, banks: data.banks.map(bank => bank.id === id ? { ...bank, archived: false, enabled: true } : bank) }
}
