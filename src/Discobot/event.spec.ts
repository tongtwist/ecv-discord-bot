import type {ClientEvents} from "discord.js"

/**
 * Spécification de forme
 */

/**
 * La description d'un objet contenant les propriétés de création d'un événement
 */
export type TCreationProperties = {
	/**
	 * Le nom de l'événement parmi ceux disponibles dans la documentation de Discord.js
	 *
	 * @type {keyof ClientEvents}
	 */
	name: keyof ClientEvents

	/**
	 * Indique si l'événement ne doit être géré qu'une seule fois
	 */
	once?: boolean

	/**
	 * La fonction à exécuter lors de la réception de l'événement Discord par le bot
	 *
	 * @param {...any[]} args
	 * @return {Promise<void>}
	 */
	execute(...args: any[]): Promise<void>
}

/**
 * Un événement Discord telle qu'il est utilisé par le reste du code
 *
 * @export
 * @interface IEvent
 */
export interface IEvent {
	/**
	 * Le nom de l'événement parmi ceux disponibles dans la documentation de Discord.js
	 *
	 * @type {keyof ClientEvents}
	 * @memberof IEvent
	 */
	readonly name: keyof ClientEvents

	/**
	 * Indique si l'événement ne doit être géré qu'une seule fois
	 *
	 * @type {boolean}
	 * @memberof IEvent
	 */
	readonly once: boolean

	/**
	 * La fonction à exécuter lors de la réception de l'événement Discord par le bot
	 *
	 * @param {...any[]} args
	 * @return {Promise<void>}
	 * @memberof IEvent
	 */
	execute(...args: any[]): Promise<void>
}

/**
 * Spécification de comportement
 */
