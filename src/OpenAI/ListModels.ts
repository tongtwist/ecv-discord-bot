import type {AxiosResponse} from "axios"
import type {Model, OpenAIApi, ListModelsResponse} from "openai"
import {log} from "../log"

export class ListModels {
	constructor(private readonly _api: OpenAIApi) {}

	async execute(): Promise<Model[]> {
		const res: AxiosResponse<ListModelsResponse> = await this._api.listModels()
		if (res.status !== 200) {
			log(`OpenAI.listModels: unexpected status code: ${res.status}`)
			return []
		}
		return res.data.data
	}
}
