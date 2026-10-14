import { createSelector } from 'reselect'

import { AppState } from '@/store/rootReducer'

export const getErrorSelector = createSelector(
    (state: AppState) => state.error,
    (error) => error
)
