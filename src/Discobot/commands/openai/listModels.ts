import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js"
import type {Model} from "openai"
import type {IOpenAI} from "../../../OpenAI.spec"
import type {IDiscobot} from "../../../Discobot.spec"
import type {ICommand} from "../../command.spec"
import Command from "../../Command"

/**
 * La commande permettant de lister les modèles disponibles sur OpenAI
 */
export const listModels: ICommand = Command.fromConfig({
	revision: 1,

	data: new SlashCommandBuilder().setName("openai-models").setDescription("List OpenAI available models"),

	execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
		// Le traitement peut prendre du temps mais il faut répondre tout de suite à Discord.
		// On indique donc à Discord qu'on est en train de traiter la commande
		// Le retour de cette commande sera visible de tous
		await interaction.deferReply()

		// On récupère le client Discord qui est en fait notre bot
		const bot = interaction.client as IDiscobot

		// On récupère l'identifiant du serveur sur lequel la commande a été lancée
		const serverId: string | null = interaction.guildId

		// On récupère l'identifiant du user qui a lancé la commande
		const userId: string = interaction.user.id

		// On récupère l'instance OpenAI associée à l'utilisateur qui a lancé la commande
		const openAI: IOpenAI | false = bot.getOpenAI(userId, serverId || undefined)

		// Si l'utilisateur n'a pas de clé OpenAI, on ne peut pas lister les modèles
		if (!openAI) {
			await interaction.editReply("OpenAI not configured. Try `/openai-setup`")
			return
		}

		// On récupère la liste des modèles disponibles
		const models: Model[] = await openAI.listModels()

		// On répond à Discord avec la liste des modèles
		await interaction.editReply(
			`OpenAI models actually are ${models.map((model: Model) => `"${model.id}"`).join(", ")}`,
		)
	},
})
