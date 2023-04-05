import type {AxiosResponse} from "axios"
import type {OpenAIApi, CreateCompletionRequest, CreateCompletionResponse} from "openai"
import {IResult, Result} from "@tongtwist/result-js"
import type {TTextCompletionParams, ITextCompletion} from "./TextCompletion.spec"

export default class TextCompletion implements ITextCompletion {
	static readonly defaultRequest: CreateCompletionRequest = {
		model: "text-davinci-003",
		max_tokens: 100,
		temperature: 0.5,
	}

	private constructor(private readonly _api: OpenAIApi, private readonly _request: CreateCompletionRequest) {
		Object.freeze(this)
	}

	get api() {
		return this._api
	}
	get request() {
		return this._request
	}

	async execute(): Promise<IResult<CreateCompletionResponse>> {
		const req: CreateCompletionRequest = {...TextCompletion.defaultRequest, ...(this._request ?? {})}
		let res: AxiosResponse<CreateCompletionResponse>
		try {
			res = await this._api.createCompletion(req)
		} catch (err) {
			return Result.failIn("openai.TextCompletion.execute", err as string | Error)
		}
		if (res.status !== 200) {
			return Result.failIn(
				"openai.TextCompletion.execute",
				`OpenAI.createCompletion: unexpected status code: ${res.status}`,
			)
		}
		return Result.success(res.data)
	}

	static create(api: OpenAIApi, params: TTextCompletionParams): ITextCompletion {
		const request: CreateCompletionRequest =
			typeof params === "string"
				? {...TextCompletion.defaultRequest, prompt: params}
				: {...TextCompletion.defaultRequest, ...params}
		return new TextCompletion(api, request)
	}
}
