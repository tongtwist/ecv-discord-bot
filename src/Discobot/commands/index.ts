import type {ICommand} from "../command.spec"
import {helloCommand} from "./hello"
import {openAICommands} from "./openai"

export const commands: ICommand[] = [helloCommand].concat(openAICommands)
