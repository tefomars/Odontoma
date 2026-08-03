import { useState } from "react"

import logoImage from "@/assets/logo.png"

import {
  getDefaultFlashcards,
  getMyFlashcards
} from "@/lib/flashcardDecks"

import {
  getSuspendedFlashcards,
  unsuspendFlashcard
} from "@/lib/suspendedFlashcards"

type Props = {
  onBack: () => void
  onMenu: () => void
}

export default function SuspendedFlashcardsScreen({
  onBack,
  onMenu
}: Props) {

  const [refreshKey, setRefreshKey] =
    useState(0)

  const suspendedCards =
    (void refreshKey,
      getSuspendedFlashcards([
        ...getDefaultFlashcards(),
        ...getMyFlashcards()
      ])
    )

  function restoreCard(cardId: string) {
    unsuspendFlashcard(cardId)
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
          flex-wrap
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
                text-amber-300
              ">
                Flashcards suspendidas
              </p>

              <h1 className="
                text-3xl
                font-black
                tracking-tight
                sm:text-4xl
              ">
                Suspendidas
              </h1>

              <p className="
                mt-2
                text-sm
                text-zinc-400
              ">
                {suspendedCards.length} tarjetas ocultas del repaso.
              </p>
            </div>
          </div>

          {suspendedCards.length === 0 ? (
            <p className="
              rounded-2xl
              border
              border-zinc-800
              bg-zinc-950
              p-5
              text-sm
              text-zinc-400
            ">
              No tenés flashcards suspendidas.
            </p>
          ) : (
            <div className="
              grid
              gap-3
            ">
              {suspendedCards.map(card => (
                <div
                  key={card.id}
                  className="
                    rounded-2xl
                    border
                    border-zinc-800
                    bg-zinc-950
                    p-4
                  "
                >
                  <div className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  ">
                    <div className="
                      min-w-0
                      flex-1
                    ">
                      <p className="
                        text-xs
                        font-black
                        uppercase
                        tracking-[0.18em]
                        text-zinc-500
                      ">
                        {card.chapter} · {card.subtopic || "General"}
                      </p>

                      <p className="
                        mt-2
                        font-black
                        text-white
                      ">
                        {card.front}
                      </p>

                      <p className="
                        mt-2
                        text-sm
                        leading-relaxed
                        text-zinc-400
                      ">
                        {card.back}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => restoreCard(card.id)}
                      className="
                        shrink-0
                        rounded-2xl
                        border
                        border-emerald-500/30
                        bg-emerald-500/10
                        px-4
                        py-2
                        text-xs
                        font-black
                        text-emerald-200
                        hover:bg-emerald-500/20
                      "
                    >
                      Reactivar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
