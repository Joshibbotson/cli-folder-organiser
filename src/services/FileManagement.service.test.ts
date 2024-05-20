import fs from "fs";
import path from "path";
import { FileManagement } from "./FileManagement.service";

jest.mock("fs");

describe("FileManagement", () => {
    let fileManagement;

    beforeEach(() => {
        fileManagement = new FileManagement();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("should check if path exists", () => {
        const mockPath = "/some/path";
        jest.spyOn(fs, "existsSync").mockReturnValue(true);

        const result = fileManagement.checkPathExists(mockPath);

        expect(fs.existsSync).toHaveBeenCalledWith(mockPath);
        expect(result).toBe(true);
    });

    it("should check if path is a subdirectory", () => {
        const parentPath = "/parent";
        const subPath = "/parent/sub";

        const result = fileManagement.checkPathIsSubDirectory(
            parentPath,
            subPath
        );

        expect(result).toBe(true);
    });

    it("should create directory recursively", () => {
        const mockPath = "/some/path";
        jest.spyOn(fs, "mkdirSync").mockImplementation(() => {
            return undefined as unknown as string;
        });

        fileManagement.createDirectory(mockPath, true);

        expect(fs.mkdirSync).toHaveBeenCalledWith(mockPath, {
            recursive: true,
        });
    });

    it("should write to file", () => {
        const mockPath = "/some/file.txt";
        const mockData = "data";
        jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});

        fileManagement.writeFile(mockPath, mockData);

        expect(fs.writeFileSync).toHaveBeenCalledWith(mockPath, mockData);
    });

    it("should read from file", () => {
        const mockPath = "/some/file.txt";
        const mockData = "data";
        jest.spyOn(fs, "readFileSync").mockReturnValue(mockData);

        const result = fileManagement.readFile(mockPath, "utf8");

        expect(fs.readFileSync).toHaveBeenCalledWith(mockPath, "utf8");
        expect(result).toBe(mockData);
    });

    it("should move file to alternative directory", () => {
        const oldPath = "/some/old/file.txt";
        const newPath = "/some/new/file.txt";
        jest.spyOn(fs, "renameSync").mockImplementation(() => {});

        const result = fileManagement.moveFileToAlternativeDir(
            oldPath,
            newPath
        );

        expect(fs.renameSync).toHaveBeenCalledWith(oldPath, expect.any(String));
        expect(result.success).toBe(true);
    });

    it("should rename file if exists", () => {
        const targetPath = "/some/file.txt";
        const newName = "/some/file-12345.txt";
        jest.spyOn(Date.prototype, "getTime").mockReturnValue(12345);
        jest.spyOn(fs, "existsSync").mockReturnValue(true);
        jest.spyOn(path, "basename").mockReturnValue("file");
        jest.spyOn(path, "extname").mockReturnValue(".txt");
        jest.spyOn(path, "dirname").mockReturnValue("/some");

        const result = fileManagement.renameFileIfExists(targetPath);

        expect(fs.existsSync).toHaveBeenCalledWith(targetPath);
        expect(result).toEqual({ isRenamed: true, path: newName });
        (Date.prototype.getTime as jest.Mock).mockRestore();
    });
});
