import { combineReducers } from 'redux'

import { errorReducer } from '@/store/reducers'

const rootReducer = combineReducers({
    error: errorReducer,
})

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer