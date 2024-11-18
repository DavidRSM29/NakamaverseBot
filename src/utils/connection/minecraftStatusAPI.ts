import type { MinecraftAPIResponse } from "../../types/types.d.ts";

export async function getMinecraftServerStatus(minecraftServerIp: string) {
    try {
        const res = await fetch(`https://api.mcsrvstat.us/3/${minecraftServerIp}`);
        const status = await res.json();
        isMinecraftServerOnline(status);
        return status;
    } catch (error) {
        if (error instanceof Error) console.log(error.stack);
    }
}

function isMinecraftServerOnline(json: unknown): asserts json is MinecraftAPIResponse {
    const response = json && typeof json === "object";
    if (!response) throw new Error("Respuesta Inválida");
    const isResponseValid = 'online' in json && typeof json.online === "boolean";
    if (!isResponseValid || json.online === false) throw new Error('Servidor Apagado');
}