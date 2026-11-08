import React, { useEffect } from "react"
import ReactDOM from "react-dom/client"
import { memoryStorage } from "./previewIsolation"
import type { ProjectSnapshot } from "./projectHistory"
import "../index.css"

async function start(project: ProjectSnapshot) {
  Object.defineProperty(window, "localStorage", { value: memoryStorage() })
  Object.defineProperty(window, "sessionStorage", { value: memoryStorage() })
  const [catalog, home, decks, pages, written, org, overrides, theme] = await Promise.all([
    import("../content/studio/catalog"), import("../content/appBuilder/index"), import("../content/appBuilder/flashcardSubjects"), import("../content/appBuilder/customPages"), import("../content/openQuizzes/index"), import("../content/appBuilder/organization"), import("../content/appBuilder/uiOverrides"), import("./theme")
  ])
  const files = project.files as Record<string, any>
  const banks = files.library.banks
  catalog.studioBanks.splice(0, catalog.studioBanks.length, ...banks)
  const originalIds = new Set(["histologia", "bioquimica", "microbiologia", "semiologia", "filosofia-de-hayek", "proceso-economico-i"])
  catalog.extraStudioBanks.splice(0, catalog.extraStudioBanks.length, ...banks.filter(b => b.kind === "course" && !b.archived && b.enabled !== false && !originalIds.has(b.id)))
  Object.assign(home.mainMenuContent, files.home.mainMenu)
  Object.assign(home.quizMenuContent, files.home.quizMenu)
  home.homeContent.subjects.splice(0, home.homeContent.subjects.length, ...files.home.subjects)
  home.homeSubjects.splice(0, home.homeSubjects.length, ...files.home.subjects.filter(s => !s.hidden && catalog.getStudyBank(s.destination)?.enabled !== false))
  decks.flashcardSubjectBlocks.splice(0, decks.flashcardSubjectBlocks.length, ...files.decks.filter(s => !s.hidden && catalog.getStudyBank(s.destination)?.enabled !== false))
  pages.customPages.splice(0, pages.customPages.length, ...files.pages)
  written.openQuizDecks.splice(0, written.openQuizDecks.length, ...files.written.decks)
  written.openQuizClasses.splice(0, written.openQuizClasses.length, ...(files.written.classes || []))
  written.openQuizContent.classes = written.openQuizClasses
  for (const key of Object.keys(org.organization)) delete org.organization[key]
  Object.assign(org.organization, files.organization)
  if (files.changelog) Object.assign((await import("../content/changelog")).changelogData, files.changelog)
  if (files.mixed) Object.assign((await import("../content/mixedExams")).mixedContent, files.mixed)
  overrides.uiOverrides.splice(0, overrides.uiOverrides.length, ...files.overrides)
  const style = document.createElement("style"); style.textContent = theme.renderBuilderCss(files.theme); document.head.append(style)
  document.documentElement.classList.add("dark"); document.documentElement.dataset.odontomaApp = "true"
  const [{ default: App }, { default: UiOverrideApplier }, { default: AppearanceSettings }] = await Promise.all([import("../App"), import("../components/UiOverrideApplier"), import("../components/AppearanceSettings")])
  function Ready() { useEffect(() => { window.parent.postMessage({ type: "odontoma-draft-mounted" }, window.location.origin) }, []); return null }
  ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><UiOverrideApplier/><div id="odontoma-original-ui"><App/></div><AppearanceSettings showTrigger={false}/><Ready/></React.StrictMode>)
}
if (import.meta.env.DEV && window.parent !== window) {
  let started = false
  window.addEventListener("message", e => {
    if (started || e.origin !== window.location.origin || e.source !== window.parent || e.data?.type !== "odontoma-draft-project" || e.data.project?.app !== "Odontoma Project") return
    started = true
    void start(e.data.project).catch(error => { document.getElementById("root")!.textContent = "No se pudo cargar el borrador: " + String(error) })
  })
  window.parent.postMessage({ type: "odontoma-draft-ready" }, window.location.origin)
} else document.getElementById("root")!.textContent = "Esta vista solo está disponible dentro del builder local."
