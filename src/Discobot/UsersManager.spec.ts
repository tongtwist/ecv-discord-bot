import {z} from "zod"
import type {TJSON} from "../utils/JSON.spec"
import type {TConfig as TUserConfig, IUser} from "./UsersManager/User.spec"
import UsersManager from "./UsersManager"

/**
 * Shape spec
 */
export type TConfig = z.infer<typeof UsersManager.configSchema>

export interface IUsersManager {
	toJSON(): TJSON
	get(id: string): IUser | undefined
	delete(id: string): boolean
	set(userConfig: TUserConfig): void
	getOrCreate(userConfig: TUserConfig): [IUser, boolean]
}

/**
 * Logic spec
 */
