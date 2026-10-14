import {FC} from 'react'
import './TableCell.css'
import {useEffect, useState} from 'react'
import {DatePicker, Input, Select} from 'antd'
import {convertToDateString} from '@/utils'
import dayjs from 'dayjs'

const {TextArea} = Input

export interface ITableCellProps {
    row: any,
    dataIndex: string,
    editable: boolean,
    type: string,
    children: any,
    handleSave: (row: any, dataIndex: string, newValue: any, newValueId?: any) => void,
    placeholder: string,
    options?: {
        label: string
        value: string
        id: number
    }[],
    isOptional: boolean
}

export const TableCell: FC<ITableCellProps> = (
    {
        row,
        dataIndex,
        editable = true,
        type,
        children,
        handleSave,
        placeholder,
        options,
        isOptional,
    }
) => {
    const [displayValue, setDisplayValue] = useState<string>(row?.[dataIndex])
    const [errorMessage, setErrorMessage] = useState<string>('')

    useEffect(() => {
        setDisplayValue(row?.[dataIndex])
    }, [row])

    useEffect(() => {
        if (!editable && errorMessage) {
            setDisplayValue(row?.[dataIndex])
            setErrorMessage('')
        }
    }, [editable]);

    const save = (newValue: any = displayValue) => {
        if (errorMessage) return
        if (type === 'number' || type === 'float') {
            let parsedNumber: number | string | undefined = parseNumber(displayValue, type === 'float')
            if (!parsedNumber && parsedNumber !== 0) newValue = 0
            else newValue = parsedNumber
            if (isOptional && !newValue) newValue = null
            setDisplayValue(newValue?.toString()?.replace('.00', ''))
        } else if (type === 'date') {
            setDisplayValue(newValue)
        }
        handleSave(row, dataIndex, newValue)
    }

    const parseNumber = (value: string, isFloat: boolean) => {
        setErrorMessage('')

        if (value == '') {
            setDisplayValue('0')
            return 0
        }

        value = value?.toString()?.replace(',', '.')

        if (value?.toString()?.endsWith('.'))
            value = value.toString().replace('.', '')

        if (isFloat && /^-?\d+(\.\d+)?$/.test(value))
            return Number.parseFloat(value).toFixed(2)
        if (/^-?\d+?$/.test(value))
            return Number.parseInt(value)
        setErrorMessage('Некорректное число')
    }

    const backgroundColor = row?.id === 'new' ? '#e5ffcf' : '#ffffff'

    if (!type) {
        return (
            <td
                className={'tableCellDeleteRow'}
                style={{
                    backgroundColor,
                }}
            >
                {children}
            </td>
        )
    }

    if (!editable) {
        return (
            <td className={'tableCellViewTextContainer'}>
                <pre className={'tableCellViewText'}>
                    {type === 'date' && displayValue ? convertToDateString(displayValue) : displayValue}
                </pre>
            </td>
        )
    }

    if (type === 'date')
        return (
            <td
                style={{
                    backgroundColor,
                }}
            >
                <DatePicker
                    onChange={(newValue) => save(newValue?.toISOString())}
                    value={displayValue ? dayjs(displayValue) : null}
                    size={'small'}
                    format={'DD.MM.YYYY'}
                    allowClear={isOptional}
                />
            </td>
        )

    if (type === 'text' || type === 'number' || type === 'float')
        return (
            <td
                className={'tableCell'}
                style={{
                    backgroundColor,
                }}
            >
                <Input
                    value={displayValue}
                    maxLength={30}
                    onChange={({target}) => {
                        if (type === 'number' || type === 'float') {
                            parseNumber(target.value, type === 'float')
                        } else {
                            if (!target.value.trim() && !isOptional) setErrorMessage('Поле не заполнено')
                            else setErrorMessage('')
                        }
                        setDisplayValue(target.value)
                    }}
                    onPressEnter={() => save()}
                    onBlur={() => save()}
                    placeholder={placeholder}
                />

                {errorMessage || (row?.id === 'new' && !isOptional) ? (
                    <span
                        className={'tableCellHint'}
                        style={errorMessage ? {
                            color: '#ff0000',
                        } : {}}
                    >
                        {errorMessage || 'Заполните для сохранения'}
                    </span>
                ) : null}
            </td>
        )

    if (type === 'dropdown') {
        return (
            <td
                className={'tableCell'}
                style={{
                    backgroundColor,
                }}
            >
                {editable ? (
                    <>
                        <Select
                            className={'tableCellSelect'}
                            value={row[dataIndex]}
                            options={options}
                            size={'small'}
                            onSelect={(value, item) => {
                                row[dataIndex] !== value ?
                                    handleSave(row, dataIndex, value, item.id)
                                    : null
                            }}
                            placeholder={placeholder}
                        />
                        {row?.id === 'new' && !isOptional ? (
                            <span className={'tableCellHint'}>
                                Выберите опцию для сохранения
                            </span>
                        ) : null}
                    </>
                ) : (
                    <p>{row[dataIndex]}</p>
                )}
            </td>
        )
    }

    return (
        <td
            className={'tableCell'}
            style={{
                backgroundColor,
            }}
        >
            <TextArea
                placeholder={placeholder}
                autoSize={{minRows: 2, maxRows: 10}}
                value={displayValue}
                onChange={({target}) => {
                    if (!target.value?.trim() && !isOptional) setErrorMessage('Поле не заполнено')
                    else setErrorMessage('')
                    setDisplayValue(target.value)
                }}
                onBlur={() => save()}
            />
            {errorMessage || (row?.id === 'new' && !isOptional) ? (
                <span
                    className={'tableCellHint'}
                    style={errorMessage ? {
                        color: '#ff0000',
                    } : {}}
                >
                        {errorMessage || 'Заполните для сохранения'}
                    </span>
            ) : null}
        </td>
    )
}
