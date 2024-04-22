import inquirer from "inquirer";
import { openMainMenu } from "../main-menu/mainMenu.menu";
import { rules } from "../../services/Rules";
import { ICreateRule } from "../types";
import { Logger } from "../../services/Logger";
import { promptBuilder } from "../../utils/promptBuilder";

export async function openNewRuleList() {
    try {
        let newRuleSpecification: ICreateRule = await inquirer.prompt(
            newRuleQuestions
        );
        Logger.info("answer: ", newRuleSpecification);
        rules.addRule(newRuleSpecification);
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

export const newRuleQuestions = [
    ...promptBuilder("input", "ruleName", "Enter the rule name:"),
    ...promptBuilder("input", "dirIn", "Enter the directory path:"),
    ...promptBuilder("input", "fileExtensions", "Target File extension:"),
    ...promptBuilder("input", "fileName", "Target File includes characters:"),
    ...promptBuilder("input", "dirOut", "Directory to move to:"),
    ...promptBuilder("confirm", "recursive", "Perform rule recursively?"),
    ...promptBuilder("confirm", "isActive", "Is the rule active?"),
];
