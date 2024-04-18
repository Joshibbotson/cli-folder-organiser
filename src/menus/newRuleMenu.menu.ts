import inquirer from "inquirer";
import { newRuleQuestions } from "../prompts/prompts";
import { openMainMenu } from "./mainMenu.menu";
import { rules } from "../features/Rules";

export interface ICreateRule {
    ruleName: string;
    directoryPath: string;
    fileExtensions: string;
    isActive: boolean;
}

export async function openNewRuleList() {
    try {
        let newRuleSpecification: ICreateRule = await inquirer.prompt(
            newRuleQuestions
        );
        console.log("answer: ", newRuleSpecification);
        rules.addRule(newRuleSpecification);
        await openMainMenu();
    } catch (error) {
        if (error.isTtyError) {
            console.error(
                "Prompt couldn't be rendered in the current environment"
            );
        } else {
            console.error("An error occurred:", error);
        }
    }
}
