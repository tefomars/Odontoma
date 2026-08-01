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

export function deleteFsrsCardHistory(
  cardIds: string[]
) {

  if (cardIds.length === 0) return

  const idsToDelete =
    new Set(cardIds)

  const storage =
    loadFsrsStorage()

  const cards =
    Object.fromEntries(
      Object.entries(storage.cards).filter(
        ([cardId]) => !idsToDelete.has(cardId)
      )
    )

  const reviews =
    storage.reviews.filter(
      review => !idsToDelete.has(review.cardId)
    )

  saveFsrsStorage({
    cards,
    reviews
  })
}

export function undoFsrsReview(
  storage: FsrsStorage,
  reference: {
    cardId: string
    reviewedAt: string
  }
): FsrsStorage | null {
  let reviewIndex = -1

  for (
    let index = storage.reviews.length - 1;
    index >= 0;
    index -= 1
  ) {
    const review = storage.reviews[index]

    if (
      review.cardId === reference.cardId &&
      review.reviewedAt === reference.reviewedAt
    ) {
      reviewIndex = index
      break
    }
  }

  if (reviewIndex < 0) return null

  const review = storage.reviews[reviewIndex]
  const cards = { ...storage.cards }

  if (review.stateBefore) {
    cards[review.cardId] = review.stateBefore
  } else {
    delete cards[review.cardId]
  }

  return {
    cards,
    reviews: storage.reviews.filter(
      (_, index) => index !== reviewIndex
    )
  }
}
