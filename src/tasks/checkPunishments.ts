import { Log, logHandler, LogType } from '../utils/logger/logHandler.js';
import { PunishmentModel } from '../schemas/punishment.js';
import cron from 'node-cron';


export default async function () {
    try {
        const timeInterval = '*/5 * * * *';
        if (!cron.validate(timeInterval)) throw new Log('El interval de tiempo es incorrecto.', LogType.WARNING);
        cron.schedule(timeInterval, checkPunishments);
    } catch (error) {
        logHandler(error);
    }
};

async function checkPunishments() {
    //TODO: Make this function check for expired punishments
}