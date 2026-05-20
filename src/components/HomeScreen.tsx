import logoImage from "@/assets/logo.png"
type Props = {
  onSelectSubject: (subject: string) => void
  onSelectMyQuizzes?: () => void
  onMainMenu?: () => void
}

const subjects = [

  {
    id: "histologia",
    title: "Histología",
    subtitle: "Tejidos básicos, epitelio, conjuntivo, cartílago y más",
    status: "Disponible",
    accent: "from-violet-500/40 to-fuchsia-500/10"
  },

  {
    id: "filosofia-de-hayek",
    title: "Filosofía de Hayek",
    subtitle: "Parcial 1, Parcial 2 y conceptos importantes",
    status: "Disponible",
    accent: "from-indigo-500/40 to-violet-500/10"
  },

  {
    id: "bioquimica",
    title: "Bioquímica",
    subtitle: "Enzimas, proteínas, metabolismo y caries",
    status: "Próximamente",
    accent: "from-cyan-500/40 to-blue-500/10"
  },

  {
    id: "anatomia",
    title: "Anatomía",
    subtitle: "Cabeza, cuello, músculos, nervios y vasos",
    status: "Próximamente",
    accent: "from-emerald-500/40 to-green-500/10"
  },

  {
    id: "fisiologia",
    title: "Fisiología",
    subtitle: "Sistemas, regulación y funciones corporales",
    status: "Próximamente",
    accent: "from-orange-500/40 to-red-500/10"
  }

]

export default function HomeScreen({
  onSelectSubject,
  onSelectMyQuizzes,
  onMainMenu
}: Props) {

  return (

    <main className="
      min-h-screen
      bg-[#09090b]
      text-white
      px-5
      py-8
    ">

      <div className="
        mb-5
        flex
        justify-start
      ">
        {onMainMenu && (
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
        )}
      </div>

      <div className="
        mx-auto
        max-w-7xl
      ">

        <div className="
          mb-10
          flex
          items-end
          justify-between
          gap-6
        ">

          <div>

            <p className="
              mb-3
              text-xs
              font-black
              uppercase
              tracking-[0.3em]
              text-violet-300
            ">
              <span className="inline-flex items-center gap-3"><img src={logoImage} alt="Odontoma" className="h-10 w-10 rounded-xl object-contain" />Odontoma</span>
            </p>

            <h1 className="
              text-5xl
              font-black
              tracking-tight
              md:text-7xl
            ">
              ¿Qué vas a practicar?
            </h1>

            <p className="
              mt-4
              max-w-2xl
              text-lg
              leading-relaxed
              text-zinc-400
            ">
              Elegí la materia, libro o clase. Después vas a poder filtrar por capítulos,
              dificultad y tipo de práctica.
            </p>

          </div>

        </div>

        <div className="
          grid
          gap-5
          md:grid-cols-2
        ">

          {subjects.map(subject => {

            const available =
              subject.id === "histologia" ||
              subject.id === "filosofia-de-hayek"

            return (

              <button
                key={subject.id}
                type="button"
                disabled={!available}
                onClick={() => {
                  if (available) {
                    onSelectSubject(subject.id)
                  }
                }}
                className={`
                  group
                  relative
                  overflow-hidden
                  rounded-[2rem]
                  border
                  p-0
                  text-left
                  transition-all

                  ${
                    available
                      ? "border-zinc-800 hover:border-violet-400/70 hover:scale-[1.01]"
                      : "cursor-not-allowed border-zinc-900 opacity-55"
                  }
                `}
              >

                <div className={`
                  absolute
                  inset-0
                  bg-gradient-to-br
                  ${subject.accent}
                `} />

                <div className="
                  relative
                  min-h-[220px]
                  bg-black/20
                  p-7
                  md:p-8
                ">

                  <div className="
                    mb-8
                    flex
                    items-center
                    justify-between
                    gap-4
                  ">

                    <span className={`
                      rounded-full
                      px-4
                      py-2
                      text-xs
                      font-black

                      ${
                        available
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-zinc-800 text-zinc-400"
                      }
                    `}>
                      {subject.status}
                    </span>

                    <div className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-2xl
                      bg-white/10
                      text-2xl
                      transition-all
                      group-hover:rotate-12
                    ">
                      →
                    </div>

                  </div>

                  <h2 className="
                    text-4xl
                    font-black
                    tracking-tight
                  ">
                    {subject.title}
                  </h2>

                  <p className="
                    mt-4
                    max-w-xl
                    text-base
                    leading-relaxed
                    text-zinc-300
                  ">
                    {subject.subtitle}
                  </p>

                </div>

              </button>

            )
          })}

        </div>

        <div className="
          mt-6
        ">
          <button
            type="button"
            onClick={onSelectMyQuizzes}
            className="
              group
              w-full
              overflow-hidden
              rounded-[2rem]
              border
              border-emerald-500/30
              bg-emerald-500/10
              p-6
              text-left
              transition-all
              hover:bg-emerald-500/20
            "
          >
            <div className="
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-center
              sm:justify-between
            ">
              <div>
                <p className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.25em]
                  text-emerald-300
                ">
                  Personal
                </p>

                <h2 className="
                  mt-2
                  text-3xl
                  font-black
                  text-white
                ">
                  My quizzes
                </h2>

                <p className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-relaxed
                  text-zinc-300
                ">
                  Creá tus propios quizzes, importá preguntas y exportá decks individuales.
                </p>
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
                transition-all
                group-hover:rotate-12
              ">
                →
              </div>
            </div>
          </button>
        </div>

      </div>

    </main>

  )
}
