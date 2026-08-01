const STORAGE_KEY =
  "odontoma_fsrs_parameters"

export type OdontomaFsrsParameters = {
  weights?: number[]
  /** User preference. The optimizer must never change this value. */
  requestRetention?: number
  optimizedAt?: string
  reviewCount?: number
  optimizer?: "fsrs-rs"
  stats?: {
    reviewCount: number
    rememberedCount: number
    forgottenCount: number
    retention: number
    targetRetention: number
    averageScheduledDays: number
    trainingItems?: number
    logLoss?: number
    rmseBins?: number
  }
}

export const DEFAULT_DESIRED_RETENTION =
  0.9

export function clampDesiredRetention(
  value: number
) {
  return Math.min(
    0.97,
    Math.max(0.8, value)
  )
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

export function getDesiredRetention() {
  const saved =
    loadFsrsParameters()

  return clampDesiredRetention(
    saved?.requestRetention ??
    DEFAULT_DESIRED_RETENTION
  )
}

export function saveDesiredRetention(
  requestRetention: number
) {
  const current =
    loadFsrsParameters() || {}

  saveFsrsParameters({
    ...current,
    requestRetention:
      clampDesiredRetention(requestRetention)
  })
}

export function clearFsrsParameters() {
  const requestRetention =
    getDesiredRetention()

  saveFsrsParameters({
    requestRetention
  })
}
