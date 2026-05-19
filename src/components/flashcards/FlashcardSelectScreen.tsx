import {
  useMemo,
  useState
} from "react"

import logoImage from "@/assets/logo.png"

import {
  isFsrsCardDue
} from "@/lib/fsrs"

import {
  loadFsrsStorage
} from "@/lib/flashcardStorage"

import {
  getDefaultFlashcards,
  getMyFlashcards,
  type FlashcardSource
} from "@/lib/flashcardDecks"

import {
  filterActiveFlashcards,
  loadSuspendedFlashcardIds
} from "@/lib/suspendedFlashcards"

type Props = {
  onBack: () => void
  onShowSuspended: () => void
  onSelectTopic: (
    topic: string,
    source: FlashcardSource
  ) => void
  onSelectSubtopic: (
    topic: string,
    subtopic: string,
    source: FlashcardSource
  ) => void
}

type BigGroup = {
  title: string
  description: string
  subtopics: string[]
}

type ChapterMenu = {
  chapter: string
  title: string
  groups: BigGroup[]
}

const CHAPTER_MENUS: ChapterMenu[] = [
  {
    chapter: "Capítulo 4",
    title: "Tejidos",
    groups: [
      {
        title: "Generalidades",
        description: "Concepto de tejido, clasificación y criterios generales.",
        subtopics: [
          "Fundamentos de los tejidos",
          "Clasificación de los tejidos",
          "Identificación de los tejidos"
        ]
      },
      {
        title: "Tejidos básicos",
        description: "Epitelial, conjuntivo, muscular y nervioso.",
        subtopics: [
          "Epitelio",
          "Tejido conjuntivo",
          "Tejido muscular",
          "Tejido nervioso"
        ]
      },
      {
        title: "Histogénesis y derivados",
        description: "Capas germinales, derivados embrionarios y teratomas.",
        subtopics: [
          "Histogénesis de los tejidos",
          "Derivados ectodérmicos",
          "Derivados mesodérmicos",
          "Derivados endodérmicos",
          "Teratomas"
        ]
      }
    ]
  },
  {
    chapter: "Capítulo 5",
    title: "Tejido epitelial",
    groups: [
      {
        title: "Generalidades",
        description: "Bases del epitelio, clasificación, funciones y polaridad.",
        subtopics: [
          "Fundamentos del tejido epitelial",
          "Tejido epitelioide",
          "Barrera epitelial",
          "Clasificación de los epitelios",
          "Epitelio seudoestratificado",
          "Urotelio",
          "Epitelios con nombres especiales",
          "Funciones epiteliales",
          "Polaridad celular",
          "Metaplasia epitelial",
          "Membranas mucosas y serosas"
        ]
      },
      {
        title: "Membrana apical",
        description: "Microvellosidades, estereocilios, cilios y ciliogénesis.",
        subtopics: [
          "Región apical",
          "Microvellosidades",
          "Estereocilios",
          "Cilios",
          "Cilios móviles",
          "Cuerpo basal",
          "Cilios primarios",
          "Cilios nodales",
          "Ciliogénesis",
          "Discinesia ciliar primaria"
        ]
      },
      {
        title: "Membrana lateral",
        description: "Complejos de unión, zónulas, desmosomas e interdigitaciones.",
        subtopics: [
          "Región lateral",
          "Complejo de unión",
          "Uniones ocluyentes",
          "Uniones adherentes",
          "Zónula adherente",
          "Zónuladherente",
          "Fascia adherente",
          "Desmosomas",
          "Uniones comunicantes",
          "Interdigitaciones laterales",
          "Patógenos y complejos de unión"
        ]
      },
      {
        title: "Membrana basal",
        description: "Lámina basal, colágeno IV, adhesiones focales y hemidesmosomas.",
        subtopics: [
          "Región basal",
          "Membrana basal",
          "Lámina basal",
          "Lámina reticular",
          "Colágeno tipo IV",
          "Otros colágenos de lámina basal",
          "Autoensamblado de lámina basal",
          "Funciones de la lámina basal",
          "Adhesiones focales",
          "Hemidesmosomas",
          "Pliegues basales"
        ]
      },
      {
        title: "Glándulas",
        description: "Glándulas exocrinas/endocrinas, secreción y renovación epitelial.",
        subtopics: [
          "Glándulas",
          "Glándulas exocrinas",
          "Glándulas endocrinas",
          "Señalización paracrina",
          "Señalización autocrina",
          "Mecanismos de secreción exocrina",
          "Secreción merocrina",
          "Secreción apocrina",
          "Secreción holocrina",
          "Glándulas unicelulares",
          "Glándulas multicelulares",
          "Clasificación de glándulas exocrinas",
          "Secreciones mucosas",
          "Secreciones serosas",
          "Glándulas mixtas",
          "Células mioepiteliales",
          "Renovación epitelial"
        ]
      }
    ]
  },
  {
    chapter: "Capítulo 6",
    title: "Tejido conjuntivo",
    groups: [
      {
        title: "Generalidades",
        description: "Concepto, clasificación, tejido embrionario y tejido conjuntivo adulto.",
        subtopics: [
          "Fundamentos del tejido conjuntivo",
          "Clasificación del tejido conjuntivo",
          "Tejido conjuntivo embrionario",
          "Mesénquima",
          "Tejido conjuntivo mucoso",
          "Tejido conjuntivo del adulto",
          "Tejido conjuntivo laxo",
          "Tejido conjuntivo denso irregular",
          "Tejido conjuntivo denso regular",
          "Tendones",
          "Ligamentos",
          "Aponeurosis",
          "Comparación laxo-denso",
          "Histología 101"
        ]
      },
      {
        title: "Fibras",
        description: "Colágenas, reticulares, elásticas y tipos de colágeno.",
        subtopics: [
          "Fibras del tejido conjuntivo",
          "Fibras de colágeno",
          "Fibrillas de colágeno",
          "Tipos de colágeno",
          "Colágenos fibrilares",
          "Colágenos FACIT",
          "Colágeno tipo IV",
          "Colágeno tipo VII",
          "Colágeno tipo XVII",
          "Colágeno tipo XVIII",
          "Biosíntesis del colágeno",
          "Degradación del colágeno",
          "Colagenopatías",
          "Fibras reticulares",
          "Fibras elásticas",
          "Material elástico",
          "Comparación de fibras"
        ]
      },
      {
        title: "Matriz extracelular",
        description: "Sustancia fundamental, GAG, proteoglucanos y glucoproteínas multiadhesivas.",
        subtopics: [
          "Matriz extracelular",
          "Sustancia fundamental",
          "Glucosaminoglucanos",
          "Proteoglucanos",
          "Agregados de proteoglucanos",
          "Glucoproteínas multiadhesivas",
          "Fibronectina",
          "Laminina",
          "Tenascina",
          "MEC y comunicación celular",
          "MEC y migración celular",
          "MEC y barrera",
          "Integración fibras-MEC"
        ]
      },
      {
        title: "Células",
        description: "Fibroblastos, macrófagos, mastocitos, adipocitos y células inmunes.",
        subtopics: [
          "Células del tejido conjuntivo",
          "Fibroblastos",
          "Miofibroblastos",
          "Macrófagos",
          "Sistema fagocítico mononuclear",
          "Mastocitos",
          "Basófilos",
          "Adipocitos",
          "Células madre adultas",
          "Pericitos",
          "Linfocitos",
          "Células plasmáticas",
          "Neutrófilos",
          "Eosinófilos",
          "Monocitos",
          "Integración células-MEC"
        ]
      },
      {
        title: "Inflamación y reparación",
        description: "Inflamación, cicatrización, fibrosis, edema y fotoenvejecimiento.",
        subtopics: [
          "Inflamación",
          "Reparación del tejido conjuntivo",
          "Cicatrización",
          "Fibrosis",
          "Fotoenvejecimiento",
          "Edema",
          "Identificación histológica",
          "Comparaciones clave"
        ]
      }
    ]
  }
]

