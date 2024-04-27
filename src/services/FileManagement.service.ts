import path from "path";
import fs from "fs";

/** utility class with methods for handling files and directories */
export class FileManagement {
    public checkPathExists(path: string): boolean {
        return fs.existsSync(path);
    }

    public checkPathIsSubDirectory(
        parentPath: string,
        subPath: string
    ): boolean {
        return subPath.includes(parentPath);
    }

    public createDirectory(path: string, recursive: boolean): void {
        try {
            fs.mkdirSync(path, { recursive: recursive });
        } catch (err) {
            throw `Failed to create directory with an error of: ${err}`;
        }
    }

    public writeFile(path: string, data: string) {
        try {
            fs.writeFileSync(path, data);
        } catch (err) {
            throw `Failed to write to file with an error of: ${err}`;
        }
    }

    public readFile(path: string, encoding: BufferEncoding) {
        try {
            return fs.readFileSync(path, encoding);
        } catch (err) {
            throw `Failed to read file with an error of: ${err}`;
        }
    }

    /** moves file to alternative path, handles already existing paths by renaming
     * the filename of the file to be moved. */
    public moveFileToAlternativeDir(
        oldPath: string,
        newPath: string
    ): { success: boolean; renamed: boolean } {
        try {
            const { isRenamed, path } = this.renameFileIfExists(newPath);
            const checkedNewPath = path;
            fs.renameSync(oldPath, checkedNewPath);
            return { success: true, renamed: isRenamed };
        } catch (err) {
            throw new Error(`failed to move file with an error of:${err}`);
        }
    }

    /** Renames basefile if target path alreadt exists by adding a current timestring to the end
     *
     * e.g. targetPath: /example/foo would become /example/foo-1714211513449
     * @returns string
     */
    public renameFileIfExists(targetPath: string) {
        const basename = path.basename(targetPath, path.extname(targetPath));
        const extension = path.extname(targetPath);

        if (!this.checkPathExists(targetPath)) {
            return { isRenamed: false, path: targetPath };
        }
        return {
            isRenamed: true,
            path: `${path.dirname(
                targetPath
            )}/${basename}-${new Date().getTime()}${extension}`,
        };
    }
}
