export class Logger {
    static table(data) {
        console.table(data);
    }

    static info(...data: any[]): void {
        console.log("\n\x1b[42m%s\x1b[0m", " Info ", ...data);
    }

    static warning(...data: any[]): void {
        console.log("\n\x1b[48;5;208m%s\x1b[0m", " Warning  ", ...data);
    }

    static error(...data: any[]): void {
        console.log("\n\x1b[41m%s\x1b[0m", " Error ", ...data);
    }
}
