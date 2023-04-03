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
} from "discord.js"
import {OpenAI} from "../OpenAI"
import {log} from "../log"
import type {ICommand} from "./command.spec"
import type {IOpenAI} from "../OpenAI.spec"
import type {IDiscobot} from "../Discobot.spec"

export class Discobot extends Client implements IDiscobot {
	private static readonly _minCommandDeploymentAge = 1000 * 60 * 60 * 24

	private _commands: Collection<string, ICommand>
	private _commandsToRedeploy: ICommand[] = []
	private _commandList: string[] = []

	private constructor(
		private readonly _token: string,
		private readonly _clientId: string,
		private readonly _guildId: string,
		private _lasICommandDeployment: number,
		private _commandRevisions: {[name: string]: number},
		private readonly _inviteUrl: string,
		private readonly _openAIs: {[userId: string]: IOpenAI},
		private readonly _configPath: string,
	) {
		super({intents: [GatewayIntentBits.Guilds]})
		this._commands = new Collection()
	}

	private async _saveConfig(): Promise<void> {
		// Crée l'objet de stockage des clés OpenAI
		const openAIUserKeys: {[userId: string]: string} = {}
		for (const [userId, openAI] of Object.entries(this._openAIs)) {
			openAIUserKeys[userId] = openAI.key
		}
		// Crée le nouvel objet de configuration
		const config = {
			token: this._token,
			inviteUrl: this._inviteUrl,
			clientId: this._clientId,
			guildId: this._guildId,
			lasICommandDeployment: Date.now(),
			commandRevisions: this._commandRevisions,
			openAIUserKeys,
		}
		// Enregistre la nouvelle configuration dans le fichier désigné par this._configPath
		await writeFile(this._configPath, JSON.stringify(config, null, 4))
	}

	private async _loadCommands(): Promise<void> {
		// Charge la liste des objets commands
		const {commands} = await import("./commands")
		// Initialise quelques variables de gestion des redéploiements
		const now = Date.now()
		const lastDeplAge = now - this._lasICommandDeployment
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
			let commands = (await rest.get(Routes.applicationGuildCommands(this._clientId, this._guildId))) as any[]
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
			const resRedeploy = (await rest.put(Routes.applicationGuildCommands(this._clientId, this._guildId), {
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

	logWelcome() {
		log("Here I am!")
		log(`Do not forget to invite me on your prefered server using this URL: ${this._inviteUrl}`)
	}

	async openAI(userId: string, openAI?: IOpenAI | string): Promise<IOpenAI | undefined> {
		if (typeof openAI !== "undefined") {
			this._openAIs[userId] = typeof openAI === "string" ? OpenAI.fromKey(openAI) : openAI
			await this._saveConfig()
		}
		const ret = this._openAIs[userId]
		return ret
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

	static async fromConfig(path: string): Promise<IDiscobot> {
		const {token, inviteUrl, clientId, guildId, lasICommandDeployment, commandRevisions, openAIUserKeys} =
			await require(path)
		const openAIs: {[userId: string]: OpenAI} = {}
		for (const userId in openAIUserKeys) {
			openAIs[userId] = OpenAI.fromKey(openAIUserKeys[userId])
		}
		return new Discobot(token, clientId, guildId, lasICommandDeployment, commandRevisions, inviteUrl, openAIs, path)
	}
}
