export function printToConsole(data, type) {
    switch (type) {
        case "table":
            console.table(data);
            break;
        case "log":
            console.log(data);
    }
}
