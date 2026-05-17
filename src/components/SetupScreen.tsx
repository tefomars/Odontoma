import { useEffect, useState } from "react"

import logoImage from "@/assets/logo.png"

import { chapters } from "@/content/histologia/chapters"

import {
  questionCountsByChapter
} from "@/content/histologia"

type Props = {
  selectedChapters: string[]
  setSelectedChapters: (chapters: string[]) => void

  selectedDifficulties: string[]
  setSelectedDifficulties: (difficulties: string[]) => void

  questionCount: number
  setQuestionCount: (count: number) => void

  practiceMode: string
  setPracticeMode: (mode: string) => void

  availableQuestionsCount: number

  modeCounts: {
    new: number
    incorrect: number
    correct: number
    failed: number
    all: number
  }

  hasPausedSession?: boolean

  onBackHome?: () => void
  onStart: () => void
  onMastery?: () => void
  onContinueSession?: () => void
  onClearSession?: () => void
}

const difficultyOptions = [
  {
    id: "easy",
    label: "Fácil"
  },
  {
    id: "medium",
    label: "Media"
  },
  {
    id: "hard",
    label: "Difícil"
  }
]

const practiceModes = [
  {
    id: "smart",
    label: "Mixto",
    description: "Prioriza incorrectas y nuevas"
  },
  {
    id: "new",
    label: "Nuevas",
    description: "Nunca respondidas"
  },
  {
    id: "incorrect",
    label: "Incorrectas",
    description: "Falladas antes"
  },
  {
    id: "failed",
    label: "Más falladas",
    description: "Ordena por más errores"
  },
  {
    id: "correct",
    label: "Correctas",
    description: "Ya dominadas"
  },
  {
    id: "all",
    label: "Todas",
    description: "Sin filtro por historial"
  }
]

