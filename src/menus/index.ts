import { services } from "../services";
import { MainMenu } from "./mainMenu.menu";
import { NewRuleMenu } from "./newRuleMenu.menu";

const newRuleMenu = new NewRuleMenu();
const mainMenu = new MainMenu(newRuleMenu);

export const menus = Object.freeze({
    newRuleMenu,
    mainMenu,
});
