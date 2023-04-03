import type {TEvent} from "./event.spec"
import {ready} from "./ready"
import {error} from "./error"

export const events: TEvent[] = [ready, error]
