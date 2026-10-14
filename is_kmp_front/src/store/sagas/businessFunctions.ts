import {all, call, put, select, takeEvery, takeLatest} from 'redux-saga/effects'

import {
    ADD_BUSINESS_FUNCTION_REQUEST,
    ATTACH_COMPANY_SOFTWARE_TO_BUSINESS_FUNCTION_REQUEST,
    ATTACH_NEW_COMPANY_SOFTWARE_TO_BUSINESS_FUNCTION_REQUEST,
    CHANGE_BUSINESS_FUNCTION_ORDER,
    CREATE_AND_ADD_TARGET_SOFTWARE_TO_BUSINESS_FUNCTION_REQUEST,
    CREATE_AND_ATTACH_NEW_COMPANY_SOFTWARE_TO_BUSINESS_FUNCTION_REQUEST,
    DELETE_BUSINESS_FUNCTION_REQUEST,
    DETACH_COMPANY_SOFTWARE_FROM_BUSINESS_FUNCTION_REQUEST,
    DOWNLOAD_BUSINESS_FUNCTIONS_REPORT_REQUEST,
    GET_BUSINESS_FUNCTION_DETAILS_REQUEST,
    GET_BUSINESS_FUNCTIONS_REQUEST,
    RESET_BUSINESS_FUNCTION_VALUE_REQUEST,
    UPDATE_BUSINESS_FUNCTION_DETAILS_REQUEST,
    UPDATE_BUSINESS_FUNCTION_EXAMPLES_REQUEST,
    UPDATE_BUSINESS_FUNCTION_REQUEST,
} from '@/store/actionTypes'
import {processError} from '@/store/sagas/rootSaga.ts'
import {
    getBusinessFunctionDetailsAction,
    getBusinessFunctionsAction,
    getCompanySoftwareAction,
    getSoftwareAction,
    onAddBusinessFunctionResponseAction,
    onAttachedCompanySoftwareUpdatedAction,
    onBusinessFunctionDetailsResponseAction,
    onBusinessFunctionsResponseAction,
    onDownloadBusinessFunctionsReportResponseAction,
    onUpdateBusinessFunctionResponseAction
} from '@/store/actions'
import {
    addBusinessFunctionRequest,
    attachCompanySoftwareToBusinessFunctionRequest,
    attachNewCompanySoftwareToBusinessFunctionRequest,
    changeBusinessFunctionOrderRequest,
    createSoftwareRequest,
    deleteBusinessFunctionRequest,
    detachCompanySoftwareFromBusinessFunctionRequest,
    downloadBusinessFunctionsReportRequest,
    getBusinessFunctionDetailsRequest,
    getBusinessFunctionsRequest,
    resetBusinessFunctionValueRequest,
    updateBusinessFunctionDetailsRequest,
    updateBusinessFunctionExamplesRequest,
    updateBusinessFunctionRequest
} from '@/services'

function* getBusinessFunctionsSaga(action) {
    try {
        const response = yield call(getBusinessFunctionsRequest)
        yield put(onBusinessFunctionsResponseAction(response.business_functions))
    } catch (error) {
        yield put(onBusinessFunctionsResponseAction([]))
        yield call(processError, action, error)
    }
}

