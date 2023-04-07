import type {ICommand} from "../../Command.spec"
import {setup} from "./setup"
import {listModels} from "./listModels"
import {completeText} from "./completeText"

/**
 * La liste des commandes OpenAI à déployer sur le serveur Discord
 */
export const openAICommands: ICommand[] = [setup, listModels, completeText]
