import { PromptType, Prompt } from "./types";

export function promptBuilder(
    type: PromptType,
    name: string,
    message: string,
    choices?: string[]
): Prompt[] {
    return [
        {
            type: type,
            name: name,
            message: message,
            choices: choices,
        },
    ];
}
