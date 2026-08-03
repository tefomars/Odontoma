import { useMemo } from "react"

import {
  getUserFlashcardsByTopic,
  loadUserFlashcardTopics
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
  topicId: string
  onBack: () => void
  onMenu: () => void
  onReview: () => void
  onEdit: () => void
}

export default function UserDeckMenuScreen({
  topicId,
  onBack,
  onMenu,
  onReview,
  onEdit
}: Props) {

  const topic =
    useMemo(
      () =>
        loadUserFlashcardTopics().find(
          item => item.id === topicId
        ),
      [topicId]
    )

  const cards =
    useMemo(
      () => filterActiveFlashcards(getUserFlashcardsByTopic(topicId)),
      [topicId]
    )

  const storage =
    useMemo(
      () => loadFsrsStorage(),
      []
    )

  const dueCount =
    cards.filter(card =>
      isFsrsCardDue(card.id, storage.cards)
    ).length

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
        max-w-4xl
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
          <p className="
            text-xs
            font-black
            uppercase
            tracking-[0.25em]
            text-violet-300
          ">
            My deck
          </p>

          <h1 className="
            mt-3
            text-4xl
            font-black
            tracking-tight
          ">
            {topic?.name || "Deck"}
          </h1>

          {topic?.description && (
            <p className="
              mt-3
              text-sm
              leading-relaxed
              text-zinc-400
            ">
              {topic.description}
            </p>
          )}

          <div className="
            mt-6
            flex
            flex-wrap
            gap-2
          ">
            <span className="
              rounded-2xl
              bg-zinc-950
              px-4
              py-2
              text-sm
              font-black
              text-zinc-300
            ">
              {cards.length} cartas
            </span>

            <span className="
              rounded-2xl
              bg-violet-500/15
              px-4
              py-2
              text-sm
              font-black
              text-violet-200
            ">
              {dueCount} pendientes
            </span>
          </div>

          <div className="
            mt-8
            grid
            gap-4
            md:grid-cols-2
          ">
            <button
              type="button"
              disabled={dueCount === 0}
              onClick={onReview}
              className={`
                rounded-[1.75rem]
                border
                p-6
                text-left
                transition-all

                ${
                  dueCount > 0
                    ? "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20"
                    : "cursor-not-allowed border-zinc-800 bg-zinc-950 opacity-60"
                }
              `}
            >
              <p className="
                text-xs
                font-black
                uppercase
                tracking-[0.2em]
                text-emerald-300
              ">
                Estudiar
              </p>

              <h2 className="
                mt-3
                text-3xl
                font-black
                text-white
              ">
                Repasar
              </h2>

              <p className="
                mt-3
                text-sm
                leading-relaxed
                text-zinc-400
              ">
                Repasar las cartas pendientes con FSRS.
              </p>

              <p className="
                mt-6
                text-sm
                font-black
                text-emerald-200
              ">
                {dueCount > 0
                  ? `${dueCount} pendientes →`
                  : "Sin pendientes ahora"}
              </p>
            </button>

            <button
              type="button"
              onClick={onEdit}
              className="
                rounded-[1.75rem]
                border
                border-violet-500/30
                bg-violet-500/10
                p-6
                text-left
                transition-all
                hover:bg-violet-500/20
              "
            >
              <p className="
                text-xs
                font-black
                uppercase
                tracking-[0.2em]
                text-violet-300
              ">
                Editar
              </p>

              <h2 className="
                mt-3
                text-3xl
                font-black
                text-white
              ">
                Modificar / Agregar cartas
              </h2>

              <p className="
                mt-3
                text-sm
                leading-relaxed
                text-zinc-400
              ">
                Crear cartas nuevas, editar cartas existentes o borrar cartas.
              </p>

              <p className="
                mt-6
                text-sm
                font-black
                text-violet-200
              ">
                Abrir editor →
              </p>
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
