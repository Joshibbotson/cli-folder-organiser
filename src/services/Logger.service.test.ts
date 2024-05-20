import { Logger } from "./Logger.service";

describe("Logger", () => {
    let logSpy;
    let tableSpy;

    beforeEach(() => {
        logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        tableSpy = jest.spyOn(console, "table").mockImplementation(() => {});
    });

    afterEach(() => {
        logSpy.mockRestore();
        tableSpy.mockRestore();
    });

    it("should call console.table with the correct data", () => {
        const data = [{ key: "value" }];
        Logger.table(data);
        expect(tableSpy).toHaveBeenCalledWith(data);
    });

    it("should call console.log with the correct arguments for info", () => {
        const data = ["test info"];
        Logger.info(...data);
        expect(logSpy).toHaveBeenCalledWith(
            "\n\x1b[42m%s\x1b[0m",
            " Info ",
            ...data
        );
    });

    it("should call console.log with the correct arguments for warning", () => {
        const data = ["test warning"];
        Logger.warning(...data);
        expect(logSpy).toHaveBeenCalledWith(
            "\n\x1b[48;5;208m%s\x1b[0m",
            " Warning  ",
            ...data
        );
    });

    it("should call console.log with the correct arguments for error", () => {
        const data = ["test error"];
        Logger.error(...data);
        expect(logSpy).toHaveBeenCalledWith(
            "\n\x1b[41m%s\x1b[0m",
            " Error ",
            ...data
        );
    });
});
