import {
    GET_EVENTS_COUNT_REQUEST,
    GET_EVENTS_ON_DATE_REQUEST,
    ON_EVENT_PARTICIPANT_NOTIFICATIONS_RESPONSE,
    ON_EVENT_PARTICIPANTS_RESPONSE,
    ON_EVENT_POSSIBLE_PARTICIPANTS_RESPONSE,
    ON_EVENTS_COUNT_RESPONSE,
    ON_EVENTS_ON_DATE_RESPONSE,
    ON_POSSIBLE_NOTIFICATION_INTERVALS_RESPONSE,
    ON_REMOVE_EVENT_PARTICIPANT_RESPONSE,
} from '@/store/actionTypes'

const initialState: {
    eventsCount: any[]
    eventsOnDate: {
        isLoading: boolean
        events: any[]
    }
    possibleParticipants: {
        companies: any[],
        users: any[],
    }
    eventsParticipants: {
        [key: number]: any
    }
    possibleNotificationIntervals: any[]
    eventParticipantNotifications: {
        [key: number]: any[]
    }
} = {
    eventsCount: [],
    eventsOnDate: {
        isLoading: false,
        events: [],
    },
    possibleParticipants: {
        companies: [],
        users: [],
    },
    eventsParticipants: {},
    possibleNotificationIntervals: [],
    eventParticipantNotifications: {},
}

export const eventsReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case GET_EVENTS_COUNT_REQUEST: {
            return {
                ...state,
                eventsCount: action.removePrevValues ? [] : state.eventsCount,
            }
        }
        case ON_EVENTS_COUNT_RESPONSE: {
            return {
                ...state,
                eventsCount: action.eventsCount,
            }
        }
        case GET_EVENTS_ON_DATE_REQUEST: {
            return {
                ...state,
                eventsOnDate: {
                    ...state.eventsOnDate,
                    isLoading: true,
                },
                eventsParticipants: action.loadParticipants ? {} : {...state.eventsParticipants},
            }
        }
        case ON_EVENTS_ON_DATE_RESPONSE: {
            return {
                ...state,
                eventsOnDate: {
                    isLoading: false,
                    events: action.events,
                },
            }
        }
        case ON_EVENT_POSSIBLE_PARTICIPANTS_RESPONSE: {
            return {
                ...state,
                possibleParticipants: {
                    companies: action.companies,
                    users: action.users,
                },
            }
        }
        case ON_EVENT_PARTICIPANTS_RESPONSE: {
            return {
                ...state,
                eventsParticipants: {
                    ...state.eventsParticipants,
                    [action.eventId]: action.participants,
                },
            }
        }
        case ON_REMOVE_EVENT_PARTICIPANT_RESPONSE: {
            return {
                ...state,
                eventsParticipants: {
                    ...state.eventsParticipants,
                    [action.eventId]: state.eventsParticipants[action.eventId].filter((participant) => participant.id !== action.participantId),
                },
            }
        }
        case ON_POSSIBLE_NOTIFICATION_INTERVALS_RESPONSE: {
            return {
                ...state,
                possibleNotificationIntervals: action.notificationIntervals,
            }
        }
        case ON_EVENT_PARTICIPANT_NOTIFICATIONS_RESPONSE: {
            return {
                ...state,
                eventParticipantNotifications: {
                    ...state.eventParticipantNotifications,
                    [action.eventId]: action.notifications,
                },
            }
        }
        default:
            return {...state}
    }
}