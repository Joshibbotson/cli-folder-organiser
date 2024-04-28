import { MainMenu } from "./MainMenu.menu";
import { NewRuleMenu } from "./newRuleMenu.menu";
import { UpdateMenu } from "./UpdateRuleMenu.menu";

const newRuleMenu = new NewRuleMenu();
const updateMenu = new UpdateMenu();
const mainMenu = new MainMenu(newRuleMenu, updateMenu);

export const menus = Object.freeze({
    newRuleMenu,
    updateMenu,
    mainMenu,
});
