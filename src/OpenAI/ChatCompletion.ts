import type { AxiosResponse } from "axios"
import type {
	OpenAIApi,
	CreateChatCompletionRequest,
	ChatCompletionRequestMessage,
	CreateChatCompletionResponse,
} from "openai"
import { log } from "../log"

export type TChatCompletionParams =
	| (Partial<CreateChatCompletionRequest> & { messages: ChatCompletionRequestMessage[] })
	| ChatCompletionRequestMessage[]

export class ChatCompletion {
	static readonly defaultRequest: Partial<CreateChatCompletionRequest> & { model: string } = {
		model: "gpt-3.5-turbo",
	}

	private readonly _request: Partial<CreateChatCompletionRequest> & { messages: ChatCompletionRequestMessage[] }

	constructor(
		private readonly _api: OpenAIApi,
		request: TChatCompletionParams
	) {
		this._request = Array.isArray(request) ? { messages: request } : request
	}

	async execute(): Promise<CreateChatCompletionResponse | false> {
		const req: CreateChatCompletionRequest = {...ChatCompletion.defaultRequest, ...this._request}
		const res: AxiosResponse<CreateChatCompletionResponse> = await this._api.createChatCompletion(req)
		if (res.status !== 200) {
			log(`OpenAI.createChatCompletion: unexpected status code: ${res.status}`)
			return false
		}
		return res.data
	}
}