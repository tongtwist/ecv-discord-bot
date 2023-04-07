import {Events} from "discord.js"
import type {IEvent} from "../Event.spec"
import Event from "../Event"
import {log} from "../../../utils/log"

/**
 * Un événement d'erreur Discord à gérer
 */
export const error: IEvent = Event.fromConfig({
	name: Events.Error,
	execute: async (...args: any[]) => log(`Error: ${args.join(" ")}`),
})
