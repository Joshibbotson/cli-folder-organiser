import { Rules, rules } from "./Rules";
import { IReadRule } from "../menus/types";
import chokidar, { FSWatcher } from "chokidar";
import path from "path";
import fs from "fs";
import { pressEnterToContinue } from "../menus/continue-menu/pressEnterMenu.menu";
import { openMainMenu } from "../menus/main-menu/mainMenu.menu";
import { Logger } from "./Logger";

class FileManagement {
    private readonly rulesReader: Rules;
    private readonly rules: Map<string, IReadRule[]> | null = null;
    private directoryWatcher: Map<any, FSWatcher> = new Map();
    private readonly pressEnterToContinue: () => void;
    private readonly openMainMenu: () => void;

    constructor(rulesReader, pressEnterToContinue, openMainMenu) {
        this.rulesReader = rulesReader;
        this.rules = this.getRules();
        this.pressEnterToContinue = pressEnterToContinue;
        this.openMainMenu = openMainMenu;
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

    public isWatchingDirectories(): boolean {
        if (this.directoryWatcher.size > 0) {
            return true;
        }
        return false;
    }

    public async startDirectoryWatchers() {
        if (!this.rules) {
            return "No rules available!";
        }
        const readyPromises = [];
        for (let [path, rules] of this.rules) {
            readyPromises.push(this.watchDirectory(path, rules));
        }

        await Promise.all(readyPromises);
        await this.pressEnterToContinue();
        await this.openMainMenu();
    }

    private watchDirectory(directory: string, rules: IReadRule[]) {
        const watcherReady = new Promise<void>(resolve => {
            const watcher = chokidar.watch(directory, {
                ignored: /(^|[\/\\])\../, // ignore dotfiles
                persistent: true,
            });

            watcher
                .on("add", path => this.handleFileEvent("add", path, rules))
                .on("change", path =>
                    this.handleFileEvent("change", path, rules)
                )
                .on("unlink", path =>
                    this.handleFileEvent("unlink", path, rules)
                )
                .on("error", error => Logger.error(`Watcher error: ${error}`))
                .on("ready", () => {
                    Logger.info(
                        `Initial scan complete. Watching for changes in ${directory}`
                    ),
                        resolve();
                });

            this.directoryWatcher.set(path, watcher);
        });
        return watcherReady;
    }

    private async handleFileEvent(
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
        if (eventType === "add") {
            if (
                this.checkFileExtension(filename, rule.includedFileExtension) ||
                this.checkFileName(filename, rule.includedFileNames)
            ) {
                const oldPath = filename;
                const newPath = path.join(
                    rule.directoryOut,
                    path.basename(filename)
                );
                try {
                    if (!this.checkDirectoryExists(rule.directoryOut)) {
                        Logger.info(
                            `Directory does not exist, creating: ${rule.directoryOut}`
                        );
                        this.createDirectory(rule.directoryOut, true);
                        this.moveFileToAlternativeDir(oldPath, newPath);
                    } else if (this.checkDirectoryExists(rule.directoryOut)) {
                        this.moveFileToAlternativeDir(oldPath, newPath);
                    }

                    Logger.info(`Successfully moved ${oldPath} to ${newPath}`);
                } catch (error) {
                    Logger.error(`Error during file processing: ${error}`);
                }
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

    private stopWatching(path) {
        const watcher = this.directoryWatcher.get(path);
        if (watcher) {
            watcher.close();
        }
    }

    public async stopAllDirectoryWatchers() {
        if (!this.rules) {
            return "No rules available!";
        }

        for (let path of this.rules) {
            this.stopWatching(path);
        }
        this.directoryWatcher.clear();
        Logger.info("stopped folder organiser");
        await this.pressEnterToContinue();
        await this.openMainMenu();
    }
}

export const fileManagement = new FileManagement(
    rules,
    pressEnterToContinue,
    openMainMenu
);

export type EventType = "change" | "add" | "unlink";
