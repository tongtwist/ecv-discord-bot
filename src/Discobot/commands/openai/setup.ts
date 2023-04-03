import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandStringOption,
	SlashCommandUserOption,
	User,
} from "discord.js"
import type {Discobot} from "../.."
import type {TCommand} from "../command.spec"

export const setup: TCommand = {
	revision: 1,

	data: new SlashCommandBuilder()
		.setName("openai-setup")
		.setDescription(
			"Retrieve and eventually store the OpenAI API key to use with a Discord user (yourself by default)",
		)
		.addStringOption((option: SlashCommandStringOption) =>
			option.setName("key").setDescription("Your OpenAI API key").setRequired(false),
		)
		.addUserOption((option: SlashCommandUserOption) =>
			option
				.setName("user")
				.setDescription("The Discord user to associate with the OpenAI API key")
				.setRequired(false),
		),

	execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
		// Le traitement peut prendre du temps mais il faut répondre tout de suite à Discord.
		// On indique donc à Discord qu'on est en train de traiter la commande
		// Le retour de cette commande ne sera visible que de l'utilisateur qui l'a lancée
		await interaction.deferReply({ephemeral: true})

		// On récupère le client Discord qui est en fait notre bot
		const bot = interaction.client as Discobot

		// On récupère la clé OpenAI éventuellement passée en paramètre
		const key: string | null = interaction.options.getString("key")

		// On récupère l'utilisateur éventuellement passé en paramètre.
		// Si aucun utilisateur n'est passé en paramètre, on prend l'utilisateur qui a lancé la commande.
		const user: User = interaction.options.getUser("user") || interaction.user

		// On construit les composantes d'un texte désignant l'utilisateur concerné par la commande
		const userDesignation: [string, string] =
			user.id === interaction.user.id ? ["You", "r"] : [`${user.username}`, "'s"]

		// Traite le cas d'une lecture de clé
		if (key === null) {
			const openAIKey: string | undefined = (await bot.openAI(user.id))?.key
			const response = openAIKey
				? `${userDesignation[0]}${userDesignation[1]} OpenAI API key is: "${openAIKey}"`
				: `${userDesignation[0]} do not have an openAI API key`
			await interaction.editReply(response)
			return
		}

		// Traite le cas du stockage d'une nouvelle clé
		const openAIKey: string | undefined = (await bot.openAI(user.id, key))?.key
		const response = openAIKey
			? `${userDesignation[0]}${userDesignation[1]} OpenAI API key is configured to: "${openAIKey}"`
			: `Failed to configure ${userDesignation[0]}${userDesignation[1]} OpenAI API key to "${key}"`
		await interaction.editReply(response)
	},
}
