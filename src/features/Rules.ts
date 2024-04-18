import fs from "fs";
import { printToConsole } from "../utils/print";
import { pressEnterToContinue } from "../menus/pressEnterMenu.menu";
import { openMainMenu } from "../menus/mainMenu.menu";
import { ICreateRule } from "../menus/newRuleMenu.menu";
import { RULES } from "../CONSTANTS";

class Rules {
    private readonly printer;
    private readonly pressEnterToContinue: () => void;
    public readonly openMainMenu: () => void;

    constructor(printer, pressEnterToContinue, openMainMenu) {
        this.checkIfRuleFileExists();
        this.printer = printer;
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
            console.error("Failed to read file with an error of: ", err);
        }
    }

    public async resetRuleFile() {
        fs.writeFileSync("./config-files/rules.json", "");
        await this.printRuleFile();
        await this.pressEnterToContinue();
        await this.openMainMenu();
    }

    public async printRuleFile() {
        this.printer(this.readRuleFile(), "table");
        await this.pressEnterToContinue();
        await this.openMainMenu();
    }

    public addRule(ruleSpecification: ICreateRule) {
        let data = this.readRuleFile();
        if (data !== undefined && !data.info) {
            data.push({
                rule: ruleSpecification.ruleName,
                directoPath: ruleSpecification.directoryPath,
                includedFileExtension: ruleSpecification.fileExtensions,
                active: ruleSpecification.isActive,
                creationDate: new Date().toISOString(),
            });
        } else if (data === undefined || Object.keys(data).length > 0) {
            data = [
                {
                    rule: ruleSpecification.ruleName,
                    directoPath: ruleSpecification.directoryPath,
                    includedFileExtension: ruleSpecification.fileExtensions,
                    active: ruleSpecification.isActive,
                    creationDate: new Date().toISOString(),
                },
            ];
        }
        const stringifiedData = JSON.stringify(data, null, 2);
        fs.writeFileSync("./config-files/rules.json", stringifiedData);
    }
}

export const rules = new Rules(
    printToConsole,
    pressEnterToContinue,
    openMainMenu
);
