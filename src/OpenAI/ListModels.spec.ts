import type {Model, OpenAIApi} from "openai"
import type {IResult} from "../utils/Result.spec"

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
