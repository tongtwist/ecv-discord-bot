import {z} from "zod"
import type {Guild} from "discord.js"
import type {IOpenAI} from "../OpenAI.spec"
import type {TJSONObject} from "../utils/JSON.spec"
import Server from "./Server"

/***********************************************************************************
 * Spécification de forme
 **********************************************************************************/

/**
 * Le type d'un objet de configuration de serveur est défini par son schéma de validation
 */
export type TConfig = z.infer<typeof Server.configSchema>

/**
 * Le gestionnaire d'un serveur discord tel qu'il est utilisé par le reste du code
 *
 * @export
 * @interface IServer
 */
export interface IServer {
	/**
	 * L'identifiant du serveur
	 *
	 * @type {string}
	 * @memberof IServer
	 */
	readonly id: string

	/**
	 * Le nom du serveur. Ne peut être récupéré que si le serveur est disponible actuellement
	 *
	 * @type {string}
	 * @memberof IServer
	 */
	readonly name?: string

	/**
	 * Est-ce que le serveur est disponible actuellement ?
	 *
	 * @type {boolean}
	 * @memberof IServer
	 */
	readonly available: boolean

	/**
	 * L'objet Guild éventuellement associé au serveur si le serveur est disponible actuellement
	 *
	 * @type {Guild}
	 * @memberof IServer
	 */
	guild?: Guild

	/**
	 * La conversion sous forme d'objet JSON de la configuration du serveur
	 *
	 * @return {TJSONObject}
	 * @memberof IServer
	 */
	toJSON(): TJSONObject

	/**
	 * Gère l'association d'une instance OpenAI à un utilisateur sur ce serveur
	 *
	 * @param {string} userId: L'identifiant de l'utilisateur
	 * @param {IOpenAI | string | false} [openAI] L'instance OpenAI à associer à l'utilisateur, ou son identifiant, ou false pour désassocier une précédente instance OpenAI de l'utilisateur
	 * @return {IOpenAI | false}
	 * @memberof IServer
	 */
	openAI(userId: string, openAI?: IOpenAI | string | false): IOpenAI | false
}

/***********************************************************************************
 * Spécification de comportement
 **********************************************************************************/
