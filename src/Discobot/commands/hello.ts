import {ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandStringOption} from "discord.js"
import type {ICommand} from "../command.spec"
import Command from "../Command"

/**
 * La commande "hello" qui répond "Hello" à l'utilisateur
 */
export const helloCommand: ICommand = Command.fromConfig({
	revision: 1,

	data: new SlashCommandBuilder()
		.setName("hello")
		.setDescription("Replies to Hello")
		.addStringOption((option: SlashCommandStringOption) =>
			option.setName("name").setDescription("Your name").setRequired(false),
		) as SlashCommandBuilder,

	execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
		const name: string | null = interaction.options.getString("name")
		await interaction.reply(`Hello${name !== null ? ` ${name}` : ""} !`)
	},
})
