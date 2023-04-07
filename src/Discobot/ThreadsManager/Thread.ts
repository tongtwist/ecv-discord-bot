import type {ThreadChannel} from "discord.js"
import type {IThread} from "./Thread.spec"

export default class Thread implements IThread {
	static create(id: string, thread?: ThreadChannel) {
		return new Thread(id, thread)
	}

	private _history: any[]

	private constructor(private readonly _id: string, private _thread?: ThreadChannel) {
		this._history = []
	}

	get id() {
		return this._id
	}
	get thread() {
		return this.thread
	}
	set thread(newThread: ThreadChannel | undefined) {
		this._thread = newThread
	}
}
