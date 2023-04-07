import {Events, GuildChannel, DMChannel} from "discord.js"
import type {IDiscobot} from "../../../Discobot.spec"
import type {IEvent} from "../Event.spec"
import Event from "../Event"

/**
 * Un channel a été modifié
 */
export const channelUpdate: IEvent = Event.fromConfig({
	name: Events.ChannelUpdate,
	once: true,
	execute: async (bot: IDiscobot, oldChannel: GuildChannel | DMChannel, newChannel: GuildChannel | DMChannel) => {},
})
