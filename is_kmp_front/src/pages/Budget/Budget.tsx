import {FC, ReactNode, useCallback, useEffect, useRef, useState} from 'react'
import './Budget.css'
import type {InputRef} from 'antd'
import {Button, Empty, Input, Select, Spin, Table} from 'antd'
import type {AlignType} from 'rc-table/lib/interface'
import {MinusCircleFilled} from '@ant-design/icons'
import {useParams} from 'react-router'
import {useDispatch, useSelector} from 'react-redux'
import {getAuthSelector, getBudgetsSelector} from '@/store/selectors'
import {
    addNewEmptyRowAction,
    createBudgetItemAction,
    getBudgetAction,
    getBudgetItemsAction,
    onBudgetResponseAction,
    openConfirmationDialogAction,
    removeBudgetAction,
    saveBudgetAction
} from '@/store/actions'
import {Tooltip} from '@/components'
import {checkEconomistOrAdmin} from '@/utils'

const EditableCell: FC<{
    children: ReactNode | ReactNode[]
    dataIndex: string
    row: any
    editable: boolean
    handleSave: (row: any, dataIndex: string, newValue: any, saveToDB: boolean) => void
    disabled: boolean
}> = (
    {
        children,
        dataIndex,
        row,
        editable,
        handleSave,
        disabled,
        ...restProps
    }
) => {
    const [editing, setEditing] = useState(false)
    const [newValue, setNewValue] = useState<string>('')
    const [errorMessage, setErrorMessage] = useState<string>('')
    const inputRef = useRef<InputRef>(null)

    useEffect(() => {
        if (editing) {
            inputRef.current?.focus()
        }
    }, [editing])

    const toggleEdit = () => {
        setEditing(!editing)
        setNewValue(row[dataIndex])
    }

    const save = async () => {
        try {
            let parsedNumber: number | string | undefined = parseNumber(newValue)
            if (!parsedNumber && parsedNumber !== 0) parsedNumber = 0
            toggleEdit()
            if (row[dataIndex] !== parsedNumber) handleSave(row, dataIndex, parsedNumber, row.budget_report_id !== 'new')
        } catch (errInfo) {
            console.log('Save failed:', errInfo)
        }
    }

    const parseNumber = (value: string) => {
        setErrorMessage('')

        if (value == '') return 0

        if (/^-?\d+(\.\d+)?$/.test(value))
            return Number.parseFloat(value)
        if (/^-?\d+?$/.test(value))
            return Number.parseInt(value)
        setErrorMessage('Нужно ввести число')
    }

    const onInputChanged = (value: string) => {
        setNewValue(value)
        parseNumber(value)
    }

    return (
        <td
            onDoubleClick={row.budget_report_id !== 'new' && editable && !editing ? toggleEdit : () => 0}
            {...restProps}
            style={{
                textAlign: 'center',
                ...(row.budget_report_id === 'new' ? {
                    cursor: 'not-allowed',
                } : editable && !editing ? {
                    cursor: 'pointer',
                } : {}),
                ...(row?.budget_report_id === 'new' ? {
                    backgroundColor: '#bed5ac',
                } : disabled ? {
                    backgroundColor: '#dadada',
                } : {}),
            }}
        >
            {editable && !disabled ?
                editing ? (
                    <>
                        <Input
                            style={{
                                fontSize: 12,
                                ...(errorMessage ? {
                                    borderColor: '#ff0000',
                                    borderWidth: 2,
                                } : {})
                            }}
                            ref={inputRef}
                            onPressEnter={save}
                            onBlur={save}
                            onChange={(e) => onInputChanged(e.target.value)}
                            value={newValue}
                            maxLength={15}
                        />
                        {errorMessage ? <span style={{color: '#ff0000', fontSize: 10}}>{errorMessage}</span> : null}
                    </>
                ) : (
                    <div className={'editable-cell-value-wrap'}>
                        {children}
                    </div>
                )
                : children}
        </td>
    )
}

