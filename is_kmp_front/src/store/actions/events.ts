import {
    ADD_EVENT_PARTICIPANT_NOTIFICATION_REQUEST,
    ADD_EVENT_PARTICIPANT_REQUEST,
    CREATE_EVENT_REQUEST,
    DELETE_EVENT_PARTICIPANT_NOTIFICATION_REQUEST,
    DELETE_EVENT_REQUEST,
    GET_EVENT_PARTICIPANT_NOTIFICATIONS_REQUEST,
    GET_EVENT_PARTICIPANTS_REQUEST,
    GET_EVENT_POSSIBLE_PARTICIPANTS_REQUEST,
    GET_EVENTS_COUNT_REQUEST,
    GET_EVENTS_ON_DATE_REQUEST,
    GET_POSSIBLE_NOTIFICATION_INTERVALS_REQUEST,
    NOTIFY_ALL_PARTICIPANTS_NOW_REQUEST,
    ON_EVENT_PARTICIPANT_NOTIFICATIONS_RESPONSE,
    ON_EVENT_PARTICIPANTS_RESPONSE,
    ON_EVENT_POSSIBLE_PARTICIPANTS_RESPONSE,
    ON_EVENTS_COUNT_RESPONSE,
    ON_EVENTS_ON_DATE_RESPONSE,
    ON_POSSIBLE_NOTIFICATION_INTERVALS_RESPONSE,
    ON_REMOVE_EVENT_PARTICIPANT_RESPONSE,
    REMOVE_EVENT_PARTICIPANT_REQUEST,
    UPDATE_EVENT_REQUEST,
} from '@/store/actionTypes'

export const getEventsCountAction = (startDate: string, endDate: string, removePrevValues: boolean = true) => ({
    type: GET_EVENTS_COUNT_REQUEST,
    startDate,
    endDate,
    removePrevValues,
})

export const onEventsCountResponseAction = (eventsCount: any[]) => ({
    type: ON_EVENTS_COUNT_RESPONSE,
    eventsCount,
})

export const getEventsOnDateAction = (date: string, loadParticipants: boolean = true) => ({
    type: GET_EVENTS_ON_DATE_REQUEST,
    date,
    loadParticipants,
})

export const onEventsOnDateResponseAction = (events: any[]) => ({
    type: ON_EVENTS_ON_DATE_RESPONSE,
    events,
})

export const createEventAction = (
    name: string,
    description: string,
    startDate: string,
    endDate: string,
    link: string,
    color: string,
    getEventsOnDate: string,
) => ({
    type: CREATE_EVENT_REQUEST,
    name,
    description,
    startDate,
    endDate,
    link,
    color,
    getEventsOnDate,
})

export const updateEventAction = (
    eventId: number,
    name: string,
    description: string,
    startDate: string,
    endDate: string,
    link: string,
    color: string,
    getEventsOnDate: string,
) => ({
    type: UPDATE_EVENT_REQUEST,
    eventId,
    name,
    description,
    startDate,
    endDate,
    link,
    color,
    getEventsOnDate,
})

export const deleteEventAction = (eventId: number) => ({
    type: DELETE_EVENT_REQUEST,
    eventId,
})

export const getEventPossibleParticipantsAction = () => ({
    type: GET_EVENT_POSSIBLE_PARTICIPANTS_REQUEST,
})

export const onEventPossibleParticipantsResponseAction = (companies, users) => ({
    type: ON_EVENT_POSSIBLE_PARTICIPANTS_RESPONSE,
    companies,
    users,
})

export const getEventParticipantsAction = (eventId: number) => ({
    type: GET_EVENT_PARTICIPANTS_REQUEST,
    eventId,
})

export const onEventParticipantsResponseAction = (eventId: number, participants: any[]) => ({
    type: ON_EVENT_PARTICIPANTS_RESPONSE,
    eventId,
    participants,
})

export const addEventParticipantAction = (eventId: number, companyOrUserId: number, elementType: string) => ({
    type: ADD_EVENT_PARTICIPANT_REQUEST,
    eventId,
    companyOrUserId,
    elementType,
})

export const removeEventParticipantAction = (eventId: number, participantId: number) => ({
    type: REMOVE_EVENT_PARTICIPANT_REQUEST,
    eventId,
    participantId,
})

export const onRemoveEventParticipantResponseAction = (eventId: number, participantId: number) => ({
    type: ON_REMOVE_EVENT_PARTICIPANT_RESPONSE,
    eventId,
    participantId,
})

export const getPossibleNotificationIntervalsAction = () => ({
    type: GET_POSSIBLE_NOTIFICATION_INTERVALS_REQUEST,
})

export const onPossibleNotificationIntervalsResponseAction = (notificationIntervals: any[]) => ({
    type: ON_POSSIBLE_NOTIFICATION_INTERVALS_RESPONSE,
    notificationIntervals,
})

export const getEventParticipantNotificationsAction = (eventId: number) => ({
    type: GET_EVENT_PARTICIPANT_NOTIFICATIONS_REQUEST,
    eventId,
})

export const onEventParticipantNotificationsResponseAction = (eventId: number, notifications: any[]) => ({
    type: ON_EVENT_PARTICIPANT_NOTIFICATIONS_RESPONSE,
    eventId,
    notifications,
})

export const addEventParticipantNotificationAction = (eventId: number, notificationIntervalId: string) => ({
    type: ADD_EVENT_PARTICIPANT_NOTIFICATION_REQUEST,
    eventId,
    notificationIntervalId,
})

export const deleteEventParticipantNotificationAction = (eventId: number, eventParticipantNotificationId: number) => ({
    type: DELETE_EVENT_PARTICIPANT_NOTIFICATION_REQUEST,
    eventId,
    eventParticipantNotificationId,
})

export const notifyAllParticipantsNowAction = (eventId: number) => ({
    type: NOTIFY_ALL_PARTICIPANTS_NOW_REQUEST,
    eventId,
})
