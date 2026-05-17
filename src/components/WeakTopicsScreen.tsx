import { questions } from "@/content/histologia"
import { chapters } from "@/content/histologia/chapters"

type Props = {
  stats: any
  onBack: () => void
}

type TopicData = {
  tag: string
  correct: number
  incorrect: number
  total: number
  mastery: number
}

function getTopicStats(stats: any, tag: string): TopicData {

  const data =
    stats.tags?.[tag]

  const correct =
    data?.correct || 0

  const incorrect =
    data?.incorrect || 0

  const total =
    correct + incorrect

  const mastery =
    total === 0
      ? 0
      : Math.round((correct / total) * 100)

  return {
    tag,
    correct,
    incorrect,
    total,
    mastery
  }
}

function getColor(item: TopicData) {

  if (item.mastery < 50) {

    return {
      card: "border-red-500/40 bg-red-500/10",
      text: "text-red-300",
      label: "Débil"
    }
  }

  if (item.mastery < 75) {

    return {
      card: "border-yellow-500/40 bg-yellow-500/10",
      text: "text-yellow-300",
      label: "En riesgo"
    }
  }

  return {
    card: "border-emerald-500/40 bg-emerald-500/10",
    text: "text-emerald-300",
    label: "Dominado"
  }
}

function getChapterTopics(chapterId: string) {

  const tags =
    new Set<string>()

  questions
    .filter((question: any) =>
      question.chapter === chapterId
    )
    .forEach((question: any) => {

      ;(question.tags || []).forEach((tag: string) => {
        tags.add(tag)
      })

    })

  return Array.from(tags).sort()
}

