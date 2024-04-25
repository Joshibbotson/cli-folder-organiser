export interface ICreateRule {
    ruleName: string;
    dirIn: string;
    fileExtensions: string;
    fileName: string;
    fileNameAllOrAny: FileNameAllOrAny;
    ruleAndOrOptions: RuleAndOrOptions;
    dirOut: string;
    ignoredSubDirectories: string;
    recursive: boolean;
    isActive: boolean;
}

type FileNameAllOrAny = "ALL" | "ANY";

type RuleAndOrOptions = "AND" | "OR";

export interface IReadRule {
    id: number;
    creationDate: string;
    rule: string;
    directoryIn: string;
    includedFileExtension: string;
    includedFileNames: string;
    fileNameAllOrAny: FileNameAllOrAny;
    ruleAndOrOptions: RuleAndOrOptions;
    directoryOut: string;
    ignoredSubDirectories: string;
    recursive: boolean;
    active: boolean;
    filesMoved: number;
    filesRenamed: number;
    filesDeleted: number;
}
