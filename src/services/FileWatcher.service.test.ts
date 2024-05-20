import chokidar, { FSWatcher } from "chokidar";
import { FileWatcher } from "./FileWatcher.service";
import { IReadRule } from "../menus/types";
import { Rules } from "./Rules.service";
import { Logger } from "./Logger.service";

jest.mock("chokidar");
jest.mock("./Logger.service");

describe("FileWatcher", () => {
    let mockRulesReader: jest.Mocked<Rules>;
    let mockPressEnterToContinue: jest.Mock;
    let mockOpenMainMenu: jest.Mock;
    let fileWatcher: FileWatcher;

    beforeEach(() => {
        mockRulesReader = {
            readRuleFile: jest.fn(),
            processRule: jest.fn(),
        } as any;

        mockPressEnterToContinue = jest.fn();
        mockOpenMainMenu = jest.fn();

        fileWatcher = new FileWatcher(
            mockRulesReader,
            mockPressEnterToContinue,
            mockOpenMainMenu
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should read rules correctly", () => {
        const rules: IReadRule[] = [
            {
                id: 1,
                creationDate: "2023-01-01",
                rule: "Sample Rule",
                directoryIn: "/some/path",
                includedFileExtension: ".txt",
                includedFileNames: "file",
                fileNameMatchCriteria: "ALL",
                ruleAndOrOptions: "AND",
                directoryOut: "/some/output",
                ignoredSubDirectories: "ignored",
                recursive: true,
                active: true,
                filesMoved: 0,
                filesRenamed: 0,
                filesDeleted: 0,
            },
        ];
        mockRulesReader.readRuleFile.mockReturnValue(rules);

        const result = fileWatcher.getRules();

        expect(result).toEqual(rules);
    });

    it("should return null if rules are empty", () => {
        mockRulesReader.readRuleFile.mockReturnValue(null);

        const result = fileWatcher.getRules();

        expect(result).toBeNull();
    });

    it("should check if it is watching directories", () => {
        const mockWatcher = {} as FSWatcher;
        fileWatcher["directoryWatcher"].set("/some/path", mockWatcher);

        const result = fileWatcher.isWatchingDirectories();

        expect(result).toBe(true);
    });

    it("should start directory watchers", async () => {
        const rules: IReadRule[] = [
            {
                id: 1,
                creationDate: "2023-01-01",
                rule: "Sample Rule",
                directoryIn: "/some/path",
                includedFileExtension: ".txt",
                includedFileNames: "file",
                fileNameMatchCriteria: "ALL",
                ruleAndOrOptions: "AND",
                directoryOut: "/some/output",
                ignoredSubDirectories: "ignored",
                recursive: true,
                active: true,
                filesMoved: 0,
                filesRenamed: 0,
                filesDeleted: 0,
            },
        ];
        mockRulesReader.readRuleFile.mockReturnValue(rules);
        jest.spyOn(fileWatcher as any, "watchDirectory").mockReturnValue(
            Promise.resolve()
        );

        await fileWatcher.startDirectoryWatchers();

        expect(fileWatcher["rules"]).toEqual(rules);
        expect(mockPressEnterToContinue).toHaveBeenCalled();
        expect(mockOpenMainMenu).toHaveBeenCalled();
    });

    it("should handle no rules when starting directory watchers", async () => {
        mockRulesReader.readRuleFile.mockReturnValue(null);

        const result = await fileWatcher.startDirectoryWatchers();

        expect(result).toBe("No rules available!");
    });

    it("should stop all directory watchers", async () => {
        const rules: IReadRule[] = [
            {
                id: 1,
                creationDate: "2023-01-01",
                rule: "Sample Rule",
                directoryIn: "/some/path",
                includedFileExtension: ".txt",
                includedFileNames: "file",
                fileNameMatchCriteria: "ALL",
                ruleAndOrOptions: "AND",
                directoryOut: "/some/output",
                ignoredSubDirectories: "ignored",
                recursive: true,
                active: true,
                filesMoved: 0,
                filesRenamed: 0,
                filesDeleted: 0,
            },
        ];
        mockRulesReader.readRuleFile.mockReturnValue(rules);
        jest.spyOn(fileWatcher as any, "stopWatching").mockImplementation(
            () => {}
        );

        await fileWatcher.stopAllDirectoryWatchers();

        expect(fileWatcher["directoryWatcher"].size).toBe(0);
        expect(mockPressEnterToContinue).toHaveBeenCalled();
        expect(mockOpenMainMenu).toHaveBeenCalled();
    });

    it("should stop watching a specific path", () => {
        const mockWatcher = { close: jest.fn() } as unknown as FSWatcher;
        fileWatcher["directoryWatcher"].set("/some/path", mockWatcher);

        (fileWatcher as any).stopWatching("/some/path");

        expect(mockWatcher.close).toHaveBeenCalled();
    });

    it("should log errors from watchers", () => {
        const mockLoggerError = jest
            .spyOn(Logger, "error")
            .mockImplementation(() => {});
        const mockLoggerInfo = jest
            .spyOn(Logger, "info")
            .mockImplementation(() => {});
        const rule: IReadRule = {
            id: 1,
            creationDate: "2023-01-01",
            rule: "Sample Rule",
            directoryIn: "/some/path",
            includedFileExtension: ".txt",
            includedFileNames: "file",
            fileNameMatchCriteria: "ALL",
            ruleAndOrOptions: "AND",
            directoryOut: "/some/output",
            ignoredSubDirectories: "ignored",
            recursive: true,
            active: true,
            filesMoved: 0,
            filesRenamed: 0,
            filesDeleted: 0,
        };

        (fileWatcher as any).watchDirectory("/some/path", rule);

        const mockWatcher = chokidar.watch as jest.Mock;
        const mockWatchInstance = {
            on: jest.fn().mockImplementation((event, callback) => {
                if (event === "error") callback("Error message");
                if (event === "ready") callback();
                return mockWatchInstance;
            }),
        } as unknown as FSWatcher;

        mockWatcher.mockReturnValue(mockWatchInstance);

        expect(mockLoggerError).toHaveBeenCalledWith(
            "Watcher error: Error message"
        );
        expect(mockLoggerInfo).toHaveBeenCalledWith(
            "Initial scan complete. Watching for changes in /some/path"
        );
    });
});
