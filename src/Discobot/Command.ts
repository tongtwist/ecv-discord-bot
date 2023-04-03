import type {SlashCommandBuilder} from "discord.js"
import type {TCreationProperties, ICommand} from "./command.spec"

export default class Command implements ICommand {
	private constructor(
		private readonly _revision: number,
		private readonly _data: SlashCommandBuilder,
		private readonly _execute: (...args: any[]) => Promise<void>,
	) {
		Object.freeze(this)
	}

	get revision() {
		return this._revision
	}
	get data() {
		return this._data
	}
	get execute() {
		return this._execute
	}

	static fromConfig(cfg: TCreationProperties): ICommand {
		return new Command(cfg.revision, cfg.data, cfg.execute)
	}
}
