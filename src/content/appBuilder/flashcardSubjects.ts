import data from "./flashcard-subjects.json"
import { getStudyBank } from "../studio/catalog"

import type { FlashcardSubjectBlock } from "./types"

export const flashcardSubjectBlocks: FlashcardSubjectBlock[] = (data as FlashcardSubjectBlock[]).filter(s => !s.hidden && getStudyBank(s.destination)?.enabled !== false)
