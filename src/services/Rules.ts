import fs from "fs";
import { pressEnterToContinue } from "../menus/continue-menu/pressEnterMenu.menu";
import { openMainMenu } from "../menus/main-menu/mainMenu.menu";
import { RULES } from "../CONSTANTS";
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
                info: RULES.noRules,
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
                info: RULES.noRules,
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
        const compactRules = rules.map(rule => {
            return {
                id: rule.id,
                name: rule.rule,
                fileNames: rule.includedFileNames,
                fileExtensions: rule.includedFileExtension,
                directoryIn: rule.directoryIn,
                directoryOut: rule.directoryOut,
                recursive: rule.recursive,
                active: rule.active,
            };
        });
        Logger.table(compactRules);
        await this.pressEnterToContinue();
        await this.openMainMenu();
    }

    public addRule(ruleSpecification: ICreateRule) {
        let data = this.readRuleFile();
        const len = data.length;
        if (data !== undefined && !data.info) {
            data.push({
                id: data[len - 1].id + 1,
                rule: ruleSpecification.ruleName,
                directoryIn: ruleSpecification.dirIn,
                includedFileExtension: ruleSpecification.fileExtensions,
                includedFileNames: ruleSpecification.fileName,
                recursive: ruleSpecification.recursive,
                directoryOut: ruleSpecification.dirOut,
                active: ruleSpecification.isActive,
                creationDate: new Date().toISOString(),
            });
        } else if (data === undefined || Object.keys(data).length > 0) {
            data = [
                {
                    id: 1,
                    rule: ruleSpecification.ruleName,
                    directoryIn: ruleSpecification.dirIn,
                    includedFileExtension: ruleSpecification.fileExtensions,
                    includedFileNames: ruleSpecification.fileName,
                    recursive: ruleSpecification.recursive,
                    directoryOut: ruleSpecification.dirOut,
                    active: ruleSpecification.isActive,
                    creationDate: new Date().toISOString(),
                },
            ];
        }
        const stringifiedData = JSON.stringify(data, null, 2);
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
