import data from "./custom-pages.json"

import type { CustomPage } from "./customPageSchema"

export const customPages = data as CustomPage[]

export type { CustomPage, CustomPageBlock, CustomPageDestination } from "./customPageSchema"
