import inquirer from "inquirer";
import { newRuleQuestions } from "../prompts/prompts";
import { openMainMenu } from "./mainMenu.menu";

export async function openNewRuleList() {
    try {
        let newRuleSpecification = await inquirer.prompt(newRuleQuestions);
        console.log("answer: ", newRuleSpecification);
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
