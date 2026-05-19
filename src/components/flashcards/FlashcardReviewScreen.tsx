import { useEffect, useMemo, useState } from "react"

import {
  getDueFsrsCards,
  reviewFsrsCard,
  previewFsrsCard,
  type FsrsRating
} from "@/lib/fsrs"

import {
  loadFsrsStorage,
  saveFsrsStorage
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

  const [isCardChanging, setIsCardChanging] =
    useState(false)
  const [currentIndex, setCurrentIndex] =
    useState(0)



  const allCards =
    useMemo(
      () =>
        filterActiveFlashcards(
          getFlashcardsBySource(
            source,
            source === "user" ? selectedTopic : undefined
          )
        ),
      [source, selectedTopic]
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
          storage.cards
        ),
      [filteredCards, storage]
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

  const currentCard =
    dueCards[currentIndex]

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
          currentState
        })

      return {
        again: formatDuePreview(preview.again.dueDate),
        hard: formatDuePreview(preview.hard.dueDate),
        good: formatDuePreview(preview.good.dueDate),
        easy: formatDuePreview(preview.easy.dueDate)
      }

    }, [
      currentCard,
      currentState
    ])

  useEffect(() => {

    if (
      dueCards.length > 0 &&
      currentIndex >= dueCards.length
    ) {
      setCurrentIndex(0)
    }

  }, [
    dueCards.length,
    currentIndex
  ])

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

        rateCard("good")
        return
      }

      if (!showAnswer) return

      if (event.key === "1") {
        event.preventDefault()
        rateCard("again")
      }

      if (event.key === "2") {
        event.preventDefault()
        rateCard("hard")
      }

      if (event.key === "3") {
        event.preventDefault()
        rateCard("good")
      }

      if (event.key === "4") {
        event.preventDefault()
        rateCard("easy")
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

    const lastReview =
      storage.reviews[storage.reviews.length - 1]

    if (!lastReview) return

    const nextCards = {
      ...storage.cards
    }

    if (lastReview.stateBefore) {
      nextCards[lastReview.cardId] =
        lastReview.stateBefore
    } else {
      delete nextCards[lastReview.cardId]
    }

    const nextStorage = {
      cards: nextCards,
      reviews: storage.reviews.slice(0, -1)
    }

    setStorage(nextStorage)
    saveFsrsStorage(nextStorage)
    setShowAnswer(false)


    setCurrentIndex(0)
  }

  function handleMobileReviewTap(
    event: React.PointerEvent<HTMLElement>
  ) {

    if (!showAnswer || !currentCard) return
    if (event.pointerType !== "touch") return

    const target =
      event.target as HTMLElement

    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("textarea")
    ) {
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
  }

  function rateCard(rating: FsrsRating) {

    if (!currentCard) return

    const {
      stateAfter,
      log
    } = reviewFsrsCard({
      cardId: currentCard.id,
      currentState,
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
      <main className="
        min-h-screen
        bg-[#09090b]
        p-5
        text-white
      ">
        <div className="
          mx-auto
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

          <section className="
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
      min-h-screen
      bg-[#09090b]
      p-5
      text-white
    ">
      <div className="
        mx-auto
        flex
        min-h-[calc(100vh-2.5rem)]
        max-w-3xl
        flex-col
      ">
        <div className="
          mb-5
          flex
          items-center
          justify-between
          gap-4
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
          flex
          flex-1
          flex-col
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
          <div className="
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
            {storage.reviews.length > 0 && (
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
            justify-center
            rounded-[1.5rem]
            border
            border-zinc-800
            bg-zinc-950
            p-6
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
                border-t
                border-zinc-800
                pt-6
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
                  text-xl
                  leading-relaxed
                  text-zinc-100
                  sm:text-2xl
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
