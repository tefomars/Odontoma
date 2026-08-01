import { useState } from "react"

import logoImage from "@/assets/logo.png"

import {
  createUserQuizDeck,
  deleteUserQuizDeck,
  getUserQuizQuestionsByDeck,
  loadUserQuizDecks
} from "@/lib/userQuizzes"

type Props = {
  onBack: () => void
  onMainMenu: () => void
  onSelectDeck: (deckId: string) => void
}

export default function MyQuizDecksScreen({
  onBack,
  onMainMenu,
  onSelectDeck
}: Props) {

  const [name, setName] =
    useState("")

  const [description, setDescription] =
    useState("")

  const [refreshKey, setRefreshKey] =
    useState(0)

  const decks =
    (void refreshKey, loadUserQuizDecks())

  function createDeck() {

    if (!name.trim()) return

    createUserQuizDeck({
      name,
      description
    })

    setName("")
    setDescription("")
    setRefreshKey(prev => prev + 1)
  }

  function deleteDeck(
    deckId: string,
    deckName: string
  ) {

    const confirmed =
      window.confirm(
        `¿Borrar el quiz "${deckName}"? También se borrarán sus preguntas.`
      )

    if (!confirmed) return

    deleteUserQuizDeck(deckId)
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
        max-w-6xl
      ">
        <div className="
          mb-5
          flex
          flex-wrap
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
            onClick={onMainMenu}
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
                My quizzes
              </p>

              <h1 className="
                text-3xl
                font-black
                tracking-tight
                sm:text-4xl
              ">
                Mis quizzes
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
              Crear quiz
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
                placeholder="Ej: Parcial 1 histología"
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
                onClick={createDeck}
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
            xl:grid-cols-3
          ">
            {decks.map(deck => {

              const count =
                getUserQuizQuestionsByDeck(deck.id).length

              return (
                <div
                  key={deck.id}
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
                    onClick={() => onSelectDeck(deck.id)}
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
                      Quiz personal
                    </p>

                    <h2 className="
                      mt-3
                      text-2xl
                      font-black
                      text-white
                    ">
                      {deck.name}
                    </h2>

                    {deck.description && (
                      <p className="
                        mt-2
                        text-sm
                        text-zinc-400
                      ">
                        {deck.description}
                      </p>
                    )}

                    <p className="
                      mt-5
                      inline-flex
                      rounded-2xl
                      bg-black/30
                      px-4
                      py-2
                      text-sm
                      font-black
                      text-zinc-200
                    ">
                      {count} preguntas
                    </p>
                  </button>

                  <div className="
                    mt-5
                    flex
                    justify-end
                  ">
                    <button
                      type="button"
                      onClick={() => deleteDeck(deck.id, deck.name)}
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
                      Borrar quiz
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {decks.length === 0 && (
            <p className="
              mt-6
              text-sm
              text-zinc-500
            ">
              Todavía no tenés quizzes personales.
            </p>
          )}
        </section>
      </div>
    </main>
  )
}
