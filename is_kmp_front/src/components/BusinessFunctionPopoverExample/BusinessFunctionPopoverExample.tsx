import {FC, useState} from 'react'
import './BusinessFunctionPopoverExample.css'
import {Button, Flex, Input, Popover, Select} from 'antd'

const {TextArea} = Input

interface BusinessFunctionPopoverExampleProps {
    contentText?: string
    onInsertValue: ((newValue: string) => void) | null
    onConfirmEditValue: ((newValue: string) => void) | null
    options?: any[]
    minWidth?: number
    maxWidth?: number
}

export const BusinessFunctionPopoverExample: FC<BusinessFunctionPopoverExampleProps> = (
    {
        contentText = '',
        onInsertValue = null,
        onConfirmEditValue = null,
        options = undefined,
        minWidth = 300,
        maxWidth = 600,
    }
) => {
    const [editEnabled, setEditEnabled] = useState<boolean>(false)
    const [editingValue, setEditingValue] = useState<string>('')

    if (!contentText && !onConfirmEditValue) return null

    return (
        <Popover
            arrow={true}
            content={(
                <div
                    className={'bfPopoverContainer'}
                    style={{
                        minWidth: maxWidth < minWidth ? maxWidth : minWidth,
                        maxWidth,
                    }}
                >
                    {editEnabled && onInsertValue ? options ? (
                        <Select
                            className={'bfPopoverSelect'}
                            value={editingValue || ''}
                            options={options}
                            onSelect={(newValue) => setEditingValue(newValue)}
                        />
                    ) : (
                        <TextArea
                            rootClassName={'bfPopoverTextArea'}
                            className={'bfPopoverTextArea'}
                            placeholder={'Введите образец заполнения'}
                            autoSize={{minRows: 3, maxRows: 30}}
                            value={editingValue}
                            onChange={({target}) => setEditingValue(target.value)}
                        />
                    ) : (
                        <div className={'bfPopoverDisplayValue'}>
                            <pre>
                                {contentText || 'Пока не заполнено'}
                            </pre>
                        </div>
                    )}
                    <Flex
                        vertical={false}
                        justify={'center'}
                    >
                        {editEnabled ? (
                            <Button
                                type={'link'}
                                onClick={() => {
                                    if (onConfirmEditValue) {
                                        onConfirmEditValue(editingValue)
                                        setEditEnabled(false)
                                        setEditingValue('')
                                    }
                                }}
                            >
                                Сохранить изменения
                            </Button>
                        ) : (
                            <>
                                {onInsertValue && contentText ? (
                                    <Button
                                        type={'link'}
                                        onClick={() => onInsertValue(contentText)}
                                    >
                                        Вставить
                                    </Button>
                                ) : null}
                                {onConfirmEditValue ? (
                                    <Button
                                        type={'link'}
                                        onClick={() => {
                                            setEditingValue(contentText)
                                            setEditEnabled(true)
                                        }}
                                    >
                                        Редактировать
                                    </Button>
                                ) : null}
                            </>
                        )}
                    </Flex>
                </div>
            )}
            title={<div className={'bfPopoverTitle'}>Образец заполнения</div>}
            trigger={'click'}
            onOpenChange={(open) => {
                if (!open) {
                    setEditEnabled(false)
                    setEditingValue('')
                }
            }}
        >
            {' ('}
            <b className={'bfPopoverText'}>образец</b>
            {')'}
        </Popover>
    )
}
