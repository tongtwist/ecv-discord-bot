import type {ICommand} from "../../command.spec"
import {setup} from "./setup"
import {listModels} from "./listModels"
import {completeText} from "./completeText"

export const openAICommands: ICommand[] = [setup, listModels, completeText]
