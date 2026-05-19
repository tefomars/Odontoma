import type {
  FsrsStorage
} from "@/lib/fsrs"

const STORAGE_KEY =
  "odontoma_fsrs_storage"

export function loadFsrsStorage(): FsrsStorage {

  const raw =
    localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return {
      cards: {},
      reviews: []
    }
  }

  try {

    const parsed =
      JSON.parse(raw)

    return {
      cards: parsed.cards || {},
      reviews: parsed.reviews || []
    }

  } catch {

    return {
      cards: {},
      reviews: []
    }
  }
}

export function saveFsrsStorage(
  storage: FsrsStorage
) {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(storage)
  )
}

export function clearFsrsStorage() {

  localStorage.removeItem(
    STORAGE_KEY
  )
}
