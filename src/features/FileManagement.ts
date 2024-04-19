import { Rules, rules } from "./Rules";
import { ICreateRule, IReadRule } from "../menus/types";
import chokidar from "chokidar";

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
        console.log(
            `Starting to watch changes in: ${directory} with these rules: ${rules[0].rule}`
        );

        const watcher = chokidar.watch(directory, {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
            persistent: true,
        });

        // Handling the events with your rules
        watcher
            .on("add", path => this.handleFileEvent("add", path, rules))
            .on("change", path => this.handleFileEvent("change", path, rules))
            .on("unlink", path => this.handleFileEvent("unlink", path, rules))
            .on("error", error => console.error(`Watcher error: ${error}`))
            .on("ready", () =>
                console.log(
                    `Initial scan complete. Watching for changes in ${directory}`
                )
            );

        return () => {
            watcher.close();
            console.log(`Stopped watching ${directory}`);
        };
    }

    private handleFileEvent(
        eventType: string,
        path: string,
        rules: IReadRule[]
    ) {
        console.log(`Event: ${eventType} in file: ${path}`);
        if (rules.length === 1) {
            this.processRule(eventType, path, rules[0]);
        } else {
            rules.forEach(rule => this.processRule(eventType, path, rule));
        }
    }

    processRule(eventType: EventType, filename: string, rule: IReadRule) {
        // if (eventType === "change") {
        // }
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

export type EventType = "change" | "close" | "error" | "rename";
