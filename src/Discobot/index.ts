import {writeFile} from "fs/promises"
import {z} from "zod"
import {Client, GatewayIntentBits, Guild} from "discord.js"
import {log} from "../utils/log"
import {IResult, Result} from "@tongtwist/result-js"
import type {TJSONObject, TJSON} from "../utils/JSON.spec"
import type {IOpenAI} from "../OpenAI.spec"
import type {ICommandsManager} from "./CommandsManager.spec"
import CommandsManager from "./CommandsManager"
import type {IEventsManager} from "./EventsManager.spec"
import EventsManager from "./EventsManager"
import type {IServersManager} from "./ServersManager.spec"
import ServersManager from "./ServersManager"
import type {IUsersManager} from "./UsersManager.spec"
import UsersManager from "./UsersManager"
import type {IServer} from "./ServersManager/Server.spec"
import type {TConfig, IDiscobot} from "../Discobot.spec"

export default class Discobot extends Client implements IDiscobot {
	private static readonly _intents: GatewayIntentBits[] = [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessageTyping,
	]

	static readonly configSchema = z.object({
		token: z.string().min(1),
		inviteUrl: z.string().url(),
		clientId: z.string().min(1),
		commands: CommandsManager.configSchema,
		servers: ServersManager.configSchema,
		users: UsersManager.configSchema,
	})

	private static validateJSON(j: TJSON): j is TConfig {
		return Discobot.configSchema.safeParse(j).success
	}

	private static create(cfg: TConfig, path: string): IDiscobot {
		const serversManager = ServersManager.create(cfg.servers)
		const usersManager = UsersManager.create(cfg.users)
		const commandsManager = CommandsManager.create(cfg.commands)
		const eventsManager = EventsManager.create()
		return new Discobot(
			cfg.token,
			cfg.clientId,
			commandsManager,
			eventsManager,
			cfg.inviteUrl,
			serversManager,
			usersManager,
			path,
		)
	}

	static async fromConfig(path: string): Promise<IResult<IDiscobot>> {
		let j: TJSON
		try {
			j = await require(path)
		} catch (e) {
			return Result.fail(e as Error)
		}
		return Discobot.validateJSON(j)
			? Result.success<IDiscobot>(Discobot.create(j, path))
			: Result.fail(`Invalid config: ${JSON.stringify(j)}`)
	}

	private constructor(
		private readonly _token: string,
		private readonly _clientId: string,
		private readonly _commandsManager: ICommandsManager,
		private readonly _eventsManager: IEventsManager,
		private readonly _inviteUrl: string,
		private readonly _serversManager: IServersManager,
		private readonly _usersManager: IUsersManager,
		private readonly _configPath: string,
	) {
		super({intents: Discobot._intents})
	}

	get clientId() {
		return this._clientId
	}

	private _configToJSON(): TJSONObject {
		return {
			token: this._token,
			inviteUrl: this._inviteUrl,
			clientId: this._clientId,
			commands: this._commandsManager.toJSON(),
			servers: this._serversManager.toJSON(),
			users: this._usersManager.toJSON(),
		}
	}

	getToken() {
		return this._token
	}

	redeployCommands(): Promise<boolean> {
		return this._commandsManager.redeploy(this)
	}

	async saveConfig(): Promise<void> {
		// Crée un objet JSON à partir de la configuration actuelle
		const config = this._configToJSON()
		// Enregistre la nouvelle configuration dans le fichier désigné par this._configPath
		await writeFile(this._configPath, JSON.stringify(config, null, 4))
	}

	async populateServers(): Promise<void> {
		const existingServers: Record<string, Guild> = {}
		for (const [serverId, guild] of this.guilds.cache) {
			existingServers[serverId] = guild
		}
	}

	logWelcome() {
		log("Here I am!")
		log(`Do not forget to invite me on your prefered server using this URL: ${this._inviteUrl}`)
	}

	async start(): Promise<void> {
		// Charge et gère les commandes
		await this._commandsManager.init(this)
		// Charge et gère les évènements
		this._eventsManager.init(this)
		// Connexion
		await super.login(this._token)
	}

	getOpenAI(userId: string, serverId?: string | undefined): false | IOpenAI {
		let res: IOpenAI | false = false
		if (serverId) {
			res = this._serversManager.get(serverId)?.setupOpenAI(userId) ?? false
		} else {
			res = this._usersManager.get(userId)?.openAI ?? false
		}
		return res
	}

	async setOpenAI(userId: string, openAI: string | false, s?: string | Guild): Promise<false | IOpenAI> {
		if (!s) {
			if (openAI === false) {
				this._usersManager.delete(userId)
				return false
			} else {
				const [user, updated] = this._usersManager.getOrCreate({id: userId, openAI})
				if (updated) {
					await this.saveConfig()
				}
				return user.openAI
			}
		}
		const server = await this.getOrCreateServer(s)
		const res = server.setupOpenAI(userId, openAI)
		await this.saveConfig()
		return res
	}

	async getOrCreateServer(s: string | Guild): Promise<IServer> {
		return this._serversManager.getOrCreate(s)
	}
}
