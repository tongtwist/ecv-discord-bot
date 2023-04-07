import type {IThread} from "./Thread.spec"
import type {IThreadsManager} from "../ThreadsManager.spec"

export default class ThreadsManager implements IThreadsManager {
	static create(): ThreadsManager {
		return new ThreadsManager(new Map())
	}

	private constructor(private readonly _threads: Map<string, IThread>) {}

	get(id: string): IThread | undefined {
		return this._threads.get(id)
	}

	set(id: string, thread: IThread): void {
		this._threads.set(id, thread)
	}

	delete(id: string): boolean {
		return this._threads.delete(id)
	}
}
