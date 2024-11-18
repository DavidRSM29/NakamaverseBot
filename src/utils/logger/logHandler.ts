import { Logger } from 'winston';
import type { LogHandlerOptions, LoggerLevels } from '../../types/types.js';
import { newLogger } from './createLogger.js';
import { colors, loggerOptions } from './config.js';

const customLogger: Logger = await newLogger(loggerOptions, colors);

customLogger.on('error', (error) => {
    console.log(error);
});

export enum LogType {
    CRIT = "crit",
    ERROR = "error",
    WARNING = "warning",
    NOTICE = "notice",
    INFO = "info",
    DEBUG = "debug"
}

export class Log extends Error {
    constructor(message: string, public logLevel: LogType) {
        super(message);
    }
}

const logByLevel: LoggerLevels = {
    [LogType.CRIT]: async (error: string) => { customLogger.crit(error); },
    [LogType.ERROR]: async (error: string) => { customLogger.error(error); },
    [LogType.WARNING]: async (error: string) => { customLogger.warning(error); },
    [LogType.NOTICE]: async (error: string) => { customLogger.notice(error); },
    [LogType.INFO]: async (error: string) => { customLogger.info(error); },
    [LogType.DEBUG]: async (error: string) => { customLogger.debug(error); },
} as const;


export async function logHandler(log: unknown, options?: LogHandlerOptions) {
    const customError = await createLog(log);
    if (options && options.editReply) options.editReply({ content: options.message ?? customError.message });
    saveLog(customError);
}

async function createLog(log: unknown) {
    let customError: Log | undefined = undefined;
    if (log instanceof Log) customError = log;
    else if (log instanceof Error) customError = new Log(log.message, LogType.ERROR);
    return customError ?? new Log(new String(log).toString(), LogType.ERROR);
}

async function saveLog(log: Log) {
    logByLevel[log.logLevel](log.message);
}