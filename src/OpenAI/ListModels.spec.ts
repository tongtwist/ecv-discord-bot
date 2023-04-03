import type {Model, OpenAIApi} from "openai"
import type {IResult} from "../Result.spec"

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
