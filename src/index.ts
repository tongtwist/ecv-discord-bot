import process from "node:process"
import path from "node:path"
import {IResult, Result} from "@tongtwist/result-js"
import {log} from "./utils/log"
import type {IDiscobot} from "./Discobot.spec"
import Discobot from "./Discobot"

async function main() {
	log("Loading...")
	const configPath = path.join(process.cwd(), "discobot.json")
	const bot: IResult<IDiscobot> = await Discobot.fromConfig(configPath)
	if (Result.isSuccess(bot)) {
		await bot.value.start()
	} else {
		log(bot.error.message)
	}
}
main()
