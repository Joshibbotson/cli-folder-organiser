import http from "http";
import { pressEnterToContinue } from "./menus/pressEnterMenu.menu";
import { openMainMenu } from "./menus/mainMenu.menu";

export const server = http.createServer();

export async function startServer() {
    server.listen(3000, async () => {
        console.log(
            "\n folder organiser server is listening on http://localhost:3000"
        );
    });
    await pressEnterToContinue();
    await openMainMenu();

    server.on("error", error => {
        console.error("\n Failed to start server: ", error);
    });
}

export function serverIsRunning(server) {
    return server.listening;
}

export async function closeServer() {
    server.close(err => {
        if (err) {
            console.error("\nError shutting down the server:", err);
            return;
        }
        console.log("\nServer has been stopped.");
    });
    await pressEnterToContinue();
    await openMainMenu();
}
