import type {ClientEvents} from "discord.js"
import type {IEvent, TCreationProperties} from "./event.spec"

export default class Event {
	private constructor(
		private readonly _name: keyof ClientEvents,
		private readonly _execute: (...args: any[]) => Promise<void>,
		private readonly _once: boolean = false,
	) {
		Object.freeze(this)
	}

	get name() {
		return this._name
	}
	get once() {
		return this._once
	}
	get execute() {
		return this._execute
	}

	static fromConfig(cfg: TCreationProperties): IEvent {
		return new Event(cfg.name, cfg.execute, cfg.once)
	}
}
