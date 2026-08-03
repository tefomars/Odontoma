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

import { flashcardSubjectBlocks } from "@/content/appBuilder/flashcardSubjects"
import type { FlashcardSubjectBlock } from "@/content/appBuilder"
import { relayWheelToPanel } from "@/lib/nestedScroll"

type Props = {
  onBack: () => void
  onSelectSubject: (subject: string) => void
  onSelectMyDecks: () => void
  subjects?: FlashcardSubjectBlock[]
  editorMode?: boolean
  onAddSubject?: () => void
  onEditSubject?: (subject: FlashcardSubjectBlock) => void
  onReorderSubject?: (sourceId: string, targetId: string) => void
}

const destinationSubjectTitles: Record<string, string> = {
  histologia: "Histología",
  "proceso-economico-i": "Proceso Económico I",
  "filosofia-de-hayek": "Filosofía"
}

export default function FlashcardSubjectScreen({
  onBack,
  onSelectSubject,
  onSelectMyDecks,
  subjects = flashcardSubjectBlocks,
  editorMode = false,
  onAddSubject,
  onEditSubject,
  onReorderSubject
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
          .map(card => card.chapter || card.topic)
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
    <main
      onWheel={relayWheelToPanel}
      className="
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

          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black">Premade decks</h2>
            {editorMode && (
              <button type="button" onClick={onAddSubject} className="rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-2 text-xs font-black text-emerald-200">
                ＋ Agregar bloque
              </button>
            )}
          </div>

          <div className="
            grid
            gap-4
            lg:grid-cols-3
          ">
            {subjects.map(subject => {
              const available = subject.destination !== "coming-soon"
              const contentSubjectTitle = destinationSubjectTitles[subject.destination] || subject.title
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
                disabled={!editorMode && !available}
                onClick={() => editorMode
                  ? onEditSubject?.(subject)
                  : available && onSelectSubject(subject.destination)}
                className={`
                  h-full
                  w-full
                  rounded-[1.75rem]
                  border
                  border-zinc-800
                  bg-gradient-to-br
                  ${subject.accent}
                  p-5
                  text-left
                  transition
                  ${
                    available || editorMode
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
                    {available
                      ? `${getSubjectDeckCount(contentSubjectTitle)} mazos · ${getSubjectCardCount(contentSubjectTitle)} cartas`
                      : "Próximamente"}
                  </span>

                  {available && (
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
              {editorMode && (
                <button type="button" onClick={() => onEditSubject?.(subject)} className="absolute right-3 top-3 z-20 rounded-xl border border-emerald-400/30 bg-black/75 px-3 py-2 text-xs font-black text-emerald-200">
                  ✎ Editar
                </button>
              )}
              </div>
            )})}
          </div>

          {!editorMode && <div className="
            mt-6
          ">
            <FsrsOptimizerPanel />
          </div>}

        </section>

      </div>
    </main>
  )
}
