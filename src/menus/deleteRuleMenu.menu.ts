import inquirer from "inquirer";
import { services } from "../services/index";
import { Logger } from "../services/Logger.service";
import { promptBuilder } from "../utils/promptBuilder.utils";
import { CONSTANTS } from "../CONSTANTS";
import { menus } from ".";

export async function deleteMenu() {
    try {
        const rulesList = await services.rules.readRuleFile();
        const formattedRuleList = [
            ...rulesList.map(rule => {
                return { name: rule.rule, value: rule.id };
            }),
            {
                name: CONSTANTS.BACK_TO_MAIN_MENU,
                value: CONSTANTS.BACK_TO_MAIN_MENU,
            },
        ];

        const rulesToDeleteOptions = promptBuilder(
            "list",
            "answer",
            "Please select a rule to delete to start: ",
            {
                choices: Array.isArray(rulesList)
                    ? formattedRuleList
                    : [
                          {
                              name: "No rules available",
                              value: "No rules available",
                          },
                      ],
                pageSize: 10,
            }
        );

        const { answer } = await inquirer.prompt(rulesToDeleteOptions);

        if (answer === "Back to Main Menu...") {
            await menus.mainMenu.openMainMenu();
        }

        const confirmQuestion = {
            type: "confirm",
            name: "confirm",
            message: `Are you sure you want to delete this rule?`,
        };

        const { confirm } = await inquirer.prompt(confirmQuestion);

        if (confirm) {
            services.rules.deleteRule(Number(answer));
            Logger.info("Rule deleted");
        }
        await deleteMenu();
    } catch (error) {
        if (error.isTtyError) {
            Logger.error(
                "Prompt couldn't be rendered in the current environment"
            );
        } else {
            Logger.error("An error occurred:", error);
        }
    }
}
