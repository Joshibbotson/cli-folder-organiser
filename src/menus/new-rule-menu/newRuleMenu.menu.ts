import inquirer from "inquirer";
import { openMainMenu } from "../main-menu/mainMenu.menu";
import { rules } from "../../services/Rules";
import { ICreateRule } from "../types";
import { Logger } from "../../services/Logger";
import { promptBuilder } from "../../utils/promptBuilder";
import { fileManagement } from "../../services/FileManagement.service";

let dirInValue = "";
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
    ...promptBuilder("input", "ruleName", "Enter the rule name:", {
        validate: notNull,
    }),
    ...promptBuilder("input", "dirIn", "Enter the directory path:", {
        validate: path => {
            const validation = directoryValidation(path);
            if (validation === true) {
                dirInValue = path; // Store dirIn value if validation is successful
            }
            return validation;
        },
    }),
    ...promptBuilder("input", "fileExtensions", "Target File extension:", {}),
    ...promptBuilder(
        "input",
        "fileName",
        "Target File includes characters:",
        {}
    ),
    ...promptBuilder("input", "dirOut", "Directory to move to:", {
        validate: notNull,
    }),
    ...promptBuilder("confirm", "recursive", "Perform rule recursively?", {}),
    ...promptBuilder("confirm", "isActive", "Is the rule active?", {}),
];

function directoryValidation(path: string): boolean | string {
    const pathExists = fileManagement.checkPathExists(path);
    return pathExists ? true : "Path does not exist";
}

function directoryOutValidation(
    previousDirIn: string
): (path: string) => boolean | string {
    return path => {
        if (!notNull(path)) {
            return "Output directory cannot be empty";
        }
        if (path === previousDirIn) {
            return "Output directory must be different from input directory";
        }
        return true;
    };
}

function notNull(value: string): boolean | string {
    return value.length > 0 ? true : "Cannot be empty";
}
