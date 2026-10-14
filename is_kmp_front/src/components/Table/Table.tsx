import './Table.css'
import {Empty, Table as ANTDTable} from 'antd'
import {FC, useEffect, useRef} from 'react'
import {TableCell, Tooltip} from '@/components'
import type {AlignType} from 'rc-table/lib/interface'
import dayjs from 'dayjs'
import {MinusCircleFilled} from '@ant-design/icons'

export interface ITableColumnProps {
    title: string,
    dataIndex: string,
    type?: string,
    handleSave?: (row: any, dataIndex: string, newValue: any, newValueId?: any) => void,
    editable?: boolean,
    width?: number | string,
    minWidth?: number | string,
    placeholder?: string,
    options?: {
        label: string
        value: string
        id?: number
    }[],
    isOptional?: boolean,
    enableSorting?: boolean,
}

const columnsProps = (
    {
        title,
        dataIndex,
        type = 'text',
        editable = true,
        width = 150,
        minWidth = width,
        handleSave,
        placeholder = '',
        options,
        isOptional = false,
        enableSorting = false,
    }: ITableColumnProps
) => ({
    title,
    dataIndex,
    key: dataIndex,
    align: 'center' as AlignType,
    sorter: enableSorting ? {
        compare: (row1: any, row2: any) => {
            if (row1[dataIndex] === null) return -1
            if (row2[dataIndex] === null) return 1

            if (row1.id === 'new' || row2.id === 'new') return 0

            switch (type) {
                case 'date':
                    return dayjs(row1[dataIndex]).diff(dayjs(row2[dataIndex]))
                case 'number':
                case 'float':
                    return row1[dataIndex] - row2[dataIndex]
                default:
                    return row1[dataIndex]?.localeCompare(row2[dataIndex])
            }
        },
        multiple: 1,
    } : null,
    ...(width ? {
        width,
        maxWidth: width,
    } : {}),
    minWidth,
    onCell: (row: any) => ({
        row,
        dataIndex,
        handleSave,
        editable,
        type,
        placeholder,
        options,
        isOptional,
    }),
})

export const Table: FC<
    {
        data: any[]
        newRow: any
        columns: ITableColumnProps[]
        canEdit: boolean
        onDeleteNewRow: () => void
        onDeleteRow: (row) => void
    }
> = (
    {
        data,
        newRow,
        columns,
        canEdit,
        onDeleteNewRow,
        onDeleteRow,
    }
) => {
    const tableRef = useRef(null)

    useEffect(() => {
        const element = document.querySelector('[data-row-key="new"]')

        if (newRow && element && tableRef?.current) {
            setTimeout(() => {
                element.scrollIntoView({
                    behavior: 'instant',
                    block: 'end',
                })
            }, 100)
        }
    }, [newRow])

    return (
        <div className={'tableContainer'}>
            <ANTDTable
                ref={tableRef}
                rowKey={'id'}
                showSorterTooltip={false}
                components={{
                    body: {
                        cell: TableCell,
                    },
                }}
                pagination={false}
                size={'small'}
                scroll={{
                    y: `calc(100vh - 235px)`,
                    x: 'max-content',
                }}
                // @ts-expect-error ///
                columns={data?.length || newRow ? (
                    [
                        ...columns.map(column => (columnsProps(column))),
                        ...(canEdit ? [{
                            title: '',
                            fixed: 'right',
                            width: 20,
                            onCell: (row: any) => ({row}),
                            render: (row) => (
                                <Tooltip
                                    title={'Удалить'}
                                    placement={'left'}
                                    value={(
                                        <MinusCircleFilled
                                            className={'tableDeleteRowIcon'}
                                            onClick={() => {
                                                if (row.id === 'new') onDeleteNewRow()
                                                else onDeleteRow(row)
                                            }}
                                        />
                                    )}
                                />
                            )
                        }] : []),
                    ]
                ) : [{
                    title: '',
                    key: 'empty',
                    render: () => (
                        <Empty description={'Нет данных'}/>
                    )
                }]}
                dataSource={
                    newRow ? [...data, newRow] : data
                }
                bordered
            />
        </div>
    )
}
