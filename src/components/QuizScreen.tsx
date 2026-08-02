import { useEffect, useRef, useState } from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { chapters } from "@/content/histologia/chapters"
import logoImage from "@/assets/logo.png"
import type { QuizResponseRecord } from "@/lib/quizHistory"

type Props = {
  question: any
  current: number
  total: number
  score: number
  previousResponse?: QuizResponseRecord

  onBack?: () => void
  onMainMenu?: () => void

  onNext: () => void
  onCorrect: () => void
  onIncorrect: () => void
  onAnswered: (response: QuizResponseRecord) => void
}

function getChapterTitle(chapterId: string) {

  const chapter =
    chapters.find(item => item.id === chapterId)

  return chapter
    ? `${chapter.id} · ${chapter.title}`
    : chapterId
}

export default function QuizScreen({
  question,
  current,
  total,
  score,
  previousResponse,

  onBack,
  onMainMenu,

  onNext,
  onCorrect,
  onIncorrect,
  onAnswered
}: Props) {

  const quizScreenRef = useRef<HTMLElement>(null)

  const options = question.options as string[]
  const correctAnswers = question.correctAnswers as number[]

  const [selected, setSelected] = useState<number[]>(() =>
    previousResponse
      ? previousResponse.selectedAnswers
          .map(answer => options.indexOf(answer))
          .filter(index => index >= 0)
      : []
  )

  const [checked, setChecked] =
    useState(Boolean(previousResponse))

  const [showExplanation, setShowExplanation] =
    useState(false)

  useEffect(() => {
    const scrollingElement = document.scrollingElement

    if (scrollingElement) {
      scrollingElement.scrollLeft = 0
    }

    document.documentElement.scrollLeft = 0
    document.body.scrollLeft = 0

    if (quizScreenRef.current) {
      quizScreenRef.current.scrollLeft = 0
    }
  }, [question.id])

  const isMulti =
    question.type === "multiple"

  function arraysEqual(a: number[], b: number[]) {

    return (
      a.length === b.length &&
      a.every(value => b.includes(value))
    )
  }

  function toggle(index: number) {

    if (checked) return

    if (isMulti) {

      setSelected(prev =>

        prev.includes(index)

          ? prev.filter(i => i !== index)

          : [...prev, index]

      )

      return
    }

    setSelected([index])
  }

  function checkAnswer() {

    const correct =
      arraysEqual(
        [...selected].sort(),
        [...correctAnswers].sort()
      )

    if (correct) {
      onCorrect()
    } else {
      onIncorrect()
    }

    onAnswered({
      questionId: question.id,
      question: question.question,
      chapter: question.chapter,
      selectedAnswers: selected.map(index => options[index]),
      correctAnswers: correctAnswers.map(index => options[index]),
      explanation: question.explanation,
      isCorrect: correct
    })

    setChecked(true)
  }

  function next() {
    onNext()
  }

  const progress =
    ((current + 1) / total) * 100

  function getOptionStyle(
    chosen: boolean,
    correct: boolean
  ) {

    if (checked && correct) {

      return `
        border-emerald-500
        bg-emerald-500/15
      `
    }

    if (
      checked &&
      chosen &&
      !correct
    ) {

      return `
        border-red-500
        bg-red-500/15
      `
    }

    if (!checked && chosen) {

      return `
        border-violet-400
        bg-violet-500/25

        shadow-lg
        shadow-violet-500/20
      `
    }

    return `
      border-zinc-700

      bg-[#262637]

      hover:bg-[#323248]

      hover:border-zinc-500

      shadow-lg
      shadow-black/30
    `
  }

  return (

    <main
      ref={quizScreenRef}
      className="quiz-screen
      h-[100dvh]
      overflow-hidden
      bg-[#09090b]
      px-4
      py-4
      text-white
      lg:py-5
    ">

      <div className="quiz-shell
        mx-auto
        flex
        h-full
        min-h-0
        max-w-5xl
        flex-col
      ">

        <div className="
          mb-3
          shrink-0
          flex
          flex-col
          items-start
          gap-3
          lg:flex-row
          lg:items-end
          lg:justify-between
        ">

          <div className="
            relative
            z-50
            mb-3
            flex
            flex-wrap
            gap-2
            self-start
            lg:mb-0
          ">
            <button
              onClick={onBack}
              className="
                rounded-2xl
                border
                border-zinc-700
                bg-zinc-900/80
                px-4
                py-2
                text-sm
                font-semibold
                hover:bg-zinc-800
                transition-all
              "
            >
              💾 Guardar y salir
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
                font-semibold
                text-violet-200
                hover:bg-violet-500/20
                transition-all
              "
            >
              Menú
            </button>
          </div>

          <div className="quiz-brand-block w-full min-w-0">

            <h1 className="
              text-3xl
              font-black
              tracking-tight
            ">
              <span className="inline-flex items-center gap-3"><img src={logoImage} alt="Odontoma" className="h-10 w-10 rounded-xl object-contain" />Odontoma</span>
            </h1>

            <div className="quiz-chapter-score mt-2 flex w-full min-w-0 items-center justify-between gap-4">
              <p className="min-w-0 text-zinc-500">
                {getChapterTitle(question.chapter)}
              </p>

              <Badge className="shrink-0" variant="outline">
                Score {score}
              </Badge>
            </div>

          </div>

        </div>

        <div className="mb-4 shrink-0">

          <div className="
            flex
            items-center
            justify-between
            mb-2
          ">

            <span className="
              text-sm
              text-zinc-500
            ">
              Pregunta {current + 1} de {total}
            </span>

            <span className="
              text-sm
              text-zinc-500
            ">
              {Math.round(progress)}%
            </span>

          </div>

          <div className="
            h-2
            bg-zinc-800
            rounded-full
            overflow-hidden
          ">

            <div
              className="
                h-full
                bg-violet-500
                transition-all
                duration-300
              "
              style={{
                width: `${progress}%`
              }}
            />

          </div>

        </div>

        <Card className="quiz-question-card
          flex
          min-h-0
          flex-1
          flex-col
          overflow-hidden
          rounded-[28px]
          border
          border-zinc-800
          bg-[#111118]
          text-white
          shadow-2xl
          shadow-black/30
          outline-none
          ring-0
          focus:outline-none
          focus:ring-0
          lg:rounded-[32px]
        ">

          <div className="quiz-question-header
            shrink-0
            border-b
            border-zinc-800
            p-5
            md:p-6
          ">

            <div className="
              max-h-none
              overflow-visible
              pr-0
              lg:max-h-[135px]
              lg:overflow-y-auto
              lg:pr-2
            ">

              <h2 className="quiz-question-title
                font-black
                leading-[1.1]
                tracking-tight
                text-[clamp(1.6rem,2.8vh,2.5rem)]
              ">
                {question.question}
              </h2>

            </div>

          </div>

          <div className="
            relative
            flex-1
            min-h-0
          ">

            <div className="
              pointer-events-none
              absolute
              bottom-0
              left-0
              right-0
              z-10
              hidden
              h-16
              bg-gradient-to-t
              from-[#111118]
              to-transparent
              lg:block
            " />

            <div className="
              h-full
              min-h-0
              overflow-y-auto
              p-5
              pr-3
              md:p-6
            ">

              <div className="
                grid
                gap-3
              ">

                {options.map((option: string, index: number) => {

                  const chosen =
                    selected.includes(index)

                  const correct =
                    correctAnswers.includes(index)

                  return (

                    <button
                      key={`${option}-${index}`}
                      onClick={() => toggle(index)}

                      className={`
                        min-w-0
                        w-full
                        rounded-[20px]
                        border

                        p-[clamp(0.85rem,1.35vh,1rem)]

                        text-left
                        transition-all
                        duration-200

                        flex
                        items-start
                        gap-3

                        ${getOptionStyle(
                          chosen,
                          correct
                        )}
                      `}
                    >

                      <div
                        className={`
                          mt-0.5
                          flex

                          h-[clamp(1.7rem,2vh,2rem)]
                          w-[clamp(1.7rem,2vh,2rem)]

                          shrink-0
                          items-center
                          justify-center

                          border
                          border-zinc-700

                          bg-black/20

                          text-sm
                          font-black

                          ${
                            isMulti
                              ? "rounded-lg"
                              : "rounded-full"
                          }
                        `}
                      >

                        {
                          isMulti
                            ? chosen ? "✓" : ""
                            : String.fromCharCode(65 + index)
                        }

                      </div>

                      <div className="
                        min-w-0
                        flex-1
                        break-words
                        [overflow-wrap:anywhere]
                        leading-relaxed
                        text-[clamp(0.94rem,1.6vh,1.05rem)]
                        font-medium
                        text-zinc-100
                      ">
                        {option}
                      </div>

                    </button>

                  )
                })}

              </div>

            </div>

          </div>

          <div className="
            shrink-0
            border-t
            border-zinc-800
            bg-[#0d0d10]
            p-4
          ">

            <div className="
              flex
              items-center
              justify-between
              gap-4
            ">

              <div className="
                min-w-0
                flex-1
                min-h-[64px]
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-900/80
                px-5
                py-4
                flex
                flex-col
                justify-center
              ">

                {
                  checked

                    ? (

                      <>

                        <p className="
                          font-black
                          text-base
                          mb-1
                        ">

                          {
                            arraysEqual(
                              selected,
                              correctAnswers
                            )

                              ? "Correcto"

                              : "Incorrecto"
                          }

                        </p>

                        <button
                          type="button"
                          onClick={() => setShowExplanation(true)}
                          className="
                            mt-2
                            w-full
                            rounded-xl
                            border
                            border-violet-500/30
                            bg-violet-500/10
                            px-3
                            py-2
                            text-left
                            text-sm
                            font-black
                            text-violet-200
                            lg:hidden
                          "
                        >
                          Ver explicación completa
                        </button>

                        <p className="
                          hidden
                          text-sm
                          text-zinc-400
                          leading-relaxed
                          lg:block
                        ">
                          {question.explanation}
                        </p>

                      </>

                    )

                    : (

                      <p className="
                        text-sm
                        text-zinc-500
                      ">
                        Selecciona una respuesta
                      </p>

                    )
                }

              </div>

              {
                !checked

                  ? (

                    <Button
                      onClick={checkAnswer}
                      disabled={selected.length === 0}

                      className="
                        rounded-2xl
                        px-6
                        py-5
                        text-base
                        font-black
                        bg-white
                        text-black
                        hover:bg-zinc-200
                      "
                    >
                      Comprobar
                    </Button>

                  )

                  : (

                    <Button
                      onClick={next}

                      className="
                        rounded-2xl
                        px-6
                        py-5
                        text-base
                        font-black
                        bg-violet-500
                        text-white
                        hover:bg-violet-400
                      "
                    >

                      {
                        current + 1 === total

                          ? "Resultados"

                          : "Siguiente"
                      }

                    </Button>

                  )
              }

            </div>

          </div>

        </Card>

      </div>

      {showExplanation && question.explanation && (

        <div className="
          fixed
          inset-0
          z-[100]
          flex
          items-end
          bg-black/70
          p-4
          backdrop-blur-sm
          lg:hidden
        ">

          <div className="
            max-h-[82dvh]
            w-full
            overflow-hidden
            rounded-[2rem]
            border
            border-zinc-800
            bg-[#111118]
            shadow-2xl
          ">

            <div className="
              flex
              items-center
              justify-between
              gap-4
              border-b
              border-zinc-800
              p-4
            ">

              <div>
                <p className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-violet-300
                ">
                  Explicación
                </p>

                <h3 className="
                  mt-1
                  text-lg
                  font-black
                  text-white
                ">
                  Respuesta completa
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowExplanation(false)}
                className="
                  rounded-full
                  bg-zinc-800
                  px-4
                  py-2
                  text-sm
                  font-black
                  text-white
                "
              >
                Cerrar
              </button>

            </div>

            <div className="
              max-h-[65dvh]
              overflow-y-auto
              p-5
            ">

              <p className="
                whitespace-pre-wrap
                text-base
                leading-relaxed
                text-zinc-200
              ">
                {question.explanation}
              </p>

            </div>

          </div>

        </div>

      )}

    </main>

  )
}
