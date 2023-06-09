import type {
	OpenAIApi,
	CreateChatCompletionRequest,
	ChatCompletionRequestMessage,
	CreateChatCompletionResponse,
} from "openai"
import type {IResult} from "@tongtwist/result-js"

/**
 * Spécifications de forme
 */
export type TChatCompletionParams =
	| (Partial<CreateChatCompletionRequest> & {messages: ChatCompletionRequestMessage[]})
	| ChatCompletionRequestMessage[]

export interface IChatCompletion {
	readonly api: OpenAIApi
	readonly request: CreateChatCompletionRequest
	execute(): Promise<IResult<CreateChatCompletionResponse>>
}

/**
 * Spécifications de comportement
 */
