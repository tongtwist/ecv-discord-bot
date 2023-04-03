import {Events} from "discord.js"
import type {Discobot} from "../index"
import type {IEvent} from "../event.spec"
import Event from "../Event"

export const ready: IEvent = Event.fromConfig({
	name: Events.ClientReady,
	once: true,
	execute: async (bot: Discobot) => {
		bot.welcome()
		if (bot.commandsToRedeploy.length > 0) {
			await bot.redeployCommands()
		}
	},
})
