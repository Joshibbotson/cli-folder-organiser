import { menus } from ".";
import { CONSTANTS } from "../CONSTANTS";
import { services } from "../services";
import { Logger } from "../services/Logger.service";
import { promptBuilder } from "../utils/promptBuilder.utils";
import inquirer from "inquirer";

export class UpdateMenu {
    private selectedRule;
    async updateMenu() {
        try {
            const rulesList = await services.rules.readRuleFile();
            const formattedRuleList = [
                ...rulesList.map(rule => {
                    return { name: rule.rule, value: rule.id };
                }),
                {
                    name: CONSTANTS.BACK_TO_MAIN_MENU,
                    value: CONSTANTS.BACK_TO_MAIN_MENU,
                },
            ];

            const rulesToUpdateOptions = promptBuilder(
                "list",
                "answer",
                "Please select a rule to update to start: ",
                {
                    choices: Array.isArray(rulesList)
                        ? formattedRuleList
                        : [
                              {
                                  name: "No rules available",
                                  value: "No rules available",
                              },
                          ],
                    pageSize: 10,
                }
            );
            const { answer } = await inquirer.prompt(rulesToUpdateOptions);

            if (answer === "Back to Main Menu...") {
                await menus.mainMenu.openMainMenu();
            }

            const keysToRemove = [
                "id",
                "creationDate",
                "filesMoved",
                "filesRenamed",
                "filesDeleted",
            ];
            this.selectedRule = services.rules.readRuleById(answer);

            const cleanedRule = { ...this.selectedRule };

            keysToRemove.forEach(key => delete cleanedRule[key]);
            const formattedSelectedRule = [
                ...Object.entries(cleanedRule).map(field => {
                    return {
                        name: `\x1b[42m${field[0]}\x1b[0m: ${field[1]}`,
                        value: field[0],
                    };
                }),
                {
                    name: CONSTANTS.BACK_TO_MAIN_MENU,
                    value: CONSTANTS.BACK_TO_MAIN_MENU,
                },
            ];
            const selectedRuleToUpdateOptions = promptBuilder(
                "list",
                "chosenField",
                "Please selected a field to update: ",
                {
                    choices: formattedSelectedRule,
                    pageSize: 20,
                }
            );

            const { chosenField } = await inquirer.prompt(
                selectedRuleToUpdateOptions
            );

            const promptMapper = {
                rule: promptBuilder("input", "newValue", chosenField, {
                    default: cleanedRule[chosenField],
                    validate: value => this.notNull(value),
                }),
                directoryIn: promptBuilder("input", "newValue", chosenField, {
                    default: cleanedRule[chosenField],
                }),
                includedFileExtension: promptBuilder(
                    "input",
                    "newValue",
                    chosenField,
                    {
                        default: cleanedRule[chosenField],
                        validate: value => {
                            this.selectedRule.fileExtensions = value;
                            return true;
                        },
                    }
                ),
                includedFileNames: promptBuilder(
                    "input",
                    "newValue",
                    chosenField,
                    {
                        default: cleanedRule[chosenField],
                        validate: fileName => this.noEmptyRule(fileName),
                    }
                ),
                fileNameAllOrAny: promptBuilder(
                    "list",
                    "newValue",
                    `${chosenField}: ${cleanedRule[chosenField]}`,
                    {
                        default: cleanedRule[chosenField],
                        choices: [
                            { name: "All Strings (ALL)", value: "ALL" },
                            { name: "Any String (ANY)", value: "ANY" },
                        ],
                    }
                ),
                ruleAndOrOptions: promptBuilder(
                    "list",
                    "newValue",
                    `${chosenField}: ${cleanedRule[chosenField]}`,
                    {
                        choices: [
                            { name: "Both (AND)", value: "AND" },
                            { name: "Either (OR)", value: "OR" },
                        ],
                    }
                ),
                recursive: promptBuilder("confirm", "newValue", chosenField, {
                    default: cleanedRule[chosenField],
                }),
                directoryOut: promptBuilder("input", "newValue", chosenField, {
                    default: cleanedRule[chosenField],
                    validate: dirOutPath =>
                        this.directoryOutValidation(dirOutPath),
                }),
                ignoredSubDirectories: promptBuilder(
                    "input",
                    "newValue",
                    chosenField,
                    {
                        default: cleanedRule[chosenField],
                        validate: childPaths =>
                            this.directoriesToIgnoreValidation(childPaths),
                    }
                ),
                active: promptBuilder("confirm", "newValue", chosenField, {
                    default: cleanedRule[chosenField],
                }),
            };
            const selectedFieldPrompt = promptMapper[chosenField];

            const { newValue } = await inquirer.prompt(selectedFieldPrompt);

            this.selectedRule[chosenField] = newValue;

            services.rules.updateRule(this.selectedRule);
        } catch (err) {
            if (err.isTtyError) {
                Logger.error(
                    "Prompt couldn't be rendered in the current environment"
                );
            } else {
                Logger.error("An error occurred:", err);
            }
        }
    }

    private directoryValidation(path: string): boolean | string {
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
                if (childPath === this.selectedRule.dirInValue) {
                    valid = false;
                    badPath = childPath;
                }
                if (
                    !services.fileManagement.checkPathIsSubDirectory(
                        this.selectedRule.dirInValue,
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
            : `${badPath} is not a sub directory of ${this.selectedRule.dirInValue}`;
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
        if (dirOutValue === this.selectedRule.dirInValue) {
            return "Output directory must be different from input directory";
        }
        return true;
    }

    private notNull(value: string): boolean | string {
        return value.length > 0 ? true : "Cannot be empty";
    }

    private noEmptyRule(value: string): boolean | string {
        if (this.selectedRule.fileExtensions.length > 0) {
            return true;
        } else if (!value) {
            return "Must have at least one rule option: target file extensions or file names";
        }
        return true;
    }
}
