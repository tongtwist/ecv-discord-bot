import {Events} from "discord.js"
import type {IDiscobot} from "../../Discobot.spec"
import type {IEvent} from "../event.spec"
import Event from "../Event"

export const ready: IEvent = Event.fromConfig({
	name: Events.ClientReady,
	once: true,
	execute: async (bot: IDiscobot) => {
		bot.logWelcome()
		await bot.redeployCommands()
	},
})
