import { useEffect, useEffectEvent, useMemo, useState } from "react"


import {
  getDueFsrsCards,
  reviewFsrsCard,
  previewFsrsCard,
  type FsrsRating
} from "@/lib/fsrs"

import {
  loadFsrsStorage,
  saveFsrsStorage,
  undoFsrsReview
} from "@/lib/flashcardStorage"

import {
  getFlashcardsBySource,
  type FlashcardSource
} from "@/lib/flashcardDecks"

import {
  filterActiveFlashcards,
  suspendFlashcard
} from "@/lib/suspendedFlashcards"

type Props = {
  onBack: () => void
  onMenu?: () => void
  selectedTopic?: string
  selectedSubtopic?: string
  source?: FlashcardSource
}

const ratingLabels: Record<FsrsRating, string> = {
  again: "1 · Otra vez",
  hard: "2 · Difícil",
  good: "3 · Bien",
  easy: "4 · Fácil"
}

function formatDuePreview(dueDate: string) {

  const now =
    Date.now()

  const due =
    new Date(dueDate).getTime()

  const diffMinutes =
    Math.max(
      1,
      Math.ceil((due - now) / 60000)
    )

  if (diffMinutes < 60) {
    return `en ${diffMinutes} min`
  }

  const diffHours =
    Math.ceil(diffMinutes / 60)

  if (diffHours < 24) {
    return `en ${diffHours} hora${diffHours === 1 ? "" : "s"}`
  }

  const diffDays =
    Math.ceil(diffHours / 24)

  if (diffDays < 30) {
    return `en ${diffDays} día${diffDays === 1 ? "" : "s"}`
  }

  const diffMonths =
    Math.ceil(diffDays / 30)

  if (diffMonths < 12) {
    return `en ${diffMonths} mes${diffMonths === 1 ? "" : "es"}`
  }

  const diffYears =
    Math.ceil(diffMonths / 12)

  return `en ${diffYears} año${diffYears === 1 ? "" : "s"}`
}

function getNextDueDate(
  cards: { id: string }[],
  progress: Record<string, any>
) {

  const futureDueDates =
    cards
      .map(card => progress[card.id]?.dueDate)
      .filter(Boolean)
      .map(date => new Date(date).getTime())
      .filter(time => time > Date.now())
      .sort((a, b) => a - b)

  if (futureDueDates.length === 0) return null

  return new Date(futureDueDates[0]).toISOString()
}

