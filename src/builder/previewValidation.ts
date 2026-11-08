import { validateStudio } from "../content/studio/schema"
import { validateMixedContent } from "../content/mixedExams/model"
import type { ProjectSnapshot } from "./projectHistory"

/** A draft may be incomplete while typing, but must have valid questions before
 * running it. Otherwise results/retries cannot reconstruct a usable session. */
export function validatePreviewContent(project: ProjectSnapshot): string[] {
  return [
    ...validateStudio(project.files.library),
    ...validateMixedContent(project.files.mixed ?? { version: 1, exams: [] }),
  ]
}
