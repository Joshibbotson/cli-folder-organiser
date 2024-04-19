import { promptBuilder } from "../utils/promptBuilder";

export function initialQuestions() {
    return promptBuilder(
        "list",
        "answer",
        "Please select an option to start: ",
        [
            "See existing rules",
            "Add new rule",
            "Reset all rules",
            // serverIsRunning(server)
            //     ? "Stop Folder Organiser"
            //     : "Start Folder Organiser",
            "Exit",
        ]
    );
}
export const newRuleQuestions = [
    ...promptBuilder("input", "ruleName", "Enter the rule name:"),
    ...promptBuilder("input", "dirIn", "Enter the directory path:"),
    ...promptBuilder("input", "fileExtensions", "Target File extension:"),
    ...promptBuilder("input", "fileName", "Target File includes characters:"),
    ...promptBuilder("input", "dirOut", "Directory to move to:"),
    ...promptBuilder("confirm", "recursive", "Perform rule recursively?"),
    ...promptBuilder("confirm", "isActive", "Is the rule active?"),
];
