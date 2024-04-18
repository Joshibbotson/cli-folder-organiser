import inquirer from "inquirer";

export async function pressEnterToContinue() {
    console.log("Press ENTER to continue...");
    return inquirer.prompt([
        {
            type: "input",
            name: "continue",
            message: "Press ENTER to proceed",
        },
    ]);
}
