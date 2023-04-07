import {z} from "zod"
import type {TJSON} from "../../utils/JSON.spec"
import type {IChannel} from "./ChannelsManager/Channel.spec"
import ChannelsManager from "./ChannelsManager"

/***********************************************************************************
 * Spécification de forme
 **********************************************************************************/

/**
 * Le type d'un objet de configuration d'un gestionnaire de channel est défini par son schéma de validation
 */
export type TConfig = z.infer<typeof ChannelsManager.configSchema>

export interface IChannelsManager {
	toJSON(): TJSON
	get(id: string): IChannel | undefined
}

/***********************************************************************************
 * Spécification de comportement
 **********************************************************************************/
