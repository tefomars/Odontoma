import { readFileSync } from "node:fs"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { parseGitLog, mergeCommitHistory } from "../../../scripts/changelog-history.mjs"
import { changelogCalendarDate, resolveChangelog, validChangelog, type ChangelogData, type ChangelogEntry } from "./model"
import { changelogData, changelogCommits } from "./index"
import { isCustomPageDestination, validateCustomPages } from "../appBuilder/customPageSchema"
import home from "../appBuilder/subjects.json"
import pages from "../appBuilder/custom-pages.json"
import ChangelogScreen from "@/components/ChangelogScreen"
import StudyMethodScreen from "@/components/StudyMethodScreen"

const automatic: ChangelogEntry = { id: `git-${"a".repeat(40)}`, date: "2026-11-04T13:00:00.000Z", title: "Exámenes nuevos", body: "Dos bancos nuevos." }
const blank = (): ChangelogData => ({ version: 1, title: "Cambios", description: "Novedades", entries: [] })

describe("public changelog and options menu", () => {
  it("parses multiline Git messages without author data or diff content", () => {
    const hash = "a".repeat(40)
    const output = `${hash}\0${automatic.date}\0Exámenes nuevos\0Dos bancos nuevos.\nCon explicaciones.\0\n`
    expect(parseGitLog(output)).toEqual([{ ...automatic, body: "Dos bancos nuevos.\nCon explicaciones." }])
    expect(parseGitLog("broken\0date\0title\0body\0")).toEqual([])
  })
  it("retains cached history on shallow/no-Git deployments and deduplicates rebuilds", () => {
    const env = { VERCEL_GIT_COMMIT_SHA: "b".repeat(40), VERCEL_GIT_COMMIT_MESSAGE: "Mejoras\n\nSe corrigió el menú." }
    const entries = mergeCommitHistory([automatic], [], env, "2026-11-05T13:00:00Z")
    expect(entries).toHaveLength(2)
    expect(entries[0]).toMatchObject({ title: "Mejoras", body: "Se corrigió el menú." })
    expect(mergeCommitHistory(entries, [], env, "2026-11-06T00:00:00Z")).toEqual(entries)
    expect(mergeCommitHistory([automatic], [], {})).toEqual([automatic])
  })
  it("retains owner edits and hidden entries when a commit is generated again", () => {
    const data = blank()
    data.entries = [{ ...automatic, title: "Título corregido", body: "Texto mío", hidden: true }]
    expect(resolveChangelog([automatic], data)).toEqual([])
    expect(resolveChangelog([automatic], data, true)).toEqual(data.entries)
    data.entries[0].hidden = false
    expect(resolveChangelog([automatic, automatic], data)).toEqual(data.entries)
  })
  it("orders manual notes and commits together without duplicate announcements", () => {
    const manual = { id: "manual-1", date: "2026-11-05", title: "Aviso", body: "" }
    expect(resolveChangelog([automatic], { ...blank(), entries: [manual] })).toEqual([manual, automatic])
    expect(resolveChangelog([], { ...blank(), entries: [manual] })).toEqual([manual])
  })
  it("validates notes before saving instead of accepting invalid or duplicate records", () => {
    expect(validChangelog(changelogData)).toBe(true)
    expect(validChangelog({ ...blank(), entries: [automatic] })).toBe(true)
    for (const patch of [{ title: " " }, { date: "not-a-date" }, { hidden: "yes" }, { body: null }]) expect(validChangelog({ ...blank(), entries: [{ ...automatic, ...patch }] })).toBe(false)
    expect(validChangelog({ ...blank(), entries: [automatic, automatic] })).toBe(false)
  })
  it("shows the same Guatemala calendar date in the editor and public feed", () => {
    expect(changelogCalendarDate("2026-11-03T02:00:00Z")).toBe("2026-11-02")
    expect(changelogCalendarDate("2026-11-03")).toBe("2026-11-03")
  })
  it("reuses a fully editable custom page and keeps the three destinations selectable", () => {
    expect(validateCustomPages(pages)).toBe(true)
    // Do not pin editable names/order: the owner's legitimate GUI edits must
    // not make the ordinary npm test / publish workflow fail.
    for (const page of pages) for (const block of page.blocks) if (block.destination) expect(isCustomPageDestination(block.destination)).toBe(true)
    expect(isCustomPageDestination("appearance")).toBe(true)
    expect(isCustomPageDestination("changelog")).toBe(true)
    const main = renderToStaticMarkup(<StudyMethodScreen onSelectQuizzes={() => {}} onSelectFlashcards={() => {}}/>)
    for (const card of home.mainMenu.cards) expect(main).toContain(card.id)
    expect(main).not.toContain("Abrir ajustes de apariencia")
  })
  it("renders public notes as escaped text and exposes direct builder targets", () => {
    const manual = { id: "manual-escape-test", date: "2026-11-05", title: "<script>unsafe</script>", body: "<img src=x onerror=unsafe>" }
    changelogData.entries.push(manual)
    try {
      const html = renderToStaticMarkup(<ChangelogScreen onBack={() => {}} onMainMenu={() => {}}/>)
      expect(html).toContain("&lt;script&gt;unsafe&lt;/script&gt;")
      expect(html).not.toContain("<script>unsafe")
      expect(html).toContain("manual-escape-test")
    } finally { changelogData.entries.pop() }
    expect(new Set(changelogCommits.map(entry => entry.id)).size).toBe(changelogCommits.length)
  })
  it("keeps appearance modal back separate from page back and mounts it in isolated preview", () => {
    const app = readFileSync(new URL("../../App.tsx", import.meta.url), "utf8")
    const back = app.slice(app.indexOf("function goBack()"), app.indexOf("function navigateToBuilderDestination"))
    expect(back.indexOf('dialog.oa-dialog[open]')).toBeLessThan(back.indexOf("builderReturn.current"))
    expect(back).toContain('destination === "changelog" ? showChangelog')
    expect(back).toContain("setShowChangelog(false)")
    const preview = readFileSync(new URL("../../builder/draft-preview-entry.tsx", import.meta.url), "utf8")
    expect(preview).toContain("files.changelog")
    expect(preview).toContain("<AppearanceSettings showTrigger={false}/>")
  })
})
