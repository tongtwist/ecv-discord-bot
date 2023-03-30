import {
	Configuration,
	OpenAIApi,
	CreateCompletionResponse,
	CreateChatCompletionResponse,
	Model,
} from "openai"
import { ListModels } from "./ListModels"
import { TCompletionParams, Completion } from "./Completion"
import { TChatCompletionParams, ChatCompletion } from "./ChatCompletion"

export class OpenAI {
	private _models: Model[] = []

	constructor (
		private readonly _key: string,
		private readonly _api: OpenAIApi
	) {}

	get key(): string { return this._key }
	get models(): Model[] { return [...this._models] }

	async listModels(): Promise<Model[]> {
		if (this._models.length === 0) {
			const req = new ListModels(this._api)
			this._models = await req.execute()
		}
		return this._models
	}

	async complete(params: TCompletionParams): Promise<CreateCompletionResponse | false> {
		const req = new Completion(this._api, params)
		return await req.execute()
	}

	async completeChat(params: TChatCompletionParams): Promise<CreateChatCompletionResponse | false> {
		const req = new ChatCompletion(this._api, params)
		return await req.execute()
	}

	static async fromConfig(path: string): Promise<OpenAI> {
		const { apikey } = await require(path)
		return OpenAI.fromKey(apikey)
	}

	static fromKey(apiKey: string): OpenAI {
		const cfg = new Configuration({ apiKey })
		const api = new OpenAIApi(cfg)
		return new OpenAI(apiKey, api)
	}
}