import {z} from "zod"
import type {User as DiscordUser} from "discord.js"
import type {TJSONObject} from "../../utils/JSON.spec"
import type {IOpenAI} from "../../OpenAI.spec"
import OpenAI from "../../OpenAI"
import type {IThread} from "../ThreadsManager/Thread.spec"
import Thread from "../ThreadsManager/Thread"
import type {IThreadsManager} from "../ThreadsManager.spec"
import ThreadsManager from "../ThreadsManager"
import type {TConfig, IUser} from "./User.spec"

export default class User implements IUser {
	static readonly configSchema = z.object({
		id: z.string().nonempty(),
		openAI: z.string().nonempty(),
	})

	static create(cfg: TConfig): IUser {
		return new User(cfg.id, OpenAI.fromKey(cfg.openAI))
	}

	static fromId(id: string, oai: string | IOpenAI, discordUser?: DiscordUser): IUser {
		return new User(id, typeof oai === "string" ? OpenAI.fromKey(oai) : oai, discordUser)
	}

	static fromDiscordUser(user: DiscordUser, oai: string | IOpenAI): IUser {
		return new User(user.id, typeof oai === "string" ? OpenAI.fromKey(oai) : oai, user)
	}

	private _threadsManager: IThreadsManager

	private constructor(
		private readonly _id: string,
		private readonly _openAI: IOpenAI,
		private _discordUser?: DiscordUser,
	) {
		this._threadsManager = ThreadsManager.create()
	}

	get id() {
		return this._id
	}
	get name() {
		return this._discordUser?.username
	}
	get openAI() {
		return this._openAI
	}

	toJSON(): TJSONObject {
		return {id: this._id, openAI: this._openAI.key}
	}

	setDiscordUser(user: DiscordUser): boolean {
		const res = user.id === this._id
		if (res) {
			this._discordUser = user
		}
		return res
	}

	getThread(id: string): IThread | undefined {
		return this._threadsManager.get(id)
	}

	setThread(id: string, thread?: IThread | undefined): IThread | undefined {
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
