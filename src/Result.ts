import type {IResult} from "./Result.spec"

export default class Result<R = unknown> implements IResult<R> {
	private readonly _error?: Error
	private readonly _value?: R
	private readonly _ok: boolean

	private constructor(v?: R, e?: Error | string) {
		this._ok = typeof e === "undefined" && typeof v !== "undefined"
		if (this._ok) {
			this._value = v
		} else {
			this._error = typeof e === "string" ? new Error(e) : e
		}
		Object.freeze(this)
	}

	get error(): Error | undefined {
		return this._error
	}
	get value(): R | undefined {
		return this._value
	}
	get isOk(): boolean {
		return this._ok
	}
	get isSuccess(): boolean {
		return this._ok
	}
	get isError(): boolean {
		return !this._ok
	}
	get isFailure(): boolean {
		return !this._ok
	}

	static success<R>(value: R): Result<R> {
		return new Result<R>(value)
	}

	static fail<R = unknown>(err: string | Error): Result<R> {
		return new Result<R>(undefined, err)
	}

	static failIn<R = unknown>(where: string, err: string | Error): Result<R> {
		const msg = typeof err === "string" ? err : err.message
		return Result.fail(`${where}: ${msg}`)
	}
}
