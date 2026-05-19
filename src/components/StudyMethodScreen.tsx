import logoImage from "@/assets/logo.png"
import BackupPanel from "@/components/BackupPanel"

type Props = {
  onSelectQuizzes: () => void
  onSelectFlashcards: () => void
}

export default function StudyMethodScreen({
  onSelectQuizzes,
  onSelectFlashcards
}: Props) {

  return (
    <main className="
      min-h-screen
      bg-[#09090b]
      p-5
      text-white
    ">
      <div className="
        mx-auto
        flex
        min-h-[calc(100vh-2.5rem)]
        max-w-5xl
        flex-col
        justify-center
      ">

        <section className="
          rounded-[2rem]
          border
          border-zinc-800
          bg-[#111113]
          p-6
          shadow-2xl
          shadow-black/30
          md:p-10
        ">

          <div className="
            mb-10
            text-center
          ">
            <img
              src={logoImage}
              alt="Odontoma"
              className="
                mx-auto
                mb-5
                h-24
                w-24
                object-contain
              "
            />

            <p className="
              mb-2
              text-xs
              font-black
              uppercase
              tracking-[0.25em]
              text-violet-300
            ">
              Odontoma
            </p>

            <h1 className="
              text-4xl
              font-black
              tracking-tight
              md:text-6xl
            ">
              Elegí cómo estudiar
            </h1>

            <p className="
              mx-auto
              mt-4
              max-w-2xl
              text-zinc-400
            ">
              Practicá con preguntas o repasá tarjetas con repetición espaciada.
            </p>
          </div>

          <div className="
            grid
            gap-4
            md:grid-cols-2
          ">

            <button
              type="button"
              onClick={onSelectQuizzes}
              className="
                group
                rounded-[2rem]
                border
                border-zinc-800
                bg-zinc-950
                p-6
                text-left
                transition-all
                hover:border-violet-500/50
                hover:bg-violet-500/10
              "
            >
              <div className="
                mb-6
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-violet-500/15
                text-3xl
              ">
                ?
              </div>

              <h2 className="
                text-3xl
                font-black
              ">
                Quizzes
              </h2>

              <p className="
                mt-3
                text-sm
                leading-relaxed
                text-zinc-400
              ">
                Entrá al menú actual de capítulos, dificultad, cantidad de preguntas y modo de práctica.
              </p>

              <p className="
                mt-6
                text-sm
                font-black
                text-violet-300
              ">
                Empezar quizzes →
              </p>
            </button>

            <button
              type="button"
              onClick={onSelectFlashcards}
              className="
                group
                rounded-[2rem]
                border
                border-zinc-800
                bg-zinc-950
                p-6
                text-left
                transition-all
                hover:border-emerald-500/50
                hover:bg-emerald-500/10
              "
            >
              <div className="
                mb-6
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-emerald-500/15
                text-3xl
              ">
                ↻
              </div>

              <h2 className="
                text-3xl
                font-black
              ">
                Flashcards
              </h2>

              <p className="
                mt-3
                text-sm
                leading-relaxed
                text-zinc-400
              ">
                Repasá tarjetas con un sistema tipo FSRS, basado en la memoria de cada tarjeta.
              </p>

              <p className="
                mt-6
                text-sm
                font-black
                text-emerald-300
              ">
                Repasar flashcards →
              </p>
            </button>

          </div>

          <div className="
            mt-6
          ">
            <BackupPanel />
          </div>

        </section>

      </div>
    </main>
  )
}
