import inquirer from "inquirer";
import { services } from "../services/index";
import { Logger } from "../services/Logger.service";
import { promptBuilder } from "../utils/promptBuilder";
import { menus } from ".";

export async function openResetRuleConfirm() {
    try {
        let resetAllRules = await inquirer.prompt(resetRuleYesOrNo);
        resetAllRules.answer
            ? services.rules.resetRuleFile()
            : await menus.mainMenu.openMainMenu();
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
    "Are you sure you want to reset all folder organiser rules?",
    {}
);