function* updateBusinessFunctionSaga(action) {
    try {
        const response = yield call(updateBusinessFunctionRequest, action.businessFunctionId, action.name)
        yield put(onUpdateBusinessFunctionResponseAction(response.updated_business_function))
        yield put(getBusinessFunctionsAction())
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* addBusinessFunctionSaga(action) {
    try {
        const response = yield call(addBusinessFunctionRequest, action.name, action.parentId)
        yield put(onAddBusinessFunctionResponseAction(response.created_business_function))
        yield put(getBusinessFunctionsAction())
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* deleteBusinessFunctionSaga(action) {
    try {
        yield call(deleteBusinessFunctionRequest, action.businessFunctionId)
        yield put(getBusinessFunctionsAction())
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* getBusinessFunctionDetailsSaga(action) {
    try {
        const response = yield call(getBusinessFunctionDetailsRequest, action.businessFunctionId)
        yield put(onBusinessFunctionDetailsResponseAction({
            businessFunctionId: action.businessFunctionId,
            ...response.business_function_by_company,
        }))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* updateBusinessFunctionDetailsSaga(action) {
    try {
        const response = yield call(
            updateBusinessFunctionDetailsRequest,
            action.businessFunctionByCompanyId,
            action.value,
            action.ftr,
            action.priority,
            action.reason,
            action.ruSoftwareAvailabilityStatus,
            action.softwareUsageStatus,
            action.targetSoftwareId,
            action.comment,
        )
        const businessFunctionsDetails = yield select(state => state.businessFunctions?.details)
        if (businessFunctionsDetails?.id && action.businessFunctionByCompanyId === businessFunctionsDetails?.id)
            yield put(onBusinessFunctionDetailsResponseAction(response.updated_business_function_by_company))
        yield put(getBusinessFunctionsAction())
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* attachNewCompanySoftwareToBusinessFunctionSaga(action) {
    try {
        const response = yield call(
            attachNewCompanySoftwareToBusinessFunctionRequest,
            action.businessFunctionId,
            action.softwareId,
        )
        yield put(onAttachedCompanySoftwareUpdatedAction(
            response.business_function_by_company?.company_software || []
        ))
        yield put(getBusinessFunctionDetailsAction(action.businessFunctionId, false))
        yield put(getCompanySoftwareAction())
        yield put(getBusinessFunctionsAction())
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* attachCompanySoftwareToBusinessFunctionSaga(action) {
    try {
        const response = yield call(
            attachCompanySoftwareToBusinessFunctionRequest,
            action.businessFunctionId,
            action.companySoftwareId,
        )
        yield put(onAttachedCompanySoftwareUpdatedAction(
            response.business_function_by_company?.company_software || []
        ))
        yield put(getBusinessFunctionDetailsAction(action.businessFunctionId, false))
        yield put(getBusinessFunctionsAction())
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* detachCompanySoftwareFromBusinessFunctionSaga(action) {
    try {
        const response = yield call(
            detachCompanySoftwareFromBusinessFunctionRequest,
            action.businessFunctionId,
            action.companySoftwareId,
        )
        yield put(onAttachedCompanySoftwareUpdatedAction(
            response.business_function_by_company?.company_software || []
        ))
        yield put(getBusinessFunctionDetailsAction(action.businessFunctionId, false))
        yield put(getBusinessFunctionsAction())
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* createAndAttachCompanySoftwareToBusinessFunctionSaga(action) {
    try {
        const createdSoftwareResponse = yield call(
            createSoftwareRequest,
            action.name,
            action.description,
            action.artNumber,
            action.registerNumber,
            action.mainClassId,
            action.additionalClassIds,
            action.tagIds,
        )
        yield put(getSoftwareAction())
        const response = yield call(
            attachNewCompanySoftwareToBusinessFunctionRequest,
            action.businessFunctionId,
            createdSoftwareResponse?.software?.id,
        )
        yield put(onAttachedCompanySoftwareUpdatedAction(
            response.business_function_by_company?.company_software || []
        ))
        yield put(getBusinessFunctionDetailsAction(action.businessFunctionId, false))
        yield put(getCompanySoftwareAction())
        yield put(getBusinessFunctionsAction())
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* changeBusinessFunctionOrderSaga(action) {
    try {
        yield call(changeBusinessFunctionOrderRequest, action.businessFunctionId, action.newPosition, action.newParentId)
        yield put(getBusinessFunctionsAction())
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* downloadBusinessFunctionsReportSaga(action) {
    try {
        const fileResponse = yield call(
            downloadBusinessFunctionsReportRequest,
            action.isFullReport,
            action.isConsolidated,
        )

        const fileBlob = yield fileResponse.blob()

        const blobUrl = window.URL.createObjectURL(fileBlob)

        const link = document.createElement('a')
        link.href = blobUrl
        link.style.display = 'none'
        if (action.isFullReport) {
            const authState = yield select(state => state.auth)
            link.download = `БизнесФункции-${action.isConsolidated ? 'Консолидировано-' : ''}${
                authState?.userSelectedChildCompany?.short_name || authState?.userInfo?.company?.short_name
            }.xlsx`.replace(' ', '')
        } else {
            link.download = 'БизнесФункции.zip'
        }
        document.body.appendChild(link)
        link.click()
        link.parentNode!.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
        console.error('ERROR WHILE DOWNLOADING FILE', error)
    } finally {
        yield put(onDownloadBusinessFunctionsReportResponseAction())
    }
}

function* updateBusinessFunctionExamplesSaga(action) {
    try {
        yield call(
            updateBusinessFunctionExamplesRequest,
            action.businessFunctionId,
            action.ftrExample,
            action.priorityExample,
            action.reasonExample,
        )
        const businessFunctionsDetails = yield select(state => state.businessFunctions?.details)
        if (businessFunctionsDetails?.id && action.businessFunctionId === businessFunctionsDetails?.businessFunctionId)
            yield put(onBusinessFunctionDetailsResponseAction({
                ...businessFunctionsDetails,
                examples: {
                    ftr_example: action.ftrExample,
                    priority_example: action.priorityExample,
                    reason_example: action.reasonExample,
                },
            }))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* resetBusinessFunctionValueSaga(action) {
    try {
        const response = yield call(resetBusinessFunctionValueRequest, action.businessFunctionByCompanyId)
        yield put(onBusinessFunctionDetailsResponseAction(response.updated_business_function_by_company))
        yield put(getBusinessFunctionsAction())
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* createAndAddTargetSoftwareToBusinessFunctionSaga(action) {
    try {
        const createdSoftwareResponse = yield call(
            createSoftwareRequest,
            action.name,
            action.description,
            action.artNumber,
            action.registerNumber,
            action.mainClassId,
            action.additionalClassIds,
            action.tagIds,
        )
        yield put(getSoftwareAction())
        const businessFunctionsDetails = yield select(state => state.businessFunctions?.details)
        if (businessFunctionsDetails?.id && createdSoftwareResponse?.software?.id)
            yield put(onBusinessFunctionDetailsResponseAction({
                ...businessFunctionsDetails,
                value: true,
                createdSoftwareId: createdSoftwareResponse.software.id,
            }))
    } catch (error) {
        yield call(processError, action, error)
    }
}

function* businessFunctionsSagas() {
    yield all([
        takeLatest(GET_BUSINESS_FUNCTIONS_REQUEST, getBusinessFunctionsSaga),
        takeEvery(UPDATE_BUSINESS_FUNCTION_REQUEST, updateBusinessFunctionSaga),
        takeEvery(ADD_BUSINESS_FUNCTION_REQUEST, addBusinessFunctionSaga),
        takeEvery(DELETE_BUSINESS_FUNCTION_REQUEST, deleteBusinessFunctionSaga),
        takeEvery(GET_BUSINESS_FUNCTION_DETAILS_REQUEST, getBusinessFunctionDetailsSaga),
        takeEvery(UPDATE_BUSINESS_FUNCTION_DETAILS_REQUEST, updateBusinessFunctionDetailsSaga),
        takeEvery(ATTACH_NEW_COMPANY_SOFTWARE_TO_BUSINESS_FUNCTION_REQUEST, attachNewCompanySoftwareToBusinessFunctionSaga),
        takeEvery(ATTACH_COMPANY_SOFTWARE_TO_BUSINESS_FUNCTION_REQUEST, attachCompanySoftwareToBusinessFunctionSaga),
        takeEvery(DETACH_COMPANY_SOFTWARE_FROM_BUSINESS_FUNCTION_REQUEST, detachCompanySoftwareFromBusinessFunctionSaga),
        takeEvery(CREATE_AND_ATTACH_NEW_COMPANY_SOFTWARE_TO_BUSINESS_FUNCTION_REQUEST, createAndAttachCompanySoftwareToBusinessFunctionSaga),
        takeEvery(CHANGE_BUSINESS_FUNCTION_ORDER, changeBusinessFunctionOrderSaga),
        takeEvery(DOWNLOAD_BUSINESS_FUNCTIONS_REPORT_REQUEST, downloadBusinessFunctionsReportSaga),
        takeEvery(UPDATE_BUSINESS_FUNCTION_EXAMPLES_REQUEST, updateBusinessFunctionExamplesSaga),
        takeEvery(RESET_BUSINESS_FUNCTION_VALUE_REQUEST, resetBusinessFunctionValueSaga),
        takeEvery(CREATE_AND_ADD_TARGET_SOFTWARE_TO_BUSINESS_FUNCTION_REQUEST, createAndAddTargetSoftwareToBusinessFunctionSaga),
    ])
}

export default businessFunctionsSagas