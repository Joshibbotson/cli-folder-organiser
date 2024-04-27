import inquirer from "inquirer";

export async function pressEnterToContinue() {
    return inquirer.prompt([
        {
            type: "input",
            name: "continue",
            message: "Press ENTER to proceed to Main Manu",
        },
    ]);
}
