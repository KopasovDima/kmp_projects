import {all, call, put, takeLatest} from 'redux-saga/effects'

import {
    ADD_COMPANY_SOFTWARE_REQUEST,
    ADD_SOFTWARE_VERSION_REQUEST,
    CREATE_SOFTWARE_REQUEST,
    DELETE_COMPANY_SOFTWARE_REQUEST,
    GET_COMPANY_SOFTWARE_BY_CLASSES_REQUEST,
    GET_COMPANY_SOFTWARE_REQUEST,
    GET_IMPLEMENTATION_STATUSES_REQUEST,
    GET_SOFTWARE_CLASSES_REQUEST,
    GET_SOFTWARE_REQUEST,
    GET_SOFTWARE_TAGS_REQUEST,
    UPDATE_COMPANY_SOFTWARE_REQUEST,
    UPDATE_SOFTWARE_REQUEST,
} from '@/store/actionTypes'
import {processError} from '@/store/sagas/rootSaga.ts'
import {
    getSoftwareAction,
    onAddCompanySoftwareResponseAction,
    onCompanySoftwareByClassesResponseAction,
    onCompanySoftwareResponseAction,
    onDeleteCompanySoftwareResponseAction,
    onImplementationStatusesResponseAction,
    onSoftwareClassesResponseAction,
    onSoftwareResponseAction,
    onSoftwareTagsResponseAction,
    onUpdateCompanySoftwareResponseAction,
    onUpdateSoftwareResponseAction,
    softwareVersionsUpdatedAction,
} from '@/store/actions'
import {
    addCompanySoftwareRequest,
    addSoftwareVersionRequest,
    createSoftwareRequest,
    deleteCompanySoftwareRequest,
    getCompanySoftwareByClassesRequest,
    getCompanySoftwareRequest,
    getImplementationStatusesRequest,
    getSoftwareClassesRequest,
    getSoftwareRequest,
    getSoftwareTagsRequest,
    getSoftwareVersionsRequest,
    updateCompanySoftwareRequest,
    updateSoftwareRequest
} from '@/services'

function* getCompanySoftwareSaga(action) {
    try {
        const response = yield call(getCompanySoftwareRequest)
        yield put(onCompanySoftwareResponseAction(response.company_software))
    } catch (error) {
        yield put(onCompanySoftwareResponseAction([]))
        yield call(processError, action, error)
    }
}

function* getCompanySoftwareByClassesSaga(action) {
    try {
        const response = yield call(getCompanySoftwareByClassesRequest)
        yield put(onCompanySoftwareByClassesResponseAction(response.company_software_by_classes))
    } catch (error) {
        yield put(onCompanySoftwareByClassesResponseAction([]))
        yield call(processError, action, error)
    }
}

function* getSoftwareClassesSaga(action) {
    try {
        const response = yield call(getSoftwareClassesRequest)
        yield put(onSoftwareClassesResponseAction(response.software_classes))
    } catch (error) {
        yield put(onSoftwareClassesResponseAction([]))
        yield call(processError, action, error)
    }
}

function* getSoftwareTagsSaga(action) {
    try {
        const response = yield call(getSoftwareTagsRequest)
        yield put(onSoftwareTagsResponseAction(response.software_tags))
    } catch (error) {
        yield put(onSoftwareTagsResponseAction([]))
        yield call(processError, action, error)
    }
}

function* getSoftwareSaga(action) {
    try {
        const response = yield call(getSoftwareRequest, action.includeVersions)
        yield put(onSoftwareResponseAction(response.software))
    } catch (error) {
        yield put(onSoftwareResponseAction([]))
        yield call(processError, action, error)
    }
}

function* addCompanySoftwareSaga(action) {
    try {
        const response = yield call(
            addCompanySoftwareRequest,
            action.softwareId,
            action.comment,
            action.implementationStatusId,
            action.copiesNumber,
            action.additionallyNeededCopiesNumber,
            action.softwareVersionIds,
        )
        yield put(onAddCompanySoftwareResponseAction(response.company_software))
    } catch (error) {
        yield put(onAddCompanySoftwareResponseAction(undefined))
        yield call(processError, action, error)
    }
}

function* updateCompanySoftwareSaga(action) {
    try {
        const response = yield call(
            updateCompanySoftwareRequest,
            action.companySoftwareId,
            action.comment,
            action.implementationStatusId,
            action.copiesNumber,
            action.additionallyNeededCopiesNumber,
            action.softwareVersionIds,
        )
        yield put(onUpdateCompanySoftwareResponseAction(response.company_software))
    } catch (error) {
        yield put(onUpdateCompanySoftwareResponseAction(undefined))
        yield call(processError, action, error)
    }
}

function* deleteCompanySoftwareSaga(action) {
    try {
        yield call(deleteCompanySoftwareRequest, action.companySoftwareId)
        yield put(onDeleteCompanySoftwareResponseAction(action.companySoftwareId))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* createSoftwareSaga(action) {
    try {
        yield call(
            createSoftwareRequest,
            action.name,
            action.description,
            action.artNumber,
            action.registerNumber,
            action.mainClassId,
            action.additionalClassIds,
            action.tagIds,
        )
        yield put(getSoftwareAction(true))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* updateSoftwareSaga(action) {
    try {
        const response = yield call(
            updateSoftwareRequest,
            action.softwareId,
            action.name,
            action.description,
            action.artNumber,
            action.registerNumber,
            action.mainClassId,
            action.additionalClassIds,
            action.tagIds,
        )
        yield put(onUpdateSoftwareResponseAction(response.updated_software))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* getImplementationStatusesSaga(action) {
    try {
        const response = yield call(getImplementationStatusesRequest)
        yield put(onImplementationStatusesResponseAction(response.implementation_statuses))
    } catch (error) {
        yield put(onImplementationStatusesResponseAction([]))
        yield call(processError, action, error)
    }
}

function* addSoftwareVersionSaga(action) {
    try {
        yield call(addSoftwareVersionRequest, action.softwareId, action.version)
        const response = yield call(getSoftwareVersionsRequest, action.softwareId)
        yield put(softwareVersionsUpdatedAction(action.softwareId, response.software_versions))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* companySoftwareSagas() {
    yield all([
        takeLatest(GET_COMPANY_SOFTWARE_REQUEST, getCompanySoftwareSaga),
        takeLatest(GET_COMPANY_SOFTWARE_BY_CLASSES_REQUEST, getCompanySoftwareByClassesSaga),
        takeLatest(GET_SOFTWARE_CLASSES_REQUEST, getSoftwareClassesSaga),
        takeLatest(GET_SOFTWARE_TAGS_REQUEST, getSoftwareTagsSaga),
        takeLatest(GET_SOFTWARE_REQUEST, getSoftwareSaga),
        takeLatest(ADD_COMPANY_SOFTWARE_REQUEST, addCompanySoftwareSaga),
        takeLatest(UPDATE_COMPANY_SOFTWARE_REQUEST, updateCompanySoftwareSaga),
        takeLatest(DELETE_COMPANY_SOFTWARE_REQUEST, deleteCompanySoftwareSaga),
        takeLatest(CREATE_SOFTWARE_REQUEST, createSoftwareSaga),
        takeLatest(UPDATE_SOFTWARE_REQUEST, updateSoftwareSaga),
        takeLatest(GET_IMPLEMENTATION_STATUSES_REQUEST, getImplementationStatusesSaga),
        takeLatest(ADD_SOFTWARE_VERSION_REQUEST, addSoftwareVersionSaga),
    ])
}

export default companySoftwareSagas