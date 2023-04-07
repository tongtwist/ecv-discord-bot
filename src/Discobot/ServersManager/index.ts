import {z} from "zod"
import type {Guild} from "discord.js"
import type {TJSON, TJSONObject} from "../../utils/JSON.spec"
import type {IServer} from "./Server.spec"
import Server from "./Server"
import type {TConfig, IServersManager} from "../ServersManager.spec"

export default class ServersManager implements IServersManager {
	static readonly configSchema = z.array(Server.configSchema)

	static create(cfg: TConfig): IServersManager {
		const servers: Map<string, IServer> = new Map()
		for (const serverConfig of cfg) {
			servers.set(serverConfig.id, Server.create(serverConfig))
		}
		return new ServersManager(servers)
	}

	private constructor(private readonly _servers: Map<string, IServer>) {}

	toJSON(): TJSON {
		const ret: TJSONObject[] = []
		for (const [serverId, server] of this._servers) {
			ret.push(server.toJSON())
		}
		return ret
	}

	get(id: string): IServer | undefined {
		return this._servers.get(id)
	}

	async getOrCreate(s: string | Guild): Promise<IServer> {
		const serverId = typeof s === "string" ? s : s.id
		if (this._servers.has(serverId)) {
			return this._servers.get(serverId)!
		}
		const server =
			typeof s === "string" ? Server.create({id: serverId, channels: [], users: []}) : Server.fromGuild(s)
		this._servers.set(serverId, server)
		return server
	}
}