export default function SetupScreen({
  selectedChapters,
  setSelectedChapters,

  selectedDifficulties,
  setSelectedDifficulties,

  questionCount,
  setQuestionCount,

  practiceMode,
  setPracticeMode,

  availableQuestionsCount,
  modeCounts,

  hasPausedSession,

  onBackHome,
  onStart,
  onMastery,
  onContinueSession,
  onClearSession
}: Props) {

  const [phoneChaptersOpen, setPhoneChaptersOpen] = useState(false)

  const [localHasPausedSession, setLocalHasPausedSession] =
    useState(false)

  useEffect(() => {

    setLocalHasPausedSession(
      Boolean(
        localStorage.getItem("odontoma_paused_session")
      )
    )

  }, [])

  useEffect(() => {

    if (
      availableQuestionsCount > 0 &&
      questionCount > availableQuestionsCount
    ) {
      setQuestionCount(availableQuestionsCount)
    }

  }, [
    availableQuestionsCount,
    questionCount,
    setQuestionCount
  ])

  const selectedTotal =
    selectedChapters.reduce(
      (sum, chapterId) =>
        sum +
        (
          questionCountsByChapter[
            chapterId as keyof typeof questionCountsByChapter
          ] || 0
        ),
      0
    )

  const visibleSessionTotal =
    availableQuestionsCount === 0
      ? 0
      : Math.min(
          questionCount,
          availableQuestionsCount
        )

  const amountOptions =
    [5, 10, 20, 40, 100, 200, 300, availableQuestionsCount]
      .filter((amount, index, array) =>
        amount > 0 &&
        amount <= availableQuestionsCount &&
        array.indexOf(amount) === index
      )

  const canStart =
    selectedChapters.length > 0 &&
    selectedDifficulties.length > 0 &&
    availableQuestionsCount > 0

  function toggleChapter(chapterId: string) {

    if (selectedChapters.includes(chapterId)) {

      setSelectedChapters(
        selectedChapters.filter(
          id => id !== chapterId
        )
      )

      return
    }

    setSelectedChapters([
      ...selectedChapters,
      chapterId
    ])
  }

  function toggleDifficulty(difficulty: string) {

    if (selectedDifficulties.includes(difficulty)) {

      setSelectedDifficulties(
        selectedDifficulties.filter(
          item => item !== difficulty
        )
      )

      return
    }

    setSelectedDifficulties([
      ...selectedDifficulties,
      difficulty
    ])
  }

  function clearSession() {

    localStorage.removeItem(
      "odontoma_paused_session"
    )

    setLocalHasPausedSession(false)
    onClearSession?.()
  }

  const [showOptions, setShowOptions] =
    useState(false)

  return (

    <main className="
      h-screen
      overflow-hidden
      bg-[#09090b]
      text-white
    ">

      <div className="
        mx-auto
        grid
        h-full
        max-w-7xl
        grid-cols-1
        gap-8
        px-5
        py-6
        lg:grid-cols-[0.85fr_1.15fr]
        lg:px-8
        lg:py-10
      ">

        <section className="
          flex
          min-h-0
          flex-col
          justify-between
          rounded-[1.5rem] lg:rounded-[2rem]
          border
          border-zinc-800
          bg-[#111113]
          p-4 lg:p-6
          shadow-2xl
          shadow-black/30
          lg:p-4 lg:p-6
        ">

          <div>

            <div className="
              mb-8
              flex
              items-center
              justify-between
              gap-4
            ">

              <div>

                <button
                  type="button"
                  onClick={onBackHome}
                  className="
                    mb-4
                    rounded-2xl
                    border
                    border-zinc-800
                    bg-zinc-950
                    px-4
                    py-2
                    text-xs
                    font-black
                    text-zinc-400
                    hover:bg-zinc-900
                    hover:text-white
                  "
                >
                  ← Materias
                </button>

                <p className="
                  mb-2
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.25em]
                  text-violet-300
                ">
                  <span className="inline-flex items-center gap-3"><img src={logoImage} alt="Odontoma" className="h-10 w-10 rounded-xl object-contain" />Odontoma</span>
                </p>

                <h1 className="
                  text-4xl
                  font-black
                  tracking-tight
                  md:text-5xl
                ">
                  Histología
                </h1>

              </div>

              <button
                type="button"
                onClick={onMastery}
                className="
                  rounded-2xl
                  border
                  border-emerald-500/30
                  bg-emerald-500/10
                  px-5
                  py-3
                  text-sm
                  font-black
                  text-emerald-300
                  hover:bg-emerald-500/20
                "
              >
                Mastery
              </button>

            </div>

            {(hasPausedSession || localHasPausedSession) && (

              <div className="
                mb-6
                rounded-3xl
                border
                border-amber-500/30
                bg-amber-500/10
                p-5
              ">

                <p className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-amber-300
                ">
                  Sesión pausada
                </p>

                <p className="
                  mt-2
                  text-sm
                  leading-relaxed
                  text-zinc-300
                ">
                  Puedes continuar tu práctica anterior o borrarla.
                </p>

                <div className="
                  mt-4
                  flex
                  gap-3
                ">

                  <button
                    type="button"
                    onClick={onContinueSession}
                    className="
                      rounded-2xl
                      bg-emerald-500
                      px-5
                      py-3
                      text-sm
                      font-black
                      text-black
                      hover:bg-emerald-400
                    "
                  >
                    Continuar
                  </button>

                  <button
                    type="button"
                    onClick={clearSession}
                    className="
                      rounded-2xl
                      border
                      border-zinc-700
                      bg-zinc-900
                      px-5
                      py-3
                      text-sm
                      font-black
                      text-zinc-200
                      hover:bg-zinc-800
                    "
                  >
                    Borrar
                  </button>

                </div>

              </div>

            )}

            <div className="
              grid
              gap-4
            ">

              <div className="
                rounded-3xl
                border
                border-zinc-800
                bg-zinc-950/60
                p-5
              ">

                <p className="
                  text-sm
                  font-bold
                  text-zinc-400
                ">
                  Preguntas seleccionadas
                </p>

                <p className="
                  mt-2
                  text-3xl
                  font-black
                ">
                  {visibleSessionTotal}
                </p>

                <p className="
                  mt-1
                  text-sm
                  text-zinc-500
                ">
                  Disponibles con estos filtros: {availableQuestionsCount}
                </p>

                <p className="
                  mt-1
                  text-xs
                  text-zinc-600
                ">
                  Total del capítulo seleccionado: {selectedTotal}
                </p>

                <p className="
                  mt-3
                  text-xs
                  leading-relaxed
                  text-zinc-400
                ">
                  Nuevas: {modeCounts.new}
                  {" · "}
                  Incorrectas: {modeCounts.incorrect}
                  {" · "}
                  Más falladas: {modeCounts.failed}
                  {" · "}
                  Correctas: {modeCounts.correct}
                </p>

              </div>


              <button
                type="button"
                onClick={() => setShowOptions(true)}
                className="
                  group
                  rounded-3xl
                  border
                  border-violet-400/50
                  bg-violet-500
                  p-5
                  text-left
                  text-white
                  shadow-xl
                  shadow-violet-500/25
                  transition-all
                  hover:scale-[1.01]
                  hover:bg-violet-400
                "
              >

                <div className="
                  flex
                  items-center
                  justify-between
                  gap-4
                ">

                  <div>

                    <p className="
                      text-xs
                      font-black
                      uppercase
                      tracking-[0.25em]
                      text-white/80
                    ">
                      Personalizar quiz
                    </p>

                    <p className="
                      mt-2
                      text-2xl
                      font-black
                      text-white
                    ">
                      Cambiar opciones
                    </p>

                    <p className="
                      mt-1
                      text-sm
                      font-semibold
                      text-white/80
                    ">
                      {questionCount} preguntas · {selectedDifficulties.length} dificultades
                    </p>

                  </div>

                  <div className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    bg-white
                    text-2xl
                    font-black
                    text-violet-600
                    transition-all
                    group-hover:rotate-12
                  ">
                    ⚙
                  </div>

                </div>

              </button>

              {showOptions && (

                <div className="
                  fixed
                  inset-0
                  z-50
                  flex
                  items-center
                  justify-center
                  bg-black/70
                  px-4
                  backdrop-blur-sm
                ">

                  <div className="
                    max-h-[88vh]
                    w-full
                    max-w-2xl
                    overflow-y-auto
                    rounded-[1.5rem] lg:rounded-[2rem]
                    border
                    border-zinc-800
                    bg-[#111113]
                    p-5
                    shadow-2xl
                    shadow-black/60
                    md:p-7
                  ">

                    <div className="
                      mb-6
                      flex
                      items-start
                      justify-between
                      gap-4
                    ">

                      <div>

                        <p className="
                          text-xs
                          font-black
                          uppercase
                          tracking-[0.25em]
                          text-violet-300
                        ">
                          Configuración
                        </p>

                        <h2 className="
                          mt-2
                          text-3xl
                          font-black
                        ">
                          Opciones de práctica
                        </h2>

                      </div>

                      <button
                        type="button"
                        onClick={() => setShowOptions(false)}
                        className="
                          rounded-2xl
                          bg-zinc-900
                          px-4
                          py-3
                          text-sm
                          font-black
                          text-zinc-300
                          hover:bg-zinc-800
                        "
                      >
                        Cerrar
                      </button>

                    </div>

                    <div className="
                      grid
                      gap-4
                    ">
              <div className="
                rounded-3xl
                border
                border-zinc-800
                bg-zinc-950/60
                p-5
              ">

                <p className="
                  mb-3
                  text-sm
                  font-bold
                  text-zinc-400
                ">
                  Modo de preguntas
                </p>

                <div className="
                  grid
                  grid-cols-2
                  gap-2
                ">

                  {practiceModes.map(mode => (

                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPracticeMode(mode.id)}
                      className={`
                        rounded-2xl
                        px-3
                        py-3
                        text-left
                        transition-all

                        ${
                          practiceMode === mode.id
                            ? "bg-violet-500 text-white"
                            : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                        }
                      `}
                    >

                      <div className="
                        text-sm
                        font-black
                      ">
                        {mode.label}
                      </div>

                      <div className="
                        mt-1
                        text-xs
                        opacity-70
                      ">
                        {mode.description}
                      </div>

                    </button>

                  ))}

                </div>

              </div>

              <div className="
                rounded-3xl
                border
                border-zinc-800
                bg-zinc-950/60
                p-5
              ">

                <p className="
                  mb-3
                  text-sm
                  font-bold
                  text-zinc-400
                ">
                  Cantidad
                </p>

                <div className="
                  grid
                  grid-cols-4
                  gap-2
                ">

                  {amountOptions.map(amount => (

                    <button
                      key={amount}
                      type="button"
                      onClick={() => setQuestionCount(amount)}
                      className={`
                        rounded-2xl
                        px-3
                        py-3
                        text-sm
                        font-black

                        ${
                          questionCount === amount
                            ? "bg-violet-500 text-white"
                            : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                        }
                      `}
                    >
                      {
                        amount === availableQuestionsCount
                          ? "Todas"
                          : amount
                      }
                    </button>

                  ))}

                </div>

              </div>

              <div className="
                rounded-3xl
                border
                border-zinc-800
                bg-zinc-950/60
                p-5
              ">

                <p className="
                  mb-3
                  text-sm
                  font-bold
                  text-zinc-400
                ">
                  Dificultad
                </p>

                <div className="
                  grid
                  grid-cols-3
                  gap-2
                 pb-12">

                  {difficultyOptions.map(difficulty => {

                    const selected =
                      selectedDifficulties.includes(
                        difficulty.id
                      )

                    return (

                      <button
                        key={difficulty.id}
                        type="button"
                        onClick={() => toggleDifficulty(difficulty.id)}
                        className={`
                          rounded-2xl
                          px-3
                          py-3
                          text-sm
                          font-black

                          ${
                            selected
                              ? "bg-cyan-500 text-black"
                              : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                          }
                        `}
                      >
                        {difficulty.label}
                      </button>

                    )
                  })}

                </div>

              </div>


                    </div>

                  </div>

                </div>

              )}

            </div>

          </div>

          <button
            type="button"
            disabled={!canStart}
            onClick={onStart}
            className={`
              mt-3
              w-full
              rounded-[1.5rem] lg:rounded-[2rem]
              px-6
              py-3
              text-center
              text-base
              font-black
              leading-tight
              transition-all
              lg:py-4
              lg:text-lg

              ${
                canStart
                  ? "bg-white text-black hover:bg-zinc-200"
                  : "cursor-not-allowed bg-zinc-800 text-zinc-500"
              }
            `}
          >
            <span className="block whitespace-normal break-words">
              {
                canStart
                  ? "Comenzar práctica"
                  : "Selecciona capítulo, modo y dificultad"
              }
            </span>
          </button>

        </section>

        
        <section className="mobile-chapters-button hidden rounded-[1.5rem] border border-zinc-800 bg-[#111113] p-4 shadow-2xl shadow-black/30">
          <div className="mb-4 px-2">
            <h2 className="text-2xl font-black">
              Capítulos
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Selecciona uno o varios para mezclar preguntas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPhoneChaptersOpen(true)}
            className="w-full rounded-[1.5rem] bg-violet-500 px-5 py-4 text-base font-black text-white shadow-lg shadow-violet-500/25"
          >
            Elegir capítulos · {selectedChapters.length} seleccionados
          </button>
        </section>

        {phoneChaptersOpen && (
          <div className="mobile-chapters-popup fixed inset-0 z-50 bg-black/75 p-4 backdrop-blur-sm">
            <div className="mx-auto flex h-[92dvh] w-full max-w-md flex-col rounded-[2rem] border border-violet-500/60 bg-[#111113] p-4 shadow-2xl">
              <div className="mb-4 flex shrink-0 items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black text-white">
                    Capítulos
                  </h2>
                  <p className="mt-1 text-base text-zinc-400">
                    Selecciona capítulos.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setPhoneChaptersOpen(false)}
                  className="rounded-full bg-zinc-800 px-5 py-3 text-sm font-black text-white"
                >
                  Cerrar
                </button>
              </div>

              <div className="grid flex-1 gap-4 overflow-y-auto pr-1 pb-4">
                {chapters.map(chapter => {
                  const selected = selectedChapters.includes(chapter.id)

                  const count =
                    questionCountsByChapter[
                      chapter.id as keyof typeof questionCountsByChapter
                    ] || 0

                  return (
                    <button
                      key={chapter.id}
                      type="button"
                      onClick={() => toggleChapter(chapter.id)}
                      className={`
                        phone-chapter-card
                        relative
                        overflow-hidden
                        rounded-[1.75rem]
                        border
                        p-0
                        text-left
                        shadow-lg
                        transition-all

                        ${
                          selected
                            ? "border-violet-400 ring-2 ring-violet-400/40"
                            : "border-zinc-700"
                        }
                      `}
                    >
                      <div
                        className="phone-chapter-image absolute inset-0 bg-cover bg-center opacity-80"
                        style={{
                          backgroundImage: `url(${chapter.image})`
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/20" />

                      <div className={`
                        absolute
                        inset-0
                        bg-gradient-to-br
                        ${chapter.accent}
                      `} />

                      <div className="phone-chapter-content relative flex flex-col justify-end p-5 pr-20">
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-200 drop-shadow">
                          {chapter.id}
                        </p>

                        <h3 className="mt-2 text-2xl font-black text-white drop-shadow">
                          {chapter.title}
                        </h3>

                        <p className="mt-1 text-base font-semibold text-zinc-200 drop-shadow">
                          {chapter.subtitle}
                        </p>
                      </div>

                      <div className="absolute right-4 top-4 rounded-2xl bg-black/70 px-4 py-2 text-base font-black text-white">
                        {count}
                      </div>

                      {selected && (
                        <div className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-violet-500 text-lg font-black text-white shadow-lg shadow-violet-500/30">
                          ✓
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => setPhoneChaptersOpen(false)}
                className="mt-4 shrink-0 rounded-[1.75rem] bg-white px-5 py-4 text-lg font-black text-black"
              >
                Listo
              </button>
            </div>
          </div>
        )}

        <section className="desktop-chapters-panel
          min-h-0
          overflow-hidden
          rounded-[1.5rem] lg:rounded-[2rem]
          border
          border-zinc-800
          bg-[#111113]
          p-4
          shadow-2xl
          shadow-black/30
          lg:p-5
        ">

          <div className="
            mb-4
            px-2
          ">

            <h2 className="
              text-2xl
              font-black
            ">
              Capítulos
            </h2>

            <p className="
              mt-1
              text-sm
              text-zinc-400
            ">
              Selecciona uno o varios para mezclar preguntas.
            </p>

          </div>

          <div className="
            grid
            max-h-none lg:max-h-[calc(100vh-9rem)]
            gap-4
            overflow-y-auto
            pr-2
            pb-10
          ">

            {chapters.map(chapter => {

              const selected =
                selectedChapters.includes(chapter.id)

              const count =
                questionCountsByChapter[
                  chapter.id as keyof typeof questionCountsByChapter
                ] || 0

              return (

                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => toggleChapter(chapter.id)}
                  className={`
                    relative
                    overflow-hidden
                    rounded-[1.5rem] lg:rounded-[2rem]
                    border
                    p-0
                    text-left
                    transition-all

                    ${
                      selected
                        ? "border-violet-400 ring-2 ring-violet-400/40"
                        : "border-zinc-800 hover:border-zinc-600"
                    }
                  `}
                >

                  <div
                    className="
                      absolute
                      inset-0
                      bg-cover
                      bg-center
                      opacity-40
                    "
                    style={{
                      backgroundImage:
                        `url(${chapter.image})`
                    }}
                  />

                  <div className={`
                    absolute
                    inset-0
                    bg-gradient-to-br
                    ${chapter.accent}
                  `} />

                  <div className="
                    relative
                    min-h-[112px] lg:min-h-[150px]
                    p-4 lg:p-6
                  ">

                    <div className="
                      flex
                      items-start
                      justify-between
                      gap-4
                    ">

                      <div>

                        <p className="
                          mb-2
                          text-xs
                          font-black
                          uppercase
                          tracking-[0.2em]
                          text-zinc-300
                        ">
                          {chapter.id}
                        </p>

                        <h3 className="
                          text-xl
                          font-black
                          text-white
                          lg:text-2xl
                        ">
                          {chapter.title}
                        </h3>

                        <p className="
                          mt-1
                          max-w-xl
                          text-xs
                          leading-snug
                          lg:mt-2
                          lg:text-sm
                          lg:leading-relaxed
                          text-zinc-300
                        ">
                          {chapter.subtitle}
                        </p>

                      </div>

                      <div className="
                        shrink-0
                        rounded-2xl
                        bg-black/40
                        px-3
                        py-1.5
                        text-xs
                        lg:px-4
                        lg:py-2
                        lg:text-sm
                        font-black
                        text-zinc-200
                      ">
                        {count} preguntas
                      </div>

                    </div>

                    {selected && (

                      <div className="
                        absolute
                        bottom-4
                        right-4
                        flex
                        h-8
                        w-8
                        lg:bottom-5
                        lg:right-5
                        lg:h-10
                        lg:w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-violet-500
                        text-lg
                        font-black
                        text-white
                        shadow-lg
                        shadow-violet-500/30
                      ">
                        ✓
                      </div>

                    )}

                  </div>

                </button>

              )
            })}

          </div>

        </section>

      </div>

    </main>

  )
}
