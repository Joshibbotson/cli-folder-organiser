import fs from "fs";
import { printRuleFile } from "./printRules";
import { printToConsole } from "./print";
import { pressEnterToContinue } from "../menus/pressEnterMenu.menu";
import { openMainMenu } from "../menus/mainMenu.menu";

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
                info: "No rules available, please add new rules",
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
                info: "No rules available, please add new rules",
            };
        } catch (err) {
            console.error("Failed to read file with an error of: ", err);
        }
    }

    public async resetRuleFile() {
        fs.writeFileSync("./config-files/rules.json", "");
        await printRuleFile();
        await this.pressEnterToContinue();
        await this.openMainMenu();
    }

    public async printRuleFile() {
        this.printer(this.readRuleFile(), "table");
        await this.pressEnterToContinue();
        await this.openMainMenu();
    }

    public addRule(rule: string) {
        let data = this.readRuleFile();
        if (data !== undefined) {
            data.push({
                rule: rule,
                creationDate: new Date().toISOString(),
                active: true,
            });
        } else if (data === undefined) {
            data = {
                rule: rule,
                creationDate: new Date().toISOString(),
                active: true,
            };
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
