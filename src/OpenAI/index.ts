import {Configuration, OpenAIApi, CreateCompletionResponse, CreateChatCompletionResponse, Model} from "openai"
import {IResult, Result} from "@tongtwist/result-js"
import type {IListModels} from "./ListModels.spec"
import ListModels from "./ListModels"
import type {ITextCompletion, TTextCompletionParams} from "./TextCompletion.spec"
import TextCompletion from "./TextCompletion"
import type {IChatCompletion, TChatCompletionParams} from "./ChatCompletion.spec"
import ChatCompletion from "./ChatCompletion"
import type {IOpenAI} from "../OpenAI.spec"

export default class OpenAI implements IOpenAI {
	private _models: Model[] = []

	constructor(private readonly _key: string, private readonly _api: OpenAIApi) {}

	get key(): string {
		return this._key
	}

	async listModels(): Promise<Model[]> {
		if (this._models.length === 0) {
			const apiRequest: IListModels = ListModels.create(this._api)
			const res: IResult<Model[]> = await apiRequest.execute()
			if (Result.isOk(res)) {
				this._models = res.value
			}
		}
		return this._models
	}

	async completeText(params: TTextCompletionParams): Promise<IResult<CreateCompletionResponse>> {
		const apiRequest: ITextCompletion = TextCompletion.create(this._api, params)
		return await apiRequest.execute()
	}

	async completeChat(params: TChatCompletionParams): Promise<IResult<CreateChatCompletionResponse>> {
		const apiRequest: IChatCompletion = ChatCompletion.create(this._api, params)
		return await apiRequest.execute()
	}

	static async fromConfig(path: string): Promise<OpenAI> {
		const {apikey} = await require(path)
		return OpenAI.fromKey(apikey)
	}

	static fromKey(apiKey: string): OpenAI {
		const cfg = new Configuration({apiKey})
		const api = new OpenAIApi(cfg)
		return new OpenAI(apiKey, api)
	}
}

export type * from "./ListModels.spec"
export type * from "./TextCompletion.spec"
export type * from "./ChatCompletion.spec"
export * from "./ListModels"
export * from "./TextCompletion"
export * from "./ChatCompletion"
