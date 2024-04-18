import { initialQuestions } from "../prompts/prompts";
import { closeServer, server, startServer } from "../server";
import { rules } from "../features/Rules";
import { endProgram } from "../utils/endProgram";
import { openNewRuleList } from "./newRuleMenu.menu";
import inquirer from "inquirer";

export async function openMainMenu() {
    try {
        const initialQuestionsPrompt = initialQuestions();
        let initialQuestionAnswer = await inquirer.prompt(
            initialQuestionsPrompt
        );
        if (initialQuestionAnswer.answer !== "Exit") {
            await handleMainMenuSelection(initialQuestionAnswer.answer);
        } else {
            endProgram();
        }
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

export async function handleMainMenuSelection(answer: string) {
    switch (answer) {
        case "See existing rules":
            await rules.printRuleFile();
            break;
        case "Add new rule":
            await openNewRuleList();
            break;
        case "Reset all rules":
            await rules.resetRuleFile();
            break;
        case "Start Folder Organiser":
            await startServer();
            break;
        case "Stop Folder Organiser":
            await closeServer();
        case "Exit":
            endProgram();
    }
}
