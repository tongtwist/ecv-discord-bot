import {z} from "zod"
import type {User as DiscordUser} from "discord.js"
import type {TJSONObject} from "../utils"
import type {IOpenAI} from "../OpenAI.spec"
import User from "./User"

/***********************************************************************************
 * Spécification de forme
 **********************************************************************************/

/**
 * Le type d'un objet de configuration d'utilisateur est défini par son schéma de validation
 */
export type TConfig = z.infer<typeof User.configSchema>

/**
 * Un utilisateur du bot tel qu'il est utilisé par le reste du code
 *
 * @export
 * @interface IUser
 */
export interface IUser {
	/**
	 * L'identifiant de l'utilisateur
	 *
	 * @type {string}
	 * @memberof IUser
	 */
	readonly id: string

	/**
	 * Le nom de l'utilisateur. Ne peut être récupéré que si l'utilisateur est disponible actuellement
	 *
	 * @type {string}
	 * @memberof IUser
	 */
	readonly name?: string

	/**
	 * L'instance {@link IOpenAI | OpenAI} associée à l'utilisateur
	 *
	 * @type {IOpenAI}
	 * @memberof IUser
	 */
	readonly openAI: IOpenAI

	/**
	 * Associe un objet représentant un utilisateur Discord à l'utilisateur
	 *
	 * @param {DiscordUser} user
	 * @memberof IUser
	 */
	setDiscordUser(user: DiscordUser): boolean

	/**
	 * La conversion sous forme d'objet JSON de la configuration de l'utilisateur
	 *
	 * @return {TJSONObject}
	 * @memberof IUser
	 */
	toJSON(): TJSONObject
}

/***********************************************************************************
 * Spécification de comportement
 **********************************************************************************/
