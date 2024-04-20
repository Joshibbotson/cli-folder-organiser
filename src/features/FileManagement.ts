import { Rules, rules } from "./Rules";
import { IReadRule } from "../menus/types";
import chokidar from "chokidar";
import path from "path";
import fs from "fs";

class FileManagement {
    private readonly rulesReader: Rules;
    private readonly rules: Map<string, IReadRule[]> | null;
    constructor(rulesReader) {
        this.rulesReader = rulesReader;
        this.rules = this.getRules();
    }

    public getRules(): Map<string, IReadRule[]> | null {
        const rules = this.rulesReader.readRuleFile();

        if (rules && rules.info) {
            return null;
        }

        const rulesHash = new Map();

        for (let i = 0; i < rules.length; i++) {
            if (rulesHash.get(rules[i].directoryIn)) {
                rulesHash.set(rules[i].directoryIn, [
                    ...rulesHash.get(rules[i].directoryIn),
                    rules[i],
                ]);
            } else {
                rulesHash.set(rules[i].directoryIn, [rules[i]]);
            }
        }
        return rulesHash;
    }

    public startDirectoryWatchers() {
        if (!this.rules) {
            return "No rules available!";
        }

        for (let [path, rules] of this.rules) {
            this.watchDirectory(path, rules);
        }
    }

    private watchDirectory(directory: string, rules: IReadRule[]) {
        const watcher = chokidar.watch(directory, {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
            persistent: true,
        });

        watcher
            .on("add", path => this.handleFileEvent("add", path, rules))
            .on("change", path => this.handleFileEvent("change", path, rules))
            .on("unlink", path => this.handleFileEvent("unlink", path, rules))
            .on("error", error => console.error(`Watcher error: ${error}`))
            .on("ready", () =>
                console.log(
                    `\n Initial scan complete. Watching for changes in ${directory}`
                )
            );

        return () => {
            watcher.close();
            console.log(`Stopped watching ${directory}`);
        };
    }

    private handleFileEvent(
        eventType: EventType,
        path: string,
        rules: IReadRule[]
    ) {
        if (rules.length === 1) {
            this.processRule(eventType, path, rules[0]);
        } else {
            rules.forEach(rule => this.processRule(eventType, path, rule));
        }
    }

    public processRule(
        eventType: EventType,
        filename: string,
        rule: IReadRule
    ) {
        if (!rule.active) {
            return "Rule not active";
        }
        if (
            eventType === "add" &&
            (this.checkFileExtension(filename, rule.includedFileExtension) ||
                this.checkFileName(filename, rule.includedFileNames))
        ) {
            const oldPath = filename;
            const newPath = path.join(
                rule.directoryOut,
                path.basename(filename)
            );
            try {
                if (!this.checkDirectoryExists(rule.directoryOut)) {
                    console.log(
                        `Directory does not exist, creating: ${rule.directoryOut}`
                    );
                    this.createDirectory(rule.directoryOut, true);
                    this.moveFileToAlternativeDir(oldPath, newPath);
                }

                console.log(`Successfully moved ${oldPath} to ${newPath}`);
            } catch (error) {
                console.error(`Error during file processing: ${error}`);
            }
        }
    }
    private checkFileExtension(
        filename: string,
        acceptedFileExts: string
    ): boolean {
        const extension = path.extname(filename);
        return acceptedFileExts.split(" ").includes(extension);
    }

    /** Consider the following in the future:
     * - case sensitivity
     * - regex checks
     * Currently checks space deliminted strings.
     */
    private checkFileName(
        filename: string,
        acceptedFileNames: string
    ): boolean {
        const basename = path.basename(filename);
        return acceptedFileNames.split(" ").includes(basename);
    }

    public checkDirectoryExists(path: string): boolean {
        return fs.existsSync(path);
    }

    public createDirectory(path: string, recursive: boolean): void {
        console.log("createDirectory!");
        try {
            fs.mkdirSync(path, { recursive: recursive });
        } catch (err) {
            throw `Failed to create directory with an error of: ${err}`;
        }
    }

    public moveFileToAlternativeDir(oldPath: string, newPath: string): void {
        try {
            fs.renameSync(oldPath, newPath);
        } catch (err) {
            throw new Error(`failed to move file with an error of:${err}`);
        }
    }

    // public stopAllDirectoryWatchers() {
    //   if(this.rules === null){
    //     return 'No rules available!'
    //   }

    //   this.rules.forEach((rules) =>{
    //     if(rules.length === 1){
    //       this.watchDirectory(rules[0].dirIn, rules[0])
    //     } else {
    //       rules.forEach(rule => this.watchDirectory(rule.dirIn, rule))
    //     }
    //   })
    //    }
}

export const fileManagement = new FileManagement(rules);

export type EventType = "change" | "add" | "unlink";
