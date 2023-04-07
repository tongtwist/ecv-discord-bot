import {Events, GuildChannel} from "discord.js"
import type {IDiscobot} from "../../../Discobot.spec"
import type {IEvent} from "../Event.spec"
import Event from "../Event"

/**
 * Un nouvel channel a été créé
 */
export const channelCreate: IEvent = Event.fromConfig({
	name: Events.ChannelCreate,
	once: true,
	execute: async (bot: IDiscobot, channel: GuildChannel) => {},
})
