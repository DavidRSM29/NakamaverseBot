import type { GetAddTimeFunc } from "../../types/types.d.ts";
import { Log, LogType } from "../logger/logHandler.js";

export class PunishmentDate extends Date {
	/**
	 * @param {string} timeToAdd Time to be added, Format: 1s,1m,1h,1d,1w,1mo,1y.
	 * @returns Returns a punishment date with the added time.
	 */
	public async addTime(timeToAdd: string): Promise<number> {
		let splittedTime = timeToAdd.match(/[0-9]+(s|mo|m|h|d|w|y)/g);

		if (!splittedTime) throw new Log("Valor Inválido.", LogType.INFO);

		for (let index = 0; index < splittedTime.length; index++) {
			const time = splittedTime[index];

			if (!time) continue;

			let punishmentTimeValue = time.match(/[0-9]+/g)?.[0];
			let punishmentTimeType = time.match(/(?:s|mo|m|h|d|w|y)/)?.[0];

			if (!punishmentTimeValue || !punishmentTimeType)
				throw new Log("El tiempo a agregar tiene un formato erróneo o está incompleto. El formato es un número más s|mo|m|h|d|w|y", LogType.INFO);

			const addTime = this.getAddTimeFunc[punishmentTimeType];
			if (!addTime) throw new Log(`No se pudo agregar el tiempo, el valor no corresponde a ningún tipo de tiempo definido. Valor: ${punishmentTimeType}`, LogType.INFO);
			addTime(this, Number.parseInt(punishmentTimeValue));
		}
		return this.getTime();
	}
	private async addYears(date: Date, years: number) {
		date.setUTCFullYear(date.getUTCFullYear() + years);
	}
	private async addMonths(date: Date, months: number) {
		date.setUTCMonth(date.getUTCMonth() + months);
	}
	private async addWeeks(date: Date, weeks: number) {
		date.setUTCHours(date.getUTCHours() + 168 * weeks);
	}
	private async addDays(date: Date, days: number) {
		date.setUTCHours(date.getUTCHours() + 24 * days);
	}
	private async addHours(date: Date, hours: number) {
		date.setUTCHours(date.getUTCHours() + hours);
	}
	private async addMinutes(date: Date, minutes: number) {
		date.setUTCMinutes(date.getUTCMinutes() + minutes);
	}
	private async addSeconds(date: Date, seconds: number) {
		date.setUTCSeconds(date.getUTCSeconds() + seconds);
	}
	private getAddTimeFunc: GetAddTimeFunc = {
		s: this.addSeconds,
		m: this.addMinutes,
		h: this.addHours,
		d: this.addDays,
		w: this.addWeeks,
		mo: this.addMonths,
		y: this.addYears,
	};
}
