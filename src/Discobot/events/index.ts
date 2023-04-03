import type {IEvent} from "../event.spec"
import {ready} from "./ready"
import {error} from "./error"

export const events: IEvent[] = [ready, error]
