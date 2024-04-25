import { Rules, rules } from "./Rules";
import { IReadRule } from "../menus/types";
import chokidar, { FSWatcher } from "chokidar";
import path from "path";
import fs from "fs";
import { pressEnterToContinue } from "../menus/continue-menu/pressEnterMenu.menu";
import { openMainMenu } from "../menus/main-menu/mainMenu.menu";
import { Logger } from "./Logger";

export class FileManagement {
    private readonly rulesReader: Rules;
    private rules: IReadRule[] | null = null;

    private directoryWatcher: Map<any, FSWatcher> = new Map();
    private readonly pressEnterToContinue: () => void;
    private readonly openMainMenu: () => void;

    constructor(rulesReader, pressEnterToContinue, openMainMenu) {
        this.rulesReader = rulesReader;
        this.rules = this.getRules();
        this.pressEnterToContinue = pressEnterToContinue;
        this.openMainMenu = openMainMenu;
    }

    /** Reads the rules.json file. If rules.json is empty will return null
     *
     * @returns IReadRule[] | null
     */
    public getRules(): IReadRule[] | null {
        const rules = this.rulesReader.readRuleFile();
        if (rules && rules.info) {
            return null;
        }
        return rules;
    }

    /** Checks if Folder Organiser is running by checking if
     * chokidar is watching any paths via the size of the
     * directoryWatcher hash map
     * @returns  boolean
     */
    public isWatchingDirectories(): boolean {
        if (this.directoryWatcher.size > 0) {
            return true;
        }
        return false;
    }

    public async startDirectoryWatchers() {
        this.rules = this.getRules();
        if (!this.rules) {
            return "No rules available!";
        }
        const readyPromises = [];
        this.rules.forEach(rule => {
            readyPromises.push(this.watchDirectory(rule.directoryIn, rule));
        });

        await Promise.all(readyPromises);
        await this.pressEnterToContinue();
        await this.openMainMenu();
    }

    private watchDirectory(directory: string, rule: IReadRule) {
        const watcherReady = new Promise<void>(resolve => {
            const watcher = chokidar.watch(directory, {
                ignored: /(^|[\/\\])\../, // ignore dotfiles
                persistent: true,
                depth: rule.recursive ? undefined : 0,
                usePolling: true,
                interval: 10000, // scan directories every 10 seconds to reduce CPU usage.
            });

            watcher
                .on("add", path => this.processRule("add", path, rule))
                .on("change", path => this.processRule("change", path, rule))
                .on("moved", path => this.processRule("moved", path, rule))
                .on("unlink", path => this.processRule("unlink", path, rule))
                .on("error", error => Logger.error(`Watcher error: ${error}`))
                .on("ready", () => {
                    Logger.info(
                        `Initial scan complete. Watching for changes in ${directory}`
                    ),
                        resolve();
                });

            this.directoryWatcher.set(directory, watcher);
        });
        return watcherReady;
    }

    public async processRule(
        eventType: EventType,
        filename: string,
        rule: IReadRule
    ) {
        if (!rule.active) {
            return "Rule not active";
        }
        if (path.dirname(filename) === rule.directoryOut) {
            return "Directory same as Directory out";
        }
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
                if (!this.checkPathExists(oldPath)) {
                    return "Path no longer exists";
                }
                if (!this.checkPathExists(rule.directoryOut)) {
                    Logger.info(
                        `Directory does not exist, creating: ${rule.directoryOut}`
                    );
                    this.createDirectory(rule.directoryOut, true);
                    this.moveFileToAlternativeDir(oldPath, newPath);
                    this.rulesReader.incrementStat(rule.id, "moved");
                } else if (this.checkPathExists(rule.directoryOut)) {
                    this.moveFileToAlternativeDir(oldPath, newPath);
                    this.rulesReader.incrementStat(rule.id, "moved");
                }

                Logger.info(`Successfully moved ${oldPath} to ${newPath}`);
            } catch (error) {
                Logger.error(`Error during file processing: ${error}`);
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

    public checkPathExists(path: string): boolean {
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
            const checkedNewPath = this.renameFileIfExists(newPath);
            fs.renameSync(oldPath, checkedNewPath);
        } catch (err) {
            throw new Error(`failed to move file with an error of:${err}`);
        }
    }

    public renameFileIfExists(targetPath: string) {
        const basename = path.basename(targetPath, path.extname(targetPath));
        const extension = path.extname(targetPath);

        if (!this.checkPathExists(targetPath)) {
            return targetPath;
        }
        return `${path.dirname(
            targetPath
        )}/${basename}-${new Date().getTime()}${extension}`;
    }

    /** Stops all chokidar watchers by looping through  */
    public async stopAllDirectoryWatchers() {
        if (!this.rules) {
            return "No rules available!";
        }

        this.rules.forEach(rule => this.stopWatching(rule.directoryIn));

        this.directoryWatcher.clear();
        Logger.info("stopped folder organiser");
        await this.pressEnterToContinue();
        await this.openMainMenu();
    }

    /** Stops chokidar watcher if directoryWatcher hash map includes that path. */
    private stopWatching(path): void {
        const watcher = this.directoryWatcher.get(path);
        if (watcher) {
            watcher.close();
        }
    }
}

export const fileManagement = new FileManagement(
    rules,
    pressEnterToContinue,
    openMainMenu
);

export type EventType = "change" | "add" | "unlink" | "moved";
