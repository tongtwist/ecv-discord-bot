/**
 * Shape spec
 */

/**
 * Le contenu d'un résultat de type "succès"
 *
 * @export
 * @interface ISuccessResult
 * @template R: Le type de la valeur de retour
 */
export interface ISuccessResult<R> {
	/**
	 * La valeur de retour
	 *
	 * @type {R}
	 * @memberof ISuccessResult
	 */
	readonly value: R

	/**
	 * Indique si le résultat est un succès. Donc cette valeur vaudra toujours `true`
	 *
	 * @type {true}
	 * @memberof ISuccessResult
	 */
	readonly isOk: true

	/**
	 * Indique si le résultat est un succès. Donc cette valeur vaudra toujours `true`
	 *
	 * @type {true}
	 * @memberof ISuccessResult
	 */
	readonly isSuccess: true

	/**
	 * Indique si le résultat est un échec. Donc cette valeur vaudra toujours `false`
	 *
	 * @type {false}
	 * @memberof ISuccessResult
	 */
	readonly isError: false

	/**
	 * Indique si le résultat est un échec. Donc cette valeur vaudra toujours `false`
	 *
	 * @type {false}
	 * @memberof ISuccessResult
	 */
	readonly isFailure: false
}

/**
 * Le contenu d'un résultat de type "échec" ou "erreur"
 *
 * @export
 * @interface IFailureResult
 */
export interface IFailureResult {
	/**
	 * L'erreur rencontrée à la place du résultat attendu
	 *
	 * @type {Error}
	 * @memberof IFailureResult
	 */
	readonly error: Error

	/**
	 * Indique si le résultat est un succès. Donc cette valeur vaudra toujours `false`
	 *
	 * @type {false}
	 * @memberof IFailureResult
	 */
	readonly isOk: false

	/**
	 * Indique si le résultat est un succès. Donc cette valeur vaudra toujours `false`
	 *
	 * @type {false}
	 * @memberof IFailureResult
	 */
	readonly isSuccess: false

	/**
	 * Indique si le résultat est un échec. Donc cette valeur vaudra toujours `true`
	 *
	 * @type {true}
	 * @memberof IFailureResult
	 */
	readonly isError: true

	/**
	 * Indique si le résultat est un échec. Donc cette valeur vaudra toujours `true`
	 *
	 * @type {true}
	 * @memberof IFailureResult
	 */
	readonly isFailure: true
}

/**
 * La pseudo-interface représentant un résultat représente soit un {@link ISuccessResult | succès}, soit un {@link IFailureResult | échec}.
 *
 * @template R: Le type de la valeur de retour
 */
export type IResult<R> = ISuccessResult<R> | IFailureResult

/**
 * Logic spec
 */
