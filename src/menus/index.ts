import { MainMenu } from "./mainMenu.menu";
import { NewRuleMenu } from "./newRuleMenu.menu";
import { UpdateMenu } from "./updateRuleMenu.menu";

const newRuleMenu = new NewRuleMenu();
const updateMenu = new UpdateMenu();
const mainMenu = new MainMenu(newRuleMenu, updateMenu);

export const menus = Object.freeze({
    newRuleMenu,
    updateMenu,
    mainMenu,
});
