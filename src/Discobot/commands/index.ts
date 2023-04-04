import type {ICommand} from "../command.spec"
import {helloCommand} from "./hello"
import {openAICommands} from "./openai"

/**
 * La liste des commandes à déployer sur le serveur Discord
 */
export const commands: ICommand[] = [helloCommand].concat(openAICommands)

export * from "./hello"
export * from "./openai"