function encodeSubtopicGroup(
  subtopics: string[]
) {
  return `__subtopics:${subtopics.join("||")}`
}

function formatDuePreview(dueDate: string) {

  const diffMinutes =
    Math.max(
      1,
      Math.ceil(
        (new Date(dueDate).getTime() - Date.now()) / 60000
      )
    )

  if (diffMinutes < 60) {
    return `en ${diffMinutes} min`
  }

  const diffHours =
    Math.ceil(diffMinutes / 60)

  if (diffHours < 24) {
    return `en ${diffHours} hora${diffHours === 1 ? "" : "s"}`
  }

  const diffDays =
    Math.ceil(diffHours / 24)

  if (diffDays < 30) {
    return `en ${diffDays} día${diffDays === 1 ? "" : "s"}`
  }

  const diffMonths =
    Math.ceil(diffDays / 30)

  return `en ${diffMonths} mes${diffMonths === 1 ? "" : "es"}`
}

function getNextDueDate(
  cardIds: string[],
  cardsProgress: Record<string, any>
) {

  const dates =
    cardIds
      .map(id => cardsProgress[id]?.dueDate)
      .filter(Boolean)
      .map(date => new Date(date).getTime())
      .filter(time => time > Date.now())
      .sort((a, b) => a - b)

  if (dates.length === 0) return null

  return new Date(dates[0]).toISOString()
}

