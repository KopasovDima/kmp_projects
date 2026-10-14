import dayjs, {Dayjs} from 'dayjs'

export const convertToDateString = (date) => {
    if (typeof date === 'string') {
        date = new Date(date)
    }

    const dateParts = date.toISOString().substring(0, 10).split('-')

    return `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`
}

export const convertToTimeString = (date) => {
    if (typeof date === 'string') {
        date = new Date(date)
    }

    return date.toTimeString().substring(0, 5)
}

export const convertToDateTimeString = (date) => {
    return convertToDateString(date) + ' ' + convertToTimeString(date)
}

export const getMonthStartingAndEndingDates = (date: string | Dayjs) => {
    if (typeof date === 'string') {
        date = dayjs(date)
    }

    return {
        'startDate': date.toISOString().slice(0, 8) + '01',
        'endDate': date.toISOString().slice(0, 8) + date.daysInMonth(),
    }
}
