import winston, { LoggerOptions } from "winston";

export async function newLogger(loggerOptions: LoggerOptions, colors?: Record<string, string>) {
    const customLogger = winston.createLogger(loggerOptions);
    if (colors) winston.addColors(colors);
    return customLogger;
}