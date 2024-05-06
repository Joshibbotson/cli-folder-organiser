import { CONSTANTS } from "../CONSTANTS";
import { ICreateRule, IReadRule } from "../menus/types";
import { Logger } from "./Logger.service";
import { FileManagement } from "./FileManagement.service";
import path from "path";

export class Rules {
    private readonly pressEnterToContinue: () => Promise<void>;
    public readonly openMainMenu: () => Promise<void>;
    private readonly fileManager: FileManagement;

    constructor(
        fileManager: FileManagement,
        pressEnterToContinue: () => Promise<void>,
        openMainMenu: () => Promise<void>
    ) {
        this.fileManager = fileManager;
        this.checkIfRuleFileExists();
        this.pressEnterToContinue = pressEnterToContinue;
        this.openMainMenu = openMainMenu;
    }

    private checkIfRuleFileExists() {
        try {
            if (
                !this.fileManager.checkPathExists(CONSTANTS.RULES_CONFIG_PATH)
            ) {
                const data = {
                    info: CONSTANTS.NO_RULES,
                };
                const stringifiedData = JSON.stringify(data, null, 2);
                this.fileManager.writeFile(
                    CONSTANTS.RULES_CONFIG_PATH,
                    stringifiedData
                );
            }
        } catch (err) {
            Logger.error(`Error at checkIfRuleFileExists of: ${err}`);
        }
    }

    public readRuleFile() {
        try {
            const data = this.fileManager.readFile(
                CONSTANTS.RULES_CONFIG_PATH,
                "utf-8"
            );
            if (data.length > 0) {
                const rules = JSON.parse(data);
                return rules;
            }
            return {
                info: CONSTANTS.NO_RULES,
            };
        } catch (err) {
            Logger.error(`Failed to read file with an error of: ${err}`);
        }
    }

    public readRuleById(id: string) {
        const rules = this.readRuleFile();
        if (rules && rules.info) {
            return new Error("Can't ready by Id as no rules exist.");
        }
        return rules.filter(rule => rule.id === id)[0];
    }

    /** Reads the rules.json file. If rules.json is empty will return null
     *
     * @returns IReadRule[] | null
     */
    public getRulesOrNull(): IReadRule[] | null {
        const rules = this.readRuleFile();
        if (rules && rules.info) {
            return null;
        }
        return rules;
    }

    public async resetRuleFile() {
        this.fileManager.writeFile(CONSTANTS.RULES_CONFIG_PATH, "");
        Logger.info("Rules reset");
        await this.printRuleFile();
        await this.pressEnterToContinue();
        await this.openMainMenu();
    }

    public async printRuleFile() {
        const rules = this.readRuleFile();
        if (rules && rules.info) {
            Logger.table(rules);
        } else {
            const compactRules = rules.map(rule => {
                return {
                    id: rule.id,
                    name: rule.rule,
                    fileNames: rule.includedFileNames,
                    fileNameMatchCriteria: rule.fileNameMatchCriteria,
                    fileNameAndOrFileExt: rule.ruleAndOrOptions,
                    fileExtensions: rule.includedFileExtension,
                    directoryIn: rule.directoryIn,
                    directoryOut: rule.directoryOut,
                    recursive: rule.recursive,
                    active: rule.active,
                };
            });
            Logger.table(compactRules);
        }
        await this.pressEnterToContinue();
        await this.openMainMenu();
    }

    public async printStats() {
        const rules = this.readRuleFile();
        if (rules && rules.info) {
            Logger.table(rules);
        } else {
            const stats = rules.map(rule => {
                return {
                    id: rule.id,
                    name: rule.rule,
                    filesMoved: rule.filesMoved,
                    filesRenamed: rule.filesRenamed,
                    filesDeleted: rule.filesDeleted,
                };
            });
            Logger.table(stats);
        }
        await this.pressEnterToContinue();
        await this.openMainMenu();
    }

