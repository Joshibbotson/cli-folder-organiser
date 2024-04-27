import { FSWatcher } from "chokidar";
import { IReadRule } from "../menus/types";
import { Rules } from "./Rules.service";
import { Logger } from "./Logger.service";
import chokidar from "chokidar";

export class FileWatcher {
    private readonly rulesReader: Rules;
    private rules: IReadRule[] | null = null;
    private directoryWatcher: Map<any, FSWatcher> = new Map();
    private readonly pressEnterToContinue: () => void;
    private readonly openMainMenu: () => void;

    constructor(
        rulesReader: Rules,
        pressEnterToContinue: () => void,
        openMainMenu: () => void
    ) {
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
                interval: 10000,
            });

            watcher
                .on("add", path =>
                    this.rulesReader.processRule("add", path, rule)
                )
                .on("change", path =>
                    this.rulesReader.processRule("change", path, rule)
                )
                .on("moved", path =>
                    this.rulesReader.processRule("moved", path, rule)
                )
                .on("unlink", path =>
                    this.rulesReader.processRule("unlink", path, rule)
                )
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
