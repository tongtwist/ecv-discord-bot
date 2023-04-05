import type {Model, OpenAIApi} from "openai"
import type {IResult} from "@tongtwist/result-js"

/**
 * Spécification de forme
 */
export interface IListModels {
	readonly api: OpenAIApi
	execute(): Promise<IResult<Model[]>>
}

/**
 * Spécification de comportement
 */
