import type {TCommand} from "./command.spec"
import {helloCommand} from "./hello"
import {openAICommands} from "./openai"

export const commands: TCommand[] = [helloCommand].concat(openAICommands)
