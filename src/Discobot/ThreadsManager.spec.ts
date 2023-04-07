import type {IThread} from "./ThreadsManager/Thread.spec"

/***********************************************************************************
 * Spécification de forme
 **********************************************************************************/
export interface IThreadsManager {
	get(id: string): IThread | undefined
	set(id: string, thread: IThread): void
	delete(id: string): boolean
}

/***********************************************************************************
 * Spécification de comportement
 **********************************************************************************/
