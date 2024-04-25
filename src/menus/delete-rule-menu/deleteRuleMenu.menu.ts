import inquirer from "inquirer";
import { openMainMenu } from "../main-menu/mainMenu.menu";
import { rules } from "../../services/Rules";
import { Logger } from "../../services/Logger";
import { promptBuilder } from "../../utils/promptBuilder";
import { CONSTANTS } from "../../CONSTANTS";

export async function deleteMenu() {
    try {
        const rulesList = await rules.readRuleFile();
        const formattedRuleList = [
            ...rulesList.map(rule => {
                return { name: rule.rule, value: rule.id };
            }),
            {
                name: CONSTANTS.backToMainMenu,
                value: CONSTANTS.backToMainMenu,
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
            }
        );

        const { answer } = await inquirer.prompt(rulesToDeleteOptions);

        if (answer === "Back to Main Menu...") {
            return await openMainMenu();
        }

        const confirmQuestion = {
            type: "confirm",
            name: "confirm",
            message: `Are you sure you want to delete this rule?`,
        };

        const { confirm } = await inquirer.prompt(confirmQuestion);

        if (confirm) {
            rules.deleteRule(Number(answer));
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
