import { readRuleFile } from "./readRuleFile";
import fs from "fs";

export function addRule(rule: string) {
    let data = readRuleFile();
    if (data !== undefined) {
        data.push({
            rule: rule,
            creationDate: new Date().toISOString(),
            active: true,
        });
    } else if (data === undefined) {
        data = {
            rule: rule,
            creationDate: new Date().toISOString(),
            active: true,
        };
    }
    const stringifiedData = JSON.stringify(data, null, 2);
    fs.writeFileSync("./config-files/rules.json", stringifiedData);
}
