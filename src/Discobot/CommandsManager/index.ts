import {z} from "zod"
import {BaseInteraction, ChatInputCommandInteraction, Collection, Events, REST, Routes} from "discord.js"
import type {TJSONObject} from "../../utils/JSON.spec"
import type {ICommand} from "./Command.spec"
import {log} from "../../utils/log"
import {IDiscobot} from "../../Discobot.spec"
import {helloCommand} from "./commands/hello"
import {openAICommands} from "./commands/openai"
import type {TConfig, ICommandsManager} from "../CommandsManager.spec"

export default class CommandsManager implements ICommandsManager {
	private static readonly _minCommandDeploymentAge = 1000 * 60 * 60 * 24
	static readonly configSchema = z.object({
		lastCommandDeployment: z.number().int().nonnegative(),
		commandRevisions: z.record(z.number().int().nonnegative()),
	})
	private static readonly _commands: ICommand[] = [helloCommand].concat(openAICommands)

	static create(cfg: TConfig): ICommandsManager {
		return new CommandsManager(cfg.lastCommandDeployment, cfg.commandRevisions)
	}

	private _commands: Collection<string, ICommand>
	private _commandsToRedeploy: ICommand[]
	private _commandList: string[]

	private constructor(
		private readonly _lastCommandDeployment: number,
		private _commandRevisions: {[name: string]: number},
	) {
		this._commands = new Collection()
		this._commandsToRedeploy = []
		this._commandList = []
	}

	toJSON(): TJSONObject {
		return {
			lastCommandDeployment: Date.now(),
			commandRevisions: this._commandRevisions,
		}
	}

	private async _load(): Promise<void> {
		// Initialise quelques variables de gestion des redéploiements
		const now = Date.now()
		const lastDeplAge = now - this._lastCommandDeployment
		const commandList: string[] = []
		const commandsThatShouldBeDeployed: ICommand[] = []
		// Enregistre les commandes dans le bot
		for (const command of CommandsManager._commands) {
			this._commands.set(command.data.name, command)
			commandList.push(command.data.name)
			const shouldBeRedeployed =
				lastDeplAge > CommandsManager._minCommandDeploymentAge ||
				(this._commandRevisions[command.data.name] ?? 0) < command.revision
			if (shouldBeRedeployed) {
				commandsThatShouldBeDeployed.push(command)
			}
		}
		// Enregistre les listes dont on a besoin par ailleur
		this._commandsToRedeploy = commandsThatShouldBeDeployed
		this._commandList = commandList
	}

	private async _handle(interaction: BaseInteraction): Promise<void> {
		if (interaction.isChatInputCommand()) {
			return this._executeChatInputCommandInteraction(interaction)
		}
	}

	async init(bot: IDiscobot): Promise<void> {
		await this._load()
		bot.on(Events.InteractionCreate, this._handle.bind(this))
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

	async redeploy(bot: IDiscobot): Promise<boolean> {
		// Si aucune commande n'est à redéployer, on ne fait rien
		if (this._commandsToRedeploy.length === 0) {
			return false
		}
		log("Redeploying commands...")
		// Crée un array d'objets JSON à passer à l'API Discord
		const newCommands = this._commandsToRedeploy.map((command: ICommand) => command.data.toJSON())
		// Instancie un client d'API REST Discord
		const rest = new REST({version: "10"}).setToken(bot.getToken())
		// Dialogue avec l'API REST de Discord
		try {
			// Récupère et affiche la liste des commandes connues de l'API de Discord
			let commands = (await rest.get(Routes.applicationCommands(bot.clientId))) as any[]
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
				return false
			}
			// Redéploiement des commandes sur l'API de Discord
			const resRedeploy = (await rest.put(Routes.applicationCommands(bot.clientId), {
				body: commands,
			})) as any[]
			log(`Successfully redeployed ${resRedeploy.length} application (/) commands.`)
			// Crée le nouvel objet des révisions de commandes à enregistrer dans le fichier de config
			const newCommandRevisions: {[name: string]: number} = {}
			for (const command of this._commandsToRedeploy) {
				newCommandRevisions[command.data.name] = command.revision
			}
			this._commandRevisions = {...this._commandRevisions, ...newCommandRevisions}
			// Sauvegarde la configuration du bot
			await bot.saveConfig()
			// Nettoie la liste des commandes à redéployer
			this._commandsToRedeploy = []
		} catch (error) {
			log(`Error while redeploying commands: ${error}`)
		}
		return true
	}
}
