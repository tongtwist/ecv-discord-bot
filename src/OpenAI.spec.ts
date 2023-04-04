import type {Model, CreateCompletionResponse, CreateChatCompletionResponse} from "openai"
import type {IResult} from "./utils/Result.spec"
import type {TTextCompletionParams} from "./OpenAI/TextCompletion.spec"
import type {TChatCompletionParams} from "./OpenAI/ChatCompletion.spec"

/***********************************************************************************************************************
 * Spécification de forme
 **********************************************************************************************************************/

/**
 * Gestionnaire d'API OpenAI
 *
 * @export
 * @interface IOpenAI
 */
export interface IOpenAI {
	/**
	 * Clé d'API OpenAI utilisée pour les requêtes
	 *
	 * @type {string}
	 * @memberof IOpenAI
	 */
	readonly key: string

	/**
	 * Liste les modèles LLM disponibles dans la session de ce gestionnaire d'API OpenAI
	 *
	 * @return {Promise<Model[]>}
	 * @memberof IOpenAI
	 */
	listModels(): Promise<Model[]>

	/**
	 * Demande à OpenAI de compléter un texte
	 *
	 * @param {TTextCompletionParams} params: Paramètres de la requête
	 * @return {Promise<Model>}
	 * @memberof IOpenAI
	 */
	completeText(params: TTextCompletionParams): Promise<IResult<CreateCompletionResponse>>

	/**
	 * Demande à OpenAI de poursuivre une conversation
	 *
	 * @param {TChatCompletionParams} params: Paramètres de la requête
	 * @return {Promise<Model>}
	 * @memberof IOpenAI
	 */
	completeChat(params: TChatCompletionParams): Promise<IResult<CreateChatCompletionResponse>>
}

/***********************************************************************************************************************
 * Spécification de comportement
 **********************************************************************************************************************/
