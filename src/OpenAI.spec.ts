import type {Model, CreateCompletionResponse, CreateChatCompletionResponse} from "openai"
import type {IResult} from "./utils/Result.spec"
import type {TTextCompletionParams} from "./OpenAI/TextCompletion.spec"
import type {TChatCompletionParams} from "./OpenAI/ChatCompletion.spec"

/**
 * Spécification de forme
 */
export interface IOpenAI {
	readonly key: string
	listModels(): Promise<Model[]>
	completeText(params: TTextCompletionParams): Promise<IResult<CreateCompletionResponse>>
	completeChat(params: TChatCompletionParams): Promise<IResult<CreateChatCompletionResponse>>
}

/**
 * Spécification de comportement
 */
