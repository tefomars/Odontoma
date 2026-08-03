import { useEffect, useState } from "react"

import {
  addUserQuizQuestion,
  addUserOpenQuizQuestion,
  deleteUserQuizQuestion,
  exportUserQuizBundle,
  exportUserQuizQuestionsToTabText,
  getUserQuizQuestionsByDeck,
  getUserQuizDeckMode,
  importUserOpenQuizQuestionsFromTabText,
  importUserQuizQuestionsFromTabText,
  loadUserQuizDecks
} from "@/lib/userQuizzes"

type Props = {
  deckId: string
  onBack: () => void
  onMainMenu: () => void
  onReview: () => void
}

const MULTIPLE_CHOICE_CHATGPT_PROMPT = `Quiero que conviertas el contenido que te daré en preguntas de opción múltiple para importar a Odontoma.

Devuelve únicamente filas TSV, sin encabezado, sin numeración, sin viñetas, sin tabla Markdown y sin texto adicional.
Cada pregunta debe ocupar una sola línea y tener exactamente 7 columnas separadas por tabulaciones reales, en este orden:
Pregunta [TAB] Opción A [TAB] Opción B [TAB] Opción C [TAB] Opción D [TAB] Respuesta correcta [TAB] Explicación

En "Respuesta correcta" escribe 1, 2, 3 o 4 según corresponda. Si hay varias respuestas correctas, sepáralas con coma, por ejemplo: 1,3.
Haz distractores plausibles, evita que la respuesta sea obvia por longitud o redacción y conserva la precisión del material fuente.

Contenido o tema:
[PEGA AQUÍ EL TEXTO O ESCRIBE EL TEMA]`

const OPEN_ENDED_CHATGPT_PROMPT = `Quiero que conviertas el contenido que te daré en preguntas de respuesta escrita para importar a Odontoma.

Devuelve únicamente filas TSV, sin encabezado, sin numeración, sin viñetas, sin tabla Markdown y sin texto adicional.
Cada pregunta debe ocupar una sola línea y tener exactamente 4 columnas separadas por tabulaciones reales, en este orden:
Pregunta [TAB] Respuesta modelo [TAB] Otros puntos aceptados [TAB] Explicación

En "Otros puntos aceptados" separa cada criterio con el símbolo |. La respuesta modelo debe ser completa pero directa. La explicación puede ampliar o aclarar la respuesta.
Formula preguntas importantes y específicas, y conserva la precisión del material fuente.

Contenido o tema:
[PEGA AQUÍ EL TEXTO O ESCRIBE EL TEMA]`

