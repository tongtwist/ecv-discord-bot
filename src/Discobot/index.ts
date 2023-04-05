import {writeFile} from "fs/promises"
import {
	BaseInteraction,
	ChatInputCommandInteraction,
	Client,
	Collection,
	Events,
	GatewayIntentBits,
	REST,
	Routes,
	Guild,
} from "discord.js"
import {log} from "../utils/log"
import {Result} from "@tongtwist/result-js"
import type {TJSONObject} from "../utils/JSON.spec"
import type {ICommand} from "./command.spec"
import type {IOpenAI} from "../OpenAI.spec"
import type {TConfig as TUserConfig, IUser} from "./User.spec"
import User from "./User"
import type {TConfig as TServerConfig, IServer} from "./Server.spec"
import Server from "./Server"
import type {IDiscobot} from "../Discobot.spec"

export default class Discobot extends Client implements IDiscobot {
	private static readonly _minCommandDeploymentAge = 1000 * 60 * 60 * 24 // Global - Gestionnaire de redeploiement des commandes

	private _commands: Collection<string, ICommand> // Global
	private _commandsToRedeploy: ICommand[] // Global - Gestionnaire de redeploiement des commandes
	private _commandList: string[] // Global - Gestionnaire de redeploiement des commandes

	private constructor(
		private readonly _token: string, // Global
		private readonly _clientId: string, // Global
		private _lastICommandDeployment: number, // Global - Gestionnaire de redeploiement des commandes
		private _commandRevisions: {[name: string]: number}, // Global - Gestionnaire de redeploiement des commandes
		private readonly _inviteUrl: string, // Global
		private readonly _servers: Map<string, IServer>, // Global
		private readonly _users: Map<string, IUser>, // Global
		private readonly _configPath: string, // Global
	) {
		super({intents: [GatewayIntentBits.Guilds]})
		this._commands = new Collection()
		this._commandsToRedeploy = []
		this._commandList = []
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
			lasICommandDeployment: Date.now(),
			commandRevisions: this._commandRevisions,
			servers,
			users,
		}
	}

	private async _saveConfig(): Promise<void> {
		// Crée un objet JSON à partir de la configuration actuelle
		const config = this._configToJSON()
		// Enregistre la nouvelle configuration dans le fichier désigné par this._configPath
		await writeFile(this._configPath, JSON.stringify(config, null, 4))
	}

	private async _loadCommands(): Promise<void> {
		// Charge la liste des objets commands
		const {commands} = await import("./commands")
		// Initialise quelques variables de gestion des redéploiements
		const now = Date.now()
		const lastDeplAge = now - this._lastICommandDeployment
		const commandList: string[] = []
		const commandsThatShouldBeDeployed: ICommand[] = []
		// Enregistre les commandes dans le bot
		for (const command of commands) {
			this._commands.set(command.data.name, command)
			commandList.push(command.data.name)
			const shouldBeRedeployed =
				lastDeplAge > Discobot._minCommandDeploymentAge ||
				(this._commandRevisions[command.data.name] ?? 0) < command.revision
			if (shouldBeRedeployed) {
				commandsThatShouldBeDeployed.push(command)
			}
		}
		// Enregistre les listes dont on a besoin par ailleur
		this._commandsToRedeploy = commandsThatShouldBeDeployed
		this._commandList = commandList
	}

	private async _handleCommands(): Promise<void> {
		this.on(Events.InteractionCreate, async (interaction: BaseInteraction) => {
			if (interaction.isChatInputCommand()) {
				await this._executeChatInputCommandInteraction(interaction as ChatInputCommandInteraction)
			}
		})
	}

	private async _loadAndHandleEvents(): Promise<void> {
		// Charge les évènements à gérer
		const {events} = await import("./events")
		// Branche les handlers d'évènements sur les évènements
		for (const event of events) {
			this[event.once ? "once" : "on"](event.name, (...args: any[]) => event.execute(this, ...args))
		}
	}

	private async _executeChatInputCommandInteraction(interaction: ChatInputCommandInteraction): Promise<void> {
		log(`Received interaction: ${interaction.commandName}`)
		const command = this._commands.get(interaction.commandName)
		if (!command) return
		try {
			await command.execute(interaction)
		} catch (error) {
			log(`Error while executing command ${interaction.commandName}: ${error}`)
			await interaction.reply({
				content: "There was an error while executing this command!",
				ephemeral: true,
			})
		}
	}

	async redeployCommands(): Promise<void> {
		// Si aucune commande n'est à redéployer, on ne fait rien
		if (this._commandsToRedeploy.length === 0) {
			return
		}
		log("Redeploying commands...")
		// Crée un array d'objets JSON à passer à l'API Discord
		const newCommands = this._commandsToRedeploy.map((command: ICommand) => command.data.toJSON())
		// Instancie un client d'API REST Discord
		const rest = new REST({version: "10"}).setToken(this._token)
		// Dialogue avec l'API REST de Discord
		try {
			// Récupère et affiche la liste des commandes connues de l'API de Discord
			let commands = (await rest.get(Routes.applicationCommands(this._clientId))) as any[]
			log(`- Registered commands: ${commands.map((command: any) => command.name).join(", ")}`)
			// Retire de ces commandes connues celles qui n'existent plus et celles à redéployer
			commands = commands.filter((command: any) => {
				return (
					this._commandList.includes(command.name) && !newCommands.some((c: any) => c.name === command.name)
				)
			})
			log(`- Commands to keep: ${commands.map((command: any) => command.name).join(", ")}`)
			// Ajoute à la liste des commandes à garder, celles à redéployer
			commands = commands.concat(newCommands)
			log(`- Commands to redeploy: ${commands.map((command: any) => command.name).join(", ")}`)
			// S'il n'y a rien à redéployer, quittes la fonction
			if (commands.length === 0) {
				log("No commands to redeploy.")
				return
			}
			// Redéploiement des commandes sur l'API de Discord
			const resRedeploy = (await rest.put(Routes.applicationCommands(this._clientId), {
				body: commands,
			})) as any[]
			log(`Successfully redeployed ${resRedeploy.length} application (/) commands.`)
			// Crée le nouvel objet des révisions de commandes à enregistrer dans le fichier de config
			const newCommandRevisions: {[name: string]: number} = {}
			for (const command of this._commandsToRedeploy) {
				newCommandRevisions[command.data.name] = command.revision
			}
			this._commandRevisions = {...this._commandRevisions, ...newCommandRevisions}
			// Enregistre la nouvelle configuration
			await this._saveConfig()
			// Nettoie la liste des commandes à redéployer
			this._commandsToRedeploy = []
		} catch (error) {
			log(`Error while redeploying commands: ${error}`)
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
		await this._loadCommands()
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
					await this._saveConfig()
				}
				return this._users.get(userId)!.openAI
			}
		}
		const server = await this.getOrCreateServer(s)
		const res = server.openAI(userId, openAI)
		await this._saveConfig()
		return res
	}

	async getOrCreateServer(s: string | Guild): Promise<IServer> {
		const serverId = typeof s === "string" ? s : s.id
		if (this._servers.has(serverId)) {
			return this._servers.get(serverId)!
		}
		const server = typeof s === "string" ? Server.create({id: serverId, users: []}) : Server.fromGuild(s)
		this._servers.set(serverId, server)
		await this._saveConfig()
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
		return new Discobot(
			cfg.token,
			cfg.clientId,
			cfg.lasICommandDeployment,
			cfg.commandRevisions,
			cfg.inviteUrl,
			srvs,
			users,
			path,
		)
	}
}

export type {TCreationProperties as TCommandCreationProperties, ICommand} from "./command.spec"
export type {TCreationProperties as TEventCreationProperties, IEvent} from "./event.spec"
export type {TConfig as TUserConfig, IUser} from "./User.spec"
export type {TConfig as TServerConfig, IServer} from "./Server.spec"
export * from "./Event"
export * from "./Command"
export * from "./User"
export * from "./Server"
export * from "./events"
export * from "./commands"
