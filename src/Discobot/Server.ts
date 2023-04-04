import {z} from "zod"
import type {Guild} from "discord.js"
import type {IResult} from "../utils/Result.spec"
import Result from "../utils/Result"
import type {IOpenAI} from "../OpenAI.spec"
import OpenAI from "../OpenAI"
import type {TJSONObject} from "../utils/JSON.spec"
import type {TConfig as TUserConfig, IUser} from "./User.spec"
import User from "./User"
import type {TConfig, IServer} from "./Server.spec"

export default class Server implements IServer {
	static readonly configSchema = z.object({
		id: z.string().nonempty(),
		users: z.array(User.configSchema),
	})

	private constructor(
		private readonly _id: string,
		private readonly _users: Map<string, IUser>,
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
		const users: TJSONObject[] = []
		for (const user of this._users.values()) {
			users.push(user.toJSON())
		}
		return {id: this._id, users}
	}

	openAI(userId: string, oai?: string | IOpenAI | false): IOpenAI | false {
		if (typeof oai !== "undefined") {
			if (oai) {
				this._users.set(userId, User.fromId(userId, oai))
			} else {
				this._users.delete(userId)
			}
		}
		return this._users.get(userId)?.openAI ?? false
	}

	static validateConfig(j: TJSONObject): j is TConfig {
		return Server.configSchema.safeParse(j).success
	}

	static create(cfg: TConfig): IServer {
		const users = new Map<string, IUser>()
		cfg.users.forEach((u: TUserConfig) => users.set(u.id, User.create(u)))
		return new Server(cfg.id, users)
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
