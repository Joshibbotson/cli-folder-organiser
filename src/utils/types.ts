export type PromptType =
    | "list"
    | "rawlist"
    | "expand"
    | "checkbox"
    | "confirm"
    | "input"
    | "number"
    | "password"
    | "editor";

export type Prompt = {
    type: PromptType;
    name: string;
    message: string;
    validate?: (value: string | number) => boolean | string;
    choices?: { name: string; value: string | number }[];
};
