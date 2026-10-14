export const addSecondsToDate = (date: Date, seconds: number) => {
    date.setSeconds(date.getSeconds() + seconds)
    return date
}