export default function FlashcardReviewScreen({
  onBack,
  onMenu,
  selectedTopic = "all",
  selectedSubtopic,
  source = "default"
}: Props) {

  const [storage, setStorage] =
    useState(() => loadFsrsStorage())

  const [showAnswer, setShowAnswer] =
    useState(false)

  const [cardAnimationKey, setCardAnimationKey] =
    useState(0)

  const [currentIndex, setCurrentIndex] =
    useState(0)

  const [suspendedVersion, setSuspendedVersion] =
    useState(0)

  const [undoReview, setUndoReview] =
    useState<{
      cardId: string
      reviewedAt: string
    } | null>(null)

  const [newCardOrderSeed] =
    useState(() => crypto.randomUUID())



  const allCards =
    useMemo(
      () => {
        void suspendedVersion

        return filterActiveFlashcards(
          getFlashcardsBySource(
            source,
            source === "user" ? selectedTopic : undefined
          )
        )
      },
      [source, selectedTopic, suspendedVersion]
    )

  const filteredCards =
    useMemo(
      () => {

        if (
          source === "default" &&
          selectedSubtopic?.startsWith("__subtopics:")
        ) {
          const subtopics =
            selectedSubtopic
              .replace("__subtopics:", "")
              .split("||")
              .filter(Boolean)

          return allCards.filter(
            card =>
              card.chapter === selectedTopic &&
              subtopics.includes(card.subtopic)
          )
        }

        if (selectedSubtopic) {
          return allCards.filter(
            card =>
              card.topic === selectedTopic &&
              card.subtopic === selectedSubtopic
          )
        }

        if (
          source === "default" &&
          selectedTopic.startsWith("Capítulo")
        ) {
          return allCards.filter(
            card => card.chapter === selectedTopic
          )
        }

        return source === "user" || selectedTopic === "all"
          ? allCards
          : allCards.filter(
              card => card.topic === selectedTopic
            )
      },
      [allCards, selectedTopic, selectedSubtopic, source]
    )

  const dueCards =
    useMemo(
      () =>
        getDueFsrsCards(
          filteredCards,
          storage.cards,
          newCardOrderSeed
        ),
      [filteredCards, storage, newCardOrderSeed]
    )

  const nextDueDate =
    useMemo(
      () =>
        getNextDueDate(
          filteredCards,
          storage.cards
        ),
      [
        filteredCards,
        storage
      ]
    )

  const safeCurrentIndex =
    dueCards.length > 0
      ? currentIndex % dueCards.length
      : 0

  const currentCard =
    dueCards[safeCurrentIndex]

  const currentState =
    currentCard
      ? storage.cards[currentCard.id]
      : undefined

  const ratingPreviews =
    useMemo(() => {

      if (!currentCard) {
        return {
          again: "",
          hard: "",
          good: "",
          easy: ""
        }
      }

      const preview =
        previewFsrsCard({
          cardId: currentCard.id,
          currentState,
          progress: storage.cards
        })

      return {
        again: formatDuePreview(preview.again.dueDate),
        hard: formatDuePreview(preview.hard.dueDate),
        good: formatDuePreview(preview.good.dueDate),
        easy: formatDuePreview(preview.easy.dueDate)
      }

    }, [
      currentCard,
      currentState,
      storage.cards
    ])

  const rateCardFromKeyboard =
    useEffectEvent((rating: FsrsRating) => {
      rateCard(rating)
    })

  useEffect(() => {

    function handleKeyDown(event: KeyboardEvent) {

      if (!currentCard) return

      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (event.code === "Space") {
        event.preventDefault()

        if (!showAnswer) {
          revealAnswer()
          return
        }

        rateCardFromKeyboard("good")
        return
      }

      if (!showAnswer) return

      if (event.key === "1") {
        event.preventDefault()
        rateCardFromKeyboard("again")
      }

      if (event.key === "2") {
        event.preventDefault()
        rateCardFromKeyboard("hard")
      }

      if (event.key === "3") {
        event.preventDefault()
        rateCardFromKeyboard("good")
      }

      if (event.key === "4") {
        event.preventDefault()
        rateCardFromKeyboard("easy")
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    )

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      )
    }

  }, [
    showAnswer,
    currentCard,
    currentState,
    storage,
    dueCards.length,
    currentIndex
  ])

  function revealAnswer() {
    setShowAnswer(true)
  }

  function undoLastReview() {

    if (!undoReview) return

    const nextStorage =
      undoFsrsReview(storage, undoReview)

    if (!nextStorage) return

    setStorage(nextStorage)
    saveFsrsStorage(nextStorage)
    setShowAnswer(false)
    setUndoReview(null)
    setCurrentIndex(0)
  }

  function handleMobileReviewTap(
    event: React.PointerEvent<HTMLElement>
  ) {

    if (!currentCard) return
    if (event.pointerType !== "touch") return

    if (
      document.documentElement.classList.contains("is-swiping-back")
    ) {
      return
    }

    const target =
      event.target as HTMLElement

    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("select") ||
      target.closest("a")
    ) {
      return
    }

    if (!showAnswer) {
      setShowAnswer(true)
      return
    }

    const screenMiddle =
      window.innerWidth / 2

    if (event.clientX < screenMiddle) {
      rateCard("again")
      return
    }

    rateCard("good")
  }

  function suspendCurrentCard() {

    if (!currentCard) return

    const confirmed =
      window.confirm("¿Suspender esta flashcard? No aparecerá en repasos hasta que la reactives.")

    if (!confirmed) return

    suspendFlashcard(currentCard.id)
    setShowAnswer(false)
    setCurrentIndex(0)
    setUndoReview(null)
    setSuspendedVersion(value => value + 1)
  }

  function rateCard(rating: FsrsRating) {

    if (!currentCard) return

    const {
      stateAfter,
      log
    } = reviewFsrsCard({
      cardId: currentCard.id,
      currentState,
      progress: storage.cards,
      rating
    })

    const nextStorage = {
      cards: {
        ...storage.cards,
        [currentCard.id]: stateAfter
      },
      reviews: [
        ...storage.reviews,
        log
      ]
    }

    setStorage(nextStorage)
    saveFsrsStorage(nextStorage)
    setUndoReview({
      cardId: log.cardId,
      reviewedAt: log.reviewedAt
    })
    setShowAnswer(false)
    setCurrentIndex(prev => {

      const nextLength =
        dueCards.length - 1

      const nextIndex =
        nextLength <= 0
          ? 0
          : prev >= nextLength
          ? 0
          : prev

      window.requestAnimationFrame(() => {
        setCardAnimationKey(value => value + 1)
      })

      return nextIndex
    })
  }

  if (!currentCard) {

    return (
      <main className="flashcard-fixed-shell 
        min-h-screen
        bg-[#09090b]
        p-5
        text-white
      ">
        <div className="flashcard-fixed-content mx-auto
        flex
          min-h-[calc(100vh-2.5rem)]
          max-w-3xl
          flex-col
          justify-center
        ">
          <div className="
            mb-6
            flex
            gap-2
          ">
            <button
              type="button"
              onClick={onBack}
              className="
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-950
                px-4
                py-2
                text-sm
                font-black
                text-zinc-400
              "
            >
              ← Volver
            </button>

            {onMenu && (
              <button
                type="button"
                onClick={onMenu}
                className="
                  rounded-2xl
                  border
                  border-violet-500/30
                  bg-violet-500/10
                  px-4
                  py-2
                  text-sm
                  font-black
                  text-violet-200
                  hover:bg-violet-500/20
                "
              >
                Menú
              </button>
            )}
          </div>

          <section className="flashcard-fixed-scroll 
            rounded-[2rem]
            border
            border-zinc-800
            bg-[#111113]
            p-8
            text-center
            shadow-2xl
            shadow-black/30
          ">
            <p className="
              text-xs
              font-black
              uppercase
              tracking-[0.25em]
              text-violet-300
            ">
              FSRS
            </p>

            <h1 className="
              mt-3
              text-4xl
              font-black
            ">
              Nada pendiente por hoy
            </h1>

            <p className="
              mt-3
              text-zinc-400
            ">
              Ya repasaste todas las tarjetas vencidas.
            </p>

            {nextDueDate ? (
              <div className="
                mt-6
                rounded-3xl
                border
                border-violet-500/30
                bg-violet-500/10
                p-5
              ">
                <p className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-violet-300
                ">
                  Próximo repaso
                </p>

                <p className="
                  mt-2
                  text-3xl
                  font-black
                  text-white
                ">
                  {formatDuePreview(nextDueDate)}
                </p>

                <p className="
                  mt-2
                  text-sm
                  text-zinc-400
                ">
                  Calculado según el FSRS de tus respuestas.
                </p>
              </div>
            ) : (
              <div className="
                mt-6
                rounded-3xl
                border
                border-zinc-800
                bg-zinc-950
                p-5
              ">
                <p className="
                  text-sm
                  font-black
                  text-zinc-400
                ">
                  No hay próximos repasos programados para este deck.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    )
  }

  return (
    <main
      onPointerUp={handleMobileReviewTap}
      className="
      flashcard-review-shell
      relative
      h-[100dvh]
      overflow-hidden
      bg-[#09090b]
      p-5
      pt-20
      text-white
    ">
      <div className="
        flashcard-review-content
        mx-auto
        flex
        h-full
        max-w-3xl
        flex-col
        overflow-hidden
      ">
        <div className="
          flashcard-review-header
          absolute
          left-1/2
          top-0
          z-[999]
          flex
          w-full
          max-w-3xl
          -translate-x-1/2
          items-center
          justify-between
          gap-4
          bg-[#09090b]/95
          px-5
          py-4
          backdrop-blur
        ">
          <button
            type="button"
            onClick={onBack}
            className="
              rounded-2xl
              border
              border-zinc-800
              bg-zinc-950
              px-4
              py-2
              text-sm
              font-black
              text-zinc-400
            "
          >
            ← Volver
          </button>

          <div className="
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-950
            px-4
            py-2
            text-sm
            font-black
            text-zinc-300
          ">
            {currentIndex + 1} / {dueCards.length}
          </div>
        </div>

        <section
          key={`${currentCard.id}-${cardAnimationKey}`}
          className={`
          flashcard-review-card
          flex
          min-h-0
          flex-1
          flex-col
          overflow-y-auto
          rounded-[2rem]
          border
          border-zinc-800
          bg-[#111113]
          p-5
          shadow-2xl
          shadow-black/30
          md:p-8
          ${cardAnimationKey > 0 ? "flashcard-change-bounce" : ""}
        `}>
          <div className="flashcard-fixed-header 
            mb-5
            flex
            flex-wrap
            gap-2
          ">
            <span className="
              rounded-full
              bg-violet-500/15
              px-3
              py-1
              text-xs
              font-black
              text-violet-200
            ">
              {currentCard.chapter}
            </span>

            <span className="
              rounded-full
              bg-zinc-800
              px-3
              py-1
              text-xs
              font-black
              text-zinc-300
            ">
              {source === "user" ? currentCard.chapter : currentCard.topic}
            </span>
          </div>

          <div className="
            mb-4
            flex
            flex-wrap
            gap-2
          ">
            {undoReview && (
              <button
                type="button"
                onClick={undoLastReview}
                className="
                  w-fit
                  rounded-2xl
                  border
                  border-amber-500/30
                  bg-amber-500/10
                  px-4
                  py-2
                  text-xs
                  font-black
                  text-amber-200
                  hover:bg-amber-500/20
                "
              >
                Undo último review
              </button>
            )}

            <button
              type="button"
              onClick={suspendCurrentCard}
              className="
                w-fit
                rounded-2xl
                border
                border-red-500/30
                bg-red-500/10
                px-4
                py-2
                text-xs
                font-black
                text-red-200
                hover:bg-red-500/20
              "
            >
              Suspender tarjeta
            </button>
          </div>

          <div className="
            flex
            flex-1
            flex-col
            items-center
            justify-center
            rounded-[1.5rem]
            border
            border-zinc-800
            bg-zinc-950
            p-6
            text-center
          ">
            <p className="
              mb-3
              text-xs
              font-black
              uppercase
              tracking-[0.25em]
              text-zinc-500
            ">
              Frente
            </p>

            <h1 className="
              max-w-3xl
              text-center
              text-3xl
              font-black
              leading-tight
              md:text-5xl
            ">
              {currentCard.front}
            </h1>

            {showAnswer && (
              <div className="
                mt-8
                w-full
                border-t
                border-zinc-800
                pt-6
                text-center
              ">
                <p className="
                  mb-3
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.25em]
                  text-emerald-300
                ">
                  Reverso
                </p>

                <p className="
                  mx-auto
                  max-w-3xl
                  text-center
                  text-2xl
                  font-bold
                  leading-relaxed
                  text-zinc-100
                  sm:text-3xl
                  md:text-4xl
                ">
                  {currentCard.back}
                </p>

                {currentState && (
                  <div className="
                    mt-5
                    grid
                    grid-cols-2
                    gap-3
                    text-xs
                    text-zinc-500
                  ">
                    <div>
                      Dificultad: {Number(currentState.card?.difficulty || 0).toFixed(2)}
                    </div>
                    <div>
                      Estabilidad: {Number(currentState.card?.stability || 0).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {!showAnswer ? (
            <button
              type="button"
              onClick={revealAnswer}
              className="
                mt-5
                w-full
                rounded-2xl
                bg-white
                px-5
                py-4
                text-base
                font-black
                text-black
              "
            >
              Mostrar respuesta
            </button>
          ) : (
            <div className="
              mt-5
              grid
              grid-cols-2
              gap-3
              md:grid-cols-4
            ">
              {(
                [
                  "again",
                  "hard",
                  "good",
                  "easy"
                ] as FsrsRating[]
              ).map(rating => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => rateCard(rating)}
                  className="
                    rounded-2xl
                    border
                    border-zinc-800
                    bg-zinc-900
                    px-4
                    py-4
                    text-left
                    font-black
                    text-zinc-200
                    hover:border-violet-500/40
                    hover:bg-violet-500/10
                  "
                >
                  <span className="
                    block
                    text-sm
                    sm:text-base
                  ">
                    {ratingLabels[rating]}
                  </span>

                  <span className="
                    mt-1
                    block
                    text-xs
                    font-black
                    text-zinc-500
                    sm:text-sm
                  ">
                    {ratingPreviews[rating]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
