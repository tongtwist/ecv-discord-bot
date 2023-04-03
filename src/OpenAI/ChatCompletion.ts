import type {AxiosResponse} from "axios"
import type {OpenAIApi, CreateChatCompletionRequest, CreateChatCompletionResponse} from "openai"
import type {IResult} from "../Result.spec"
import Result from "../Result"
import type {TChatCompletionParams, IChatCompletion} from "./ChatCompletion.spec"

export default class ChatCompletion implements IChatCompletion {
	static readonly defaultRequest: Partial<CreateChatCompletionRequest> & {model: string} = {
		model: "gpt-3.5-turbo",
	}

	private constructor(private readonly _api: OpenAIApi, private readonly _request: CreateChatCompletionRequest) {
		Object.freeze(this)
	}

	get api() {
		return this._api
	}
	get request() {
		return this._request
	}

	async execute(): Promise<IResult<CreateChatCompletionResponse>> {
		const req: CreateChatCompletionRequest = {...ChatCompletion.defaultRequest, ...this._request}
		let res: AxiosResponse<CreateChatCompletionResponse>
		try {
			res = await this._api.createChatCompletion(req)
		} catch (err) {
			return Result.failIn("openai.ChatCompletion.execute", err as string | Error)
		}
		if (res.status !== 200) {
			return Result.failIn(
				"openai.ChatCompletion.execute",
				`OpenAI.createChatCompletion: unexpected status code: ${res.status}`,
			)
		}
		return Result.success(res.data)
	}

	static create(api: OpenAIApi, params: TChatCompletionParams): IChatCompletion {
		const request: CreateChatCompletionRequest = Array.isArray(params)
			? {...ChatCompletion.defaultRequest, messages: params}
			: {...ChatCompletion.defaultRequest, ...params}
		return new ChatCompletion(api, request)
	}
}