const DropdownCell: FC<{
    children: ReactNode | ReactNode[]
    dataIndex: string
    row: any
    variants: {
        label: string
        key: string
    }[]
    onItemSelected: (row: any, dataIndex: string, newValue: string) => void
    createNewItem: (name: string) => void
    placeholder?: string
    editable?: boolean
}> = (
    {
        dataIndex,
        row,
        variants,
        onItemSelected,
        createNewItem,
        placeholder = '',
        editable = false,
        ...restProps
    }
) => {
    const disabled = !variants?.length

    const [searchValue, setSearchValue] = useState<string>('')
    const [createStarted, setCreateStarted] = useState<boolean>(false)

    return (
        <td
            {...restProps}
            style={{
                position: 'sticky',
                left: dataIndex === 'section' ? 0 : dataIndex === 'item_name' ? 500 : 250,
                zIndex: 1,
                maxWidth: 200,
                textAlign: 'center',
                cursor: !editable ? 'inherit' : !disabled ? 'pointer' : 'not-allowed',
                ...((row?.budget_report_id === 'new' || !row[dataIndex]) ? {
                    backgroundColor: disabled ? '#bed5ac' : '#e5ffcf',
                } : {}),
            }}
        >
            {editable ? (
                <Select
                    showSearch
                    value={row[dataIndex]}
                    options={variants.map((v) => ({
                        ...v,
                        ...(v.label === row[dataIndex] ? {disabled: false} : {})
                    }))}
                    style={{
                        width: '100%',
                    }}
                    optionFilterProp={'label'}
                    classNames={{
                        popup: {
                            root: 'selectPopup',
                        },
                    }}
                    popupMatchSelectWidth={false}
                    onSearch={(newValue) => setSearchValue(newValue)}
                    onSelect={(value) => (
                        row[dataIndex] !== value as string ?
                            onItemSelected(row, dataIndex, value as string)
                            : null
                    )}
                    placeholder={placeholder}
                    notFoundContent={createNewItem ? (
                        <Button
                            type={'primary'}
                            onClick={() => {
                                setCreateStarted(true)
                                createNewItem(searchValue)
                            }}
                            loading={createStarted}
                        >
                            Добавить
                        </Button>
                    ) : <Empty description={'Ничего не найдено'}/>}
                    disabled={createStarted || disabled}
                />
            ) : (
                <p>{row[dataIndex]}</p>
            )}
        </td>
    )
}

const commonColumnsProps = (
    title: string,
    dataIndex: string,
) => ({
    title,
    dataIndex,
    key: dataIndex,
    align: 'center' as AlignType,
})

const columnLargeProps = (
    title: string,
    dataIndex: string,
    fixed: boolean | undefined = undefined,
    width: number = 250,
) => ({
    ...commonColumnsProps(title, dataIndex),
    ...(width ? {
        width,
        maxWidth: width,
    } : {}),
    minWidth: 250,
    ...(fixed ? {fixed} : {}),
    sorter: {
        compare: (row1: any, row2: any) => row1.budget_report_id === 'new' || row2.budget_report_id === 'new' ? 0 : row1[dataIndex]?.localeCompare(row2[dataIndex]),
        multiple: 1,
    },
})

const columnSmallProps = (
    {
        title,
        dataIndex,
        editable = false,
        handleSave = undefined,
        disabled = false,
        width = 150,
    }: {
        title: string,
        dataIndex: string,
        editable?: boolean,
        handleSave?: (row: any, dataIndex: string, newValue: any) => void,
        disabled?: boolean,
        width?: number,
    }
) => {
    return {
        ...commonColumnsProps(title, dataIndex),
        ...(width ? {
            width,
            maxWidth: width,
        } : {}),
        minWidth: 50,
        ...(editable ? {
            onCell: (row: any) => ({
                row,
                dataIndex,
                title: undefined,
                handleSave,
                editable: true,
                disabled,
                type: 'text',
            }),
        } : {
            onCell: (row: any) => ({
                row,
                disabled,
                title: undefined,
                type: 'text',
            }),
        }),
        render: (value: number) => (
            value?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
        ),
        sorter: {
            compare: (row1: any, row2: any) => row1.budget_report_id === 'new' || row2.budget_report_id === 'new' ? 0 : row1[dataIndex] - row2[dataIndex],
            multiple: 1,
        },
    }
}

