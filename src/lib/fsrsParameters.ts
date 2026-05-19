const STORAGE_KEY =
  "odontoma_fsrs_parameters"

export type OdontomaFsrsParameters = {
  weights?: number[]
  requestRetention?: number
  optimizedAt?: string
  reviewCount?: number
  stats?: {
    reviewCount: number
    rememberedCount: number
    forgottenCount: number
    retention: number
    targetRetention: number
    intervalScale: number
    averageScheduledDays: number
  }
}

export function loadFsrsParameters(): OdontomaFsrsParameters | null {

  const raw =
    localStorage.getItem(STORAGE_KEY)

  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveFsrsParameters(
  parameters: OdontomaFsrsParameters
) {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(parameters)
  )
}

export function clearFsrsParameters() {

  localStorage.removeItem(STORAGE_KEY)
}
