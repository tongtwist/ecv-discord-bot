import {Events} from "discord.js"
import type {IDiscobot} from "../../../Discobot.spec"
import type {IEvent} from "../Event.spec"
import Event from "../Event"

/**
 * Un événement de connection à Discord prête
 */
export const ready: IEvent = Event.fromConfig({
	name: Events.ClientReady,
	once: true,
	execute: async (bot: IDiscobot) => {
		await bot.redeployCommands()
		await bot.populateServers()
		bot.logWelcome()
	},
})
