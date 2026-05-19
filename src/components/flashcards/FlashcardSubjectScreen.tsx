import logoImage from "@/assets/logo.png"

import FsrsOptimizerPanel from "@/components/flashcards/FsrsOptimizerPanel"

import {
  loadUserFlashcards,
  loadUserFlashcardTopics
} from "@/lib/userFlashcards"

import {
  loadFsrsStorage
} from "@/lib/flashcardStorage"

import {
  isFsrsCardDue
} from "@/lib/fsrs"

type Props = {
  onBack: () => void
  onSelectSubject: (subject: string) => void
  onSelectMyDecks: () => void
}

const subjects = [
  {
    id: "histologia",
    title: "Histología",
    subtitle: "Ross",
    description:
      "Flashcards premade de tejidos, epitelio, conjuntivo, cartílago y hueso.",
    available: true,
    count: 3,
    accent: "from-violet-500/20 to-fuchsia-500/10"
  },
  {
    id: "bioquimica",
    title: "Bioquímica",
    subtitle: "Próximamente",
    description:
      "Decks premade de enzimas, proteínas, metabolismo y caries dental.",
    available: false,
    count: 0,
    accent: "from-emerald-500/20 to-teal-500/10"
  },
  {
    id: "anatomia",
    title: "Anatomía",
    subtitle: "Próximamente",
    description:
      "Decks premade de anatomía general, cabeza, cuello y odontología.",
    available: false,
    count: 0,
    accent: "from-amber-500/20 to-orange-500/10"
  }
]

export default function FlashcardSubjectScreen({
  onBack,
  onSelectSubject,
  onSelectMyDecks
}: Props) {

  const userTopics =
    loadUserFlashcardTopics()

  const userCards =
    loadUserFlashcards()

  const storage =
    loadFsrsStorage()

  const userDue =
    userCards.filter(card =>
      isFsrsCardDue(
        card.id,
        storage.cards
      )
    ).length

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
        max-w-6xl
      ">

        <button
          type="button"
          onClick={onBack}
          className="
            mb-5
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
          ← Volver
        </button>

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
            mb-8
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-end
            lg:justify-between
          ">
            <div>
              <div className="
                mb-4
                flex
                items-center
                gap-3
              ">
                <img
                  src={logoImage}
                  alt="Odontoma"
                  className="
                    h-12
                    w-12
                    object-contain
                  "
                />

                <p className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.25em]
                  text-violet-300
                ">
                  Flashcards
                </p>
              </div>

              <h1 className="
                text-3xl
                font-black
                leading-tight
                tracking-tight
                sm:text-4xl
                lg:text-5xl
              ">
                Elegí un deck
              </h1>

              <p className="
                mt-3
                max-w-2xl
                text-sm
                leading-relaxed
                text-zinc-400
                sm:text-base
              ">
                Tus decks personales van separados de los decks premade por materia.
              </p>
            </div>

            <div className="
              rounded-3xl
              border
              border-zinc-800
              bg-zinc-950
              px-5
              py-4
            ">
              <p className="
                text-xs
                font-black
                uppercase
                tracking-[0.2em]
                text-zinc-500
              ">
                Sistema
              </p>

              <p className="
                mt-1
                text-2xl
                font-black
                text-white
              ">
                FSRS
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSelectMyDecks}
            className="
              mb-6
              w-full
              overflow-hidden
              rounded-[1.75rem]
              border
              border-emerald-500/30
              bg-emerald-500/10
              p-5
              text-left
              transition-all
              hover:border-emerald-400/50
              hover:bg-emerald-500/20
              sm:p-6
            "
          >
            <div className="
              flex
              flex-col
              gap-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            ">
              <div>
                <p className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-emerald-300
                ">
                  Personal
                </p>

                <h2 className="
                  mt-3
                  text-3xl
                  font-black
                  leading-tight
                  text-white
                  sm:text-4xl
                ">
                  My decks
                </h2>

                <p className="
                  mt-3
                  max-w-2xl
                  text-sm
                  leading-relaxed
                  text-zinc-300
                ">
                  Crear tus propios temas y agregar flashcards rápido.
                </p>
              </div>

              <div className="
                flex
                flex-wrap
                gap-2
                sm:justify-end
              ">
                <span className="
                  rounded-2xl
                  bg-black/30
                  px-4
                  py-2
                  text-sm
                  font-black
                  text-zinc-200
                ">
                  {userTopics.length} decks
                </span>

                <span className="
                  rounded-2xl
                  bg-black/30
                  px-4
                  py-2
                  text-sm
                  font-black
                  text-zinc-200
                ">
                  {userCards.length} cards
                </span>

                <span className="
                  rounded-2xl
                  bg-emerald-500/20
                  px-4
                  py-2
                  text-sm
                  font-black
                  text-emerald-200
                ">
                  {userDue} pendientes
                </span>
              </div>
            </div>
          </button>

          <h2 className="
            mb-4
            text-xl
            font-black
            text-white
          ">
            Premade decks
          </h2>

          <div className="
            grid
            gap-4
            md:grid-cols-2
            xl:grid-cols-3
          ">

            {subjects.map(subject => (
              <button
                key={subject.id}
                type="button"
                disabled={!subject.available}
                onClick={() => onSelectSubject(subject.id)}
                className={`
                  relative
                  min-h-[210px]
                  overflow-hidden
                  rounded-[1.75rem]
                  border
                  p-5
                  text-left
                  transition-all

                  ${
                    subject.available
                      ? "border-zinc-800 bg-zinc-950 hover:border-violet-500/50"
                      : "cursor-not-allowed border-zinc-900 bg-zinc-950/50 opacity-60"
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
                  flex
                  min-h-[170px]
                  flex-col
                  justify-between
                ">
                  <div>
                    <p className="
                      text-xs
                      font-black
                      uppercase
                      tracking-[0.2em]
                      text-zinc-400
                    ">
                      {subject.subtitle}
                    </p>

                    <h2 className="
                      mt-3
                      text-3xl
                      font-black
                      leading-tight
                      text-white
                    ">
                      {subject.title}
                    </h2>

                    <p className="
                      mt-3
                      text-sm
                      leading-relaxed
                      text-zinc-300
                    ">
                      {subject.description}
                    </p>
                  </div>

                  <div className="
                    mt-5
                    flex
                    items-center
                    justify-between
                    gap-3
                  ">
                    <span className="
                      rounded-2xl
                      bg-black/30
                      px-4
                      py-2
                      text-sm
                      font-black
                      text-zinc-200
                    ">
                      {subject.available
                        ? `${subject.count} cards`
                        : "Próximamente"}
                    </span>

                    {subject.available && (
                      <span className="
                        text-sm
                        font-black
                        text-violet-200
                      ">
                        Entrar →
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}

          </div>

          <div className="
            mt-6
          ">
            <FsrsOptimizerPanel />
          </div>

        </section>

      </div>
    </main>
  )
}
