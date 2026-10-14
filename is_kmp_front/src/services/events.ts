import {sendIsKmpRequest} from '@/services'

export const getEventsCountRequest = async (startDate: string, endDate: string) => {
    return await sendIsKmpRequest(`events/count/?start_date=${startDate}&end_date=${endDate}`, 'GET')
}

export const getEventsOnDateRequest = async (date: string) => {
    return await sendIsKmpRequest(`events/?date=${date}`, 'GET')
}

export const createEventRequest = async (
    name: string,
    description: string,
    startDate: string,
    endDate: string,
    link: string,
    color: string,
) => {
    return await sendIsKmpRequest(
        'events/create/',
        'POST',
        {
            name,
            start_date: startDate,
            ...(description ? {description} : {}),
            ...(endDate ? {end_date: endDate} : {}),
            ...(link ? {link} : {}),
            color,
        }
    )
}

export const updateEventRequest = async (
    eventId: number,
    name: string,
    description: string,
    startDate: string,
    endDate: string,
    link: string,
    color: string,
) => {
    return await sendIsKmpRequest(
        `events/${eventId}/update/`,
        'PUT',
        {
            name,
            start_date: startDate,
            ...(description ? {description} : {}),
            ...(endDate ? {end_date: endDate} : {}),
            ...(link ? {link} : {}),
            color,
        },
    )
}

export const deleteEventRequest = async (eventId: number) => {
    return await sendIsKmpRequest(`events/${eventId}/delete/`, 'DELETE')
}

export const getUserProfilesRequest = async (includeCompanyName: boolean = false) => {
    return await sendIsKmpRequest(
        'event_participants/user_profiles/?include_photo=true' +
        (includeCompanyName ? '&include_company_name=true' : ''),
        'GET',
    )
}

export const getEventParticipantsRequest = async (eventId: number) => {
    return await sendIsKmpRequest(`event_participants/?event_id=${eventId}`, 'GET')
}

export const addEventParticipantRequest = async (eventId: number, companyOrUserId: number, type: string) => {
    let paramValue = ''
    if (type === 'company') paramValue = `company_id=${companyOrUserId}`
    if (type === 'user') paramValue = `user_id=${companyOrUserId}`
    return await sendIsKmpRequest(`event_participants/add/?event_id=${eventId}&${paramValue}`, 'PATCH')
}

export const removeEventParticipantRequest = async (eventParticipantId: number) => {
    return await sendIsKmpRequest(`event_participants/${eventParticipantId}/delete/`, 'DELETE')
}

export const getEventParticipantNotificationsRequest = async (eventId: number) => {
    return await sendIsKmpRequest(`event_participant_notifications/?event_id=${eventId}`, 'GET')
}

export const getPossibleNotificationIntervalsRequest = async () => {
    return await sendIsKmpRequest('event_participant_notifications/intervals/', 'GET')
}

export const addEventParticipantNotificationRequest = async (eventId: number, notificationIntervalId: number) => {
    return await sendIsKmpRequest(
        'event_participant_notifications/add/',
        'POST',
        {
            event_id: eventId,
            notification_interval_id: notificationIntervalId,
        }
    )
}

export const deleteEventParticipantNotificationRequest = async (eventParticipantNotificationId: number) => {
    return await sendIsKmpRequest(`event_participant_notifications/${eventParticipantNotificationId}/delete/`, 'DELETE')
}

export const notifyAllParticipantsNowRequest = async (eventId: number) => {
    return await sendIsKmpRequest(
        'event_participant_notifications/notify_all_now/',
        'POST',
        {
            event_id: eventId,
        }
    )
}
