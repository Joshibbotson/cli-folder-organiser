import inquirer from "inquirer";
import { rules } from "../../services/Rules";
import { Logger } from "../../services/Logger";
import { openMainMenu } from "../main-menu/mainMenu.menu";
import { promptBuilder } from "../../utils/promptBuilder";

export async function openResetRuleConfirm() {
    try {
        let resetAllRules = await inquirer.prompt(resetRuleYesOrNo);
        resetAllRules.answer ? rules.resetRuleFile() : await openMainMenu();
    } catch (error) {
        if (error.isTtyError) {
            Logger.error(
                "Prompt couldn't be rendered in the current environment"
            );
        } else {
            Logger.error("An error occurred:", error);
        }
    }
}

export const resetRuleYesOrNo = promptBuilder(
    "confirm",
    "answer",
    "Are you sure you want to reset all folder organiser rules?"
);
