import fs from "fs";
import { pressEnterToContinue } from "../menus/continue-menu/pressEnterMenu.menu";
import { openMainMenu } from "../menus/main-menu/mainMenu.menu";
import { CONSTANTS } from "../CONSTANTS";
import { ICreateRule, IReadRule } from "../menus/types";
import { Logger } from "./Logger";

export class Rules {
    private readonly pressEnterToContinue: () => void;
    public readonly openMainMenu: () => void;

    constructor(pressEnterToContinue, openMainMenu) {
        this.checkIfRuleFileExists();
        this.pressEnterToContinue = pressEnterToContinue;
        this.openMainMenu = openMainMenu;
    }

    private checkIfRuleFileExists() {
        if (!fs.existsSync("./config-files/rules.json")) {
            const data = {
                info: CONSTANTS.noRules,
            };
            const stringifiedData = JSON.stringify(data, null, 2);
            fs.writeFileSync("./config-files/rules.json", stringifiedData);
        }
    }

    public readRuleFile() {
        try {
            const data = fs.readFileSync("./config-files/rules.json", "utf-8");
            if (data.length > 0) {
                const rules = JSON.parse(data);
                return rules;
            }
            return {
                info: CONSTANTS.noRules,
            };
        } catch (err) {
            Logger.error(`Failed to read file with an error of: ${err}`);
        }
    }

    public async resetRuleFile() {
        fs.writeFileSync("./config-files/rules.json", "");
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
                    fileNamesAllOrAny: rule.fileNameAllOrAny,
                    fileNameAndOrfileExt: rule.ruleAndOrOptions,
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
        if (data !== undefined && !data.info) {
            data.push({
                creationDate: new Date().toISOString(),
                id: data[len - 1].id + 1,
                rule: ruleSpecification.ruleName,
                directoryIn: ruleSpecification.dirIn,
                includedFileExtension: ruleSpecification.fileExtensions,
                includedFileNames: ruleSpecification.fileName,
                fileNameAllOrAny: ruleSpecification.fileNameAllOrAny,
                ruleAndOrOptions: ruleSpecification.ruleAndOrOptions,
                recursive: ruleSpecification.recursive,
                directoryOut: ruleSpecification.dirOut,
                ignoredSubDirectories: ruleSpecification.ignoredSubDirectories,
                active: ruleSpecification.isActive,
                filesMoved: 0,
                filesRenamed: 0,
                filesDeleted: 0,
            });
        } else if (data === undefined || Object.keys(data).length > 0) {
            data = [
                {
                    creationDate: new Date().toISOString(),
                    id: 1,
                    rule: ruleSpecification.ruleName,
                    directoryIn: ruleSpecification.dirIn,
                    includedFileExtension: ruleSpecification.fileExtensions,
                    includedFileNames: ruleSpecification.fileName,
                    fileNameAllOrAny: ruleSpecification.fileNameAllOrAny,
                    ruleAndOrOptions: ruleSpecification.ruleAndOrOptions,
                    recursive: ruleSpecification.recursive,
                    directoryOut: ruleSpecification.dirOut,
                    ignoredSubDirectories:
                        ruleSpecification.ignoredSubDirectories,
                    active: ruleSpecification.isActive,
                    filesMoved: 0,
                    filesRenamed: 0,
                    filesDeleted: 0,
                },
            ];
        }
        const stringifiedData = JSON.stringify(data, null, 2);
        fs.writeFileSync("./config-files/rules.json", stringifiedData);
    }

    // public updateRule() {
    //     let rules: IReadRule[] = this.readRuleFile();
    //     rules = rules.filter(rule => {
    //         return rule.id !== id;
    //     });

    //     const stringifiedData = JSON.stringify(rules, null, 2);
    //     fs.writeFileSync("./config-files/rules.json", stringifiedData);
    // }

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
        fs.writeFileSync("./config-files/rules.json", stringifiedData);
    }

    public deleteRule(id: number) {
        let rules: IReadRule[] = this.readRuleFile();
        rules = rules.filter(rule => {
            return rule.id !== id;
        });

        const stringifiedData = JSON.stringify(rules, null, 2);
        fs.writeFileSync("./config-files/rules.json", stringifiedData);
    }
}

export const rules = new Rules(pressEnterToContinue, openMainMenu);

export type IStatType = "moved" | "deleted" | "renamed";
