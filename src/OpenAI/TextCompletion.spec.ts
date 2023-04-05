import type {OpenAIApi, CreateCompletionRequest, CreateCompletionResponse} from "openai"
import type {IResult} from "@tongtwist/result-js"

/**
 * Spécifications de forme
 */
export type TTextCompletionParams = Partial<CreateCompletionRequest> | string

export interface ITextCompletion {
	readonly api: OpenAIApi
	readonly request: CreateCompletionRequest
	execute(): Promise<IResult<CreateCompletionResponse>>
}

/**
 * Spécifications de comportement
 */
