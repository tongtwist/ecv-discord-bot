import {z} from "zod"
import type {Guild} from "discord.js"
import type {IResult} from "../utils/Result.spec"
import Result from "../utils/Result"
import type {IOpenAI} from "../OpenAI.spec"
import OpenAI from "../OpenAI"
import type {TJSONObject} from "../utils/JSON.spec"
import type {TConfig, IServer} from "./Server.spec"

export default class Server implements IServer {
	static readonly configSchema = z.object({
		id: z.string().nonempty(),
		openAIAPIKeys: z.record(z.string().nonempty()),
	})

	private constructor(
		private readonly _id: string,
		private readonly _openAIs: Map<string, IOpenAI>,
		private _guild?: Guild,
	) {}

	get id() {
		return this._id
	}
	get name() {
		return this._guild?.name
	}
	get available() {
		return this._guild?.available ?? false
	}
	get guild() {
		return this._guild
	}
	set guild(v: Guild | undefined) {
		this._guild = v
	}

	toJSON(): TJSONObject {
		const openAIAPIKeys: TJSONObject = {}
		for (const [userId, openAI] of this._openAIs) {
			openAIAPIKeys[userId] = openAI.key
		}
		return {id: this._id, openAIAPIKeys}
	}

	openAI(userId: string, oai?: string | IOpenAI | false): IOpenAI | false {
		if (typeof oai !== "undefined") {
			if (oai) {
				this._openAIs.set(userId, typeof oai === "string" ? OpenAI.fromKey(oai) : oai)
			} else {
				this._openAIs.delete(userId)
			}
		}
		return this._openAIs.get(userId) ?? false
	}

	static validateConfig(j: TJSONObject): j is TConfig {
		return Server.configSchema.safeParse(j).success
	}

	static create(cfg: TConfig): IServer {
		const openAIs = new Map<string, IOpenAI>()
		for (const userId in cfg.openAIAPIKeys) {
			openAIs.set(userId, OpenAI.fromKey(cfg.openAIAPIKeys[userId]))
		}
		return new Server(cfg.id, openAIs)
	}

	static fromJSON(j: TJSONObject): IResult<IServer> {
		return Server.validateConfig(j)
			? Result.success<IServer>(Server.create(j))
			: Result.fail<IServer>(`Invalid config: ${JSON.stringify(j)}`)
	}

	static fromGuild(guild: Guild): IServer {
		return new Server(guild.id, new Map(), guild)
	}
}
