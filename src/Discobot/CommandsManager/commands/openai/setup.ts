import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandStringOption,
	SlashCommandUserOption,
	User,
} from "discord.js"
import type {Guild} from "discord.js"
import type {IOpenAI} from "../../../../OpenAI.spec"
import type {IDiscobot} from "../../../../Discobot.spec"
import type {ICommand} from "../../Command.spec"
import Command from "../../Command"

/**
 * La commande permettant de gérer les clés d'API OpenAI associées aux utilisateurs
 */
export const setup: ICommand = Command.fromConfig({
	revision: 2,

	data: new SlashCommandBuilder()
		.setName("openai-setup")
		.setDescription("Store or delete an OpenAI API key to use with a Discord user (yourself by default)")
		.addStringOption((option: SlashCommandStringOption) =>
			option.setName("key").setDescription("Your OpenAI API key").setRequired(false),
		)
		.addUserOption((option: SlashCommandUserOption) =>
			option
				.setName("user")
				.setDescription("The Discord user to associate with the OpenAI API key")
				.setRequired(false),
		) as SlashCommandBuilder,

	execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
		// Le traitement peut prendre du temps mais il faut répondre tout de suite à Discord.
		// On indique donc à Discord qu'on est en train de traiter la commande
		// Le retour de cette commande ne sera visible que de l'utilisateur qui l'a lancée
		await interaction.deferReply({ephemeral: true})

		// On récupère le client Discord qui est en fait notre bot
		const bot = interaction.client as IDiscobot

		// On récupère la guilde (aka serveur discord) sur lequel la commande a été lancée
		const guild: Guild | null = interaction.guild

		// On récupère l'utilisateur éventuellement passé en paramètre.
		// Si aucun utilisateur n'est passé en paramètre, on prend l'utilisateur qui a lancé la commande.
		const user: User = interaction.options.getUser("user") || interaction.user

		// On construit les composantes d'un texte désignant l'utilisateur concerné par la commande
		const userDesignation: [string, string] =
			user.id === interaction.user.id ? ["You", "r"] : [`${user.username}`, "'s"]

		// On récupère la clé OpenAI éventuellement passée en paramètre
		const key: string | false = interaction.options.getString("key") || false

		// Traite le cas d'une suppression de clé
		if (key === null) {
			// On récupère l'instance OpenAI associée à l'utilisateur qui a lancé la commande
			const openAI: IOpenAI | false = bot.getOpenAI(user.id, guild?.id || undefined)

			// On construit la réponse
			const response = openAI
				? `${userDesignation[0]}${userDesignation[1]} OpenAI API key is: "${openAI.key}"`
				: `${userDesignation[0]} do not have an openAI API key`

			// On répond et la lecture de clé est terminée
			await interaction.editReply(response)
			return
		}

		// Traite le cas de la clé par défaut pour un utilisateur
		if (guild === null) {
			// On stocke/supprime la clé OpenAI par défaut pour l'utilisateur
			const res: IOpenAI | false = await bot.setOpenAI(user.id, key)

			// On construit la réponse
			const response = res
				? `${userDesignation[0]}${userDesignation[1]} OpenAI API key is configured to: "${res.key}"`
				: `${userDesignation[0]}${userDesignation[1]} has no configured default OpenAI API key`

			// On répond et le stockage de la clé est terminé
			await interaction.editReply(response)
			return
		}

		// Traite le cas de la clé pour un utilisateur sur un serveur
		{
			// On stocke/supprime la clé OpenAI pour l'utilisateur sur le serveur
			const res: IOpenAI | false = await bot.setOpenAI(user.id, key, guild)

			// On construit la réponse
			const response = res
				? `${userDesignation[0]}${userDesignation[1]} OpenAI API key is configured to: "${res.key}" on server "${guild.name}"`
				: `${userDesignation[0]}${userDesignation[1]} has no configured OpenAI API key on server "${guild.name}"`

			// On répond et le stockage de la clé est terminé
			await interaction.editReply(response)
		}
	},
})
