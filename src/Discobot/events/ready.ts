import {Events} from "discord.js"
import type {TEvent} from "./event.spec"
import type {Discobot} from "../index"

export const ready: TEvent = {
	name: Events.ClientReady,
	once: true,
	execute: async (bot: Discobot) => {
		bot.welcome()
		if (bot.commandsToRedeploy.length > 0) {
			await bot.redeployCommands()
		}
	},
}
