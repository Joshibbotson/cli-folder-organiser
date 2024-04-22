import { rules } from "../../services/Rules";
import { endProgram } from "../../utils/endProgram";
import { openNewRuleList } from "../new-rule-menu/newRuleMenu.menu";
import inquirer from "inquirer";
import { fileManagement } from "../../services/FileManagement";
import { Logger } from "../../services/Logger";
import { openResetRuleConfirm } from "../reset-rules-menu/resetRule.menu";
import { promptBuilder } from "../../utils/promptBuilder";
import { openDeleteRuleInput } from "../delete-rule-menu/deleteRuleMenu.menu";

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
            Logger.error(
                "Prompt couldn't be rendered in the current environment"
            );
        } else {
            Logger.error(`An error occurred: ${error}`);
        }
    }
}

export function initialQuestions() {
    return promptBuilder(
        "list",
        "answer",
        "Please select an option to start: ",
        [
            "See existing rules",
            "Add new rule",
            "Delete rule",
            "Reset all rules",
            fileManagement.isWatchingDirectories()
                ? "Stop Folder Organiser"
                : "Start Folder Organiser",
            "Exit",
        ]
    );
}

export async function handleMainMenuSelection(answer: string) {
    switch (answer) {
        case "See existing rules":
            await rules.printRuleFile();
            break;
        case "Stats for nerds":
            await rules.printRuleFile();
            break;
        case "Add new rule":
            await openNewRuleList();
            break;
        case "Delete rule":
            await openDeleteRuleInput();
            break;
        case "Reset all rules":
            await openResetRuleConfirm();
            break;
        case "Start Folder Organiser":
            await fileManagement.startDirectoryWatchers();
            break;
        case "Stop Folder Organiser":
            await fileManagement.stopAllDirectoryWatchers();
            break;
        case "Exit":
            endProgram();
            break;
    }
}
