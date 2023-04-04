import type {SlashCommandBuilder} from "discord.js"

/**
 * Spécifications de forme
 */

/**
 * La description d'un objet contenant les propriétés de création d'une commande
 */
export type TCreationProperties = {
	/**
	 * Le numéro de révision à attribuer à la commande
	 *
	 * @type {number}
	 * @memberof TCreationProperties
	 */
	revision: number

	/**
	 * La description dans la représentation de Discord de la commande
	 *
	 * @type {SlashCommandBuilder}
	 */
	data: SlashCommandBuilder

	/**
	 * La fonction à exécuter lors de l'appel de la commande par un utilisateur
	 *
	 * @param {...any[]} args: Un nombre variable d'arguments quelconques à passer à la fonction
	 * @return {Promise<void>}
	 */
	execute(...args: any[]): Promise<void>
}

/**
 * Une commande Discord telle qu'elle est utilisée par le reste du code
 *
 * @export
 * @interface ICommand
 */
export interface ICommand {
	/**
	 * Le numéro de révision de la commande
	 *
	 * @type {number}
	 * @memberof ICommand
	 */
	readonly revision: number

	/**
	 * La description dans la représentation de Discord de la commande
	 *
	 * @type {SlashCommandBuilder}
	 * @memberof ICommand
	 */
	readonly data: SlashCommandBuilder

	/**
	 * La fonction à exécuter lors de l'appel de la commande par un utilisateur
	 *
	 * @param {...any[]} args
	 * @return {Promise<void>}
	 * @memberof ICommand
	 */
	execute(...args: any[]): Promise<void>
}

/**
 * Spécifications de comportement
 */
