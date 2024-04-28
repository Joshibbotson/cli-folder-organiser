import { PromptType, Prompt } from "./types";

export function promptBuilder(
    type: PromptType,
    name: string,
    message: string,
    opts: IPromptBuilderOpts
): Prompt[] {
    return [
        {
            type: type,
            name: name,
            message: message,
            validate: opts.validate,
            choices: opts.choices,
            pageSize: opts.pageSize,
            default: opts.default,
        },
    ];
}

interface IPromptBuilderOpts {
    choices?: { name: string; value: string | number }[];
    validate?: (value: string) => boolean | string;
    pageSize?: number;
    default?: string | boolean;
}
