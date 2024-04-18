import inquirer from "inquirer";
import fs from "fs";
import { initialQuestions } from "./questions";
import { startServer } from "./server";

async function startList() {
    try {
        let initialQuestionAnswer = await inquirer.prompt(initialQuestions);

        appendRuleFile("tester rule set!");
        handleStartUserAnswer(initialQuestionAnswer.value);
        startList();
    } catch (error) {
        if (error.isTtyError) {
            console.error(
                "Prompt couldn't be rendered in the current environment"
            );
        } else {
            console.error("An error occurred:", error);
        }
    }
}

function handleStartUserAnswer(answer: string) {
    switch (answer) {
        case "See existing rules":
            logRuleFile();
            break;
        case "Add new rule":
            openNewRuleList();
            break;
        case "Reset all rules":
            resetRuleFile();
            break;
        case "Start Folder Organiser":
            startServer();
            break;
        case "Exit":
            endProgram();
    }
}

function appendRuleFile(rule: string) {
    let data = readRuleFile();
    if (data !== undefined) {
        data.push({
            rule: rule,
            creationDate: new Date().toISOString(),
            active: true,
        });
    } else if (data === undefined) {
        data = {
            rule: rule,
            creationDate: new Date().toISOString(),
            active: true,
        };
    }
    const stringifiedData = JSON.stringify(data, null, 2);
    fs.writeFileSync("./config-files/rules.json", stringifiedData);
}

function readRuleFile() {
    try {
        const data = fs.readFileSync("./config-files/rules.json", "utf-8");
        const rules = JSON.parse(data);
        return rules;
    } catch (err) {
        console.error("Failed to read file with an error of: ", err);
    }
}

function logRuleFile() {
    console.table(readRuleFile());
}

startList();
function openNewRuleList() {
    throw new Error("Function not implemented.");
}

function resetRuleFile() {
    throw new Error("Function not implemented.");
}
function endProgram() {
    process.exit(0);
}
