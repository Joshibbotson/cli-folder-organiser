import { PromptType, Prompt } from "./types";

export function promptBuilder(
    type: PromptType,
    message: string,
    choices: string[]
): Prompt[] {
    return [
        {
            type: type,
            name: "value",
            message: message,
            choices: choices,
        },
    ];
}
