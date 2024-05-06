export interface ICreateRule {
    ruleName: string;
    dirIn: string;
    fileExtensions: string;
    fileName: string;
    fileNameMatchCriteria: FileNameMatchCriteria;
    ruleAndOrOptions: RuleAndOrOptions;
    dirOut: string;
    ignoredSubDirectories: string;
    recursive: boolean;
    isActive: boolean;
}

type FileNameMatchCriteria = "ALL" | "ANY" | "N/A";

type RuleAndOrOptions = "AND" | "OR" | "N/A";

export interface IReadRule {
    id: number;
    creationDate: string;
    rule: string;
    directoryIn: string;
    includedFileExtension: string;
    includedFileNames: string;
    fileNameMatchCriteria: FileNameMatchCriteria;
    ruleAndOrOptions: RuleAndOrOptions;
    directoryOut: string;
    ignoredSubDirectories: string;
    recursive: boolean;
    active: boolean;
    filesMoved: number;
    filesRenamed: number;
    filesDeleted: number;
}
