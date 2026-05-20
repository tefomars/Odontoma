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
        max-w-6xl
        flex-col
        justify-center
        gap-8
      ">
        <section className="
          rounded-[2rem]
          border
          border-zinc-800
          bg-[#111113]
          p-6
          shadow-2xl
          shadow-black/30
          sm:p-8
          lg:p-10
        ">
          <div className="
            mb-8
            flex
            items-center
            gap-4
          ">
            <img
              src={logoImage}
              alt="Odontoma"
              className="
                h-14
                w-14
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
                Odontoma
              </p>

              <h1 className="
                mt-2
                text-4xl
                font-black
                tracking-tight
                sm:text-5xl
              ">
                ¿Qué querés estudiar?
              </h1>
            </div>
          </div>

          <div className="
            grid
            gap-5
            md:grid-cols-2
          ">
            <button
              type="button"
              onClick={onSelectQuizzes}
              className="
                group
                relative
                overflow-hidden
                rounded-[1.75rem]
                border
                border-violet-500/30
                bg-violet-500/10
                p-6
                text-left
                transition-all
                hover:border-violet-400/70
                hover:bg-violet-500/20
                hover:scale-[1.01]
              "
            >
              <div className="
                mb-6
                flex
                items-start
                justify-between
                gap-4
              ">
                <div className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-violet-500/20
                  text-violet-200
                  ring-1
                  ring-violet-400/30
                ">
                  ?
                </div>

                <div className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white/10
                  text-2xl
                  font-black
                  text-violet-100
                  transition-all
                  group-hover:translate-x-1
                  group-hover:-translate-y-1
                  group-hover:rotate-12
                ">
                  →
                </div>
              </div>

              <p className="
                text-xs
                font-black
                uppercase
                tracking-[0.2em]
                text-violet-300
              ">
                Preguntas
              </p>

              <h2 className="
                mt-3
                text-3xl
                font-black
                text-white
              ">
                Quizzes
              </h2>

              <p className="
                mt-3
                text-sm
                leading-relaxed
                text-zinc-400
              ">
                Practicá con preguntas, filtros por capítulo, dificultad y modo de repaso.
              </p>

              <p className="
                mt-6
                text-sm
                font-black
                text-violet-200
              ">
                Entrar →
              </p>
            </button>

            <button
              type="button"
              onClick={onSelectFlashcards}
              className="
                group
                relative
                overflow-hidden
                rounded-[1.75rem]
                border
                border-emerald-500/30
                bg-emerald-500/10
                p-6
                text-left
                transition-all
                hover:border-emerald-400/70
                hover:bg-emerald-500/20
                hover:scale-[1.01]
              "
            >
              <div className="
                mb-6
                flex
                items-start
                justify-between
                gap-4
              ">
                <div className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-emerald-500/20
                  text-emerald-200
                  ring-1
                  ring-emerald-400/30
                ">
                  ↻
                </div>

                <div className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white/10
                  text-2xl
                  font-black
                  text-emerald-100
                  transition-all
                  group-hover:translate-x-1
                  group-hover:-translate-y-1
                  group-hover:rotate-12
                ">
                  →
                </div>
              </div>

              <p className="
                text-xs
                font-black
                uppercase
                tracking-[0.2em]
                text-emerald-300
              ">
                Memoria activa
              </p>

              <h2 className="
                mt-3
                text-3xl
                font-black
                text-white
              ">
                Flashcards
              </h2>

              <p className="
                mt-3
                text-sm
                leading-relaxed
                text-zinc-400
              ">
                Repasá tarjetas con FSRS, decks por materia y tus propios mazos.
              </p>

              <p className="
                mt-6
                text-sm
                font-black
                text-emerald-200
              ">
                Entrar →
              </p>
            </button>
          </div>
        </section>

        <BackupPanel />
      </div>
    </main>
  )
}
