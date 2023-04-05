import {z} from "zod"
import type {User as DiscordUser} from "discord.js"
import {IResult, Result} from "@tongtwist/result-js"
import type {TJSONObject} from "../utils/JSON.spec"
import type {IOpenAI} from "../OpenAI.spec"
import OpenAI from "../OpenAI"
import type {TConfig, IUser} from "./User.spec"

export default class User implements IUser {
	static readonly configSchema = z.object({
		id: z.string().nonempty(),
		openAI: z.string().nonempty(),
	})

	private constructor(
		private readonly _id: string,
		private readonly _openAI: IOpenAI,
		private _discordUser?: DiscordUser,
	) {}

	get id() {
		return this._id
	}
	get name() {
		return this._discordUser?.username
	}
	get openAI() {
		return this._openAI
	}

	setDiscordUser(user: DiscordUser): boolean {
		const res = user.id === this._id
		if (res) {
			this._discordUser = user
		}
		return res
	}

	toJSON(): TJSONObject {
		return {id: this._id, openAI: this._openAI.key}
	}

	static validateConfig(cfg: TJSONObject): cfg is TConfig {
		return User.configSchema.safeParse(cfg).success
	}

	static create(cfg: TConfig): IUser {
		return new User(cfg.id, OpenAI.fromKey(cfg.openAI))
	}

	static fromJSON(j: TJSONObject): IResult<IUser> {
		return User.validateConfig(j)
			? Result.success<IUser>(User.create(j))
			: Result.fail<IUser>(`Invalid config: ${JSON.stringify(j)}`)
	}

	static fromId(id: string, oai: string | IOpenAI, discordUser?: DiscordUser): IUser {
		return new User(id, typeof oai === "string" ? OpenAI.fromKey(oai) : oai, discordUser)
	}

	static fromDiscordUser(user: DiscordUser, oai: string | IOpenAI): IUser {
		return new User(user.id, typeof oai === "string" ? OpenAI.fromKey(oai) : oai, user)
	}
}