export default function WeakTopicsScreen({
  stats,
  onBack
}: Props) {

  const totalAnswered =
    stats.totalAnswered || 0

  const totalCorrect =
    stats.totalCorrect || 0

  const globalMastery =
    totalAnswered === 0
      ? 0
      : Math.round((totalCorrect / totalAnswered) * 100)

  return (

    <main className="
      min-h-screen
      bg-[#09090b]
      px-4
      py-8
      text-white
    ">

      <div className="
        mx-auto
        max-w-6xl
      ">

        <div className="
          mb-10
          flex
          items-center
          justify-between
          gap-6
        ">

          <div>

            <p className="
              mb-2
              text-xs
              font-black
              uppercase
              tracking-[0.25em]
              text-emerald-300
            ">
              Odontoma
            </p>

            <h1 className="
              text-4xl
              font-black
              tracking-tight
              md:text-5xl
            ">
              Mastery
            </h1>

            <p className="
              mt-3
              text-zinc-400
            ">
              Enfocado en lo que ya practicaste y en tus puntos débiles.
            </p>

          </div>

          <button
            type="button"
            onClick={onBack}
            className="
              rounded-2xl
              border
              border-zinc-800
              bg-zinc-900
              px-6
              py-3
              text-sm
              font-black
              hover:bg-zinc-800
            "
          >
            Volver
          </button>

        </div>

        <div className="
          mb-8
          grid
          gap-4
          md:grid-cols-3
        ">

          <div className="
            rounded-3xl
            border
            border-zinc-800
            bg-[#111113]
            p-6
          ">

            <p className="
              text-sm
              font-bold
              text-zinc-500
            ">
              Respondidas
            </p>

            <p className="
              mt-2
              text-4xl
              font-black
            ">
              {totalAnswered}
            </p>

          </div>

          <div className="
            rounded-3xl
            border
            border-zinc-800
            bg-[#111113]
            p-6
          ">

            <p className="
              text-sm
              font-bold
              text-zinc-500
            ">
              Correctas
            </p>

            <p className="
              mt-2
              text-4xl
              font-black
            ">
              {totalCorrect}
            </p>

          </div>

          <div className="
            rounded-3xl
            border
            border-zinc-800
            bg-[#111113]
            p-6
          ">

            <p className="
              text-sm
              font-bold
              text-zinc-500
            ">
              Dominio global
            </p>

            <p className="
              mt-2
              text-4xl
              font-black
            ">
              {globalMastery}%
            </p>

          </div>

        </div>

        <div className="
          grid
          gap-6
        ">

          {chapters.map(chapter => {

            const allTopicStats =
              getChapterTopics(chapter.id)
                .map(tag => getTopicStats(stats, tag))

            const practicedTopics =
              allTopicStats
                .filter(item => item.total > 0)

            const unpracticedCount =
              allTopicStats.length - practicedTopics.length

            const sortedPracticedTopics =
              practicedTopics
                .sort((a, b) => {

                  if (a.mastery !== b.mastery) {
                    return a.mastery - b.mastery
                  }

                  return b.total - a.total
                })

            const weakTopics =
              sortedPracticedTopics
                .filter(item => item.mastery < 75)

            const masteredTopics =
              sortedPracticedTopics
                .filter(item => item.mastery >= 75)

            const visibleTopics =
              [
                ...weakTopics,
                ...masteredTopics
              ].slice(0, 12)

            const chapterMastery =
              practicedTopics.length === 0
                ? 0
                : Math.round(
                    practicedTopics.reduce(
                      (sum, item) => sum + item.mastery,
                      0
                    ) / practicedTopics.length
                  )

            return (

              <section
                key={chapter.id}
                className="
                  rounded-[2rem]
                  border
                  border-zinc-800
                  bg-[#111113]
                  p-6
                  md:p-8
                "
              >

                <div className="
                  mb-6
                  flex
                  items-start
                  justify-between
                  gap-6
                ">

                  <div>

                    <p className="
                      mb-2
                      text-sm
                      font-bold
                      text-zinc-500
                    ">
                      {chapter.id}
                    </p>

                    <h2 className="
                      text-3xl
                      font-black
                    ">
                      {chapter.title}
                    </h2>

                    <p className="
                      mt-2
                      text-sm
                      text-zinc-400
                    ">
                      {practicedTopics.length} subtemas practicados
                      {" · "}
                      {unpracticedCount} sin practicar
                    </p>

                  </div>

                  <div className="
                    text-right
                  ">

                    <p className="
                      mb-1
                      text-sm
                      font-bold
                      text-zinc-500
                    ">
                      Mastery
                    </p>

                    <p className="
                      text-4xl
                      font-black
                    ">
                      {chapterMastery}%
                    </p>

                  </div>

                </div>

                <div className="
                  mb-6
                  h-2
                  overflow-hidden
                  rounded-full
                  bg-zinc-800
                ">

                  <div
                    className="
                      h-full
                      bg-emerald-500
                    "
                    style={{
                      width: `${chapterMastery}%`
                    }}
                  />

                </div>

                {practicedTopics.length === 0 ? (

                  <div className="
                    rounded-2xl
                    border
                    border-zinc-800
                    bg-zinc-950/70
                    p-5
                    text-zinc-400
                  ">
                    Todavía no practicaste este capítulo.
                  </div>

                ) : (

                  <div className="
                    grid
                    gap-4
                    md:grid-cols-2
                  ">

                    {visibleTopics.map(item => {

                      const color =
                        getColor(item)

                      return (

                        <div
                          key={item.tag}
                          className={`
                            rounded-2xl
                            border
                            p-5
                            ${color.card}
                          `}
                        >

                          <div className="
                            mb-3
                            flex
                            items-start
                            justify-between
                            gap-4
                          ">

                            <div>

                              <h3 className="
                                text-lg
                                font-black
                              ">
                                {item.tag}
                              </h3>

                              <p className={`
                                mt-1
                                text-sm
                                font-bold
                                ${color.text}
                              `}>
                                {color.label}
                              </p>

                            </div>

                            <div className="
                              text-right
                            ">

                              <p className="
                                text-2xl
                                font-black
                              ">
                                {item.mastery}%
                              </p>

                            </div>

                          </div>

                          <div className="
                            text-sm
                            font-semibold
                            text-zinc-400
                          ">

                            ✅ {item.correct}
                            {" · "}
                            ❌ {item.incorrect}
                            {" · "}
                            Total: {item.total}

                          </div>

                        </div>

                      )
                    })}

                  </div>

                )}

                {practicedTopics.length > 12 && (

                  <p className="
                    mt-5
                    text-sm
                    text-zinc-500
                  ">
                    Mostrando los 12 subtemas más relevantes. Los débiles aparecen primero.
                  </p>

                )}

              </section>

            )
          })}

        </div>

      </div>

    </main>

  )
}
