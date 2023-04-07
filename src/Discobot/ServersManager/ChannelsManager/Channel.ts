import {z} from "zod"
import {GuildChannel, DMChannel, ChannelType} from "discord.js"
import type {TJSONObject, TJSON} from "../../../utils/JSON.spec"
import {IOpenAI} from "../../../OpenAI.spec"
import OpenAI from "../../../OpenAI"
import type {IThread} from "../../ThreadsManager/Thread.spec"
import Thread from "../../ThreadsManager/Thread"
import type {IThreadsManager} from "../../ThreadsManager.spec"
import ThreadsManager from "../../ThreadsManager"
import type {TConfig, IChannel} from "./Channel.spec"

export default class Channel implements IChannel {
	static readonly configSchema = z.object({
		id: z.string().min(1),
		openai: z.string().min(1).optional(),
	})

	static create(cfg: TConfig): IChannel {
		let openai: IOpenAI | undefined
		if (cfg.openai) {
			openai = OpenAI.fromKey(cfg.openai)
		}
		return new Channel(cfg.id, openai)
	}

	static fromDiscordChannel(channel: GuildChannel | DMChannel, oai?: IOpenAI | string): IChannel {
		let openAI: IOpenAI | undefined
		if (oai) {
			openAI = typeof oai === "string" ? OpenAI.fromKey(oai) : oai
		}
		return new Channel(channel.id, openAI, channel)
	}

	private _threadsManager: IThreadsManager

	private constructor(
		private readonly _id: string,
		private _openai?: IOpenAI,
		private _channel?: GuildChannel | DMChannel,
	) {
		this._threadsManager = ThreadsManager.create()
	}

	get id() {
		return this._id
	}
	get type() {
		return this._channel?.type
	}
	get name() {
		if (this._channel?.type !== ChannelType.DM) {
			return this._channel?.name
		}
	}
	get channel() {
		return this._channel
	}
	set channel(newChannel: GuildChannel | DMChannel | undefined) {
		if (typeof newChannel === "undefined") {
			this._channel = undefined
		} else if (newChannel.id === this._id) {
			this._channel = newChannel
		}
	}
	get openAI() {
		return this._openai
	}
	set openAI(newOpenAI: IOpenAI | undefined) {
		this._openai = newOpenAI
	}

	toJSON(): TJSON {
		const ret: TJSONObject = {id: this._id}
		if (this._openai) {
			ret.openai = this._openai.key
		}
		return ret
	}

	getThread(id: string): IThread | undefined {
		return this._threadsManager.get(id)
	}

	setThread(id: string, thread?: IThread): IThread | undefined {
		if (typeof thread === "undefined") {
			this._threadsManager.delete(id)
		} else {
			this._threadsManager.set(id, thread)
		}
		return this._threadsManager.get(id)
	}

	getOrCreate(id: string): IThread {
		let thread = this._threadsManager.get(id)
		if (!thread) {
			thread = Thread.create(id)
			this._threadsManager.set(id, thread)
		}
		return thread
	}
}
