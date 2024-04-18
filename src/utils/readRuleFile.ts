import fs from "fs";

export function readRuleFile() {
    try {
        const data = fs.readFileSync("./config-files/rules.json", "utf-8");
        if (data.length > 0) {
            const rules = JSON.parse(data);
            return rules;
        }
        return {
            info: "No rules available, please add new rules",
        };
    } catch (err) {
        console.error("Failed to read file with an error of: ", err);
    }
}
