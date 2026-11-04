import { readFileSync } from "node:fs"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { bumpAppVersion, resolveAppVersion, validAppVersion, validChangelog } from "./model"
import { changelogData, currentAppVersion } from "./index"
import ChangelogScreen from "@/components/ChangelogScreen"

describe("editable public application version", () => {
  it("accepts a release number rather than confusing it with the JSON schema version", () => {
    for (const value of ["0.10.0", "0.10.12", "1.0.0", "12.25.100"]) expect(validAppVersion(value)).toBe(true)
    for (const value of ["", "v0.10.1", "0.10", "0.10.1.2", "01.2.3", "-1.2.3", "1.2.x", "<b>1.2.3</b>", 1]) expect(validAppVersion(value)).toBe(false)
    expect(validChangelog({ ...changelogData, appVersion: "1.2.3" })).toBe(true)
    expect(validChangelog({ ...changelogData, appVersion: "1.2" })).toBe(false)
    expect(changelogData.version).toBe(1)
  })
  it("offers patch/minor/major suggestions without changing a version automatically", () => {
    expect(bumpAppVersion("0.10.0", "patch")).toBe("0.10.1")
    expect(bumpAppVersion("0.10.9", "patch")).toBe("0.10.10")
    expect(bumpAppVersion("0.10.9", "minor")).toBe("0.11.0")
    expect(bumpAppVersion("0.10.9", "major")).toBe("1.0.0")
    expect(bumpAppVersion("", "patch")).toBeNull()
    expect(bumpAppVersion("999999.0.0", "major")).toBeNull()
  })
  it("reads fresh metadata so isolated previews show the unsaved release too", () => {
    const original = changelogData.appVersion
    try {
      changelogData.appVersion = "9.8.7"
      expect(currentAppVersion()).toBe("9.8.7")
      const html = renderToStaticMarkup(<ChangelogScreen onBack={() => {}} onMainMenu={() => {}}/>)
      expect(html).toContain("v9.8.7")
      expect(html.slice(0, html.indexOf("</header>"))).not.toContain("v0.10.0")
      changelogData.appVersion = "9.8.8"
      expect(currentAppVersion()).toBe("9.8.8")
    } finally { changelogData.appVersion = original }
  })
  it("supports old editable backups while keeping a safe display fallback", () => {
    const { appVersion: _oldVersion, ...legacy } = changelogData
    expect(validChangelog(legacy)).toBe(true)
    expect(resolveAppVersion(undefined, "0.10.0")).toBe("0.10.0")
    expect(resolveAppVersion("invalid", "0.10.0")).toBe("0.10.0")
    expect(resolveAppVersion("1.2.3", "0.10.0")).toBe("1.2.3")
  })
  it("uses that same editable value in both existing app labels", () => {
    const app = readFileSync(new URL("../../App.tsx", import.meta.url), "utf8")
    expect(app).not.toContain("packageJson.version")
    expect(app.match(/v\{currentAppVersion\(\)\}/g)).toHaveLength(2)
    const preview = readFileSync(new URL("../../builder/draft-preview-entry.tsx", import.meta.url), "utf8")
    expect(preview).toContain('Object.assign((await import("../content/changelog")).changelogData, files.changelog)')
  })
})
