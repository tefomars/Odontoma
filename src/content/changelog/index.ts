import saved from "./data.json"
import generated from "./commits.json"
import { resolveAppVersion, resolveChangelog, type ChangelogData, type ChangelogEntry } from "./model"
import packageJson from "../../../package.json"

export const changelogData = saved as ChangelogData
export const changelogCommits = generated as ChangelogEntry[]
export function publishedChangelog() { return resolveChangelog(changelogCommits, changelogData) }
// Read on render, not once at module load: the isolated builder preview replaces
// changelogData before mounting the app and must show its unsaved version too.
export function currentAppVersion() { return resolveAppVersion(changelogData.appVersion, packageJson.version) }
