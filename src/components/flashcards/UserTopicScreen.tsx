import { useRef, useState } from "react"

import {
  addUserFlashcard,
  deleteUserFlashcard,
  getUserFlashcardsByTopic,
  loadUserFlashcardTopics,
  updateUserFlashcard,
  importUserFlashcardsFromTabText,
  exportUserFlashcardsToTabText
} from "@/lib/userFlashcards"

import {
  loadFsrsStorage
} from "@/lib/flashcardStorage"

import {
  isFsrsCardDue
} from "@/lib/fsrs"

import {
  filterActiveFlashcards
} from "@/lib/suspendedFlashcards"

type Props = {
  topicId: string
  onBack: () => void
  onMenu: () => void
  onReview: () => void
}

export default function UserTopicScreen({
  topicId,
  onBack,
  onMenu,
  onReview
}: Props) {

  const [front, setFront] =
    useState("")

  const [back, setBack] =
    useState("")

  const frontInputRef =
    useRef<HTMLTextAreaElement | null>(null)

  const [editingCardId, setEditingCardId] =
    useState<string | null>(null)

  const [searchQuery, setSearchQuery] =
    useState("")

  const [importText, setImportText] =
    useState("")

  const [showImportBox, setShowImportBox] =
    useState(false)

  const [refreshKey, setRefreshKey] =
    useState(0)

  const topic =
    (void refreshKey,
      loadUserFlashcardTopics().find(
        item => item.id === topicId
      )
    )

  const cards =
    (void refreshKey,
      filterActiveFlashcards(getUserFlashcardsByTopic(topicId))
    )

  const storage =
    (void refreshKey, loadFsrsStorage())

  const dueCount =
    cards.filter(card =>
      isFsrsCardDue(card.id, storage.cards)
    ).length

  const filteredCards =
    cards.filter(card => {

      const query =
        searchQuery.trim().toLowerCase()

      if (!query) return true

      return (
        card.front.toLowerCase().includes(query) ||
        card.back.toLowerCase().includes(query)
      )
    })

  const canSave =
    front.trim().length > 0 &&
    back.trim().length > 0

  function clearForm() {
    setFront("")
    setBack("")
    setEditingCardId(null)
  }

  function saveAndContinue() {

    if (!canSave) return

    if (editingCardId) {
      updateUserFlashcard({
        cardId: editingCardId,
        front,
        back
      })
    } else {
      addUserFlashcard({
        topicId,
        front,
        back
      })
    }

    clearForm()
    setRefreshKey(prev => prev + 1)

    window.setTimeout(() => {
      frontInputRef.current?.focus()
    }, 0)
  }

  function startEdit(card: any) {
    setEditingCardId(card.id)
    setFront(card.front)
    setBack(card.back)

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  function removeCard(cardId: string) {

    const confirmed =
      window.confirm("¿Borrar esta flashcard?")

    if (!confirmed) return

    deleteUserFlashcard(cardId)

    if (editingCardId === cardId) {
      clearForm()
    }

    setRefreshKey(prev => prev + 1)
  }

  function handleTextAreaKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {

    if (
      event.key === "Enter" &&
      (
        event.shiftKey ||
        event.metaKey ||
        event.ctrlKey
      )
    ) {
      event.preventDefault()
      saveAndContinue()
    }
  }

  function importCardsFromText(
    text: string
  ) {

    let imported

    try {
      imported =
        importUserFlashcardsFromTabText({
          topicId,
          text
        })
    } catch (caught) {
      window.alert(
        caught instanceof Error
          ? caught.message
          : "No se pudieron importar las tarjetas."
      )
      return false
    }

    if (imported.length === 0) {
      window.alert(
        "No se importó ninguna tarjeta. Usá dos columnas: pregunta y respuesta."
      )
      return false
    }

    setImportText("")
    setShowImportBox(false)
    setRefreshKey(prev => prev + 1)

    window.alert(
      `Se importaron ${imported.length} tarjetas.`
    )

    return true
  }

  function importCards() {
    importCardsFromText(importText)
  }

  async function importCardsFromFile(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0]

    event.target.value = ""

    if (!file) return

    const extension =
      file.name
        .toLowerCase()
        .split(".")
        .pop()

    if (!extension || !["txt", "tsv", "csv"].includes(extension)) {
      window.alert("Elegí un archivo .txt, .tsv o .csv.")
      return
    }

    try {
      const text =
        await file.text()

      importCardsFromText(text)
    } catch {
      window.alert("No se pudo leer el archivo.")
    }
  }

  function exportDeck() {

    const exported =
      exportUserFlashcardsToTabText(topicId)

    if (!exported.trim()) {
      window.alert("Este deck no tiene cartas para exportar.")
      return
    }

    const blob =
      new Blob(
        [exported],
        {
          type: "text/plain;charset=utf-8"
        }
      )

    const url =
      URL.createObjectURL(blob)

    const link =
      document.createElement("a")

    const safeName =
      (topic?.name || "deck")
        .toLowerCase()
        .replace(/[^a-z0-9áéíóúñü]+/gi, "-")
        .replace(/^-+|-+$/g, "")

    link.href = url
    link.download = `${safeName || "deck"}-flashcards.txt`
    link.click()

    URL.revokeObjectURL(url)
  }

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
        max-w-4xl
      ">
        <div className="
          mb-5
          flex
          items-center
          justify-between
          gap-2
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

          <button
            type="button"
            onClick={onMenu}
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
        </div>

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
            mb-6
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-end
            sm:justify-between
          ">
            <div>
              <p className="
                text-xs
                font-black
                uppercase
                tracking-[0.25em]
                text-violet-300
              ">
                My flashcards
              </p>

              <h1 className="
                mt-2
                text-3xl
                font-black
                tracking-tight
                sm:text-4xl
              ">
                {topic?.name || "Deck"}
              </h1>

              <p className="
                mt-2
                text-sm
                text-zinc-400
              ">
                {cards.length} tarjetas · {dueCount} pendientes
              </p>
            </div>

            <button
              type="button"
              disabled={dueCount === 0}
              onClick={onReview}
              className={`
                rounded-2xl
                px-5
                py-3
                text-sm
                font-black

                ${
                  dueCount > 0
                    ? "bg-emerald-500 text-black hover:bg-emerald-400"
                    : "cursor-not-allowed bg-zinc-800 text-zinc-500"
                }
              `}
            >
              Repasar deck
            </button>
          </div>

          <div className="
            mb-6
            rounded-[1.5rem]
            border
            border-zinc-800
            bg-zinc-950
            p-5
          ">
            <div className="
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-center
              sm:justify-between
            ">
              <div>
                <p className="
                  text-sm
                  font-black
                  text-white
                ">
                  Import / Export
                </p>

                <p className="
                  mt-1
                  text-xs
                  text-zinc-500
                ">
                  Pegá dos columnas o elegí un archivo .txt, .tsv o .csv.
                </p>
              </div>

              <div className="
                flex
                flex-wrap
                gap-2
              ">
                <button
                  type="button"
                  onClick={() => setShowImportBox(prev => !prev)}
                  className="
                    rounded-2xl
                    border
                    border-violet-500/30
                    bg-violet-500/10
                    px-4
                    py-2
                    text-xs
                    font-black
                    text-violet-200
                    hover:bg-violet-500/20
                  "
                >
                  Pegar texto
                </button>

                <label className="
                  cursor-pointer
                  rounded-2xl
                  border
                  border-violet-500/30
                  bg-violet-500/10
                  px-4
                  py-2
                  text-xs
                  font-black
                  text-violet-200
                  hover:bg-violet-500/20
                ">
                  Importar archivo

                  <input
                    type="file"
                    accept=".txt,.tsv,.csv,text/plain,text/tab-separated-values,text/csv"
                    onChange={importCardsFromFile}
                    className="sr-only"
                  />
                </label>

                <button
                  type="button"
                  onClick={exportDeck}
                  className="
                    rounded-2xl
                    border
                    border-emerald-500/30
                    bg-emerald-500/10
                    px-4
                    py-2
                    text-xs
                    font-black
                    text-emerald-200
                    hover:bg-emerald-500/20
                  "
                >
                  Exportar deck
                </button>
              </div>
            </div>

            {showImportBox && (
              <div className="
                mt-4
                grid
                gap-3
              ">
                <textarea
                  value={importText}
                  onChange={(event) => setImportText(event.target.value)}
                  rows={6}
                  placeholder={"Pregunta 1\tRespuesta 1\nPregunta 2\tRespuesta 2"}
                  className="
                    rounded-2xl
                    border
                    border-zinc-800
                    bg-[#111113]
                    px-4
                    py-3
                    text-sm
                    text-white
                    outline-none
                    focus:border-violet-500
                  "
                />

                <button
                  type="button"
                  onClick={importCards}
                  disabled={!importText.trim()}
                  className={`
                    rounded-2xl
                    px-5
                    py-3
                    text-sm
                    font-black

                    ${
                      importText.trim()
                        ? "bg-white text-black hover:bg-zinc-200"
                        : "cursor-not-allowed bg-zinc-800 text-zinc-500"
                    }
                  `}
                >
                  Importar cartas
                </button>
              </div>
            )}
          </div>

          <div className="
            rounded-[1.5rem]
            border
            border-violet-500/30
            bg-violet-500/10
            p-5
          ">
            <div className="
              flex
              items-center
              justify-between
              gap-3
            ">
              <h2 className="
                text-xl
                font-black
                text-white
              ">
                {editingCardId ? "Editar flashcard" : "Crear flashcard"}
              </h2>

              {editingCardId && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="
                    rounded-2xl
                    border
                    border-zinc-700
                    bg-zinc-900
                    px-4
                    py-2
                    text-xs
                    font-black
                    text-zinc-300
                    hover:bg-zinc-800
                  "
                >
                  Cancelar
                </button>
              )}
            </div>

            <p className="
              mt-2
              text-xs
              text-zinc-400
            ">
              En compu: Shift + Enter o Cmd + Enter para guardar.
            </p>

            <div className="
              mt-4
              grid
              gap-4
            ">
              <textarea
                ref={frontInputRef}
                value={front}
                onChange={(event) => setFront(event.target.value)}
                onKeyDown={handleTextAreaKeyDown}
                rows={3}
                placeholder="Frente / pregunta"
                className="
                  rounded-2xl
                  border
                  border-zinc-800
                  bg-zinc-950
                  px-4
                  py-3
                  text-base
                  text-white
                  outline-none
                  focus:border-violet-500
                "
              />

              <textarea
                value={back}
                onChange={(event) => setBack(event.target.value)}
                onKeyDown={handleTextAreaKeyDown}
                rows={4}
                placeholder="Reverso / respuesta"
                className="
                  rounded-2xl
                  border
                  border-zinc-800
                  bg-zinc-950
                  px-4
                  py-3
                  text-base
                  text-white
                  outline-none
                  focus:border-emerald-500
                "
              />

              <button
                type="button"
                disabled={!canSave}
                onClick={saveAndContinue}
                className={`
                  rounded-2xl
                  px-5
                  py-4
                  text-base
                  font-black

                  ${
                    canSave
                      ? "bg-white text-black hover:bg-zinc-200"
                      : "cursor-not-allowed bg-zinc-800 text-zinc-500"
                  }
                `}
              >
                {editingCardId ? "Guardar cambios" : "Guardar y crear otra"}
              </button>
            </div>
          </div>

          <div className="
            mt-6
            rounded-[1.5rem]
            border
            border-zinc-800
            bg-zinc-950
            p-4
          ">
            <div className="
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-center
              sm:justify-between
            ">
              <div>
                <p className="
                  text-sm
                  font-black
                  text-white
                ">
                  Buscar cartas
                </p>

                <p className="
                  mt-1
                  text-xs
                  text-zinc-500
                ">
                  Mostrando {filteredCards.length} de {cards.length}
                </p>
              </div>

              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar por pregunta o respuesta..."
                className="
                  w-full
                  rounded-2xl
                  border
                  border-zinc-800
                  bg-[#111113]
                  px-4
                  py-3
                  text-sm
                  text-white
                  outline-none
                  focus:border-violet-500
                  sm:max-w-sm
                "
              />
            </div>
          </div>

          <div className="
            mt-4
            grid
            gap-3
          ">
            {filteredCards.length === 0 && (
              <div className="
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-950
                p-5
                text-sm
                text-zinc-400
              ">
                No encontré cartas con esa búsqueda.
              </div>
            )}

            {filteredCards.slice().reverse().map(card => (
              <div
                key={card.id}
                className="
                  rounded-2xl
                  border
                  border-zinc-800
                  bg-zinc-950
                  p-4
                "
              >
                <div className="
                  flex
                  flex-col
                  gap-4
                  sm:flex-row
                  sm:items-start
                  sm:justify-between
                ">
                  <div className="
                    min-w-0
                    flex-1
                  ">
                    <p className="
                      text-sm
                      font-black
                      text-white
                    ">
                      {card.front}
                    </p>

                    <p className="
                      mt-2
                      text-sm
                      leading-relaxed
                      text-zinc-400
                    ">
                      {card.back}
                    </p>
                  </div>

                  <div className="
                    flex
                    shrink-0
                    flex-wrap
                    gap-2
                    sm:justify-end
                  ">
                    <button
                      type="button"
                      onClick={() => startEdit(card)}
                      className="
                        rounded-2xl
                        border
                        border-violet-500/30
                        bg-violet-500/10
                        px-4
                        py-2
                        text-xs
                        font-black
                        text-violet-200
                        hover:bg-violet-500/20
                      "
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => removeCard(card.id)}
                      className="
                        rounded-2xl
                        border
                        border-red-500/30
                        bg-red-500/10
                        px-4
                        py-2
                        text-xs
                        font-black
                        text-red-200
                        hover:bg-red-500/20
                      "
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
