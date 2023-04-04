import process from "node:process"
import path from "node:path"
import {log} from "./utils/log"
import type {IDiscobot} from "./Discobot.spec"
import Discobot from "./Discobot"

async function main() {
	log("Loading...")

	const bot: IDiscobot = await Discobot.fromConfig(path.join(process.cwd(), "discobot.json"))
	await bot.start()
}
main()

export * from "./utils"
export * from "./Discobot"
export * from "./OpenAI"
export type * from "./Discobot.spec"
export type * from "./OpenAI.spec"
