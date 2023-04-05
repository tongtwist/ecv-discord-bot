import {writeFile} from "fs/promises"
import {Client, Events, GatewayIntentBits, Guild} from "discord.js"
import {log} from "../utils/log"
import {Result} from "@tongtwist/result-js"
import type {TJSONObject} from "../utils/JSON.spec"
import type {IOpenAI} from "../OpenAI.spec"
import type {TConfig as TUserConfig, IUser} from "./User.spec"
import User from "./User"
import type {TConfig as TServerConfig, IServer} from "./Server.spec"
import Server from "./Server"
import type {ICommands} from "./Commands.spec"
import Commands from "./Commands"
import type {IDiscobot} from "../Discobot.spec"

export default class Discobot extends Client implements IDiscobot {
	private constructor(
		private readonly _token: string,
		private readonly _clientId: string,
		private readonly _commands: ICommands,
		private readonly _inviteUrl: string,
		private readonly _servers: Map<string, IServer>,
		private readonly _users: Map<string, IUser>,
		private readonly _configPath: string,
	) {
		super({intents: [GatewayIntentBits.Guilds]})
	}

	get clientId() {
		return this._clientId
	}

	private _configToJSON(): TJSONObject {
		// Crée l'objet de stockage des serveurs
		const servers: TJSONObject[] = []
		for (const [serverId, server] of this._servers) {
			servers.push(server.toJSON())
		}
		// Crée l'objet de stockage des users
		const users: TJSONObject[] = []
		for (const [userId, user] of this._users) {
			users.push(user.toJSON())
		}
		// Crée le nouvel objet de configuration
		return {
			token: this._token,
			inviteUrl: this._inviteUrl,
			clientId: this._clientId,
			commands: this._commands.toJSON(),
			servers,
			users,
		}
	}

	getToken() {
		return this._token
	}

	redeployCommands(): Promise<boolean> {
		return this._commands.redeploy(this)
	}

	async saveConfig(): Promise<void> {
		// Crée un objet JSON à partir de la configuration actuelle
		const config = this._configToJSON()
		// Enregistre la nouvelle configuration dans le fichier désigné par this._configPath
		await writeFile(this._configPath, JSON.stringify(config, null, 4))
	}

	private async _handleCommands(): Promise<void> {
		this.on(Events.InteractionCreate, this._commands.handle.bind(this._commands))
	}

	private async _loadAndHandleEvents(): Promise<void> {
		// Charge les évènements à gérer
		const {events} = await import("./events")
		// Branche les handlers d'évènements sur les évènements
		for (const event of events) {
			this[event.once ? "once" : "on"](event.name, (...args: any[]) => event.execute(this, ...args))
		}
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
		// Charge les commandes
		await this._commands.load()
		// Gère les commandes
		await this._handleCommands()
		// Charge et gère les évènements
		await this._loadAndHandleEvents()
		// Connexion
		await super.login(this._token)
	}

	getOpenAI(userId: string, serverId?: string | undefined): false | IOpenAI {
		let res: IOpenAI | false = false
		if (serverId) {
			res = this._servers.get(serverId)?.openAI(userId) ?? false
		} else {
			res = this._users.get(userId)?.openAI ?? false
		}
		return res
	}

	async setOpenAI(userId: string, openAI: string | false | IOpenAI, s?: string | Guild): Promise<false | IOpenAI> {
		if (!s) {
			if (openAI === false) {
				if (this._users.has(userId)) {
					this._users.delete(userId)
				}
				return false
			} else {
				const newKey = typeof openAI === "string" ? openAI : openAI.key
				const user: IUser | undefined = this._users.get(userId)
				if (!user || user.openAI.key !== newKey) {
					this._users.set(
						userId,
						User.create({id: userId, openAI: typeof openAI === "string" ? openAI : newKey}),
					)
					await this.saveConfig()
				}
				return this._users.get(userId)!.openAI
			}
		}
		const server = await this.getOrCreateServer(s)
		const res = server.openAI(userId, openAI)
		await this.saveConfig()
		return res
	}

	async getOrCreateServer(s: string | Guild): Promise<IServer> {
		const serverId = typeof s === "string" ? s : s.id
		if (this._servers.has(serverId)) {
			return this._servers.get(serverId)!
		}
		const server = typeof s === "string" ? Server.create({id: serverId, users: []}) : Server.fromGuild(s)
		this._servers.set(serverId, server)
		await this.saveConfig()
		return server
	}

	static async fromConfig(path: string): Promise<IDiscobot> {
		const cfg = await require(path)
		const users: Map<string, IUser> = new Map()
		cfg.users.forEach((userConfig: TUserConfig) => {
			const resUser = User.fromJSON(userConfig)
			if (Result.isSuccess(resUser)) {
				users.set(userConfig.id, resUser.value)
			}
		})
		const srvs: Map<string, IServer> = new Map()
		cfg.servers.forEach((serverConfig: TServerConfig) => {
			const resSrv = Server.fromJSON(serverConfig)
			if (Result.isSuccess(resSrv)) {
				srvs.set(serverConfig.id, resSrv.value)
			}
		})
		const commands = Commands.create(cfg.commands)
		return new Discobot(cfg.token, cfg.clientId, commands, cfg.inviteUrl, srvs, users, path)
	}
}

export type {TCreationProperties as TCommandCreationProperties, ICommand} from "./Command.spec"
export type {TCreationProperties as TEventCreationProperties, IEvent} from "./event.spec"
export type {TConfig as TUserConfig, IUser} from "./User.spec"
export type {TConfig as TServerConfig, IServer} from "./Server.spec"
export type {TConfig as TCommandsConfig, ICommands} from "./Commands.spec"
export * from "./Event"
export * from "./Command"
export * from "./User"
export * from "./Server"
export * from "./Commands"
export * from "./events"
export * from "./Commands"
