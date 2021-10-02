declare type LogType = "log" | "warn" | "error" | "debug" | "cmd" | "ready";
export default function logger(content: any, type?: LogType): void;
export {};
