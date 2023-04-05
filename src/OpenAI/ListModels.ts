import type {AxiosResponse} from "axios"
import type {Model, OpenAIApi, ListModelsResponse} from "openai"
import {IResult, Result} from "@tongtwist/result-js"
import type {IListModels} from "./ListModels.spec"

export default class ListModels implements IListModels {
	private constructor(private readonly _api: OpenAIApi) {
		Object.freeze(this)
	}

	get api() {
		return this._api
	}

	async execute(): Promise<IResult<Model[]>> {
		let res: AxiosResponse<ListModelsResponse>
		try {
			res = await this._api.listModels()
		} catch (err) {
			return Result.failIn("openai.ListModels.execute", err as string | Error)
		}
		if (res.status !== 200) {
			return Result.failIn(
				"openai.ListModels.execute",
				`OpenAI.listModels: unexpected status code: ${res.status}`,
			)
		}
		return Result.success(res.data.data)
	}

	static create(api: OpenAIApi): ListModels {
		return new ListModels(api)
	}
}
