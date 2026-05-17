import { useEffect, useMemo, useState } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { chapters } from "@/content/histologia/chapters"
import logoImage from "@/assets/logo.png"

type Props = {
  question: any
  current: number
  total: number
  score: number

  onBack?: () => void

  onNext: () => void
  onCorrect: () => void
  onIncorrect: () => void
}

function shuffleQuestion(question: any) {

  const combined =
    question.options.map(
      (
        option: string,
        index: number
      ) => ({

        option,

        isCorrect:
          question.correctAnswers.includes(index)
      })
    )

  for (
    let i = combined.length - 1;
    i > 0;
    i--
  ) {

    const j =
      crypto.getRandomValues(
        new Uint32Array(1)
      )[0] % (i + 1)

    ;[combined[i], combined[j]] = [
      combined[j],
      combined[i]
    ]
  }

  return {

    options:
      combined.map(
        item => item.option
      ),

    correctAnswers:
      combined
        .map(
          (item, index) =>

            item.isCorrect
              ? index
              : null
        )
        .filter(
          item => item !== null
        )
  }
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

  onBack,

  onNext,
  onCorrect,
  onIncorrect
}: Props) {

  const [selected, setSelected] =
    useState<number[]>([])

  const [checked, setChecked] =
    useState(false)

  const shuffled = useMemo(
    () => shuffleQuestion(question),
    [question.id]
  )

  const options =
    shuffled.options

  const correctAnswers =
    shuffled.correctAnswers

  const isMulti =
    question.type === "multiple"

  useEffect(() => {

    setSelected([])
    setChecked(false)

  }, [question.id])

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

    <main className="
      min-h-screen
      bg-[#09090b]
      text-white
      px-4
      py-5
      overflow-y-auto
      lg:h-screen
      lg:overflow-hidden
      lg:py-6
    ">

      <div className="
        mx-auto
        max-w-5xl
        min-h-screen
        flex
        flex-col
        lg:h-full
      ">

        <div className="
          mb-4
          shrink-0
          flex
          flex-col
          items-start
          gap-3
          lg:flex-row
          lg:items-end
          lg:justify-between
        ">

          <button
            onClick={onBack}

            className="
              relative
              z-50
              mb-3
              self-start
              lg:absolute
              lg:top-6
              lg:left-6
              lg:mb-0

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
            ← Volver
          </button>

          <div>

            <h1 className="
              text-3xl
              font-black
              tracking-tight
              mb-2
            ">
              <span className="inline-flex items-center gap-3"><img src={logoImage} alt="Odontoma" className="h-10 w-10 rounded-xl object-contain" />Odontoma</span>
            </h1>

            <p className="text-zinc-500">
              {getChapterTitle(question.chapter)}
            </p>

          </div>

          <Badge variant="outline">
            Score {score}
          </Badge>

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

        <Card className="
          flex-none
          rounded-[28px]
          border-zinc-800
          bg-[#111118]
          overflow-visible
          flex
          flex-col
          lg:flex-1
          lg:min-h-0
          lg:rounded-[32px]
          lg:overflow-hidden
        ">

          <div className="
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

              <h2 className="
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
              overflow-visible
              p-5
              pr-3
              md:p-6
              lg:h-full
              lg:overflow-y-auto
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
                        flex-1
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
                flex-1
                min-h-[72px]
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

                        <p className="
                          text-sm
                          text-zinc-400
                          leading-relaxed
                          line-clamp-2
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
                        px-8
                        py-6
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
                        px-8
                        py-6
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

    </main>

  )
}
