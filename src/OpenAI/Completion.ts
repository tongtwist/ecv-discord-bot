import type {AxiosResponse} from "axios"
import type {OpenAIApi, CreateCompletionRequest, CreateCompletionResponse} from "openai"
import {log} from "../log"

export type TCompletionParams = Partial<CreateCompletionRequest> | string

export class Completion {
	static readonly defaultRequest: CreateCompletionRequest = {
		model: "text-davinci-003",
		max_tokens: 100,
		temperature: 0.5,
	}

	private readonly _request?: Partial<CreateCompletionRequest>

	constructor(private readonly _api: OpenAIApi, request?: TCompletionParams) {
		this._request = typeof request === "string" ? {prompt: request} : request
	}

	async execute(): Promise<CreateCompletionResponse | false> {
		const req: CreateCompletionRequest = {...Completion.defaultRequest, ...(this._request ?? {})}
		const res: AxiosResponse<CreateCompletionResponse> = await this._api.createCompletion(req)
		if (res.status !== 200) {
			log(`OpenAI.createCompletion: unexpected status code: ${res.status}`)
			return false
		}
		return res.data
	}
}
