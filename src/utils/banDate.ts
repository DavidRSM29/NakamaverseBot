import { TimeType } from "./enums";

export class BanDate extends Date {
    /**
     * @param {string} timeToAdd Time to be added, Format: 1s,1m,1h,1d,1w,1mo,1y.
     * @param {Date} initDate Date that will be modified with the timeToAdd string.
     * @returns Returns ban date with the added time.
     */
    public async addTime(timeToAdd: string, initDate: Date): Promise<Date> {
        const regex = new RegExp('[0-9]+(s|mo|m|h|d|w|y)', 'g')

        let filteredValues = timeToAdd.match(regex)
        let banDate = initDate

        if (!filteredValues) throw new Error('Valor Inválido.')

        for (let index = 0; index < filteredValues.length; index++) {
            const value = filteredValues[index];

            let banTimeValue = value?.match(/[0-9]+/g)?.[0]
            let banTimeType = value?.match(/(?:s|mo|m|h|d|w|y)/)?.[0]

            if (!banTimeValue || !banTimeType) throw new Error('Valor Inválido.')

            const addTime = this.addTimebyType[banTimeType]
            if (!addTime) throw new Error('Valor Inválido.')
            addTime(banDate, Number.parseInt(banTimeValue));
        }
        return banDate
    }
    private async addYears(date: Date, years: number) {
        date.setUTCFullYear(date.getUTCFullYear() + years)
    }
    private async addMonths(date: Date, months: number) {
        date.setUTCMonth(date.getUTCMonth() + months)
    }
    private async addWeeks(date: Date, weeks: number) {
        date.setUTCHours(date.getUTCHours() + (168 * weeks))
    }
    private async addDays(date: Date, days: number) {
        date.setUTCHours(date.getUTCHours() + (24 * days))
    }
    private async addHours(date: Date, hours: number) {
        date.setUTCHours(date.getUTCHours() + hours)
    }
    private async addMinutes(date: Date, minutes: number) {
        date.setUTCMinutes(date.getUTCMinutes() + minutes)
    }
    private async addSeconds(date: Date, seconds: number) {
        date.setUTCSeconds(date.getUTCSeconds() + seconds)
    }
    private addTimebyType: Record<string, Function> = {
        s : this.addSeconds,
        m : this.addMinutes,
        h : this.addHours,
        d : this.addDays,
        w : this.addWeeks,
        mo : this.addMonths,
        y : this.addYears
    }
}