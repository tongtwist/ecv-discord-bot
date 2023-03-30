import type { TCommand } from "../command.spec"
import { setup } from "./setup"
import { listModels } from "./listModels"
import { complete } from "./complete"

export const openAICommands: TCommand[] = [
	setup,
	listModels,
	complete
]
