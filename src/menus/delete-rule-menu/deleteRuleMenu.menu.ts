import inquirer from "inquirer";
import { openMainMenu } from "../main-menu/mainMenu.menu";
import { rules } from "../../services/Rules";
import { Logger } from "../../services/Logger";
import { promptBuilder } from "../../utils/promptBuilder";

export async function openDeleteRuleInput() {
    try {
        let answer = await inquirer.prompt(deleteRuleInput);
        // Logger.info("answer: ", newRuleSpecification);
        rules.deleteRule(Number(answer.id));
        await openMainMenu();
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

export const deleteRuleInput = promptBuilder(
    "input",
    "id",
    "Delete rule by ID:"
);
