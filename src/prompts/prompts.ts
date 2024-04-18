import { promptBuilder } from "../promptBuilder";
import { server, serverIsRunning } from "../server";

export function initialQuestions() {
    return promptBuilder(
        "list",
        "answer",
        "Please select an option to start: ",
        [
            "See existing rules",
            "Add new rule",
            "Reset all rules",
            serverIsRunning(server)
                ? "Stop Folder Organiser"
                : "Start Folder Organiser",
            "Exit",
        ]
    );
}
export const newRuleQuestions = [
    ...promptBuilder("input", "ruleName", "Enter the rule name:"),
    ...promptBuilder("input", "directoryPath", "Enter the directory path:"),
    ...promptBuilder("input", "fileExtensions", "Target File extension:"),
    ...promptBuilder("confirm", "isActive", "Is the rule active?"),
];
