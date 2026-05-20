import logoImage from "@/assets/logo.png"

import {
  getDefaultFlashcards
} from "@/lib/flashcardDecks"

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
    accent: "from-violet-500/20 to-fuchsia-500/10"
  },
  {
    id: "proceso-economico-i",
    title: "Proceso Económico I",
    subtitle: "Material de clase",
    description:
      "Flashcards premade de ahorro, inversión, capital, interés, competencia y rol empresarial.",
    available: true,
    accent: "from-sky-500/20 to-cyan-500/10"
  },
  {
    id: "filosofia-de-hayek",
    title: "Filosofía",
    subtitle: "Hayek",
    description:
      "Flashcards premade de liberalismo, libertad, conocimiento, orden espontáneo y pensamiento de Hayek.",
    available: true,
    accent: "from-indigo-500/20 to-blue-500/10"
  },
  {
    id: "bioquimica",
    title: "Bioquímica",
    subtitle: "Próximamente",
    description:
      "Decks premade de enzimas, proteínas, metabolismo y caries dental.",
    available: false,
    accent: "from-emerald-500/20 to-teal-500/10"
  },
  {
    id: "anatomia",
    title: "Anatomía",
    subtitle: "Próximamente",
    description:
      "Decks premade de anatomía general, cabeza, cuello y odontología.",
    available: false,
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

  function getSubjectCardCount(subjectTitle: string) {
    return getDefaultFlashcards()
      .filter(card => card.subject === subjectTitle)
      .length
  }

  function getSubjectDeckCount(subjectTitle: string) {
    return Math.max(
      1,
      new Set(
        getDefaultFlashcards()
          .filter(card => card.subject === subjectTitle)
          .map(card => card.topic || card.chapter)
          .filter(Boolean)
      ).size
    )
  }

  const userDue =
    userCards.filter(card =>
      isFsrsCardDue(
        card.id,
        storage.cards
      )
    ).length

  return (
    <main className="
      flashcard-book-shell
      bg-[#09090b]
      px-4
      py-5
      text-white
      sm:px-6
      lg:px-8
      lg:py-10
    ">
      <div className="
        flashcard-book-frame
        mx-auto
        max-w-6xl
      ">

        <div className="
          flashcard-book-topbar
          pb-5
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
            ← Volver
          </button>
        </div>

        <section className="
          flashcard-book-scroll
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
                sm:text-5xl
              ">
                Elegí un deck
              </h1>

              <p className="
                mt-4
                max-w-2xl
                text-base
                font-medium
                leading-relaxed
                text-zinc-400
              ">
                Tus decks personales van separados de los decks premade por materia.
              </p>
            </div>

            <div className="
              rounded-[1.5rem]
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
                tracking-[0.25em]
                text-zinc-500
              ">
                Sistema
              </p>

              <p className="
                mt-2
                text-2xl
                font-black
              ">
                FSRS
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSelectMyDecks}
            className="
              mb-8
              w-full
              rounded-[2rem]
              border
              border-emerald-500/30
              bg-emerald-500/10
              p-6
              text-left
              transition
              hover:border-emerald-400/60
              hover:bg-emerald-500/15
            "
          >
            <div className="
              flex
              flex-col
              gap-5
              lg:flex-row
              lg:items-center
              lg:justify-between
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
                  mt-3
                  text-3xl
                  font-black
                ">
                  My decks
                </h2>

                <p className="
                  mt-3
                  text-sm
                  font-bold
                  text-zinc-300
                ">
                  Crear tus propios temas y agregar flashcards rápido.
                </p>
              </div>

              <div className="
                flex
                flex-wrap
                gap-2
              ">
                <span className="
                  rounded-full
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
                  rounded-full
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
                  rounded-full
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
            text-2xl
            font-black
          ">
            Premade decks
          </h2>

          <div className="
            grid
            gap-4
            lg:grid-cols-3
          ">
            {subjects.map(subject => (
              <button
                key={subject.id}
                type="button"
                disabled={!subject.available}
                onClick={() => {
                  if (subject.available) {
                    onSelectSubject(subject.id)
                  }
                }}
                className={`
                  rounded-[1.75rem]
                  border
                  border-zinc-800
                  bg-gradient-to-br
                  ${subject.accent}
                  p-5
                  text-left
                  transition
                  ${
                    subject.available
                      ? "hover:border-violet-400/60 hover:brightness-110"
                      : "cursor-not-allowed opacity-45"
                  }
                `}
              >
                <p className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.25em]
                  text-zinc-500
                ">
                  {subject.subtitle}
                </p>

                <h3 className="
                  mt-4
                  text-3xl
                  font-black
                ">
                  {subject.title}
                </h3>

                <p className="
                  mt-3
                  min-h-[3rem]
                  text-sm
                  font-medium
                  leading-relaxed
                  text-zinc-300
                ">
                  {subject.description}
                </p>

                <div className="
                  mt-5
                  flex
                  items-center
                  justify-between
                  gap-3
                ">
                  <span className="
                    rounded-full
                    bg-black/30
                    px-4
                    py-2
                    text-sm
                    font-black
                    text-zinc-200
                  ">
                    {subject.available
                      ? `${getSubjectDeckCount(subject.title)} mazos · ${getSubjectCardCount(subject.title)} cartas`
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

