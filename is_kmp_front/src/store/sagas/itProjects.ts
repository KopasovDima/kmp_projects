import {all, call, put, takeLatest} from 'redux-saga/effects'
import {processError} from '@/store/sagas/rootSaga.ts'
import {
    onCreateITProjectResponseAction,
    onDeleteITProjectResponseAction,
    onITProjectsResponseAction,
    onUpdateITProjectResponseAction,
} from '@/store/actions'
import {createITProjectRequest, deleteITProjectRequest, getITProjectsRequest, updateITProjectRequest,} from '@/services'
import {
    CREATE_IT_PROJECT_REQUEST,
    DELETE_IT_PROJECT_REQUEST,
    GET_IT_PROJECTS_REQUEST,
    UPDATE_IT_PROJECT_REQUEST,
} from '@/store/actionTypes'

function* getITProjectsSaga(action) {
    try {
        const response = yield call(getITProjectsRequest)
        yield put(onITProjectsResponseAction(response.it_projects))
    } catch (error) {
        yield put(onITProjectsResponseAction([]))
        yield call(processError, action, error)
    }
}

function* createITProjectSaga(action) {
    try {
        const response = yield call(
            createITProjectRequest,
            action.name,
            action.description,
            action.purpose,
            action.initiator,
            action.leader,
            action.budget,
            action.startDate,
            action.endDate,
        )
        yield put(onCreateITProjectResponseAction(response.created_it_project))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* updateITProjectSaga(action) {
    try {
        const response = yield call(
            updateITProjectRequest,
            action.itProjectId,
            action.name,
            action.description,
            action.purpose,
            action.initiator,
            action.leader,
            action.budget,
            action.startDate,
            action.endDate,
        )
        yield put(onUpdateITProjectResponseAction(response.updated_it_project))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* deleteITProjectSaga(action) {
    try {
        yield call(deleteITProjectRequest, action.itProjectId)
        yield put(onDeleteITProjectResponseAction(action.itProjectId))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* itProjectsSagas() {
    yield all([
        takeLatest(GET_IT_PROJECTS_REQUEST, getITProjectsSaga),
        takeLatest(CREATE_IT_PROJECT_REQUEST, createITProjectSaga),
        takeLatest(UPDATE_IT_PROJECT_REQUEST, updateITProjectSaga),
        takeLatest(DELETE_IT_PROJECT_REQUEST, deleteITProjectSaga),
    ])
}

export default itProjectsSagas