function getDueCount(
  cards: any[],
  progress: Record<string, any>
) {
  return cards.filter(card =>
    isFsrsCardDue(
      card.id,
      progress
    )
  ).length
}

export default function FlashcardSelectScreen({
  onBack,
  onShowSuspended,
  onSelectTopic,
  onSelectSubtopic
}: Props) {

  const storage =
    useMemo(
      () => loadFsrsStorage(),
      []
    )

  const defaultCards =
    useMemo(
      () => filterActiveFlashcards(getDefaultFlashcards()),
      []
    )

  const myCards =
    useMemo(
      () => filterActiveFlashcards(getMyFlashcards()),
      []
    )

  const availableChapterMenus =
    useMemo(
      () =>
        CHAPTER_MENUS.filter(menu =>
          defaultCards.some(card => card.chapter === menu.chapter)
        ),
      [defaultCards]
    )

  const [selectedChapter, setSelectedChapter] =
    useState(
      availableChapterMenus[0]?.chapter || "Capítulo 5"
    )

  const currentMenu =
    availableChapterMenus.find(menu => menu.chapter === selectedChapter) ||
    availableChapterMenus[0]

  const totalReviews =
    storage.reviews.length

  const suspendedCount =
    loadSuspendedFlashcardIds().length

  const defaultDue =
    getDueCount(
      defaultCards,
      storage.cards
    )

  const myDue =
    getDueCount(
      myCards,
      storage.cards
    )

  const nextDefaultDue =
    getNextDueDate(
      defaultCards.map(card => card.id),
      storage.cards
    )

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
                  Flashcards FSRS
                </p>
              </div>

              <h1 className="
                text-3xl
                font-black
                tracking-tight
                sm:text-4xl
                lg:text-5xl
              ">
                Histología
              </h1>

              <p className="
                mt-3
                max-w-2xl
                text-sm
                leading-relaxed
                text-zinc-400
                sm:text-base
              ">
                Elegí un capítulo y repasá por bloques grandes.
              </p>
            </div>

            <div className="
              grid
              gap-3
              sm:grid-cols-4
            ">
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
                  Reviews
                </p>

                <p className="
                  mt-1
                  text-3xl
                  font-black
                  text-white
                ">
                  {totalReviews}
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
                  Pendientes
                </p>

                <p className="
                  mt-1
                  text-3xl
                  font-black
                  text-white
                ">
                  {defaultDue + myDue}
                </p>
              </div>

              <button
                type="button"
                onClick={onShowSuspended}
                className="
                  rounded-3xl
                  border
                  border-amber-500/30
                  bg-amber-500/10
                  px-5
                  py-4
                  text-left
                  hover:bg-amber-500/20
                "
              >
                <p className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-amber-300
                ">
                  Suspendidas
                </p>

                <p className="
                  mt-1
                  text-3xl
                  font-black
                  text-white
                ">
                  {suspendedCount}
                </p>

                <p className="
                  mt-2
                  text-xs
                  leading-relaxed
                  text-amber-100/80
                ">
                  Suspende cartas que creas que no te servirán para que no vuelvan a aparecer en tus repasos.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  onSelectTopic(
                    "__reviewed_due",
                    "default"
                  )
                }
                className="
                  rounded-3xl
                  border
                  border-sky-500/30
                  bg-sky-500/10
                  px-5
                  py-4
                  text-left
                  hover:bg-sky-500/20
                "
              >
                <p className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-sky-300
                ">
                  Due primero
                </p>

                <p className="
                  mt-1
                  text-3xl
                  font-black
                  text-white
                ">
                  Repasar
                </p>

                <p className="
                  mt-2
                  text-xs
                  leading-relaxed
                  text-sky-100/80
                ">
                  Terminá primero las cartas ya repasadas que vencieron antes de hacer nuevas.
                </p>
              </button>

            </div>
          </div>

          {defaultDue === 0 && nextDefaultDue && (
            <p className="
              mb-6
              rounded-2xl
              border
              border-emerald-500/20
              bg-emerald-500/10
              px-4
              py-3
              text-sm
              font-black
              text-emerald-300
            ">
              No hay pendientes ahora. Próximo review {formatDuePreview(nextDefaultDue)}.
            </p>
          )}

          <div className="
            grid
            gap-5
            lg:grid-cols-[280px_1fr]
          ">
            <aside className="
              rounded-[1.75rem]
              border
              border-zinc-800
              bg-zinc-950
              p-4
            ">
              <p className="
                mb-3
                text-xs
                font-black
                uppercase
                tracking-[0.2em]
                text-zinc-500
              ">
                Capítulos
              </p>

              <div className="
                grid
                gap-2
                sm:max-h-none
                lg:max-h-[68vh]
                lg:overflow-y-auto
              ">
                {availableChapterMenus.map(menu => {
                  const chapterCards =
                    defaultCards.filter(card =>
                      card.chapter === menu.chapter
                    )

                  const chapterDue =
                    getDueCount(
                      chapterCards,
                      storage.cards
                    )

                  const isSelected =
                    menu.chapter === currentMenu?.chapter

                  return (
                    <button
                      key={menu.chapter}
                      type="button"
                      onClick={() => setSelectedChapter(menu.chapter)}
                      className={`
                        rounded-2xl
                        border
                        px-4
                        py-4
                        text-left
                        transition-all

                        ${
                          isSelected
                            ? "border-violet-500/40 bg-violet-500/15"
                            : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                        }
                      `}
                    >
                      <p className="
                        text-xs
                        font-black
                        uppercase
                        tracking-[0.18em]
                        text-zinc-500
                      ">
                        {menu.chapter}
                      </p>

                      <p className="
                        mt-2
                        text-lg
                        font-black
                        text-white
                      ">
                        {menu.title}
                      </p>

                      <p className="
                        mt-2
                        text-sm
                        text-zinc-400
                      ">
                        {chapterDue}/{chapterCards.length} pendientes
                      </p>
                    </button>
                  )
                })}
              </div>
            </aside>

            <section className="
              rounded-[1.75rem]
              border
              border-zinc-800
              bg-zinc-950
              p-4
              lg:max-h-[68vh]
              lg:overflow-y-auto
            ">
              {currentMenu && (
                <>
                  <div className="
                    mb-4
                    flex
                    flex-col
                    gap-3
                    sm:flex-row
                    sm:items-end
                    sm:justify-between
                  ">
                    <div>
                      <p className="
                        text-xs
                        font-black
                        uppercase
                        tracking-[0.2em]
                        text-violet-300
                      ">
                        {currentMenu.chapter}
                      </p>

                      <h2 className="
                        mt-2
                        text-3xl
                        font-black
                        text-white
                      ">
                        {currentMenu.title}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onSelectTopic(
                          currentMenu.chapter,
                          "default"
                        )
                      }
                      className="
                        rounded-2xl
                        bg-violet-500/15
                        px-4
                        py-3
                        text-sm
                        font-black
                        text-violet-200
                        hover:bg-violet-500/25
                      "
                    >
                      Repasar todo el capítulo
                    </button>
                  </div>

                  <div className="
                    grid
                    gap-3
                  ">
                    {currentMenu.groups.map(group => {
                      const groupCards =
                        defaultCards.filter(card =>
                          card.chapter === currentMenu.chapter &&
                          group.subtopics.includes(card.subtopic)
                        )

                      const groupDue =
                        getDueCount(
                          groupCards,
                          storage.cards
                        )

                      return (
                        <button
                          key={group.title}
                          type="button"
                          disabled={groupCards.length === 0}
                          onClick={() =>
                            onSelectSubtopic(
                              currentMenu.chapter,
                              encodeSubtopicGroup(group.subtopics),
                              "default"
                            )
                          }
                          className={`
                            rounded-[1.5rem]
                            border
                            p-5
                            text-left
                            transition-all

                            ${
                              groupCards.length > 0
                                ? "border-zinc-800 bg-zinc-900 hover:border-violet-500/40 hover:bg-zinc-900/80"
                                : "cursor-not-allowed border-zinc-900 bg-zinc-950 opacity-50"
                            }
                          `}
                        >
                          <div className="
                            flex
                            items-start
                            justify-between
                            gap-4
                          ">
                            <div>
                              <h3 className="
                                text-2xl
                                font-black
                                text-white
                              ">
                                {group.title}
                              </h3>

                              <p className="
                                mt-2
                                text-sm
                                leading-relaxed
                                text-zinc-400
                              ">
                                {group.description}
                              </p>
                            </div>

                            <span className="
                              shrink-0
                              rounded-2xl
                              bg-black/30
                              px-3
                              py-2
                              text-sm
                              font-black
                              text-zinc-300
                            ">
                              {groupDue}/{groupCards.length}
                            </span>
                          </div>

                          <p className="
                            mt-4
                            text-xs
                            font-black
                            uppercase
                            tracking-[0.18em]
                            text-zinc-500
                          ">
                            {group.subtopics.length} subtemas incluidos
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  )
}
