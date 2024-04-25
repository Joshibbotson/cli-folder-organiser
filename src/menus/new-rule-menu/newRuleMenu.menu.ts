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
            "Enter target file extensions, separated by spaces (e.g., .txt .jpeg .mpeg):",
            {}
        ),
        ...promptBuilder(
            "input",
            "fileName",
            'Enter target file strings, space-separated and enclosed in quotes (e.g., "example1" "example2"):',
            {
                validate: fileName => this.fileNameValidation(fileName),
            }
        ),
        ...promptBuilder(
            "list",
            "fileNameAllOrAny",
            "Select matching criteria for file strings: match ALL specified strings, or ANY of the strings:",
            {
                choices: [
                    { name: "All Strings (ALL)", value: "ALL" },
                    { name: "Any String (ANY)", value: "ANY" },
                ],
            }
        ),
        ...promptBuilder(
            "list",
            "ruleAndOrOptions",
            "Specify how to match: by BOTH File Extensions AND File Names, OR by EITHER:",
            {
                choices: [
                    { name: "Both (AND)", value: "AND" },
                    { name: "Either (OR)", value: "OR" },
                ],
            }
        ),
        ...promptBuilder("input", "dirOut", "Directory to move to:", {
            validate: dirOutPath => this.directoryOutValidation(dirOutPath),
        }),
        ...promptBuilder(
            "input",
            "ignoredSubDirectories",
            'Directories to ignore: space-separated and enclosed in quotes (e.g., "/targetDirectory/subDirectory1" "/targetDirectory/subDirectory2"):\n',
            { validate: value => this.noMisMatchedQuotationMarks(value) }
        ),
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

    private fileNameValidation(value: string): boolean | string {
        const emptyRuleCheck = this.noEmptyRule(value);
        if (emptyRuleCheck !== true) {
            return emptyRuleCheck;
        }

        const quotationMarkCheck = this.noMisMatchedQuotationMarks(value);
        if (quotationMarkCheck !== true) {
            return quotationMarkCheck;
        }

        return true;
    }

    private noEmptyRule(value: string): boolean | string {
        if (this.fileExtensions.length > 0) {
            return true;
        } else if (!value) {
            return "Must have at least one rule option: target file extensions or file names";
        }
        return true;
    }

    private noMisMatchedQuotationMarks(inputString: string): boolean | string {
        let cleanedString = inputString.replace(/\\"/g, "");
        const quotationCount = (cleanedString.match(/"/g) || []).length;

        if (quotationCount % 2 !== 0) {
            return 'Mismatched quotation marks: please ensure every opening " is paired with a closing "';
        }

        if (
            (cleanedString.startsWith('"') && !cleanedString.endsWith('"')) ||
            (!cleanedString.startsWith('"') && cleanedString.endsWith('"'))
        ) {
            return "Unmatched quotation mark at the start or end of the string.";
        }

        let segments = inputString.split('"');
        let inQuotes = false;
        for (let i = 0; i < segments.length; i++) {
            if (i % 2 === 1) {
                inQuotes = !inQuotes;
            } else {
                if (segments[i].trim().length > 0) {
                    return (
                        "All text must be enclosed in quotation marks. Issue found around: " +
                        segments[i].trim()
                    );
                }
            }
        }

        if (inQuotes) {
            return "Unmatched quotation mark found.";
        }

        return true;
    }
}

export const newRuleMenu = new NewRuleMenu();
