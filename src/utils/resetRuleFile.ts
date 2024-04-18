import fs from "fs";
import { openMainMenu } from "../menus/mainMenu.menu";
import { pressEnterToContinue } from "../menus/pressEnterMenu.menu";
import { printRuleFile } from "./printRules";

export async function resetRuleFile() {
    fs.writeFileSync("./config-files/rules.json", "");
    await printRuleFile();
    await pressEnterToContinue();
    await openMainMenu();
}
