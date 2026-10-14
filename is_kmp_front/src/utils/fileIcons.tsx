import Icon from '@ant-design/icons'
import DOCX_ICON from '@/assets/icons/files/docx.svg?react'
import GIF_ICON from '@/assets/icons/files/gif.svg?react'
import JPG_ICON from '@/assets/icons/files/jpg.svg?react'
import OTHER_FILE_ICON from '@/assets/icons/files/other_file.svg?react'
import PDF_ICON from '@/assets/icons/files/pdf.svg?react'
import PNG_ICON from '@/assets/icons/files/png.svg?react'
import PPTX_ICON from '@/assets/icons/files/pptx.svg?react'
import PPT_ICON from '@/assets/icons/files/ppt.svg?react'
import RAR_ICON from '@/assets/icons/files/rar.svg?react'
import TAR_ICON from '@/assets/icons/files/tar.svg?react'
import TXT_ICON from '@/assets/icons/files/txt.svg?react'
import XLSX_ICON from '@/assets/icons/files/xlsx.svg?react'
import XLS_ICON from '@/assets/icons/files/xls.svg?react'
import ZIP_ICON from '@/assets/icons/files/zip.svg?react'
import _7Z_ICON from '@/assets/icons/files/7z.svg?react'

// ICONS https://www.flaticon.com/packs/file-formats-icons
// PNG to SVG https://www.vectorizer.io/

const get7zIcon = (className: string = '') => {
    return (
        <Icon
            className={className}
            style={{
                color: '#000000',
                fontSize: 40,
            }}
            component={_7Z_ICON}
        />
    )
}

const getDocxIcon = (className: string = '') => {
    return (
        <Icon
            className={className}
            style={{
                color: '#225bd5',
                fontSize: 40,
            }}
            component={DOCX_ICON}
        />
    )
}

const getGifIcon = (className: string = '') => {
    return (
        <Icon
            className={className}
            style={{
                color: '#0174d1',
                fontSize: 40,
            }}
            component={GIF_ICON}
        />
    )
}

const getJpgIcon = (className: string = '') => {
    return (
        <Icon
            className={className}
            style={{
                color: '#0174d1',
                fontSize: 40,
            }}
            component={JPG_ICON}
        />
    )
}

const getOtherFileIcon = (className: string = '') => {
    return (
        <Icon
            className={className}
            style={{
                color: '#2b2d30',
                fontSize: 40,
            }}
            component={OTHER_FILE_ICON}
        />
    )
}

const getPdfIcon = (className: string = '') => {
    return (
        <Icon
            className={className}
            style={{
                color: '#c30508',
                fontSize: 40,
            }}
            component={PDF_ICON}
        />
    )
}

const getPngIcon = (className: string = '') => {
    return (
        <Icon
            className={className}
            style={{
                color: '#0174d1',
                fontSize: 40,
            }}
            component={PNG_ICON}
        />
    )
}

const getPptIcon = (className: string = '') => {
    return (
        <Icon
            className={className}
            style={{
                color: '#f66045',
                fontSize: 40,
            }}
            component={PPT_ICON}
        />
    )
}

const getPptxIcon = (className: string = '') => {
    return (
        <Icon
            className={className}
            style={{
                color: '#f66045',
                fontSize: 40,
            }}
            component={PPTX_ICON}
        />
    )
}

const getRarIcon = (className: string = '') => {
    return (
        <Icon
            className={className}
            style={{
                color: '#000000',
                fontSize: 40,
            }}
            component={RAR_ICON}
        />
    )
}

const getTarIcon = (className: string = '') => {
    return (
        <Icon
            className={className}
            style={{
                color: '#000000',
                fontSize: 40,
            }}
            component={TAR_ICON}
        />
    )
}

const getXlsIcon = (className: string = '') => {
    return (
        <Icon
            className={className}
            style={{
                color: '#2e7d53',
                fontSize: 40,
            }}
            component={XLS_ICON}
        />
    )
}

const getXlsxIcon = (className: string = '') => {
    return (
        <Icon
            className={className}
            style={{
                color: '#2e7d53',
                fontSize: 40,
            }}
            component={XLSX_ICON}
        />
    )
}

const getZipIcon = (className: string = '') => {
    return (
        <Icon
            className={className}
            style={{
                color: '#000000',
                fontSize: 40,
            }}
            component={ZIP_ICON}
        />
    )
}

const getTxtIcon = (className: string = '') => {
    return (
        <Icon
            className={className}
            style={{
                color: '#5e5e5e',
                fontSize: 40,
            }}
            component={TXT_ICON}
        />
    )
}

export const getFileIcon = (mimeType: string, className: string = '') => {
    switch (mimeType) {
        case 'zip':
            return getZipIcon(className)
        case 'application/pdf':
            return getPdfIcon(className)
        case 'image/png':
            return getPngIcon(className)
        case 'image/gif':
            return getGifIcon(className)
        case 'image/jpeg':
        case 'image/jpg':
            return getJpgIcon(className)
        case 'application/vnd.ms-excel':
        case 'application/excel':
        case 'application/x-excel':
        case 'application/x-msexcel':
        case 'application/msexcel':
            return getXlsIcon(className)
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            return getXlsxIcon(className)
        case 'application/x-7z-compressed':
            return get7zIcon(className)
        case 'application/x-rar-compressed':
        case 'application/vnd.rar':
        case 'application/x-rar':
            return getRarIcon(className)
        case 'application/x-tar':
        case 'application/x-gtar':
            return getTarIcon(className)
        case 'application/zip':
        case 'application/x-zip':
        case 'application/x-zip-compressed':
            return getZipIcon(className)
        case 'application/vnd.ms-powerpoint':
        case 'application/powerpoint':
        case 'application/x-mspowerpoint':
        case 'application/mspowerpoint':
            return getPptIcon(className)
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            return getPptxIcon(className)
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return getDocxIcon(className)
        case 'text/plain':
            return getTxtIcon(className)
        default:
            return getOtherFileIcon(className)
    }
}
