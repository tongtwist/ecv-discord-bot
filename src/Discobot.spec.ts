import type {Client, Guild} from "discord.js"
import type {IServer} from "./Discobot/Server.spec"
import type {IOpenAI} from "./OpenAI.spec"

/************************************************************************************
 * Spécification de forme
 ***********************************************************************************/

/**
 * Interface du bot utilisé par le reste du code
 *
 * @export
 * @interface IDiscobot
 * @extends {Client}
 */
export interface IDiscobot extends Client {
	readonly clientId: string

	/**
	 * Renvoie le token du bot
	 *
	 * @return {string}
	 * @memberof IDiscobot
	 */
	getToken(): string

	/**
	 * Lance le redéploiement éventuel des commandes en fonction de leur révision et de la date de dernier déploiement
	 *
	 * @return {Promise<boolean>}
	 * @memberof IDiscobot
	 */
	redeployCommands(): Promise<boolean>

	/**
	 * Charge les serveurs depuis la configuration et à partir de l'API Discord
	 *
	 * @return {Promise<void>}
	 * @memberof IDiscobot
	 */
	populateServers(): Promise<void>

	/**
	 * Affiche dans la console un message de salutation indiquant que le bot est prêt à fonctionner
	 *
	 * @return {Promise<void>}
	 * @memberof IDiscobot
	 */
	logWelcome(): void

	/**
	 * Lance le bot
	 *
	 * @return {Promise<void>}
	 * @memberof IDiscobot
	 */
	start(): Promise<void>

	/**
	 * Retourne une instance de {@link IOpenAI | OpenAI} associée à l'utilisateur si elle existe
	 *
	 * @param {string} userId: L'identifiant de l'utilisateur
	 * @param {string} [serverId]: L'identifiant éventuel du serveur. Si non fourni, c'est l'instance {@link IOpenAI | OpenAI} par défaut de l'utilisateur si elle existe qui sera retournée
	 * @return {(IOpenAI | false)}
	 * @memberof IDiscobot
	 */
	getOpenAI(userId: string, serverId?: string): IOpenAI | false

	/**
	 * Associe ou supprime une instance de {@link IOpenAI | OpenAI} à un utilisateur
	 *
	 * @param {string} userId: L'identifiant de l'utilisateur
	 * @param {(IOpenAI | string | false)} openAI: L'instance de {@link IOpenAI | OpenAI} à associer ou la clé d'API à utiliser pour créer une instance de {@link IOpenAI | OpenAI} ou `false` pour supprimer l'instance de {@link IOpenAI | OpenAI} associée à l'utilisateur
	 * @param {(string | Guild)} [serverId]: L'identifiant éventuel du serveur. Si non fourni, c'est l'instance {@link IOpenAI | OpenAI} par défaut de l'utilisateur qui sera associée ou supprimée
	 * @return {(Promise<IOpenAI | false>)}
	 * @memberof IDiscobot
	 */
	setOpenAI(userId: string, openAI: IOpenAI | string | false, serverId?: string | Guild): Promise<IOpenAI | false>

	/**
	 * Retourne une instance de {@link IServer | Server} associée à un serveur discord (Guild) et la crée si elle n'existe pas
	 *
	 * @param {(string | Guild)} server
	 * @return {Promise<IServer>}
	 * @memberof IDiscobot
	 */
	getOrCreateServer(server: string | Guild): Promise<IServer>

	/**
	 * Sauvegarde la configuration du bot
	 *
	 * @return {Promise<void>}
	 * @memberof IDiscobot
	 */
	saveConfig(): Promise<void>
}

/************************************************************************************
 * Spécification de comportement
 ***********************************************************************************/
