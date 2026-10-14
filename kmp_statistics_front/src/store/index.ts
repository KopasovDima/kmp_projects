import createSagaMiddleware from 'redux-saga'
import logger from 'redux-logger'
import { configureStore } from '@reduxjs/toolkit'

import rootReducer from '@/store/rootReducer.ts'
import { rootSaga } from '@/store/sagas'

const sagaMiddleware = createSagaMiddleware()

const middlewares: any[] = [sagaMiddleware]

if (process.env.NODE_ENV === 'development') middlewares.push(logger)

const store = configureStore({
    reducer: rootReducer,
    middleware: (gDM) => gDM().concat(...middlewares),
})

sagaMiddleware.run(rootSaga)

export default store