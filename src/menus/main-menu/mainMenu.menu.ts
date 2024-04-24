import { rules } from "../../services/Rules";
import { endProgram } from "../../utils/endProgram";
import { openNewRuleList } from "../new-rule-menu/newRuleMenu.menu";
import inquirer from "inquirer";
import { fileManagement } from "../../services/FileManagement.service";
import { Logger } from "../../services/Logger";
import { openResetRuleConfirm } from "../reset-rules-menu/resetRule.menu";
import { promptBuilder } from "../../utils/promptBuilder";
import { deleteMenu } from "../delete-rule-menu/deleteRuleMenu.menu";

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
        {
            choices: [
                { name: "See existing rules", value: "See existing rules" },
                { name: "Stats for nerds", value: "Stats for nerds" },
                { name: "Add new rule", value: "Add new rule" },
                { name: "Delete rule", value: "Delete rule" },
                { name: "Reset all rules", value: "Reset all rules" },
                fileManagement.isWatchingDirectories()
                    ? {
                          name: "Stop Folder Organiser",
                          value: "Stop Folder Organiser",
                      }
                    : {
                          name: "Start Folder Organiser",
                          value: "Start Folder Organiser",
                      },
                { name: "Exit", value: "Exit" },
            ],
        }
    );
}
export async function handleMainMenuSelection(answer: string) {
    switch (answer) {
        case "See existing rules":
            await rules.printRuleFile();
            break;
        case "Stats for nerds":
            await rules.printStats();
            break;
        case "Add new rule":
            await openNewRuleList();
            break;
        case "Delete rule":
            await deleteMenu();
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
