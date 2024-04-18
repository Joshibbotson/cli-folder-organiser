import { promptBuilder } from "./promptBuilder";

export const initialQuestions = promptBuilder(
    "list",
    "Please select an option to start: ",
    [
        "See existing rules",
        "Add new rule",
        "Reset all rules",
        "Start Folder Organiser",
        "Exit",
    ]
);

export const newRuleQuestions = promptBuilder(
    "list",
    "Please select an option to start: ",
    [
        "See existing rules",
        "Add new rule",
        "Reset all rules",
        "Start Folder Organiser",
        "Exit",
    ]
);