    public addRule(ruleSpecification: ICreateRule) {
        let data = this.readRuleFile();
        const len = data.length;

        const baseData = {
            creationDate: new Date().toISOString(),
            rule: ruleSpecification.ruleName,
            directoryIn: ruleSpecification.dirIn,
            includedFileExtension: ruleSpecification.fileExtensions,
            includedFileNames: ruleSpecification.fileName,
            fileNameMatchCriteria: ruleSpecification.fileNameMatchCriteria,
            ruleAndOrOptions: ruleSpecification.ruleAndOrOptions,
            recursive: ruleSpecification.recursive,
            directoryOut: ruleSpecification.dirOut,
            ignoredSubDirectories: ruleSpecification.ignoredSubDirectories,
            active: ruleSpecification.isActive,
            filesMoved: 0,
            filesRenamed: 0,
            filesDeleted: 0,
        };

        if (data !== undefined && !data.info) {
            data.push({
                id: data[len - 1].id + 1,
                ...baseData,
            });
        } else if (data === undefined || Object.keys(data).length > 0) {
            data = [
                {
                    id: 1,
                    ...baseData,
                },
            ];
        }
        const stringifiedData = JSON.stringify(data, null, 2);
        this.fileManager.writeFile(
            CONSTANTS.RULES_CONFIG_PATH,
            stringifiedData
        );
    }

    public updateRule(updatedRule) {
        const rules = this.readRuleFile();
        const updatedRules = rules.map(rule => {
            if (rule.id === updatedRule.id) {
                rule = updatedRule;
            }
            return rule;
        });
        const stringifiedData = JSON.stringify(updatedRules, null, 2);
        this.fileManager.writeFile(
            CONSTANTS.RULES_CONFIG_PATH,
            stringifiedData
        );
    }

    public incrementStat(ruleId: number, type: IStatType) {
        let rules: IReadRule[] = this.readRuleFile();
        rules = rules.map(rule => {
            if (rule.id === ruleId) {
                switch (type) {
                    case "moved":
                        rule.filesMoved = Number(rule.filesMoved + 1);
                        break;
                    case "renamed":
                        rule.filesRenamed = Number(rule.filesRenamed + 1);
                        break;
                    case "deleted":
                        rule.filesDeleted = Number(rule.filesDeleted + 1);
                        break;
                }
            }
            return rule;
        });

        const stringifiedData = JSON.stringify(rules, null, 2);
        this.fileManager.writeFile(
            CONSTANTS.RULES_CONFIG_PATH,
            stringifiedData
        );
    }

    public deleteRule(id: number) {
        let rules: IReadRule[] = this.readRuleFile();
        rules = rules.filter(rule => {
            return rule.id !== id;
        });

        const stringifiedData = JSON.stringify(rules, null, 2);
        this.fileManager.writeFile(
            CONSTANTS.RULES_CONFIG_PATH,
            stringifiedData
        );
    }

    public async processRule(
        eventType: EventType,
        filename: string,
        rule: IReadRule
    ) {
        if (!rule.active) {
            return "Rule not active";
        }
        if (path.dirname(filename) === rule.directoryOut) {
            return "Directory same as Directory out";
        }
        switch (rule.ruleAndOrOptions) {
            case "AND":
                await this.handleFileAndExtRule(filename, rule);
                break;
            case "OR":
                await this.handleFileOrExtRule(filename, rule);
                break;
            case "N/A":
                await this.handleExtensionRule(filename, rule);
                break;
        }
    }

    private handleFileNameMatchCriteria(
        filename: string,
        rule: IReadRule
    ): boolean {
        let validFileName: boolean;

        switch (rule.fileNameMatchCriteria) {
            case "ALL":
                validFileName = this.fileNameIncludesAllStrings(
                    filename,
                    this.extractQuotedStrings(rule.includedFileNames)
                );
                break;
            case "ANY":
                validFileName = this.fileNameIncludesAnyString(
                    filename,
                    this.extractQuotedStrings(rule.includedFileNames)
                );
        }
        return validFileName;
    }

