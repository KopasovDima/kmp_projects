import {all, put, takeEvery} from 'redux-saga/effects'
import {DOWNLOAD_FILE,} from '@/store/actionTypes'
import {openNotificationAction} from '@/store/actions'
import {ENV} from '@/consts'

function* downloadFileSaga(action: any) {
    try {
        let url = action.fileUrl.replace('/media/', '/api/download_media/media/')
        if (ENV.IS_PRODUCTION)
            url = url.replace('http://', 'https://')

        const fileResponse = yield fetch(url)

        if (fileResponse.status !== 200) {
            yield put(openNotificationAction('Ошибка', `Файл "${action.fileName}" не найден`, {nType: 'error'}))
            return
        }

        const fileBlob = yield fileResponse.blob()

        const blobUrl = window.URL.createObjectURL(fileBlob)

        const link = document.createElement('a')
        link.href = blobUrl
        link.style.display = 'none'
        link.download = action.fileName
        document.body.appendChild(link)
        link.click()
        link.parentNode!.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
        console.error('ERROR WHILE DOWNLOADING FILE', error)
    }
}

function* commonSagas() {
    yield all([
        takeEvery(DOWNLOAD_FILE, downloadFileSaga),
    ])
}

export default commonSagas
