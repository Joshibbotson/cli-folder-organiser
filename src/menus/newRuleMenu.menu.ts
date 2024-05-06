import inquirer from "inquirer";
import { services } from "../services/index";
import { ICreateRule } from "./types";
import { Logger } from "../services/Logger.service";
import { promptBuilder } from "../utils/promptBuilder.utils";
import { menus } from ".";

export class NewRuleMenu {
    private dirInValue = "";
    private fileNames = "";
    private fileExtensions = "";
    private async generateDynamicPrompts() {
        let responses = await inquirer.prompt([
            ...promptBuilder("input", "ruleName", "Enter the rule name:", {
                validate: value => this.notNull(value),
            }),
            ...promptBuilder("input", "dirIn", "Enter the directory path:", {
                validate: dir => this.directoryValidation(dir),
            }),
            ...promptBuilder(
                "input",
                "fileExtensions",
                "Enter target file extensions, separated by spaces (e.g., .txt .jpeg .mpeg):",
                {
                    validate: value => {
                        this.fileExtensions = value;
                        return true;
                    },
                }
            ),
            ...promptBuilder(
                "input",
                "fileName",
                "Enter target file strings, space-separated and enclosed in quotes (e.g., example1 | example2):",
                {
                    validate: fileName => this.noEmptyRule(fileName),
                }
            ),
        ]);

        // Set defaults for conditional fields
        responses.fileNameMatchCriteria = "N/A";
        responses.ruleAndOrOptions = "N/A";

        // Dynamically add prompts based on previous responses
        if (responses.fileName && responses.fileName.trim().length > 0) {
            let additionalResponses = await inquirer.prompt([
                ...promptBuilder(
                    "list",
                    "fileNameMatchCriteria",
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
            ]);

            responses.fileNameMatchCriteria =
                additionalResponses.fileNameMatchCriteria;
            responses.ruleAndOrOptions = additionalResponses.ruleAndOrOptions;
        }

        let finalResponses = await inquirer.prompt([
            ...promptBuilder("input", "dirOut", "Directory to move to:", {
                validate: dirOutPath => this.directoryOutValidation(dirOutPath),
            }),
            ...promptBuilder(
                "input",
                "ignoredSubDirectories",
                "Directories to ignore: space-separated and enclosed in quotes (e.g., /targetDirectory/subDirectory1 | /targetDirectory/subDirectory2):\n",
                {
                    validate: childPaths =>
                        this.directoriesToIgnoreValidation(childPaths),
                }
            ),
            ...promptBuilder(
                "confirm",
                "recursive",
                "Perform rule recursively?",
                {}
            ),
            ...promptBuilder("confirm", "isActive", "Is the rule active?", {}),
        ]);

        return { ...responses, ...finalResponses };
    }

    public async openNewRuleList() {
        try {
            let newRuleSpecification = await this.generateDynamicPrompts();
            services.rules.addRule(newRuleSpecification);
            await menus.mainMenu.openMainMenu();
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
        this.dirInValue = path;
        const pathExists = services.fileManagement.checkPathExists(path);
        return pathExists ? true : "Path does not exist";
    }

    private directoriesToIgnoreValidation(
        childPaths: string
    ): boolean | string {
        const childPathsArr = this.extractQuotedStrings(childPaths);
        let badPath;
        let valid = true;
        if (childPaths.length > 0) {
            childPathsArr.forEach(childPath => {
                if (childPath === this.dirInValue) {
                    valid = false;
                    badPath = childPath;
                }
                if (
                    !services.fileManagement.checkPathIsSubDirectory(
                        this.dirInValue,
                        childPath
                    )
                ) {
                    valid = false;
                    badPath = childPath;
                }
            });
        }
        return valid
            ? valid
            : `${badPath} is not a sub directory of ${this.dirInValue}`;
    }

    private extractQuotedStrings(inputString: string): string[] | [] {
        let tmp: string[] = [];
        let strings: string[] = [];
        let push = true;
        for (let i = 0; i < inputString.length; i++) {
            if (inputString[i] === "|") {
                push = false;
                if (tmp.length > 0) {
                    strings.push(tmp.join("").trim());
                }
                tmp = [];
            }
            if (inputString[i] !== "|") {
                push = true;
            }
            if (push) {
                tmp.push(inputString[i]);
            }
        }
        if (tmp.length > 0) {
            strings.push(tmp.join("").trim());
        }
        return strings;
    }

    private directoryOutValidation(dirOutValue: string): boolean | string {
        if (typeof this.notNull(dirOutValue) === "string") {
            return "Output directory cannot be empty";
        }
        if (dirOutValue.trim() === this.dirInValue) {
            return "Output directory must be different from input directory";
        }
        return true;
    }

    private notNull(value: string): boolean | string {
        return value.length > 0 ? true : "Cannot be empty";
    }

    private noEmptyRule(value: string): boolean | string {
        this.fileNames = value;
        if (this.fileExtensions.length > 0) {
            return true;
        } else if (!value) {
            return "Must have at least one rule option: target file extensions or file names";
        }
        return true;
    }
}
