import { services } from "../services/index";
import { endProgram } from "../utils/endProgram.utils";
import inquirer from "inquirer";
import { Logger } from "../services/Logger.service";
import { openResetRuleConfirm } from "./resetRule.menu";
import { promptBuilder } from "../utils/promptBuilder.utils";
import { deleteMenu } from "./deleteRuleMenu.menu";
import { NewRuleMenu } from "./newRuleMenu.menu";
import { UpdateMenu } from "./UpdateRuleMenu.menu";

export class MainMenu {
    private readonly newRuleMenuReader: NewRuleMenu;
    private readonly updateMenuReader: UpdateMenu;

    constructor(newRuleMenuReader: NewRuleMenu, updateMenuReader: UpdateMenu) {
        this.newRuleMenuReader = newRuleMenuReader;
        this.updateMenuReader = updateMenuReader;
    }

    private async handleMainMenuSelection(answer: string) {
        switch (answer) {
            case "See existing rules":
                await services.rules.printRuleFile();
                break;
            case "Stats for nerds":
                await services.rules.printStats();
                break;
            case "Add new rule":
                await this.newRuleMenuReader.openNewRuleList();
                break;
            case "Update rule":
                await this.updateMenuReader.updateMenu();
                break;
            case "Delete rule":
                await deleteMenu();
                break;
            case "Reset all rules":
                await openResetRuleConfirm();
                break;
            case "Start Folder Organiser":
                await services.fileWatcher.startDirectoryWatchers();
                break;
            case "Stop Folder Organiser":
                await services.fileWatcher.stopAllDirectoryWatchers();
                break;
            case "Exit":
                endProgram();
                break;
        }
    }

    public async openMainMenu() {
        try {
            const initialQuestionsPrompt = this.initialQuestions();
            let initialQuestionAnswer = await inquirer.prompt(
                initialQuestionsPrompt
            );
            if (initialQuestionAnswer.answer !== "Exit") {
                await this.handleMainMenuSelection(
                    initialQuestionAnswer.answer
                );
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

    private initialQuestions() {
        return promptBuilder(
            "list",
            "answer",
            "Please select an option to start: ",
            {
                choices: [
                    { name: "See existing rules", value: "See existing rules" },
                    { name: "Stats for nerds", value: "Stats for nerds" },
                    { name: "Add new rule", value: "Add new rule" },
                    { name: "Update rule", value: "Update rule" },
                    { name: "Delete rule", value: "Delete rule" },
                    { name: "Reset all rules", value: "Reset all rules" },
                    services.fileWatcher.isWatchingDirectories()
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
                pageSize: 10,
            }
        );
    }
}
