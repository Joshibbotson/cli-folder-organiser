import inquirer from "inquirer";
import { openMainMenu } from "../main-menu/mainMenu.menu";
import { rules } from "../../services/Rules";
import { ICreateRule } from "../types";
import { Logger } from "../../services/Logger";
import { promptBuilder } from "../../utils/promptBuilder";
import { fileManagement } from "../../services/FileManagement.service";

export class NewRuleMenu {
    private dirInValue = "";
    private fileExtensions = "";
    private newRuleQuestions = [
        ...promptBuilder("input", "ruleName", "Enter the rule name:", {
            validate: value => this.notNull(value),
        }),
        ...promptBuilder("input", "dirIn", "Enter the directory path:", {
            validate: path => {
                const validation = this.directoryValidation(path);
                if (validation === true) {
                    this.dirInValue = path;
                }
                return validation;
            },
        }),
        ...promptBuilder(
            "input",
            "fileExtensions",
            "Target File extension:",
            {}
        ),
        ...promptBuilder(
            "input",
            "fileName",
            "Target File includes characters:",
            {
                validate: fileName => this.noEmptyRule(fileName),
            }
        ),
        ...promptBuilder("input", "dirOut", "Directory to move to:", {
            validate: dirOutPath => this.directoryOutValidation(dirOutPath),
        }),
        ...promptBuilder(
            "confirm",
            "recursive",
            "Perform rule recursively?",
            {}
        ),
        ...promptBuilder("confirm", "isActive", "Is the rule active?", {}),
    ];

    public async openNewRuleList() {
        try {
            let newRuleSpecification: ICreateRule = await inquirer.prompt(
                this.newRuleQuestions
            );
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

    private directoryValidation(path: string): boolean | string {
        const pathExists = fileManagement.checkPathExists(path);
        return pathExists ? true : "Path does not exist";
    }

    private directoryOutValidation(dirOutValue: string): boolean | string {
        if (typeof this.notNull(dirOutValue) === "string") {
            return "Output directory cannot be empty";
        }
        if (dirOutValue === this.dirInValue) {
            return "Output directory must be different from input directory";
        }
        return true;
    }

    private notNull(value: string): boolean | string {
        return value.length > 0 ? true : "Cannot be empty";
    }

    private noEmptyRule(value: string): boolean | string {
        if (this.fileExtensions.length > 0) {
            return true;
        } else if (!value) {
            return "Must have at least one rule option: target file extensions or file names";
        }
        return true;
    }
}

export const newRuleMenu = new NewRuleMenu();
