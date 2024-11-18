import mongoose from "mongoose";
import { Log, logHandler, LogType } from "../logger/logHandler.js";

export async function connectToMongoDB() {
    const [MONGO_URI, MONGO_DATABASE_NAME] = [process.env.MONGO_URI, process.env.MONGO_DATABASE_NAME];
    if (!MONGO_URI || !MONGO_DATABASE_NAME) return logHandler(new Log('La configuración de la base de datos no está completa.', LogType.WARNING));
    mongoose.connect(`${MONGO_URI}/${MONGO_DATABASE_NAME}`)
        .then(() => logHandler(new Log(`La conexión a la base de datos fue exitosa, conectado a ${MONGO_DATABASE_NAME}.`, LogType.INFO)))
        .catch(() => logHandler(new Log('La conexión a la base de datos falló.', LogType.WARNING)));
}

export async function connectedToDB() {
    if (mongoose.connection.readyState !== mongoose.STATES.connected)
        throw new Log('Not connected to the database.', LogType.WARNING);
}