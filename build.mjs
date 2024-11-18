import { exec } from 'child_process';
import { add } from 'node-7z';
import fs from 'fs/promises';
import winston from 'winston';
import PromptSync from 'prompt-sync';

const customLogger = await newLogger();
const prompt = PromptSync();

async function build() {
    process.stdout.write('\x1Bc');
    process.stdout.write('----------------------------Compilador de Nakamaverse----------------------------\n\n');
    await deleteOldBuild();
    customLogger.log('info', 'Compilando archivos, por favor espere...');
    exec('npx tsc --build', async (error, stdout, stderr) => {
        try {
            if (error) return customLogger.log('error', `error: ${error.message}`);
            if (stderr) return customLogger.log('error', `stderr: ${stderr}`);
            customLogger.log('info', 'Se han compilado todos los archivos exitosamente');
            customLogger.log('info', 'Copiando el archivo package.json, por favor espere...');
            await fs.copyFile('package.json', './build/package.json');
            customLogger.log('info', 'Se ha copiado el archivo package.json exitosamente');
            customLogger.log('info', 'Copiando el archivo package-lock.json, por favor espere...');
            await fs.copyFile('package-lock.json', './build/package-lock.json');
            customLogger.log('info', 'Se ha copiado el archivo package-lock.json exitosamente');
            customLogger.log('info', 'Limpiando el archivo .env, por favor espere...');
            const envFile = (await fs.readFile('.env', { encoding: 'utf-8' }).catch(async e => { if (e instanceof Error) customLogger.log('info', e.message); return await getEnvFile(); }));
            customLogger.log('info', 'Copiando el archivo .env, por favor espere...');
            await fs.writeFile('./build/.env', envFile);
            customLogger.log('info', 'Se ha limpiado y copiado el archivo .env correctamente');
            process.stdout.write('\n');
            const zipBuild = prompt('Quiere comprimir esta build?(Y/N): ', 'N').toString().toLowerCase().trim();
            process.stdout.write('\n');
            const deleteFilesAfter = zipBuild === 'y' ? prompt('Eliminar archivos tras comprimirlos?(Y/N): ', 'N').toString().toLowerCase().trim() : undefined;
            if (zipBuild === 'y') {
                add('build/build.zip', './build/*', { $bin: 'C:/Program Files/7-Zip/7z.exe', deleteFilesAfter: deleteFilesAfter === 'y' ? true : false });
                process.stdout.write('\n');
                customLogger.log('info', deleteFilesAfter === 'y' ? 'Build comprimida y archivos borrados exitosamente.' : 'Build comprimida exitosamente.');
                process.stdout.write('\n');
            }
        } catch (error) {
            if (error instanceof Error) customLogger.log('error', error.message);
        }
    });
}

async function deleteOldBuild() {
    try {
        customLogger.log('info', 'Borrando la build anterior, por favor espere...');
        await fs.rm('./build/', { recursive: true, force: true });
        await fs.mkdir('./build', { recursive: true, force: true });
    } catch (error) {
        if (error instanceof Error) customLogger.log('error', error.message);
    }
}

async function getEnvFile() {
    return `TOKEN=""\nMONGO_URI=""\nMONGO_DATABASE_NAME=""`;
}

async function newLogger() {
    return winston.createLogger({
        transports: [
            new winston.transports.Console({ format: winston.format.json() }),
        ],
        exitOnError: false
    });
}

await build();;