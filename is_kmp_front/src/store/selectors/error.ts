import {AppState} from '@/store/rootReducer'

export const getErrorSelector = (state: AppState) => state.error