const BUDGET_YEARS = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030]

export const Budget: FC = () => {
    const params = useParams()

    const {budget, budgetItems, isLoading} = useSelector(getBudgetsSelector)
    const {userInfo, userSelectedChildCompany} = useSelector(getAuthSelector)
    const dispatch = useDispatch()

    const canEdit = checkEconomistOrAdmin(userInfo?.roles)

    const [selectedYear, setSelectedYear] = useState<number>(Number.parseInt(params.year || '') || (new Date()).getFullYear())

    const [sectionFilters, setSectionFilters] = useState<string[]>([])
    const [categoryFilters, setCategoryFilters] = useState<string[]>([])
    const [itemFilters, setItemFilters] = useState<string[]>([])
    const [activeFilters, setActiveFilters] = useState<any>({})

    const updateSectionFilters = useCallback((data: any[]) => {
        setSectionFilters(
            Object.keys(
                data.reduce(
                    (result, row) => {
                        if (!(row.section in result)) result[row.section] = ''
                        return result
                    },
                    {}
                )
            )
        )
    }, [])

    const updateCategoryFilters = useCallback((data: any[]) => {
        setCategoryFilters(
            Object.keys(
                data.reduce(
                    (result, row) => {
                        const categoryName = `${row.category_number} - ${row.category_name}`
                        if (!(categoryName in result)) result[categoryName] = ''
                        return result
                    },
                    {}
                )
            )
        )
    }, [])

    const updateItemFilters = useCallback((data: any[]) => {
        setItemFilters(
            Object.keys(
                data.reduce(
                    (result, row) => {
                        if (!(row.item_name in result)) result[row.item_name] = ''
                        return result
                    },
                    {}
                )
            )
        )
    }, [])

    const getBudget = useCallback(() => {
        setActiveFilters({})

        dispatch(getBudgetAction(selectedYear))
    }, [selectedYear])

    useEffect(() => {
        if (!budget?.length) return

        updateSectionFilters(budget)
        updateCategoryFilters(budget)
        updateItemFilters(budget)
    }, [budget])

    useEffect(() => {
        window.document.title = 'Бюджет'
    }, [])

    useEffect(() => {
        if (canEdit) dispatch(getBudgetItemsAction())
    }, [userInfo])

    useEffect(() => {
        getBudget()
    }, [userSelectedChildCompany, selectedYear])

    const handleSave = useCallback((row: any, dataIndex: string, newValue: any, saveToDB: boolean = true) => {
        const newBudget = [...budget]
        const index = newBudget.findIndex((item) => row.budget_report_id === item.budget_report_id)
        const item = newBudget[index]

        if (saveToDB) {
            if (row.budget_report_id === 'new') {
                dispatch(saveBudgetAction(
                    selectedYear,
                    {
                        itemName: newValue,
                        factOrPlan: 'plan',
                    },
                    row.budget_report_id,
                    'NEW_REPORT',
                ))
            } else if (dataIndex === `budget_${selectedYear - 1}_fact`) {
                dispatch(saveBudgetAction(
                    selectedYear - 1,
                    {
                        itemName: row.item_name,
                        factOrPlan: 'fact',
                        ['4q']: newValue,
                    },
                    row.budget_report_id,
                    'UPDATE_REPORT_VALUE',
                ))
            } else if (dataIndex === 'item_name') {
                dispatch(saveBudgetAction(
                    selectedYear,
                    {
                        budgetReportId: row.budget_report_id,
                        itemName: newValue,
                        ['1q']: row[`budget_${selectedYear}_1q`],
                        ['2q']: row[`budget_${selectedYear}_2q`],
                        ['3q']: row[`budget_${selectedYear}_3q`],
                        ['4q']: row[`budget_${selectedYear}_4q`],
                    },
                    row.budget_report_id,
                    'CHANGE_ITEM',
                ))
            } else {
                dispatch(saveBudgetAction(
                    selectedYear,
                    {
                        budgetReportId: row['budget_report_id'],
                        ['1q']: dataIndex.endsWith('1q') ? newValue : row[`budget_${selectedYear}_1q`],
                        ['2q']: dataIndex.endsWith('2q') ? newValue : row[`budget_${selectedYear}_2q`],
                        ['3q']: dataIndex.endsWith('3q') ? newValue : row[`budget_${selectedYear}_3q`],
                        ['4q']: dataIndex.endsWith('4q') ? newValue : row[`budget_${selectedYear}_4q`],
                    },
                    row.budget_report_id,
                    'UPDATE_REPORT_VALUE',
                ))
            }
        }

        newBudget.splice(index, 1, {
            ...item,
            ...({
                ...row,
                [dataIndex]: newValue,
            }),
        })

        dispatch(onBudgetResponseAction(newBudget, selectedYear))
    }, [budget, selectedYear])

    const createNewItem = useCallback((row: any, itemName: string) => {
        dispatch(createBudgetItemAction(
            itemName,
            row['category_name'],
            () => handleSave(row, 'item_name', itemName),
        ))
    }, [handleSave])

    const updateDataCategory = useCallback((row: any, dataIndex: string, newValue: string) => {
        const newRow = {...row}
        if (dataIndex === 'category_name' || dataIndex === 'category_number') {
            if (dataIndex === 'category_name') {
                newRow['category_number'] = (
                    Object.values(budgetItems[row.section].section_categories).find((section_category: any) => section_category.name === newValue) as any
                )?.number || ''
            }
            if (dataIndex === 'category_number') {
                newRow['category_name'] = (
                    Object.values(budgetItems[row.section].section_categories).find((section_category: any) => section_category.number === newValue) as any
                )?.name || ''
            }
            newRow['item_name'] = undefined
        } else if (dataIndex === 'section') {
            newRow['category_number'] = undefined
            newRow['category_name'] = undefined
            newRow['item_name'] = undefined
        }
        handleSave(newRow, dataIndex, newValue, dataIndex === 'item_name')
    }, [handleSave])

    if (isLoading) return (
        <div
            style={{
                height: '100%',
                width: '100%',
                placeItems: 'center',
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            <Spin/>
        </div>
    )

    return (
        <div className={'budgetPage'}>
            <div>
                Бюджет за

                <Select
                    style={{
                        marginLeft: 10,
                        marginRight: 10,
                    }}
                    value={selectedYear}
                    options={BUDGET_YEARS.map((v) => ({
                        label: v,
                        value: v,
                    }))}
                    onSelect={(newYear) => setSelectedYear(newYear)}
                />

                год
            </div>

            <div
                style={{
                    marginTop: 10,
                    // height: '100%',
                    // width: '100%',
                    height: `calc(100vh - 500px)`,
                    width: `calc(100vw - 100px)`
                }}
            >
                <Table
                    rowKey={'budget_report_id'}
                    showSorterTooltip={false}
                    components={{
                        body: {
                            cell: (props) => {
                                if (!budget?.length)
                                    return (
                                        <td style={{width: '80vw'}}>
                                            <Empty description={'Нет данных'}/>
                                        </td>
                                    )

                                if (!props.type) {
                                    return (
                                        <td
                                            style={{
                                                position: 'sticky',
                                                right: 0,
                                                zIndex: 1,
                                                backgroundColor: '#ffffff',
                                                maxWidth: props.width,
                                                textAlign: 'center',
                                                ...(props.row === 'new' ? {
                                                    backgroundColor: '#e5ffcf',
                                                } : {}),
                                            }}
                                        >
                                            {props.children}
                                        </td>
                                    )
                                }

                                if (props.type === 'dropdown')
                                    return <DropdownCell {...props} />
                                return <EditableCell {...props} />
                            },
                        },
                    }}
                    pagination={false}
                    size={'small'}
                    scroll={{
                        // y: window.innerHeight - 600,
                        y: `calc(100vh - 360px)`,
                        x: 'max-content',
                        // x: true,
                        // x: 400,
                        // x: `calc(100vw - 100px)`
                        // x: `calc(50% + 100px)`
                        // x: 1000
                    }}
                    // @ts-expect-error ///
                    columns={budget?.length ? [
                        {
                            ...columnLargeProps('Раздел бюджета', 'section', true),
                            onCell: (row) => ({
                                row,
                                dataIndex: 'section',
                                type: 'dropdown',
                                title: undefined,
                                variants: Object.keys(budgetItems).map((section) => ({
                                    label: section,
                                    value: section,
                                })),
                                onItemSelected: updateDataCategory,
                                editable: canEdit,
                            }),
                            filterSearch: true,
                            filters: (activeFilters.category_name?.length || activeFilters.item_name?.length) ? null : sectionFilters.map((section) => ({
                                // filters: sectionFilters.map((section) => ({
                                value: section,
                                text: section,
                            })),
                            filteredValue: activeFilters.section || [],
                            onFilter: (value, row) => row.budget_report_id === 'new' || row.section?.indexOf(value as string) === 0,
                        },
                        {
                            ...columnLargeProps('Раздел / статья расходов', 'category_name', true),
                            onCell: (row) => ({
                                row,
                                dataIndex: 'category_name',
                                type: 'dropdown',
                                title: undefined,
                                variants: Object.values(budgetItems[row.section]?.section_categories || {}).map((section_category: any) => ({
                                    label: `${section_category.number} - ${section_category.name}`,
                                    value: section_category.name,
                                })),
                                onItemSelected: updateDataCategory,
                                editable: canEdit,
                            }),
                            filteredValue: activeFilters.category_name || [],
                            filterSearch: true,
                            filters: (activeFilters.section?.length || activeFilters.item_name?.length) ? null : categoryFilters.map((category) => ({
                                // filters: categoryFilters.map((category) => ({
                                value: category,
                                text: category,
                            })),
                            onFilter: (value, row) => row.budget_report_id === 'new' || `${row.category_number} - ${row.category_name}`?.indexOf(value as string) === 0,
                        },
                        {
                            ...columnLargeProps('Номенклатура/ наименование мероприятия', 'item_name', true, 0),
                            onCell: (row) => ({
                                row,
                                dataIndex: 'item_name',
                                type: 'dropdown',
                                title: undefined,
                                variants: (budgetItems[row.section]?.section_categories?.[row.category_number]?.items || []).map((item: any) => ({
                                    label: item,
                                    value: item,
                                    disabled: budget.some((budget) => budget.item_name === item)
                                })),
                                onItemSelected: updateDataCategory,
                                createNewItem: (itemName: string) => {
                                    createNewItem(row, itemName)
                                },
                                placeholder: 'Введите название, чтобы добавить новый элемент',
                                editable: canEdit,
                            }),
                            filteredValue: activeFilters.item_name || [],
                            filterSearch: true,
                            filters: (activeFilters.section?.length || activeFilters.category_name?.length) ? null : itemFilters.map((item) => ({
                                // filters: itemFilters.map((item) => ({
                                value: item,
                                text: item,
                            })),
                            onFilter: (value, row) => row.budget_report_id === 'new' || row.item_name?.indexOf(value as string) === 0,
                        },
                        {
                            title: 'Объем финансирования, тыс. руб.  с НДС',
                            children: [
                                {
                                    title: `${selectedYear - 1} год`,
                                    children: [
                                        {
                                            ...columnSmallProps({
                                                title: 'План',
                                                dataIndex: `budget_${selectedYear - 1}_plan`,
                                                disabled: canEdit,
                                                editable: canEdit
                                            }),
                                        },
                                        {
                                            ...columnSmallProps({
                                                title: 'Факт',
                                                dataIndex: `budget_${selectedYear - 1}_fact`,
                                                editable: canEdit,
                                                handleSave
                                            }),
                                            className: 'boldRightBorder'
                                        },
                                    ],
                                },
                                {
                                    title: `Плановый ${selectedYear} год`,
                                    children: [
                                        {
                                            ...columnSmallProps({
                                                title: '1 кв',
                                                dataIndex: `budget_${selectedYear}_1q`,
                                                editable: canEdit,
                                                handleSave
                                            }),
                                        },
                                        {
                                            ...columnSmallProps({
                                                title: '2 кв',
                                                dataIndex: `budget_${selectedYear}_2q`,
                                                editable: canEdit,
                                                handleSave
                                            }),
                                        },
                                        {
                                            ...columnSmallProps({
                                                title: '1 полуг',
                                                dataIndex: `budget_${selectedYear}_1half`,
                                                disabled: canEdit,
                                                editable: canEdit
                                            }),
                                        },
                                        {
                                            ...columnSmallProps({
                                                title: '3 кв',
                                                dataIndex: `budget_${selectedYear}_3q`,
                                                editable: canEdit,
                                                handleSave
                                            }),
                                        },
                                        {
                                            ...columnSmallProps({
                                                title: '9 месяцев',
                                                dataIndex: `budget_${selectedYear}_9m`,
                                                disabled: canEdit,
                                                editable: canEdit
                                            }),
                                        },
                                        {
                                            ...columnSmallProps({
                                                title: '4 кв',
                                                dataIndex: `budget_${selectedYear}_4q`,
                                                editable: canEdit,
                                                handleSave
                                            }),
                                        },
                                        {
                                            ...columnSmallProps({
                                                title: 'ИТОГО',
                                                dataIndex: `budget_${selectedYear}_total`,
                                                disabled: canEdit
                                            }),
                                        },
                                    ],
                                },
                            ]
                        },
                        ...(canEdit ? [{
                            title: '',
                            fixed: 'right',
                            width: 20,
                            render: (row) => (
                                <Tooltip
                                    title={'Удалить'}
                                    placement={'left'}
                                    value={(
                                        <MinusCircleFilled
                                            style={{color: '#df3030', fontSize: 10}}
                                            onClick={() => {
                                                if (row.budget_report_id === 'new')
                                                    dispatch(removeBudgetAction(row.budget_report_id))
                                                else
                                                    dispatch(openConfirmationDialogAction({
                                                        title: 'Подтверждение',
                                                        message: `Удалить элемент бюджета - "${row.item_name}" ?`,
                                                        applyText: 'Да',
                                                        onApply: () => dispatch(removeBudgetAction(row.budget_report_id)),
                                                    }))
                                            }}
                                        />
                                    )}
                                />
                            )
                        },
                        ] : []),
                    ] : [
                        {
                            title: '',
                            key: 'empty',
                            render: () => (
                                <Empty description={'Нет данных'}/>
                            )
                        }
                    ]}
                    dataSource={budget}
                    bordered
                    onChange={(_, filters) => setActiveFilters(filters)}
                />
            </div>
            {canEdit ? (
                <Button
                    style={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        width: 120,
                        zIndex: 2000,
                    }}
                    type={'primary'}
                    onClick={() => dispatch(addNewEmptyRowAction(selectedYear))}
                    disabled={budget.some((item) => item.budget_report_id === 'new')}
                >
                    Добавить строку
                </Button>
            ) : null}
        </div>
    )
}
