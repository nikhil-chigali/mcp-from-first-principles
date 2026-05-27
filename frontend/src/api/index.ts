// Single import surface for the rest of the app.
// When the real backend client lands, swap USE_MOCK to false and add the import.

import { mockApi } from "./mock"
import type { Api } from "./types"

const USE_MOCK = true

export const api: Api = USE_MOCK ? mockApi : mockApi // TODO: realApi

export * from "./types"
