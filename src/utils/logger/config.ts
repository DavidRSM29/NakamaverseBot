import winston from "winston";
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const levels = {
    crit: 0,
    error: 1,
    warning: 2,
    notice: 3,
    info: 4,
    debug: 5
};

const transportOptions = {
    Levels: {
        console: "info",
        errorLog: "error",
        informationLog: "info"
    },
    fileNames: {
        errorLog: join(__dirname, "./logs/error.log"),
        informationLog: join(__dirname, "./logs/info.log"),
        uncaughtExceptionsLog: join(__dirname, "./logs/uncaughtexceptions.log"),
        unhandledRejectionsLog: join(__dirname, "./logs/unhandledrejections.log")
    }
};

export const colors = {
    crit: "bold red",
    error: "red",
    warning: "blue",
    notice: "yellow",
    info: "white",
    degub: "green"
};

export const loggerOptions = {
    levels: levels,
    transports: [
        new winston.transports.Console({ level: transportOptions.Levels.console, format: winston.format.combine(winston.format.json(), winston.format.colorize({ all: true })) }),
        new winston.transports.File({ filename: transportOptions.fileNames.errorLog, level: transportOptions.Levels.errorLog }),
        new winston.transports.File({ filename: transportOptions.fileNames.informationLog, level: transportOptions.Levels.informationLog })
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: transportOptions.fileNames.uncaughtExceptionsLog })
    ],
    rejectionHandlers: [
        new winston.transports.File({ filename: transportOptions.fileNames.unhandledRejectionsLog })
    ],
    exitOnError: false
};