import { writeFile } from "fs/promises"
import {
	BaseInteraction,
	ChatInputCommandInteraction,
	Client,
	Collection,
	Events,
	GatewayIntentBits,
	REST,
	Routes
} from "discord.js"
import { OpenAI } from "../OpenAI"
import { log } from "../log"
import type { TCommand } from "./commands/command.spec"

export class Discobot extends Client {
	private static readonly _minCommandDeploymentAge = 1000 * 60 * 60 * 24

	private _commands: Collection<string, TCommand>
	commandsToRedeploy: TCommand[] = []
	commandList: string[] = []

	private constructor(
		private readonly _token: string,
		private readonly _clientId: string,
		private readonly _guildId: string,
		private _lastCommandDeployment: number,
		private _commandRevisions: { [name: string]: number },
		private readonly _inviteUrl: string,
		private readonly _openAIs: { [userId: string]: OpenAI },
		private readonly _configPath: string,
	) {
		super({ intents: [GatewayIntentBits.Guilds] })
		this._commands = new Collection()
	}

	private async _saveConfig(): Promise<void> {
		// Crée l'objet de stockage des clés OpenAI
		const openAIUserKeys: { [userId: string]: string } = {}
		for (const [userId, openAI] of Object.entries(this._openAIs)) {
			openAIUserKeys[userId] = openAI.key
		}
		// Crée le nouvel objet de configuration
		const config = {
			token: this._token,
			inviteUrl: this._inviteUrl,
			clientId: this._clientId,
			guildId: this._guildId,
			lastCommandDeployment: Date.now(),
			commandRevisions: this._commandRevisions,
			openAIUserKeys,
		}
		// Enregistre la nouvelle configuration dans le fichier désigné par this._configPath
		await writeFile(this._configPath, JSON.stringify(config, null, 4))
	}

	private async _loadCommands(): Promise<[ TCommand[], string[] ]> {
		// Charge la liste des objets commands
		const { commands } = await import("./commands")
		// Initialise quelques variables de gestion des redéploiements
		const now = Date.now()
		const lastDeplAge = now - this._lastCommandDeployment
		const commandList: string[] = []
		const commandsThatShouldBeDeployed: TCommand[] = []
		// Enregistre les commandes dans le bot
		for (const command of commands) {
			this._commands.set(command.data.name, command)
			commandList.push(command.data.name)
			const shouldBeRedeployed = lastDeplAge > Discobot._minCommandDeploymentAge
				|| (this._commandRevisions[command.data.name] ?? 0) < command.revision
			if (shouldBeRedeployed) {
				commandsThatShouldBeDeployed.push(command)
			}
		}
		// Renvoi les listes dont on a besoin par ailleur
		return [commandsThatShouldBeDeployed, commandList]
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
		const { events } = await import("./events")
		// Branche les handlers d'évènements sur les évènements
		for (const event of events) {
			this[event.once ? "once" : "on"](
				event.name,
				(...args: any[]) => event.execute(this, ...args)
			)
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
				ephemeral: true
			})
		}
	}

	async redeployCommands(): Promise<void> {
		log("Redeploying commands...")
		// Crée un array d'objets JSON à passer à l'API Discord
		const newCommands = this.commandsToRedeploy.map((command: TCommand) => command.data.toJSON())
		// Instancie un client d'API REST Discord
		const rest = new REST({ version: "10" }).setToken(this._token)
		// Dialogue avec l'API REST de Discord
		try {
			// Récupère et affiche la liste des commandes connues de l'API de Discord
			let commands = await rest.get(Routes.applicationGuildCommands(this._clientId, this._guildId)) as any[]
			log(`- Registered commands: ${commands.map((command: any) => command.name).join(", ")}`)
			// Retire de ces commandes connues celles qui n'existent plus et celles à redéployer
			commands = commands.filter((command: any) => {
				return this.commandList.includes(command.name)
					&& !newCommands.some((c: any) => c.name === command.name)
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
			const resRedeploy = await rest.put(
				Routes.applicationGuildCommands(this._clientId, this._guildId),
				{ body: commands }
			) as any[]
			log(`Successfully redeployed ${resRedeploy.length} application (/) commands.`)
			// Crée le nouvel objet des révisions de commandes à enregistrer dans le fichier de config
			const newCommandRevisions: {[name: string]: number} = {}
			for (const command of this.commandsToRedeploy) {
				newCommandRevisions[command.data.name] = command.revision
			}
			this._commandRevisions = {...this._commandRevisions, ...newCommandRevisions}
			// Enregistre la nouvelle configuration
			await this._saveConfig()
			// Nettoie la liste des commandes à redéployer
			this.commandsToRedeploy = []
		} catch(error) {
			log(`Error while redeploying commands: ${error}`)
		}
	}

	welcome() {
		log("Here I am!")
		log(`Do not forget to invite me on your prefered server using this URL: ${this._inviteUrl}`)
	}

	async openAI(userId: string, openAI?: OpenAI | string): Promise<OpenAI | undefined> {
		if (typeof openAI !== "undefined") {
			this._openAIs[userId] = typeof openAI === "string" ? OpenAI.fromKey(openAI) : openAI
			await this._saveConfig()
		}
		const ret = this._openAIs[userId]
		return ret
	}
	
	async start(): Promise<void> {
		// Charge les commandes
		const [commandsToRedeploy, commandList] = await this._loadCommands()
		this.commandsToRedeploy = commandsToRedeploy
		this.commandList = commandList
		// Gère les commandes
		await this._handleCommands()
		// Charge et gère les évènements
		await this._loadAndHandleEvents()
		// Connexion
		await super.login(this._token)
	}

	static async fromConfig(path: string): Promise<Discobot> {
		const {
			token,
			inviteUrl,
			clientId,
			guildId,
			lastCommandDeployment,
			commandRevisions,
			openAIUserKeys
		} = await require(path)
		const openAIs: {[userId: string]: OpenAI} = {}
		for (const userId in openAIUserKeys) {
			openAIs[userId] = OpenAI.fromKey(openAIUserKeys[userId])
		}
		return new Discobot(
			token,
			clientId,
			guildId,
			lastCommandDeployment,
			commandRevisions,
			inviteUrl,
			openAIs,
			path,
		)
	}
}
