import type {IEvent} from "../event.spec"
import {ready} from "./ready"
import {error} from "./error"

/**
 * La liste des événements Discord à gérer
 */
export const events: IEvent[] = [ready, error]

export * from "./error"
export * from "./ready"