    private async handleExtensionRule(filename: string, rule: IReadRule) {
        const validExtension: boolean = this.fileNameIncludesExtension(
            filename,
            rule.includedFileExtension
        );

        const ignoredDirectory = this.ignoredDirectory(filename, rule);

        if (validExtension && !ignoredDirectory) {
            await this.executeSuccessfulRule(filename, rule);
        }
    }

    private async handleFileAndExtRule(filename: string, rule: IReadRule) {
        const validFileName = this.handleFileNameMatchCriteria(filename, rule);
        const validExtension: boolean = this.fileNameIncludesExtension(
            filename,
            rule.includedFileExtension
        );
        const ignoredDirectory = this.ignoredDirectory(filename, rule);
        if (validFileName && validExtension && !ignoredDirectory) {
            await this.executeSuccessfulRule(filename, rule);
        }
    }

    private async handleFileOrExtRule(filename: string, rule: IReadRule) {
        const validFileName = this.handleFileNameMatchCriteria(filename, rule);
        const validExtension: boolean = this.fileNameIncludesExtension(
            filename,
            rule.includedFileExtension
        );
        const ignoredDirectory = this.ignoredDirectory(filename, rule);

        if ((validFileName || validExtension) && !ignoredDirectory) {
            await this.executeSuccessfulRule(filename, rule);
        }
    }

    private fileNameIncludesExtension(
        filename: string,
        fileExtensions: string
    ): boolean {
        return fileExtensions.includes(path.extname(filename));
    }

    private fileNameIncludesAnyString(
        filename: string,
        includedFileNames: string[]
    ): boolean {
        let valid = false;
        for (const name of includedFileNames) {
            if (filename.includes(name)) {
                valid = true;
                break;
            }
        }
        return valid;
    }

    private async executeSuccessfulRule(filename: string, rule: IReadRule) {
        const oldPath = filename;
        const newPath = path.join(rule.directoryOut, path.basename(filename));
        try {
            if (!this.fileManager.checkPathExists(oldPath)) {
                return "Path no longer exists";
            }
            if (!this.fileManager.checkPathExists(rule.directoryOut)) {
                Logger.info(
                    `Directory does not exist, creating: ${rule.directoryOut}`
                );
                this.fileManager.createDirectory(rule.directoryOut, true);
                const { success, renamed } =
                    this.fileManager.moveFileToAlternativeDir(oldPath, newPath);
                if (success) {
                    this.incrementStat(rule.id, "moved");
                }
                if (renamed) {
                    this.incrementStat(rule.id, "renamed");
                }
            } else if (this.fileManager.checkPathExists(rule.directoryOut)) {
                const { success, renamed } =
                    this.fileManager.moveFileToAlternativeDir(oldPath, newPath);
                if (success) {
                    this.incrementStat(rule.id, "moved");
                }
                if (renamed) {
                    this.incrementStat(rule.id, "renamed");
                }
            }

            Logger.info(`Successfully moved ${oldPath} to ${newPath}`);
        } catch (error) {
            Logger.error(`Error during file processing: ${error}`);
        }
    }

    private fileNameIncludesAllStrings(
        filename: string,
        includedFileNames: string[]
    ): boolean {
        let valid = true;
        for (const name of includedFileNames) {
            if (!filename.includes(name)) {
                valid = false;
                break;
            }
        }
        return valid;
    }

    private ignoredDirectory(filename: string, rule: IReadRule): boolean {
        return this.extractQuotedStrings(rule.ignoredSubDirectories).includes(
            path.dirname(filename)
        );
    }

    private extractQuotedStrings(inputString: string): string[] {
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
}

export type IStatType = "moved" | "deleted" | "renamed";
export type EventType = "change" | "add" | "unlink" | "moved";
