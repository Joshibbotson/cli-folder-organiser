export interface ICreateRule {
    ruleName: string;
    dirIn: string;
    fileExtensions: string;
    fileName: string;
    dirOut: string;
    recursive: boolean;
    isActive: boolean;
}

export interface IReadRule {
    rule: string;
    directoryIn: string;
    includedFileExtension: string;
    includedFileNames: string;
    directoryOut: string;
    recursive: boolean;
    active: boolean;
    creationDate: string;
}
