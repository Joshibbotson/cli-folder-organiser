import { menus } from "../menus";
import { pressEnterToContinue } from "../menus/pressEnterMenu.menu";
import { FileManagement } from "./FileManagement.service";
import { FileWatcher } from "./FileWatcher.service";
import { Rules } from "./Rules.service";

const fileManagement = new FileManagement();
const rules = new Rules(fileManagement, pressEnterToContinue, () =>
    menus.mainMenu.openMainMenu()
);
const fileWatcher = new FileWatcher(rules, pressEnterToContinue, () =>
    menus.mainMenu.openMainMenu()
);

export const services = Object.freeze({ fileManagement, rules, fileWatcher });