function answerTokenToIndex(token: string) {
  const normalized = token.trim().toUpperCase()

  if (/^[A-Z]$/.test(normalized)) {
    return normalized.charCodeAt(0) - 65
  }

  if (/^\d+$/.test(normalized)) {
    return Number(normalized) - 1
  }

  return -1
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
    useState("")

  const [explanation, setExplanation] =
    useState("")

  const [modelAnswer, setModelAnswer] =
    useState("")

  const [acceptedPointsText, setAcceptedPointsText] =
    useState("")

  const [importText, setImportText] =
    useState("")

  const [showImportBox, setShowImportBox] =
    useState(false)

  const [promptCopied, setPromptCopied] =
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

  const quizMode = getUserQuizDeckMode(deck)
  const isOpenEnded = quizMode === "open-ended"

  function saveQuestion() {

    if (isOpenEnded) {
      if (!question.trim() || !modelAnswer.trim()) {
        window.alert("Necesitás escribir la pregunta y su respuesta modelo.")
        return
      }

      addUserOpenQuizQuestion({
        deckId,
        question,
        modelAnswer,
        acceptedPoints: acceptedPointsText.split(/\r?\n/),
        explanation
      })

      setQuestion("")
      setModelAnswer("")
      setAcceptedPointsText("")
      setExplanation("")
      setRefreshKey(prev => prev + 1)
      return
    }

    const options =
      optionsText
        .split(/\r?\n/)
        .map(option => option.trim())
        .filter(Boolean)

    const correctAnswers =
      [...new Set(
        correctText
          .split(/[,;\s]+/)
          .map(answerTokenToIndex)
          .filter(value =>
            Number.isInteger(value) &&
            value >= 0 &&
            value < options.length
          )
      )]

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
    setCorrectText("")
    setExplanation("")
    setRefreshKey(prev => prev + 1)
  }

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey)) return
      if (event.key.toLowerCase() !== "s" && event.key !== "Enter") return
      event.preventDefault()
      saveQuestion()
    }

    window.addEventListener("keydown", handleShortcut)
    return () => window.removeEventListener("keydown", handleShortcut)
  })

  function importQuestions() {

    let imported

    try {
      imported = isOpenEnded
        ? importUserOpenQuizQuestionsFromTabText({
            deckId,
            text: importText
          })
        : importUserQuizQuestionsFromTabText({
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
        isOpenEnded
          ? "No se importó nada. Usá: Pregunta, tab, Respuesta modelo, tab, Otros puntos aceptados, tab, Explicación."
          : "No se importó nada. Usá: Pregunta, tab, Opción A, tab, Opción B, tab, Opción C, tab, Opción D, tab, correctas."
      )
      return
    }

    setImportText("")
    setShowImportBox(false)
    setRefreshKey(prev => prev + 1)
    window.alert(`Importadas ${imported.length} preguntas.`)
  }

  async function copyChatGptPrompt() {
    const prompt = isOpenEnded
      ? OPEN_ENDED_CHATGPT_PROMPT
      : MULTIPLE_CHOICE_CHATGPT_PROMPT

    try {
      await navigator.clipboard.writeText(prompt)
    } catch {
      const textArea = document.createElement("textarea")
      textArea.value = prompt
      textArea.style.position = "fixed"
      textArea.style.opacity = "0"
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      textArea.remove()
    }

    setPromptCopied(true)
    window.setTimeout(() => setPromptCopied(false), 2_500)
  }

  function exportDeck() {

    if (isOpenEnded) {
      const bundle = exportUserQuizBundle(deckId)
      const blob = new Blob([JSON.stringify(bundle, null, 2)], {
        type: "application/vnd.odontoma.quiz+json"
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      const safeName = (deck?.name || "quiz").toLowerCase().replace(/[^a-z0-9áéíóúñü]+/gi, "-").replace(/^-+|-+$/g, "")
      link.href = url
      link.download = `${safeName || "quiz"}.odontoma-quiz`
      link.click()
      URL.revokeObjectURL(url)
      return
    }

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
                {isOpenEnded ? "Respuesta escrita" : "Opción múltiple"}
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
              onClick={onReview}
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
                  Importar / Exportar
                </p>

                <p className="
                  mt-1
                  text-xs
                  text-zinc-500
                ">
                  {isOpenEnded
                    ? "Formato: pregunta, respuesta modelo, puntos aceptados y explicación."
                    : "Formato: pregunta, opciones, correctas. Todo separado por tab."}
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
                lg:grid-cols-[15rem_minmax(0,1fr)]
              ">
                <button
                  type="button"
                  onClick={() => void copyChatGptPrompt()}
                  className="group rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-left transition hover:border-emerald-400/60 hover:bg-emerald-500/15"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-xl font-black text-black">✣</span>
                  <strong className="mt-4 block text-sm text-emerald-100">
                    {isOpenEnded
                      ? "Prompt para respuestas escritas"
                      : "Prompt para opción múltiple"}
                  </strong>
                  <span className="mt-1 block text-xs leading-relaxed text-zinc-400">
                    {promptCopied
                      ? "¡Copiado! Pegalo en ChatGPT y añadí tu tema o texto."
                      : isOpenEnded
                        ? "Copiá el prompt para generar pregunta, respuesta modelo y criterios aceptados."
                        : "Copiá el prompt para generar pregunta, opciones, respuesta correcta y explicación."}
                  </span>
                </button>

                <div className="grid gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
                    {isOpenEnded
                      ? "Pegá preguntas y respuestas escritas"
                      : "Pegá preguntas de opción múltiple"}
                  </span>
                  <textarea
                    value={importText}
                    onChange={(event) => setImportText(event.target.value)}
                    rows={6}
                    placeholder={isOpenEnded
                      ? "Pregunta\\tRespuesta modelo\\tPunto 1 | Punto 2\\tExplicación opcional"
                      : "Pregunta\\tOpción A\\tOpción B\\tOpción C\\tOpción D\\t1\\tExplicación opcional"}
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
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Pregunta</span>
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  rows={3}
                  placeholder="Escribí la pregunta"
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
              </label>

              {isOpenEnded ? (
                <>
                  <label className="grid gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Respuesta modelo</span>
                    <textarea
                      value={modelAnswer}
                      onChange={(event) => setModelAnswer(event.target.value)}
                      rows={5}
                      placeholder="Escribí la respuesta completa"
                      className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-base text-white outline-none focus:border-amber-500"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Otros puntos aceptados · opcional</span>
                    <textarea
                      value={acceptedPointsText}
                      onChange={(event) => setAcceptedPointsText(event.target.value)}
                      rows={4}
                      placeholder={"Uno por línea\nEj: Describe el mecanismo\nRelaciona el concepto con…"}
                      className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-base text-white outline-none focus:border-amber-500"
                    />
                  </label>
                </>
              ) : (
              <>
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Opciones · una por línea</span>
                <textarea
                  value={optionsText}
                  onChange={(event) => setOptionsText(event.target.value)}
                  rows={5}
                  placeholder={"Opción A\nOpción B\nOpción C\nOpción D"}
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
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Respuesta correcta</span>
                <input
                  value={correctText}
                  onChange={(event) => setCorrectText(event.target.value)}
                  placeholder="A, B, C o D · también acepta 1, 2, 3 o 4"
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
              </label>
              </>
              )}

              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Explicación · opcional</span>
                <textarea
                  value={explanation}
                  onChange={(event) => setExplanation(event.target.value)}
                  rows={3}
                  placeholder="Aclaración que se mostrará después de responder"
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
              </label>

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
                Guardar pregunta <span className="ml-2 text-xs opacity-50">⌘/Ctrl + S</span>
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
                        {isOpenEnded
                          ? "Respuesta escrita · incluye respuesta modelo"
                          : `${item.options.length} opciones · correcta(s): ${item.correctAnswers.map(index => String.fromCharCode(65 + index)).join(", ")}`}
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
