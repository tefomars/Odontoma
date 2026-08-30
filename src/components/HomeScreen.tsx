import logoImage from "@/assets/logo.png"
import histologiaImage from "@/assets/chapters/cap14.jpg"
import microbiologiaImage from "@/assets/chapters/micro-cap20.jpg"
import semiologiaImage from "@/assets/chapters/cap15.jpg"
import hayekImage from "@/assets/flashcard-decks/hayek.jpg"

import {
  homeSubjects,
  type HomeSubject
} from "@/content/appBuilder"

type Props = {
  onSelectSubject: (subject: string) => void
  onBack?: () => void
  onMainMenu?: () => void
  subjects?: HomeSubject[]
  editorMode?: boolean
  onAddSubject?: () => void
  onEditSubject?: (subject: HomeSubject) => void
  onReorderSubject?: (sourceId: string, targetId: string) => void
}

const SUBJECT_IMAGES: Partial<Record<HomeSubject["destination"], string>> = {
  histologia: histologiaImage,
  "filosofia-de-hayek": hayekImage,
  microbiologia: microbiologiaImage,
  semiologia: semiologiaImage
}

export default function HomeScreen({
  onSelectSubject,
  onBack,
  onMainMenu,
  subjects = homeSubjects,
  editorMode = false,
  onAddSubject,
  onEditSubject,
  onReorderSubject
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
        home-navigation-row
        mb-5
        flex
        items-center
        justify-between
        gap-3
      ">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-black text-violet-200 hover:bg-violet-500/20"
          >
            ← Atrás
          </button>
        )}
        {onMainMenu && (
          <button
            type="button"
            onClick={onMainMenu}
            className="
              ml-auto
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
              subject.destination !== "coming-soon"

            const subjectImage =
              SUBJECT_IMAGES[subject.destination]

            return (
              <div
                className="relative"
                key={subject.id}
                draggable={editorMode}
                onDragStart={event => event.dataTransfer.setData("text/odontoma-card", subject.id)}
                onDragOver={event => editorMode && event.preventDefault()}
                onDrop={event => {
                  if (!editorMode) return
                  event.preventDefault()
                  const sourceId = event.dataTransfer.getData("text/odontoma-card")
                  if (sourceId) onReorderSubject?.(sourceId, subject.id)
                }}
              >
              <button
                type="button"
                disabled={!available && !editorMode}
                onClick={() => {
                  if (editorMode) {
                    onEditSubject?.(subject)
                  } else if (available) {
                    onSelectSubject(subject.destination)
                  }
                }}
                className={`
                  group
                  relative
                  h-full
                  w-full
                  overflow-hidden
                  rounded-[2rem]
                  border
                  p-0
                  text-left
                  transition-all

                  ${
                    available || editorMode
                      ? "border-zinc-800 hover:border-violet-400/70 hover:scale-[1.01]"
                      : "cursor-not-allowed border-zinc-900 opacity-55"
                  }
                `}
              >

                {subjectImage && (
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-cover bg-center opacity-55 transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${subjectImage})` }}
                  />
                )}

                {subjectImage && (
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/35"
                  />
                )}

                <div
                  className="
                  absolute
                  inset-0
                "
                  style={{
                    background: `linear-gradient(to bottom right, ${subject.accentColor}66, ${subject.accentColor}12)`
                  }}
                />

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

              {editorMode && (
                <button
                  type="button"
                  onClick={() => onEditSubject?.(subject)}
                  className="absolute right-4 top-4 z-20 rounded-xl border border-white/20 bg-black/60 px-3 py-2 text-xs font-black text-white shadow-xl backdrop-blur hover:bg-black/80"
                  aria-label={`Editar ${subject.title}`}
                >
                  ✎ Editar
                </button>
              )}
              </div>

            )
          })}

          {editorMode && (
            <button
              type="button"
              onClick={onAddSubject}
              className="group flex min-h-[220px] items-center justify-center rounded-[2rem] border-2 border-dashed border-emerald-500/35 bg-emerald-500/5 p-7 text-emerald-200 transition hover:border-emerald-400 hover:bg-emerald-500/10"
            >
              <span className="text-center">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-emerald-400/30 bg-emerald-500/15 text-4xl font-light transition group-hover:scale-110">
                  +
                </span>
                <strong className="mt-4 block text-lg">Agregar materia</strong>
                <small className="mt-1 block text-emerald-300/60">Solo visible en el editor local</small>
              </span>
            </button>
          )}

        </div>

      </div>

    </main>

  )
}
