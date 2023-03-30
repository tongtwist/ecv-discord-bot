import process from "node:process"
import path from "node:path"
import { log } from "./log"
import { Discobot } from "./Discobot"

async function main() {
	log("Loading...")

	const bot = await Discobot.fromConfig(path.join(process.cwd(), "discobot.json"))
	await bot.start()
}
main()
