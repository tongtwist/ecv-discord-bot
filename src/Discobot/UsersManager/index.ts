import {z} from "zod"
import type {TJSON, TJSONObject} from "../../utils/JSON.spec"
import type {TConfig as TUserConfig, IUser} from "./User.spec"
import User from "./User"
import type {TConfig, IUsersManager} from "../UsersManager.spec"

export default class UsersManager implements IUsersManager {
	static readonly configSchema = z.array(User.configSchema)

	static create(cfg: TConfig): IUsersManager {
		const users = new Map<string, IUser>()
		for (const user of cfg) {
			users.set(user.id, User.create(user))
		}
		return new UsersManager(users)
	}

	private constructor(private readonly _users: Map<string, IUser>) {}

	toJSON(): TJSON {
		const ret: TJSONObject[] = []
		for (const [_, user] of this._users) {
			ret.push(user.toJSON())
		}
		return ret
	}

	get(id: string): IUser | undefined {
		return this._users.get(id)
	}

	delete(id: string): boolean {
		return this._users.delete(id)
	}

	set(userConfig: TUserConfig) {
		this._users.set(userConfig.id, User.create(userConfig))
	}

	getOrCreate(userConfig: TUserConfig): [IUser, boolean] {
		const currentUser = this._users.get(userConfig.id)
		const needUpdate = !currentUser || currentUser.openAI.key !== userConfig.openAI
		if (needUpdate) {
			this.set(userConfig)
		}
		return [this._users.get(userConfig.id)!, needUpdate]
	}
}
