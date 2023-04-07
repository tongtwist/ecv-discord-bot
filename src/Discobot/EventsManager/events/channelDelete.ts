import {Events, GuildChannel, DMChannel} from "discord.js"
import type {IDiscobot} from "../../../Discobot.spec"
import type {IEvent} from "../Event.spec"
import Event from "../Event"

/**
 * Un channel a été supprimé
 */
export const channelDelete: IEvent = Event.fromConfig({
	name: Events.ChannelDelete,
	once: true,
	execute: async (bot: IDiscobot, channel: GuildChannel | DMChannel) => {},
})
