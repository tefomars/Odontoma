import { useState } from "react"
import logoImage from "@/assets/logo.png"

import {
  createUserFlashcardTopic,
  loadUserFlashcardTopics,
  loadUserFlashcards,
  deleteUserFlashcardTopic
} from "@/lib/userFlashcards"

import {
  loadFsrsStorage
} from "@/lib/flashcardStorage"

import {
  isFsrsCardDue
} from "@/lib/fsrs"

import {
  filterActiveFlashcards
} from "@/lib/suspendedFlashcards"

type Props = {
  onBack: () => void
  onMenu: () => void
  onSelectTopic: (topicId: string) => void
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

  return `en ${diffDays} día${diffDays === 1 ? "" : "s"}`
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

export default function MyFlashcardTopicsScreen({
  onBack,
  onMenu,
  onSelectTopic
}: Props) {

  const [name, setName] =
    useState("")

  const [description, setDescription] =
    useState("")

  const [refreshKey, setRefreshKey] =
    useState(0)

  const topics =
    (void refreshKey, loadUserFlashcardTopics())

  const cards =
    (void refreshKey, filterActiveFlashcards(loadUserFlashcards()))

  const storage =
    (void refreshKey, loadFsrsStorage())

  function createTopic() {

    if (!name.trim()) return

    createUserFlashcardTopic({
      name,
      description
    })

    setName("")
    setDescription("")
    setRefreshKey(prev => prev + 1)
  }

  function deleteTopic(
    topicId: string,
    topicName: string
  ) {

    const confirmed =
      window.confirm(
        `¿Borrar el deck "${topicName}"? También se borrarán todas sus flashcards.`
      )

    if (!confirmed) return

    deleteUserFlashcardTopic(topicId)

    setRefreshKey(prev => prev + 1)
  }

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
        max-w-5xl
      ">
        <div className="
          mb-5
          flex
          items-center
          justify-between
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
              hover:bg-zinc-900
              hover:text-white
            "
          >
            ← Volver
          </button>

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
            Menú principal
          </button>
        </div>

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

            <div>
              <p className="
                text-xs
                font-black
                uppercase
                tracking-[0.25em]
                text-violet-300
              ">
                My flashcards
              </p>

              <h1 className="
                text-3xl
                font-black
                tracking-tight
                sm:text-4xl
              ">
                Mis temas
              </h1>
            </div>
          </div>

          <div className="
            mb-6
            rounded-[1.5rem]
            border
            border-violet-500/30
            bg-violet-500/10
            p-5
          ">
            <p className="
              text-sm
              font-black
              text-violet-200
            ">
              Crear tema
            </p>

            <div className="
              mt-4
              grid
              gap-3
              sm:grid-cols-[1fr_1fr_auto]
            ">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej: Epitelio examen 1"
                className="
                  rounded-2xl
                  border
                  border-zinc-800
                  bg-zinc-950
                  px-4
                  py-3
                  text-white
                  outline-none
                  focus:border-violet-500
                "
              />

              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Descripción opcional"
                className="
                  rounded-2xl
                  border
                  border-zinc-800
                  bg-zinc-950
                  px-4
                  py-3
                  text-white
                  outline-none
                  focus:border-violet-500
                "
              />

              <button
                type="button"
                onClick={createTopic}
                disabled={!name.trim()}
                className={`
                  rounded-2xl
                  px-5
                  py-3
                  text-sm
                  font-black

                  ${
                    name.trim()
                      ? "bg-white text-black hover:bg-zinc-200"
                      : "cursor-not-allowed bg-zinc-800 text-zinc-500"
                  }
                `}
              >
                Crear
              </button>
            </div>
          </div>

          <div className="
            grid
            gap-4
            md:grid-cols-2
          ">
            {topics.length === 0 && (
              <div className="
                rounded-[1.5rem]
                border
                border-zinc-800
                bg-zinc-950
                p-6
                text-zinc-400
              ">
                Todavía no tenés temas. Creá uno arriba para empezar.
              </div>
            )}

            {topics.map(topic => {

              const topicCards =
                cards.filter(card => card.topic === topic.id)

              const dueCount =
                topicCards.filter(card =>
                  isFsrsCardDue(card.id, storage.cards)
                ).length

              const nextDueDate =
                getNextDueDate(
                  topicCards.map(card => card.id),
                  storage.cards
                )

              return (
                <div
                  key={topic.id}
                  className="
                    rounded-[1.5rem]
                    border
                    border-zinc-800
                    bg-zinc-950
                    p-5
                    transition-all
                    hover:border-violet-500/40
                    hover:bg-violet-500/10
                  "
                >
                  <button
                    type="button"
                    onClick={() => onSelectTopic(topic.id)}
                    className="
                      w-full
                      text-left
                    "
                  >
                  <p className="
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.2em]
                    text-zinc-500
                  ">
                    Tema personal
                  </p>

                  <h2 className="
                    mt-3
                    text-2xl
                    font-black
                    text-white
                  ">
                    {topic.name}
                  </h2>

                  {topic.description && (
                    <p className="
                      mt-2
                      text-sm
                      text-zinc-400
                    ">
                      {topic.description}
                    </p>
                  )}

                  <div className="
                    mt-5
                    flex
                    flex-wrap
                    gap-2
                  ">
                    <span className="
                      rounded-2xl
                      bg-black/30
                      px-3
                      py-1.5
                      text-xs
                      font-black
                      text-zinc-300
                    ">
                      {topicCards.length} tarjetas
                    </span>

                    <span className="
                      rounded-2xl
                      bg-violet-500/15
                      px-3
                      py-1.5
                      text-xs
                      font-black
                      text-violet-200
                    ">
                      {dueCount} pendientes
                    </span>

                    {dueCount === 0 && nextDueDate && (
                      <span className="
                        rounded-2xl
                        bg-emerald-500/15
                        px-3
                        py-1.5
                        text-xs
                        font-black
                        text-emerald-200
                      ">
                        Próximo {formatDuePreview(nextDueDate)}
                      </span>
                    )}
                  </div>
                  </button>

                  <div className="
                    mt-5
                    flex
                    justify-end
                  ">
                    <button
                      type="button"
                      onClick={() => deleteTopic(topic.id, topic.name)}
                      className="
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
                      Borrar deck
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
