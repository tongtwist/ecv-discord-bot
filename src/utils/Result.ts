import type {IResult, ISuccessResult, IFailureResult} from "./Result.spec"

export class SuccessResult<R = unknown> implements ISuccessResult<R> {
	readonly isOk = true
	readonly isSuccess = true
	readonly isError = false
	readonly isFailure = false

	private constructor(private readonly _value: R) {
		Object.freeze(this)
	}

	get value(): R {
		return this._value
	}

	static of<R>(value: R): ISuccessResult<R> {
		return new SuccessResult(value)
	}
}

export class ErrorResult implements IFailureResult {
	readonly isOk = false
	readonly isSuccess = false
	readonly isError = true
	readonly isFailure = true

	private constructor(private readonly _error: Error) {
		Object.freeze(this)
	}

	get error(): Error {
		return this._error
	}

	static of(err: string | Error): IFailureResult {
		return new ErrorResult(typeof err === "string" ? new Error(err) : err)
	}
}

export default class Result {
	static isOk<R>(r: IResult<R>): r is ISuccessResult<R> {
		return r.isOk
	}
	static isSuccess<R>(r: IResult<R>): r is ISuccessResult<R> {
		return r.isOk
	}

	static isError<R>(r: IResult<R>): r is IFailureResult {
		return r.isError
	}
	static isFailure<R>(r: IResult<R>): r is IFailureResult {
		return r.isError
	}

	static success<R>(value: R): IResult<R> {
		return SuccessResult.of<R>(value)
	}

	static fail<R = unknown>(err: string | Error): IResult<R> {
		return ErrorResult.of(err)
	}

	static failIn<R = unknown>(where: string, err: string | Error): IResult<R> {
		const msg = typeof err === "string" ? err : err.message
		return ErrorResult.of(`${where}: ${msg}`)
	}
}
