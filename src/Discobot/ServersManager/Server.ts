import {z} from "zod"
import type {Guild} from "discord.js"
import type {IOpenAI} from "../../OpenAI.spec"
import type {TJSONObject} from "../../utils/JSON.spec"
import type {IChannelsManager} from "./ChannelsManager.spec"
import ChannelsManager from "./ChannelsManager"
import type {IUsersManager} from "../UsersManager.spec"
import UsersManager from "../UsersManager"
import type {TConfig, IServer} from "./Server.spec"

export default class Server implements IServer {
	static readonly configSchema = z.object({
		id: z.string().nonempty(),
		channels: ChannelsManager.configSchema,
		users: UsersManager.configSchema,
	})

	static create(cfg: TConfig): IServer {
		const channelsManager = ChannelsManager.create(cfg.channels)
		const usersManager = UsersManager.create(cfg.users)
		return new Server(cfg.id, channelsManager, usersManager)
	}

	static fromGuild(guild: Guild): IServer {
		const channelsManager = ChannelsManager.create([])
		const usersManager = UsersManager.create([])
		return new Server(guild.id, channelsManager, usersManager, guild)
	}

	private constructor(
		private readonly _id: string,
		private readonly _channelsManager: IChannelsManager,
		private readonly _usersManager: IUsersManager,
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
		return {
			id: this._id,
			channels: this._channelsManager.toJSON(),
			users: this._usersManager.toJSON(),
		}
	}

	setupOpenAI(id: string, openAI?: string | false): IOpenAI | false {
		if (typeof openAI !== "undefined") {
			if (openAI) {
				this._usersManager.set({id, openAI})
			} else {
				this._usersManager.delete(id)
			}
		}
		return this._usersManager.get(id)?.openAI ?? false
	}
}
