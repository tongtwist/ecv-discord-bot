import type {IEvent} from "./Event.spec"
import {ready} from "./events/ready"
import {error} from "./events/error"
import {channelCreate} from "./events/channelCreate"
import {channelDelete} from "./events/channelDelete"
import {channelUpdate} from "./events/channelUpdate"
import type {IDiscobot} from "../../Discobot.spec"
import type {IEventsManager} from "../EventsManager.spec"

export default class EventsManager implements IEventsManager {
	private static readonly _events: IEvent[] = [ready, error, channelCreate, channelDelete, channelUpdate]

	private _bot?: IDiscobot

	private constructor() {}

	init(bot: IDiscobot): void {
		this._bot = bot
		for (const event of EventsManager._events) {
			this._bot[event.once ? "once" : "on"](event.name, (...args: any[]) => event.execute(this._bot, ...args))
		}
	}

	static create(): IEventsManager {
		return new EventsManager()
	}
}
