import { useMemo } from "react"
import logoImage from "@/assets/logo.png"

import {
  isFsrsCardDue
} from "@/lib/fsrs"

import {
  loadFsrsStorage
} from "@/lib/flashcardStorage"

import {
  getDefaultFlashcards,
  getMyFlashcards,
  type FlashcardSource
} from "@/lib/flashcardDecks"

type Props = {
  onBack: () => void
  onCreateFlashcard: () => void
  onSelectTopic: (
    topic: string,
    source: FlashcardSource
  ) => void
  onSelectSubtopic: (
    topic: string,
    subtopic: string,
    source: FlashcardSource
  ) => void
}

type TopicGroup = {
  topic: string
  chapter: string
  book: string
  count: number
  dueCount: number
  subtopics: {
    subtopic: string
    count: number
    dueCount: number
  }[]
}

function formatDuePreview(dueDate: string) {

  const diffMinutes =
    Math.max(
      1,
      Math.ceil(
        (new Date(dueDate).getTime() - Date.now()) / 60000
      )
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

  return `en ${diffMonths} mes${diffMonths === 1 ? "" : "es"}`
}

function getNextDueDate(
  cardIds: string[],
  cardsProgress: Record<string, any>
) {

  const dates =
    cardIds
      .map(id => cardsProgress[id]?.dueDate)
      .filter(Boolean)
      .map(date => new Date(date).getTime())
      .filter(time => time > Date.now())
      .sort((a, b) => a - b)

  if (dates.length === 0) return null

  return new Date(dates[0]).toISOString()
}

function getTopicGroups(
  cards: any[],
  progress: Record<string, any>
): TopicGroup[] {

  const groups: Record<string, TopicGroup> = {}

  for (const card of cards) {

    const key =
      `${card.chapter}__${card.topic}`

    const due =
      isFsrsCardDue(
        card.id,
        progress
      )

    if (!groups[key]) {
      groups[key] = {
        topic: card.topic,
        chapter: card.chapter,
        book: card.book,
        count: 0,
        dueCount: 0,
        subtopics: []
      }
    }

    groups[key].count += 1

    if (due) {
      groups[key].dueCount += 1
    }

    const subtopicName =
      card.subtopic || "General"

    const existing =
      groups[key].subtopics.find(
        item => item.subtopic === subtopicName
      )

    if (existing) {
      existing.count += 1

      if (due) {
        existing.dueCount += 1
      }
    } else {
      groups[key].subtopics.push({
        subtopic: subtopicName,
        count: 1,
        dueCount: due ? 1 : 0
      })
    }
  }

  return Object.values(groups)
}

export default function FlashcardSelectScreen({
  onBack,
  onCreateFlashcard,
  onSelectTopic,
  onSelectSubtopic
}: Props) {

  const storage =
    useMemo(
      () => loadFsrsStorage(),
      []
    )

  const defaultCards =
    useMemo(
      () => getDefaultFlashcards(),
      []
    )

  const myCards =
    useMemo(
      () => getMyFlashcards(),
      []
    )

  const defaultGroups =
    getTopicGroups(
      defaultCards,
      storage.cards
    )

  const defaultDue =
    defaultCards.filter(card =>
      isFsrsCardDue(
        card.id,
        storage.cards
      )
    ).length

  const myDue =
    myCards.filter(card =>
      isFsrsCardDue(
        card.id,
        storage.cards
      )
    ).length

  const totalReviews =
    storage.reviews.length

  const nextDefaultDue =
    getNextDueDate(
      defaultCards.map(card => card.id),
      storage.cards
    )

  const nextMyDue =
    getNextDueDate(
      myCards.map(card => card.id),
      storage.cards
    )

  return (
    <main className="
      min-h-screen
      overflow-y-auto
      bg-[#09090b]
      px-4
      py-5
      text-white
      sm:px-6
      lg:px-8
      lg:py-10
    ">
      <div className="
        mx-auto
        max-w-6xl
      ">

        <button
          type="button"
          onClick={onBack}
          className="
            mb-5
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-950
            px-4
            py-2
            text-sm
            font-black
            text-zinc-400
            hover:bg-zinc-900
            hover:text-white
          "
        >
          ← Volver
        </button>

        <section className="
          rounded-[2rem]
          border
          border-zinc-800
          bg-[#111113]
          p-5
          shadow-2xl
          shadow-black/30
          sm:p-6
          lg:p-8
        ">
          <div className="
            mb-8
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-end
            lg:justify-between
          ">
            <div>
              <div className="
                mb-4
                flex
                items-center
                gap-3
              ">
                <img
                  src={logoImage}
                  alt="Odontoma"
                  className="
                    h-12
                    w-12
                    object-contain
                  "
                />

                <p className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.25em]
                  text-violet-300
                ">
                  Flashcards FSRS
                </p>
              </div>

              <h1 className="
                text-3xl
                font-black
                tracking-tight
                sm:text-4xl
                lg:text-5xl
              ">
                Elegí un deck
              </h1>

              <p className="
                mt-3
                max-w-2xl
                text-sm
                leading-relaxed
                text-zinc-400
                sm:text-base
              ">
                Las flashcards default y tus temas personales se mantienen separados.
              </p>
            </div>

            <div className="
              rounded-3xl
              border
              border-zinc-800
              bg-zinc-950
              px-5
              py-4
            ">
              <p className="
                text-xs
                font-black
                uppercase
                tracking-[0.2em]
                text-zinc-500
              ">
                Total reviews
              </p>

              <p className="
                mt-1
                text-3xl
                font-black
                text-white
              ">
                {totalReviews}
              </p>
            </div>
          </div>

          <div className="
            mb-8
            grid
            gap-4
            md:grid-cols-2
          ">
            <div className="
              rounded-[1.75rem]
              border
              border-zinc-800
              bg-zinc-950
              p-5
            ">
              <p className="
                text-xs
                font-black
                uppercase
                tracking-[0.2em]
                text-violet-300
              ">
                Default flashcards
              </p>

              <h2 className="
                mt-3
                text-3xl
                font-black
                text-white
              ">
                Premade decks
              </h2>

              <p className="
                mt-3
                text-sm
                text-zinc-400
              ">
                {defaultCards.length} tarjetas · {defaultDue} pendientes
              </p>

              {defaultDue === 0 && nextDefaultDue && (
                <p className="
                  mt-3
                  text-sm
                  font-black
                  text-emerald-300
                ">
                  Próximo review {formatDuePreview(nextDefaultDue)}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onCreateFlashcard}
              className="
                rounded-[1.75rem]
                border
                border-emerald-500/30
                bg-emerald-500/10
                p-5
                text-left
                transition-all
                hover:bg-emerald-500/20
              "
            >
              <p className="
                text-xs
                font-black
                uppercase
                tracking-[0.2em]
                text-emerald-300
              ">
                My flashcards
              </p>

              <h2 className="
                mt-3
                text-3xl
                font-black
                text-white
              ">
                Mis temas
              </h2>

              <p className="
                mt-3
                text-sm
                text-zinc-300
              ">
                Crear temas y añadir tarjetas rápido.
              </p>

              <p className="
                mt-3
                text-sm
                text-zinc-400
              ">
                {myCards.length} tarjetas · {myDue} pendientes
              </p>

              {myDue === 0 && nextMyDue && (
                <p className="
                  mt-3
                  text-sm
                  font-black
                  text-emerald-200
                ">
                  Próximo review {formatDuePreview(nextMyDue)}
                </p>
              )}

              <p className="
                mt-5
                text-sm
                font-black
                text-emerald-200
              ">
                Abrir mis temas →
              </p>
            </button>
          </div>

          <h2 className="
            mb-4
            text-2xl
            font-black
            text-white
          ">
            Default flashcards
          </h2>

          <div className="
            grid
            gap-4
            md:grid-cols-2
            xl:grid-cols-3
          ">
            {defaultGroups.map(group => (
              <div
                key={`${group.chapter}-${group.topic}`}
                className="
                  rounded-[1.75rem]
                  border
                  border-zinc-800
                  bg-zinc-950
                  p-5
                "
              >
                <p className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-zinc-500
                ">
                  {group.chapter} · {group.book}
                </p>

                <h3 className="
                  mt-3
                  text-2xl
                  font-black
                  text-white
                ">
                  {group.topic}
                </h3>

                <button
                  type="button"
                  disabled={group.dueCount === 0}
                  onClick={() => onSelectTopic(group.topic, "default")}
                  className={`
                    mt-5
                    w-full
                    rounded-2xl
                    px-4
                    py-3
                    text-sm
                    font-black

                    ${
                      group.dueCount > 0
                        ? "bg-violet-500/15 text-violet-200 hover:bg-violet-500/25"
                        : "cursor-not-allowed bg-zinc-900 text-zinc-600"
                    }
                  `}
                >
                  {group.dueCount > 0
                    ? `Repasar tema · ${group.dueCount} pendientes`
                    : "Sin pendientes ahora"}
                </button>

                <div className="
                  mt-4
                  grid
                  gap-2
                ">
                  {group.subtopics.map(subtopic => (
                    <button
                      key={subtopic.subtopic}
                      type="button"
                      disabled={subtopic.dueCount === 0}
                      onClick={() =>
                        onSelectSubtopic(
                          group.topic,
                          subtopic.subtopic,
                          "default"
                        )
                      }
                      className={`
                        flex
                        items-center
                        justify-between
                        gap-3
                        rounded-2xl
                        border
                        px-4
                        py-3
                        text-sm
                        font-black

                        ${
                          subtopic.dueCount > 0
                            ? "border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-violet-500/40"
                            : "cursor-not-allowed border-zinc-900 bg-zinc-950 text-zinc-600"
                        }
                      `}
                    >
                      <span>
                        {subtopic.subtopic}
                      </span>

                      <span className="
                        rounded-xl
                        bg-black/30
                        px-2.5
                        py-1
                        text-xs
                        text-zinc-400
                      ">
                        {subtopic.dueCount}/{subtopic.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
