import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandStringOption,
	SlashCommandNumberOption,
} from "discord.js"
import type {CreateCompletionRequest, CreateCompletionResponse, CreateCompletionResponseChoicesInner} from "openai"
import type {IResult} from "../../../Result.spec"
import type {OpenAI} from "../../../OpenAI"
import type {Discobot} from "../.."
import type {ICommand} from "../../command.spec"
import Command from "../../Command"
import {log} from "../../../log"

export const completeText: ICommand = Command.fromConfig({
	revision: 4,

	data: new SlashCommandBuilder()
		.setName("openai-complete-text")
		.setDescription("Ask to OpenAI to complete a text")
		.addStringOption((option: SlashCommandStringOption) =>
			option.setName("text").setDescription("Text to complete").setRequired(true),
		)
		.addStringOption((option: SlashCommandStringOption) =>
			option
				.setName("model")
				.setDescription("Model to use (default: text-davinci-003)")
				.setRequired(false)
				.addChoices(
					{name: "babbage", value: "babbage"},
					{name: "davinci", value: "davinci"},
					{name: "text-davinci-001", value: "text-davinci-001"},
					{name: "ada", value: "ada"},
					{name: "curie-instruct-beta", value: "curie-instruct-beta"},
					{name: "text-curie-001", value: "text-curie-001"},
					{name: "text-ada-001", value: "text-ada-001"},
					{name: "text-davinci-003", value: "text-davinci-003"},
					{name: "davinci-instruct-beta", value: "davinci-instruct-beta"},
					{name: "text-babbage-001", value: "text-babbage-001"},
					{name: "curie", value: "curie"},
					{name: "text-davinci-002", value: "text-davinci-002"},
				),
		)
		.addNumberOption((option: SlashCommandNumberOption) =>
			option
				.setName("max_tokens")
				.setDescription("Maximum number of tokens to generate (0 < max_tokens <= 2048. Default: 100)")
				.setRequired(false)
				.setMinValue(1)
				.setMaxValue(2048),
		)
		.addNumberOption((option: SlashCommandNumberOption) =>
			option
				.setName("temperature")
				.setDescription("Temperature (0.0 <= temperature <= 1.0. Default: 0.5)")
				.setRequired(false)
				.setMinValue(0.0)
				.setMaxValue(2.0),
		) as SlashCommandBuilder,

	execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
		// Le traitement peut prendre du temps mais il faut répondre tout de suite à Discord.
		// On indique donc à Discord qu'on est en train de traiter la commande
		// Le retour de cette commande sera visible de tous
		await interaction.deferReply()

		// On récupère le client Discord qui est en fait notre bot
		const bot = interaction.client as Discobot

		// On récupère l'instance OpenAI associée à l'utilisateur qui a lancé la commande
		const openAI: OpenAI | undefined = await bot.openAI(interaction.user.id)

		// Si l'utilisateur n'a pas de clé OpenAI, on ne peut pas lister les modèles
		if (!openAI) {
			await interaction.editReply("OpenAI not configured. Try `/openai-setup`")
			return
		}

		// On récupère les paramètres de la commande
		const prompt = interaction.options.getString("text", true)
		const model = interaction.options.getString("model", false)
		const maxTokens = interaction.options.getNumber("max_tokens", false)
		const temperature = interaction.options.getNumber("temperature", false)

		// On construit un objet de requête pour OpenAI
		const request: Partial<CreateCompletionRequest> = {prompt}
		typeof model === "string" && (request.model = model)
		typeof maxTokens === "number" && (request.max_tokens = Math.round(maxTokens))
		typeof temperature === "number" && (request.temperature = temperature)

		// On fait appel à OpenAI pour compléter le texte
		const completion: IResult<CreateCompletionResponse> = await openAI.completeText(request)
		if (completion.isError) {
			await interaction.editReply("OpenAI failed to complete the text")
			log(completion.error!.message)
			return
		}
		if (completion.value!.choices.length === 0) {
			await interaction.editReply("OpenAI failed to return at least one choice")
			log(JSON.stringify(completion.value!))
			return
		}
		const {choices, usage} = completion.value!
		const choice: CreateCompletionResponseChoicesInner = choices[0]
		const {text, finish_reason} = choice

		// On créé un message de réponse
		const reponse = `${prompt}${text}`

		// On répond à Discord
		await interaction.editReply(reponse)

		// En cas de réponse incomplète, on indique à l'utilisateur comment faire pour avoir une réponse plus complète
		if (finish_reason === "length") {
			// openAI n'a pas terminé sa réponse car la longueur maximale a été atteinte
			await interaction.followUp(`J'aurai voulu en dire plus, mais j'ai atteind ma longueur maximum autorisée de réponse fixée à ${
				usage?.completion_tokens ?? "n"
			} tokens.
Demandez moi une réponse plus courte ou autorisez moi à en dire plus via le paramètre "max_tokens".`)
		} else if (finish_reason !== "stop") {
			// openAI n'a pas terminé sa réponse pour une autre raison
			await interaction.followUp(`Pour une raison inconnue, je n'ai pas terminé ma réponse. Ci-dessous le détail technique ... pour les techniciens:
${JSON.stringify(choice)}`)
		}
	},
})
