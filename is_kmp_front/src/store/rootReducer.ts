import {combineReducers} from 'redux'

import {
    authReducer,
    budgetsReducer,
    businessFunctionsReducer,
    chatsReducer,
    commonReducer,
    companiesReducer,
    companySoftwareReducer,
    confirmationDialogReducer,
    errorReducer,
    eventsReducer,
    itProjectsReducer,
    notificationsSettingsReducer,
    offersReducer,
    ordersReducer,
    purchasesReducer,
} from '@/store/reducers'

const rootReducer = combineReducers({
    auth: authReducer,
    budgets: budgetsReducer,
    businessFunctions: businessFunctionsReducer,
    chats: chatsReducer,
    common: commonReducer,
    companies: companiesReducer,
    companySoftware: companySoftwareReducer,
    confirmationDialog: confirmationDialogReducer,
    error: errorReducer,
    events: eventsReducer,
    itProjects: itProjectsReducer,
    notificationsSettings: notificationsSettingsReducer,
    offers: offersReducer,
    orders: ordersReducer,
    purchases: purchasesReducer,
})

export type AppState = ReturnType<typeof rootReducer>

export default rootReducer