import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js"
import type {Model} from "openai"
import type {IOpenAI} from "../../../OpenAI.spec"
import type {IDiscobot} from "../../../Discobot.spec"
import type {ICommand} from "../../command.spec"
import Command from "../../Command"

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

		// On récupère l'instance OpenAI associée à l'utilisateur qui a lancé la commande
		const openAI: IOpenAI | undefined = await bot.openAI(interaction.user.id)

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
