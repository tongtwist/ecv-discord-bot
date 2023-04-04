import {Events} from "discord.js"
import type {IEvent} from "../event.spec"
import Event from "../Event"
import {log} from "../../utils/log"

export const error: IEvent = Event.fromConfig({
	name: Events.Error,
	execute: async (...args: any[]) => log(`Error: ${args.join(" ")}`),
})
