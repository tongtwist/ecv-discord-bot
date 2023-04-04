import {z} from "zod"
import type {Guild} from "discord.js"
import type {IOpenAI} from "../OpenAI.spec"
import type {TJSONObject} from "../utils/JSON.spec"
import Server from "./Server"

/**
 * Spécification de forme
 */
export type TConfig = z.infer<typeof Server.configSchema>

export interface IServer {
	readonly id: string
	readonly name?: string
	readonly available: boolean
	guild?: Guild
	toJSON(): TJSONObject
	openAI(userId: string, openAI?: IOpenAI | string | false): IOpenAI | false
}

/**
 * Spécification de comportement
 */
