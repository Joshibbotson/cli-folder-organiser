import { openMainMenu } from "../menus/mainMenu.menu";
import { pressEnterToContinue } from "../menus/pressEnterMenu.menu";
import { printToConsole } from "./print";
import { readRuleFile } from "./readRuleFile";

export async function printRuleFile() {
    printToConsole(readRuleFile(), "table");
    await pressEnterToContinue();
    await openMainMenu();
}
