import { useState } from "react"

import {
  addUserQuizQuestion,
  deleteUserQuizQuestion,
  exportUserQuizQuestionsToTabText,
  getUserQuizQuestionsByDeck,
  importUserQuizQuestionsFromTabText,
  loadUserQuizDecks
} from "@/lib/userQuizzes"

type Props = {
  deckId: string
  onBack: () => void
  onMainMenu: () => void
  onReview: (questions: any[]) => void
}

export default function UserQuizDeckScreen({
  deckId,
  onBack,
  onMainMenu,
  onReview
}: Props) {

  const [question, setQuestion] =
    useState("")

  const [optionsText, setOptionsText] =
    useState("")

  const [correctText, setCorrectText] =
    useState("1")

  const [explanation, setExplanation] =
    useState("")

  const [importText, setImportText] =
    useState("")

  const [showImportBox, setShowImportBox] =
    useState(false)

  const [refreshKey, setRefreshKey] =
    useState(0)

  const deck =
    (void refreshKey,
      loadUserQuizDecks().find(
        item => item.id === deckId
      )
    )

  const questions =
    (void refreshKey, getUserQuizQuestionsByDeck(deckId))

  function saveQuestion() {

    const options =
      optionsText
        .split(/\r?\n/)
        .map(option => option.trim())
        .filter(Boolean)

    const correctAnswers =
      correctText
        .split(",")
        .map(value => Number(value.trim()) - 1)
        .filter(value =>
          Number.isInteger(value) &&
          value >= 0 &&
          value < options.length
        )

    if (
      !question.trim() ||
      options.length < 2 ||
      correctAnswers.length === 0
    ) {
      window.alert(
        "Necesitás pregunta, mínimo 2 opciones y respuesta correcta."
      )
      return
    }

    addUserQuizQuestion({
      deckId,
      question,
      options,
      correctAnswers,
      explanation
    })

    setQuestion("")
    setOptionsText("")
    setCorrectText("1")
    setExplanation("")
    setRefreshKey(prev => prev + 1)
  }

  function importQuestions() {

    let imported

    try {
      imported =
        importUserQuizQuestionsFromTabText({
          deckId,
          text: importText
        })
    } catch (caught) {
      window.alert(
        caught instanceof Error
          ? caught.message
          : "No se pudieron importar las preguntas."
      )
      return
    }

    if (imported.length === 0) {
      window.alert(
        "No se importó nada. Usá: Pregunta, tab, Opción A, tab, Opción B, tab, Opción C, tab, Opción D, tab, correctas."
      )
      return
    }

    setImportText("")
    setShowImportBox(false)
    setRefreshKey(prev => prev + 1)
    window.alert(`Importadas ${imported.length} preguntas.`)
  }

  function exportDeck() {

    const exported =
      exportUserQuizQuestionsToTabText(deckId)

    if (!exported.trim()) {
      window.alert("Este quiz no tiene preguntas para exportar.")
      return
    }

    const blob =
      new Blob(
        [exported],
        {
          type: "text/plain;charset=utf-8"
        }
      )

    const url =
      URL.createObjectURL(blob)

    const link =
      document.createElement("a")

    const safeName =
      (deck?.name || "quiz")
        .toLowerCase()
        .replace(/[^a-z0-9áéíóúñü]+/gi, "-")
        .replace(/^-+|-+$/g, "")

    link.href = url
    link.download = `${safeName || "quiz"}-questions.txt`
    link.click()

    URL.revokeObjectURL(url)
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
            ← My quizzes
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
            mb-6
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-end
            sm:justify-between
          ">
            <div>
              <p className="
                text-xs
                font-black
                uppercase
                tracking-[0.25em]
                text-violet-300
              ">
                My quiz
              </p>

              <h1 className="
                mt-2
                text-3xl
                font-black
                tracking-tight
                sm:text-4xl
              ">
                {deck?.name || "Quiz"}
              </h1>

              <p className="
                mt-2
                text-sm
                text-zinc-400
              ">
                {questions.length} preguntas
              </p>
            </div>

            <button
              type="button"
              disabled={questions.length === 0}
              onClick={() => onReview(questions)}
              className={`
                rounded-2xl
                px-5
                py-3
                text-sm
                font-black

                ${
                  questions.length > 0
                    ? "bg-emerald-500 text-black hover:bg-emerald-400"
                    : "cursor-not-allowed bg-zinc-800 text-zinc-500"
                }
              `}
            >
              Repasar
            </button>
          </div>

          <div className="
            mb-6
            rounded-[1.5rem]
            border
            border-zinc-800
            bg-zinc-950
            p-5
          ">
            <div className="
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-center
              sm:justify-between
            ">
              <div>
                <p className="
                  text-sm
                  font-black
                  text-white
                ">
                  Import / Export
                </p>

                <p className="
                  mt-1
                  text-xs
                  text-zinc-500
                ">
                  Formato: Pregunta, opciones, correctas. Todo separado por tab.
                </p>
              </div>

              <div className="
                flex
                flex-wrap
                gap-2
              ">
                <button
                  type="button"
                  onClick={() => setShowImportBox(prev => !prev)}
                  className="
                    rounded-2xl
                    border
                    border-violet-500/30
                    bg-violet-500/10
                    px-4
                    py-2
                    text-xs
                    font-black
                    text-violet-200
                    hover:bg-violet-500/20
                  "
                >
                  Importar
                </button>

                <button
                  type="button"
                  onClick={exportDeck}
                  className="
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
                  Exportar quiz
                </button>
              </div>
            </div>

            {showImportBox && (
              <div className="
                mt-4
                grid
                gap-3
              ">
                <textarea
                  value={importText}
                  onChange={(event) => setImportText(event.target.value)}
                  rows={6}
                  placeholder={"Pregunta\\tOpción A\\tOpción B\\tOpción C\\tOpción D\\t1\\tExplicación opcional"}
                  className="
                    rounded-2xl
                    border
                    border-zinc-800
                    bg-[#111113]
                    px-4
                    py-3
                    text-sm
                    text-white
                    outline-none
                    focus:border-violet-500
                  "
                />

                <button
                  type="button"
                  onClick={importQuestions}
                  disabled={!importText.trim()}
                  className={`
                    rounded-2xl
                    px-5
                    py-3
                    text-sm
                    font-black

                    ${
                      importText.trim()
                        ? "bg-white text-black hover:bg-zinc-200"
                        : "cursor-not-allowed bg-zinc-800 text-zinc-500"
                    }
                  `}
                >
                  Importar preguntas
                </button>
              </div>
            )}
          </div>

          <div className="
            rounded-[1.5rem]
            border
            border-violet-500/30
            bg-violet-500/10
            p-5
          ">
            <h2 className="
              text-xl
              font-black
              text-white
            ">
              Crear pregunta
            </h2>

            <div className="
              mt-4
              grid
              gap-4
            ">
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                rows={3}
                placeholder="Pregunta"
                className="
                  rounded-2xl
                  border
                  border-zinc-800
                  bg-zinc-950
                  px-4
                  py-3
                  text-base
                  text-white
                  outline-none
                  focus:border-violet-500
                "
              />

              <textarea
                value={optionsText}
                onChange={(event) => setOptionsText(event.target.value)}
                rows={5}
                placeholder={"Opciones, una por línea\\nOpción A\\nOpción B\\nOpción C\\nOpción D"}
                className="
                  rounded-2xl
                  border
                  border-zinc-800
                  bg-zinc-950
                  px-4
                  py-3
                  text-base
                  text-white
                  outline-none
                  focus:border-violet-500
                "
              />

              <input
                value={correctText}
                onChange={(event) => setCorrectText(event.target.value)}
                placeholder="Correctas: 1 o 1,3"
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

              <textarea
                value={explanation}
                onChange={(event) => setExplanation(event.target.value)}
                rows={3}
                placeholder="Explicación opcional"
                className="
                  rounded-2xl
                  border
                  border-zinc-800
                  bg-zinc-950
                  px-4
                  py-3
                  text-base
                  text-white
                  outline-none
                  focus:border-emerald-500
                "
              />

              <button
                type="button"
                onClick={saveQuestion}
                className="
                  rounded-2xl
                  bg-white
                  px-5
                  py-4
                  text-base
                  font-black
                  text-black
                  hover:bg-zinc-200
                "
              >
                Guardar pregunta
              </button>
            </div>
          </div>

          <div className="
            mt-6
          ">
            <div className="
              mb-3
              flex
              items-center
              justify-between
              gap-3
            ">
              <h2 className="
                text-xl
                font-black
              ">
                Preguntas
              </h2>

              <span className="
                rounded-2xl
                bg-zinc-950
                px-4
                py-2
                text-sm
                font-black
                text-zinc-300
              ">
                {questions.length}
              </span>
            </div>

            <div className="
              grid
              gap-3
            ">
              {questions.map(item => (
                <div
                  key={item.id}
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
                    <div>
                      <p className="
                        font-black
                        text-white
                      ">
                        {item.question}
                      </p>

                      <p className="
                        mt-2
                        text-xs
                        text-zinc-500
                      ">
                        {item.options.length} opciones · correcta(s): {item.correctAnswers.map(index => index + 1).join(", ")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        deleteUserQuizQuestion(item.id)
                        setRefreshKey(prev => prev + 1)
                      }}
                      className="
                        shrink-0
                        rounded-2xl
                        border
                        border-red-500/30
                        bg-red-500/10
                        px-3
                        py-2
                        text-xs
                        font-black
                        text-red-200
                        hover:bg-red-500/20
                      "
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
