import {z} from "zod"
import type {Guild} from "discord.js"
import type {IServer} from "./ServersManager/Server.spec"
import type {IDiscobot} from "../Discobot.spec"
import type {TJSON} from "../utils/JSON.spec"
import ServersManager from "./ServersManager"

/**
 * Shape spec
 */
export type TConfig = z.infer<typeof ServersManager.configSchema>

export interface IServersManager {
	toJSON(): TJSON
	get(id: string): IServer | undefined
	getOrCreate(s: string | Guild): Promise<IServer>
}

/**
 * Logic spec
 */
