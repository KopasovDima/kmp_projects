import {useCallback, useRef} from 'react'
import attachFileIcon from '@/assets/attach_file_icon.png'
import './MessageAttachmentUpload.css'

export const MessageAttachmentUpload = (
    {
        onSelectFiles,
    }
) => {
    const fileInputRef = useRef<any>(null)

    const handleFileChange = useCallback((e) => {
        const files = Array.from(e.target.files)
        if (files.length === 0) return

        onSelectFiles(files.map((file: any) => ({
            file,
            preview: URL.createObjectURL(file)
        })))
    }, [onSelectFiles])

    const triggerFileInput = () => {
        fileInputRef!.current!.click()
    }

    return (
        <div>
            <input
                className={'messageAttachmentUploadFileInput'}
                type={'file'}
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept={'*'}
            />
            <div
                className={'messageAttachmentUploadImageContainer'}
                onClick={triggerFileInput}
            >
                <img src={attachFileIcon} className={'messageAttachmentUploadImage'}/>
            </div>
        </div>
    )
}
