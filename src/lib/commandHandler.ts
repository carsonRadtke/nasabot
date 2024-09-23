export enum CommandKind {
    Subscribe = "subscribe",
    APOD = "apod",
    Help = "help",
    Unknown = "unknown",
}

export type CommandResult = {
    kind: CommandKind,
    command: string,
    subcommand: string,
    args: string[]
};

export function HandleCommand(messageContents: string): CommandResult {
    const [command, subcommand, ...args] = messageContents.split(" ").map(x => x.trim());
    switch (subcommand) {
        case CommandKind.Subscribe:
            return { kind: CommandKind.Subscribe, command, subcommand, args };
        case CommandKind.APOD:
            return { kind: CommandKind.APOD, command, subcommand, args };
        case CommandKind.Help:
            return { kind: CommandKind.Help, command, subcommand, args };
        default:
            return { kind: CommandKind.Unknown, command, subcommand, args };
    }
}