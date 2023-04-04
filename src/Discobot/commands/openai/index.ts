import type {ICommand} from "../../command.spec"
import {setup} from "./setup"
import {listModels} from "./listModels"
import {completeText} from "./completeText"

/**
 * La liste des commandes OpenAI à déployer sur le serveur Discord
 */
export const openAICommands: ICommand[] = [setup, listModels, completeText]

export * from "./completeText"
export * from "./listModels"
export * from "./setup"
