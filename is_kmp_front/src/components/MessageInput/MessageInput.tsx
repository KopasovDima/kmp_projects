import {FC, useCallback, useEffect, useState} from 'react'
import {Button, Flex, Input, Popover} from 'antd'
import './MessageInput.css'
import {KeyboardKeyTracker, MessageAttachmentUpload, Tooltip} from '@/components'
import {CloseOutlined, SendOutlined, SmileOutlined} from '@ant-design/icons'
import EmojiPicker, {Categories, EmojiStyle} from 'emoji-picker-react'
import {getFileIcon} from '@/utils'

interface IMessageInputProps {
    onTextInput: (text: string) => void
    textInput: string
    selectedFiles?: any[]
    onSelectFiles?: (files: any[]) => void
    onDeselectFiles?: (filePosition: number) => void
    onSendPress: () => void
    parentMessage?: any
    getParentMessageTitle?: () => string
    onPressParentMessage?: () => void
    onRemoveParentMessage?: () => void
    textInputPlaceholder: string
}

export const MessageInput: FC<IMessageInputProps> = (
    {
        onTextInput,
        textInput,
        selectedFiles = [],
        onSelectFiles,
        onDeselectFiles,
        onSendPress,
        parentMessage,
        getParentMessageTitle,
        onPressParentMessage,
        onRemoveParentMessage,
        textInputPlaceholder,
    }
) => {
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState<boolean>(false)
    const [parentMessageTitle, setParentMessageTitle] = useState<string>('Ответ на сообщение')

    useEffect(() => {
        if (getParentMessageTitle) setParentMessageTitle(getParentMessageTitle())
    }, [getParentMessageTitle])

    const onEmojiInput = useCallback((emojiInput) => {
        onTextInput(textInput + emojiInput.emoji)
    }, [textInput, onTextInput])

    return (
        <Flex vertical className={'messageInputContainer'}>
            {parentMessage ? (
                <Flex vertical={false} className={'messageInputParentMessageContainer'}>
                    <div
                        className={'messageInputParentMessageInnerContainer'}
                        onClick={onPressParentMessage}
                    >
                        <p className={'messageInputParentMessageTitle'}>{parentMessageTitle}</p>
                        <div className={'messageInputParentMessage'}>
                            <span>{parentMessage?.text}</span>
                            <span>
                                {!parentMessage?.text && parentMessage?.attachments?.length ?
                                    'Прикреплено файлов: ' + parentMessage?.attachments?.length :
                                    ''
                                }
                            </span>
                        </div>
                    </div>
                    <Button type={'text'} onClick={onRemoveParentMessage}>
                        <CloseOutlined className={'iconMedium'}/>
                    </Button>
                </Flex>
            ) : null}
            {selectedFiles?.length && onSelectFiles && onDeselectFiles ? (
                <Flex vertical={false} className={'messageInputFilesContainer'}>
                    {selectedFiles?.map((file, index) => (
                        <div key={index}>
                            <Tooltip
                                value={(
                                    <div className={'messageInputFile'}>
                                        {file.file.type.indexOf('image') !== -1 ? (
                                            <img
                                                className={'messageInputFileImage'}
                                                src={file.preview}
                                            />
                                        ) : (
                                            getFileIcon(file.file.type, 'messageInputFileImage')
                                        )}
                                        <button
                                            className={'messageInputFileRemoveButton'}
                                            onClick={() => onDeselectFiles(index)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                                title={file.file.name}
                            />
                        </div>
                    ))}
                </Flex>
            ) : null}
            <div className={'messageInputTextAreaContainer'}>
                <KeyboardKeyTracker keys={['Enter']} onPress={onSendPress} ctrlKeyPressRequired/>
                <Input.TextArea
                    style={{
                        paddingRight: onSelectFiles ? 38 : 0,
                    }}
                    className={'messageInputTextArea'}
                    placeholder={textInputPlaceholder}
                    onChange={(e) => onTextInput(e.target.value)}
                    value={textInput}
                    autoSize={{
                        minRows: 2,
                        maxRows: 4,
                    }}
                />
                <Popover
                    arrow={false}
                    content={(
                        <EmojiPicker
                            emojiStyle={EmojiStyle.NATIVE}
                            onEmojiClick={onEmojiInput}
                            searchDisabled={true}
                            skinTonesDisabled={true}
                            previewConfig={{showPreview: false}}
                            categories={[
                                {name: 'Смайлы и люди', category: Categories.SMILEYS_PEOPLE},
                                {name: 'Животные и природа', category: Categories.ANIMALS_NATURE},
                                {name: 'Еда и напитки', category: Categories.FOOD_DRINK},
                                {name: 'Занятия', category: Categories.ACTIVITIES},
                                {name: 'Места и путешествия', category: Categories.TRAVEL_PLACES},
                                {name: 'Предметы', category: Categories.OBJECTS},
                                {name: 'Символы', category: Categories.SYMBOLS},
                                {name: 'Флаги', category: Categories.FLAGS}
                            ]}
                        />
                    )}
                    onOpenChange={(isOpen) => setIsEmojiPickerOpen(isOpen)}
                >
                    <div className={'messageInputEmojiButtonContainer'}>
                        <SmileOutlined
                            className={isEmojiPickerOpen ? 'iconEmojiActive' : 'iconEmoji'}
                        />
                    </div>
                </Popover>
                {onSelectFiles ? (
                    <div className={'messageInputAttachmentUploadContainer'}>
                        <MessageAttachmentUpload
                            onSelectFiles={onSelectFiles}
                        />
                    </div>
                ) : null}
                <Button
                    tabIndex={-1}
                    disabled={!textInput && !selectedFiles?.length}
                    className={'messageInputSendButton'}
                    style={{
                        opacity: textInput || selectedFiles?.length ? 1 : 0.2,
                    }}
                    type={'text'}
                    onClick={onSendPress}
                >
                    <SendOutlined className={'iconSendButton'}/>
                </Button>
            </div>
        </Flex>
    )
}
