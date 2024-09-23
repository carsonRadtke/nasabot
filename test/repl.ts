import "process";
import { CommandKind, HandleCommand } from "../src/lib/commandHandler";
import { MakeAPODRequest } from "../src/lib/apodService";

process.stdin.on("data", async (data) => {
    const input = data.toString().trim();
    if (input === "exit") {
        process.exit(0);
    }
    const res = HandleCommand(input);
    switch (res.kind) {
        case CommandKind.Subscribe:
            console.log("Cannot subscribe from REPL");
            break;
        case CommandKind.APOD:
            const res = await MakeAPODRequest();
            console.log(res);
            break;
        case CommandKind.Unknown:
        case CommandKind.Help:
            console.log("./nasabot [subscribe|apod|help]");
            break;
    }
})