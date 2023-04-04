/**
 * Shape spec
 */
export interface ISuccessResult<R> {
	readonly value: R
	readonly isOk: true
	readonly isSuccess: true
	readonly isError: false
	readonly isFailure: false
}
export interface IFailureResult {
	readonly error: Error
	readonly isOk: false
	readonly isSuccess: false
	readonly isError: true
	readonly isFailure: true
}
export type IResult<R> = ISuccessResult<R> | IFailureResult

/**
 * Logic spec
 */
