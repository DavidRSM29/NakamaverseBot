import { readdir } from 'fs/promises';
import { Log, logHandler, LogType } from '../utils/logger/logHandler.js';
import type { Task } from '../types/types.d.ts';

export async function initTasks(__dirname: string) {
    const tasks = await getTasks(__dirname);
    if (!tasks) throw new Log('No tasks to execute', LogType.NOTICE);
    for (let index = 0; index < tasks.length; index++) {
        const taskName = tasks[index];
        if (!taskName) continue;
        const task: Task = await import(`./${taskName}`);
        if (!task.default) throw new Log(`${taskName} no es una tarea válida.`, LogType.ERROR);
        task.default();
        logHandler(new Log(`Se ha cargado y ejecutado la tarea ${taskName.replace('.js', '').toUpperCase()}.`, LogType.INFO));
    }
}

async function getTasks(__dirname: string) {
    try {
        const files = await readdir(`${__dirname}/tasks`, { encoding: 'utf-8' });
        return files.reduce((files, file) => {
            if (file !== 'taskLoader.js') files.push(file);
            return files;
        }, [] as string[]);
    } catch (error) {
        logHandler(error);
    }
}