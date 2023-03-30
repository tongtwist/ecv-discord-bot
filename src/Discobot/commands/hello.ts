import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandStringOption } from "discord.js"
import type { TCommand } from "./command.spec"

export const helloCommand: TCommand = {
	revision: 1,

	data: new SlashCommandBuilder()
		.setName("hello")
		.setDescription("Replies to Hello")
		.addStringOption(
			(option: SlashCommandStringOption) => option
				.setName("name")
				.setDescription("Your name")
				.setRequired(false)
		),

	execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
		const name: string | null = interaction.options.getString("name")
		await interaction.reply(`Hello${name !== null ? ` ${name}` : ""} !`)
	},
}
