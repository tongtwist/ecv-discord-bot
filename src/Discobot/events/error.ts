import {Events} from "discord.js"
import type {TEvent} from "./event.spec"
import {log} from "../../log"

export const error: TEvent = {
	name: Events.Error,
	once: false,
	execute: async (...args: any[]) => log(`Error: ${args.join(" ")}`),
}
