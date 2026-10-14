import {FC, useCallback, useEffect, useMemo, useState} from 'react'
import './BusinessFunctions.css'
import {Button, Dropdown, Flex, Input, Select, Spin, Splitter, Switch, Tree} from 'antd'
import {useDispatch, useSelector} from 'react-redux'
import {
    getAuthSelector,
    getBusinessFunctionsSelector,
    getCompaniesSelector,
    getCompanySoftwareSelector
} from '@/store/selectors'
import {
    addBusinessFunctionAction,
    attachCompanySoftwareToBusinessFunctionAction,
    attachNewCompanySoftwareToBusinessFunctionAction,
    changeBusinessFunctionOrderAction,
    createAndAddTargetSoftwareToBusinessFunctionAction,
    createAndAttachNewCompanySoftwareToBusinessFunctionAction,
    deleteBusinessFunctionAction,
    detachCompanySoftwareFromBusinessFunctionAction,
    downloadBusinessFunctionsReportAction,
    getBusinessFunctionDetailsAction,
    getBusinessFunctionsAction,
    getCompanySoftwareAction,
    getSoftwareAction,
    getSoftwareClassesAction,
    getSoftwareTagsAction,
    openConfirmationDialogAction,
    resetBusinessFunctionValueAction,
    updateBusinessFunctionAction,
    updateBusinessFunctionDetailsAction,
    updateBusinessFunctionExamplesAction,
} from '@/store/actions'
import {EditOutlined, MinusOutlined, PlusOutlined} from '@ant-design/icons'
import {checkAdmin, checkBFManagerAdmin, checkITSpecialistOrAdmin, convertToDateTimeString} from '@/utils'
import {SoftwareModal} from '@/modals'
import {
    BF_COMMENTS_HINT_TEXT,
    BF_FTR_HINT_TEXT,
    BF_PRIORITY_HINT_TEXT,
    BF_REASON_HINT_TEXT,
    BF_RU_SOFT_AVAIL_STATUS_HINT_TEXT,
    BF_SOFT_HINT_TEXT,
    BF_SOFT_USAGE_STATUS_HINT_TEXT,
    BF_TARGET_SOFTWARE_HINT_TEXT,
    BF_VALUE_HINT_TEXT,
    MODES
} from '@/consts'
import {BusinessFunctionPopoverExample, HintTooltip} from '@/components'

const {TextArea} = Input

export const BusinessFunctions: FC = () => {
    const {
        businessFunctions,
        isLoading,
        details,
        detailsIsLoading,
        downloadReportIsLoading,
    } = useSelector(getBusinessFunctionsSelector)
    const {userInfo, userSelectedChildCompany} = useSelector(getAuthSelector)
    const {
        companySoftware,
        software,
        softwareClasses,
        softwareTags,
    } = useSelector(getCompanySoftwareSelector)
    const {availableCompanies} = useSelector(getCompaniesSelector)
    const dispatch = useDispatch()

    const [editItem, setEditItem] = useState<any>(undefined)
    const [addItem, setAddItem] = useState<any>(undefined)
    const [editingDetails, setEditingDetails] = useState<any>(undefined)
    const [manuallySwitchDetailsValue, setManuallySwitchDetailsValue] = useState<boolean>(false)
    const [manuallyEditDetailsValue, setManuallyEditDetailsValue] = useState<boolean>(false)
    const [forceUpdateDetailsValue, setForceUpdateDetailsValue] = useState<boolean>(false)

    const [selectedFilterOption, setSelectedFilterOption] = useState<string>('all')
    const [filteredBusinessFunctions, setFilteredBusinessFunctions] = useState<any[]>([])

    const [selectedBusinessFunction, setSelectedBusinessFunction] = useState<any>(undefined)
    const [showLastUpdateOnEachRow, setShowLastUpdateOnEachRow] = useState<boolean>(false)
    const [isSoftwareModalOpen, setIsSoftwareModalOpen] = useState<boolean>(false)
    const [softwareModalSource, setSoftwareModalSource] = useState<string>('')

    const [searchBusinessFunctionsText, setSearchBusinessFunctionsText] = useState<string>('')
    const [searchSoftwareText, setSearchSoftwareText] = useState<string>('')

    const [expandedItems, setExpandedItems] = useState<any[]>([])
    const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true)
    const [updatedBusinessFunctionStructure, setUpdatedBusinessFunctionsStructure] = useState<any[]>([])

    const [canEdit, setCanEdit] = useState<boolean>(false)
    const [canEditBFInfoExamples, setCanEditBFInfoExamples] = useState<boolean>(false)
    const [canDelete, setCanDelete] = useState<boolean>(false)
    const [treeHeight, setTreeHeight] = useState<number>(window.innerHeight - 160)
    const [canDownloadConsolidatedReport, setCanDownloadConsolidatedReport] = useState<boolean>(false)

    useEffect(() => {
        window.document.title = 'Бизнес-функции'
        dispatch(getSoftwareAction())

        const handleResize = () => {
            setTreeHeight(window.innerHeight - 160)
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    useEffect(() => {
        setCanEdit(checkITSpecialistOrAdmin(userInfo?.roles))
        setCanEditBFInfoExamples(checkBFManagerAdmin(userInfo?.roles))
        setCanDelete(checkAdmin(userInfo?.roles))
    }, [userInfo?.roles])

    useEffect(() => {
        if (canEdit) {
            dispatch(getSoftwareClassesAction())
            dispatch(getSoftwareTagsAction())
        }
    }, [canEdit])

    useEffect(() => {
        setEditingDetails(null)
        setSelectedBusinessFunction(null)
        setEditItem(null)
        setAddItem(null)
        dispatch(getBusinessFunctionsAction())
        dispatch(getCompanySoftwareAction())
    }, [userSelectedChildCompany])

    useEffect(() => {
        const userCompanyId = userSelectedChildCompany?.id || userInfo?.company?.id

        setCanDownloadConsolidatedReport(
            userCompanyId ? availableCompanies?.some((company) => company.parent_id === userCompanyId) : false
        )
    }, [userInfo, availableCompanies, userSelectedChildCompany])

    useEffect(() => {
        if (selectedBusinessFunction && editingDetails?.businessFunctionId !== selectedBusinessFunction.key) {
            dispatch(getBusinessFunctionDetailsAction(selectedBusinessFunction.key))
        }
    }, [selectedBusinessFunction, editingDetails])

    useEffect(() => {
        if (details) {
            setEditingDetails({
                ...details
            })
        }
    }, [details])

    const businessFunctionToTreeData = useCallback((items, parentNumber: string = '', parentId: number = 0) => {
        return items?.map((item, index) => {
            const itemNumber = parentNumber ? `${parentNumber}${index + 1}.` : `${index + 1}.`
            return {
                title: '',
                key: item.id,
                name: item.name,
                level: item.level,
                software: item.software,
                value: item.value,
                number: itemNumber,
                parentId,
                sortingOrder: item.sorting_order,
                lastUpdated: item.last_updated,
                children: [
                    ...(item?.children ? businessFunctionToTreeData(item?.children, itemNumber, item.id) : []),
                    ...(canEdit && item.level < 3 && !item.addItemButton ? [{
                        title: '',
                        key: `add-item-${item.id}`,
                        name: 'Добавить',
                        parentId: item.id,
                        level: item.level + 1,
                        addItemButton: true,
                        sortingOrder: item?.children?.length ? item?.children[item?.children?.length - 1].sorting_order : 0,
                    }] : []),
                ],
            }
        })
    }, [canEdit])

    useEffect(() => {
        setUpdatedBusinessFunctionsStructure(businessFunctionToTreeData(businessFunctions))
    }, [businessFunctions])

    const onAddItemPressed = useCallback((item) => {
        setAddItem({
            key: `add-item-${item.parentId}`,
            newName: '',
            parentId: item.parentId,
        })
    }, [])

    const updateItemName = useCallback(() => {
        if (editItem?.newName?.trim() && editItem?.name?.trim() !== editItem?.newName?.trim()) {
            dispatch(updateBusinessFunctionAction(editItem.key, editItem.newName.trim()))
            setSelectedBusinessFunction({
                ...selectedBusinessFunction,
                name: editItem.newName.trim(),
            })
        }
        setEditItem(undefined)
    }, [editItem])

    const addNewItem = useCallback(() => {
        if (addItem?.newName?.trim())
            dispatch(addBusinessFunctionAction(addItem.newName.trim(), addItem.parentId))
        setAddItem(undefined)
        if (selectedFilterOption === 'filled') setSelectedFilterOption('all')
    }, [addItem])

    const updateBusinessFunctionDetails = useCallback(() => {
        if (
            editingDetails && details && (
                (editingDetails.value !== details.value && manuallySwitchDetailsValue) ||
                (editingDetails.ftr !== details.ftr && manuallyEditDetailsValue) ||
                (editingDetails.priority !== details.priority && manuallyEditDetailsValue) ||
                (editingDetails.reason !== details.reason && manuallyEditDetailsValue) ||
                (editingDetails.ru_software_availability_status !== details.ru_software_availability_status && manuallyEditDetailsValue) ||
                (editingDetails.software_usage_status !== details.software_usage_status && manuallyEditDetailsValue) ||
                (editingDetails.target_software?.id !== details.target_software?.id && manuallyEditDetailsValue) ||
                details?.createdSoftwareId ||
                (editingDetails.comment !== details.comment && manuallyEditDetailsValue) ||
                forceUpdateDetailsValue
            )
        ) {
            setManuallySwitchDetailsValue(false)
            setManuallyEditDetailsValue(false)
            setForceUpdateDetailsValue(false)
            if (editingDetails.value === null) {
                if (manuallySwitchDetailsValue) dispatch(resetBusinessFunctionValueAction(editingDetails.id))
            } else {
                dispatch(updateBusinessFunctionDetailsAction(
                    editingDetails.id,
                    editingDetails.value,
                    editingDetails.ftr?.trim() || '',
                    editingDetails.priority || '',
                    editingDetails.reason?.trim() || '',
                    editingDetails.ru_software_availability_status || '',
                    editingDetails.software_usage_status || '',
                    details?.createdSoftwareId || editingDetails.target_software?.id || 0,
                    editingDetails.comment?.trim() || '',
                ))
            }
        }
    }, [editingDetails, details, manuallySwitchDetailsValue, manuallyEditDetailsValue, forceUpdateDetailsValue])

    useEffect(() => {
        if (
            editingDetails && details && (
                editingDetails.value !== details.value ||
                editingDetails.priority !== details.priority ||
                editingDetails.ru_software_availability_status !== details.ru_software_availability_status ||
                editingDetails.software_usage_status !== details.software_usage_status ||
                editingDetails.target_software?.id !== details.target_software?.id ||
                details?.createdSoftwareId ||
                forceUpdateDetailsValue
            )
        ) updateBusinessFunctionDetails()
        if (
            editingDetails && details && (
                editingDetails.examples?.ftr_example !== details.examples?.ftr_example ||
                editingDetails.examples?.priority_example !== details.examples?.priority_example ||
                editingDetails.examples?.reason_example !== details.examples?.reason_example
            )
        ) {
            dispatch(updateBusinessFunctionExamplesAction(
                editingDetails.businessFunctionId,
                editingDetails.examples?.ftr_example?.trim() || '',
                editingDetails.examples?.priority_example || '',
                editingDetails.examples?.reason_example?.trim() || '',
            ))
        }
    }, [editingDetails, details, forceUpdateDetailsValue])

    const onDrop = useCallback((info) => {
        const dragKey = info.dragNode.key

        let newParentId = 0

        if (info.node.level === info.dragNode.level) {
            if (info.node?.parentId !== info.dragNode?.parentId) newParentId = info.node?.parentId
        } else {
            if (info.node.addItemButton) return
            else if (info.node.level === info.dragNode.level - 1 && info.node.key !== info.dragNode.parentId) {
                newParentId = info.node?.key
            } else if (!info.node?.children?.some((item) => dragKey === item.key)) return
        }

        let newPosition = info.node?.level !== info.dragNode.level ? 0 : info.node?.sortingOrder + 1

        if (info.dragNode?.sortingOrder === newPosition && !newParentId) return

        dispatch(changeBusinessFunctionOrderAction(dragKey, newPosition, newParentId))
    }, [])

    const onSearchBusinessFunction = useCallback((e) => {
        let { value } = e.target

        value = value.trim()

        setSearchBusinessFunctionsText(value)

        if (!value) return

        const findItemsBySearchText = (items) => {
            const result: any[] = []

            const find = (item: any) => {
                if (!item.number) return
                if (`${item.number} ${item.name}${item.software ? ' (' + item.software + ')' : ''}`.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                    result.push(item.parentId)
                }
                item?.children?.forEach((itemChild) => find(itemChild))
            }

            items.forEach(node => find(node))
            return result
        }
        setExpandedItems(findItemsBySearchText(updatedBusinessFunctionStructure))
        setAutoExpandParent(true)
    }, [updatedBusinessFunctionStructure])

    useEffect(() => {
        if (!updatedBusinessFunctionStructure?.length) return

        if (selectedFilterOption === 'all') {
            setFilteredBusinessFunctions(updatedBusinessFunctionStructure)
            return
        }

        let filterCondition
        switch (selectedFilterOption) {
            case 'empty':
                filterCondition = (value) => !value
                break
            case 'filled':
                filterCondition = (value) => value
                break
            case 'all':
            default:
                filterCondition = (_) => true
        }

        const filterItems = (items) => {
            const result: any[] = []

            const filter = (item: any) => {
                if (!item.number) return item

                let filteredChildren: any[] = []

                for (const child of (item?.children || [])) {
                    const filteredChild = filter(child)

                    if (filteredChild) {
                        filteredChildren.push(filteredChild)
                    }
                }

                const modifiedItem = {
                    ...item,
                    children: filteredChildren,
                }

                if (item.level === 3) {
                    if (!filterCondition(item.value)) return null
                }

                return modifiedItem
            }

            for (const item of items) {
                result.push(filter(item))
            }
            return result
        }

        setFilteredBusinessFunctions(filterItems(updatedBusinessFunctionStructure))
    }, [selectedFilterOption, updatedBusinessFunctionStructure])

    const renderedBusinessFunctionTree = useMemo(() => {
        const loop = (items) =>
            items.map((item) => {
                const strTitle = `${item.number} ${item.name}${item.software ? ' (' + item.software + ')' : ''}`
                const index = strTitle.toLowerCase().indexOf(searchBusinessFunctionsText.toLowerCase())
                const beforeStr = strTitle.substring(0, index)
                const afterStr = strTitle.slice(index + searchBusinessFunctionsText.length)

                const indicator = item.value !== null && (item.level === 2 || item.level === 3) ? (
                    <div
                        style={{
                            height: 6,
                            minWidth: 6,
                            backgroundColor: item.value ? '#54cd50' : '#ff5f5f',
                            marginRight: 5,
                            borderRadius: 3,
                            position: 'absolute',
                            left: -8,
                        }}
                    />
                ) : null

                let displayText =
                    searchBusinessFunctionsText && index >= 0 ? (
                        <span>
                            {beforeStr}
                            <b className={'businessFunctionsTreeSearchedValue'}>{strTitle.substring(index, index + searchBusinessFunctionsText.length)}</b>
                            {afterStr}
                        </span>
                    ) : (
                        <span>
                            {item.number}
                            {' '}
                            {item.name}
                            {item.software ? (
                                <b> ({item.software})</b>
                            ) : null}
                        </span>
                    )
                displayText = (
                    <Flex vertical={false} key={item.key} style={{userSelect: 'text', alignItems: 'center', position: 'relative'}}>
                        {indicator}
                        {displayText}
                    </Flex>
                )

                if (item.children) {
                    return {
                        ...item,
                        children: loop(item.children),
                        displayText,
                    }
                }

                return {
                    ...item,
                    key: item.key,
                    displayText,
                }
            })

        return loop(filteredBusinessFunctions)
    }, [filteredBusinessFunctions, searchBusinessFunctionsText])

    return (
        <div className={'businessFunctionsPage'}>
            <Flex vertical={false} justify={'space-between'}>
                <Flex
                    vertical={false}
                    style={{
                        width: 520,
                    }}
                    justify={'space-between'}
                    align={'center'}
                >
                    <p
                        style={{
                            fontSize: 18,
                        }}
                    >
                        Бизнес-функции
                    </p>
                    <Flex
                        vertical={false}
                        style={{
                            width: 360,
                            marginLeft: 4,
                        }}
                        justify={'space-between'}
                        align={'center'}
                    >
                        <span>
                            Отображать
                        </span>
                        <Select
                            size={'small'}
                            value={selectedFilterOption}
                            options={[
                                {
                                    label: 'Все элементы',
                                    value: 'all',
                                },
                                {
                                    label: 'Только заполненные',
                                    value: 'filled',
                                },
                                {
                                    label: 'Только незаполненные',
                                    value: 'empty',
                                },
                            ]}
                            onSelect={(value) => setSelectedFilterOption(value)}
                            style={{
                                width: 240,
                                marginLeft: 5,
                            }}
                        />
                        <Button
                            style={{
                                marginLeft: 15,
                                height: 24,
                                width: 84,
                            }}
                            type={'dashed'}
                            onClick={() => {
                                if (expandedItems?.length) setExpandedItems([])
                                else {
                                    const findAllExpandableItems = (items) => {
                                        const result: any[] = []

                                        const find = (item: any) => {
                                            if (item?.level < 3 && !item.addItemButton) {
                                                result.push(item.key)
                                                item?.children?.forEach((itemChild) => find(itemChild))
                                            }
                                        }

                                        items.forEach(node => find(node))
                                        return result
                                    }

                                    setExpandedItems(findAllExpandableItems(updatedBusinessFunctionStructure))
                                }
                            }}
                        >
                            {expandedItems?.length ? 'Свернуть' : 'Развернуть'}
                        </Button>
                    </Flex>
                </Flex>
                <Flex
                    vertical={false}
                    justify={'center'}
                    align={'center'}
                >
                    <Dropdown.Button
                        onClick={() => dispatch(downloadBusinessFunctionsReportAction(true))}
                        disabled={downloadReportIsLoading}
                        trigger={['click']}
                        size={'small'}
                        type={'primary'}
                        style={{
                            width: 80,
                            height: 24,
                            marginRight: 16,
                        }}
                        menu={{
                            items: [
                                ...(canDownloadConsolidatedReport ?
                                        [
                                            {
                                                key: 'consolidatedFullReport',
                                                label: 'Скачать консолидированный отчёт',
                                                onClick: () => dispatch(
                                                    downloadBusinessFunctionsReportAction(true, true)
                                                )
                                            }
                                        ] : []
                                ),
                                {
                                    key: 'BFStructure',
                                    label: 'Скачать только структуру БФ',
                                    onClick: () => dispatch(downloadBusinessFunctionsReportAction(false))
                                },
                            ]
                        }}
                    >
                        Скачать
                    </Dropdown.Button>
                    <Flex
                        vertical={false}
                        onClick={() => setShowLastUpdateOnEachRow(!showLastUpdateOnEachRow)}
                        justify={'center'}
                        align={'center'}
                    >
                        <p>
                            Показывать дату изменения
                        </p>
                        <Switch
                            value={showLastUpdateOnEachRow}
                            size={'small'}
                        />
                    </Flex>
                </Flex>
            </Flex>
            {isLoading && !updatedBusinessFunctionStructure?.length ? (
                <div className={'businessFunctionsSpinnerContainer'}>
                    <Spin/>
                </div>
            ) : (
                <Splitter
                    layout={'horizontal'}
                >
                    <Splitter.Panel
                        defaultSize={'50%'}
                        min={250}
                        resizable
                    >
                        <div className={'businessFunctionsTreeContainer'}>
                            <Input
                                className={'businessFunctionsTreeSearchInput'}
                                placeholder={'Поиск'}
                                onChange={onSearchBusinessFunction}
                                allowClear
                                size={'small'}
                            />
                            <Tree
                                style={{
                                    marginTop: 5,
                                    paddingTop: 5,
                                }}
                                treeData={renderedBusinessFunctionTree}
                                height={treeHeight}
                                blockNode
                                draggable={(item: any) => (
                                    canEdit &&
                                    !item?.addItemButton &&
                                    item?.level !== 1 &&
                                    item?.level !== 0 &&
                                    editItem?.key !== item?.key
                                )}
                                expandedKeys={expandedItems}
                                onExpand={(items) => {
                                    setExpandedItems(items)
                                    setAutoExpandParent(false)
                                }}
                                autoExpandParent={autoExpandParent}
                                onDrop={onDrop}
                                titleRender={(item: any) => (
                                    <div className={'businessFunctionsTreeItem'}>
                                        {showLastUpdateOnEachRow && item.lastUpdated && !(editItem?.key === item.key || addItem?.key === item.key) ? (
                                            <span
                                                style={{
                                                    position: 'absolute',
                                                    bottom: -10,
                                                    left: -8,
                                                    fontSize: 6,
                                                    color: '#a1a1a1',
                                                    width: 100,
                                                }}
                                            >
                                            Изменения от {convertToDateTimeString(item.lastUpdated)}
                                        </span>
                                        ) : null}
                                        {editItem?.key === item.key || addItem?.key === item.key ? (
                                            <Input
                                                style={{
                                                    marginTop: 1.5,
                                                    marginBottom: 1,
                                                    width: `calc(50vw - ${150 + item.level * 30}px)`,
                                                    height: 20,
                                                }}
                                                placeholder={'Название'}
                                                autoFocus
                                                size={'small'}
                                                value={addItem?.newName || editItem?.newName}
                                                onChange={(e) => {
                                                    if (addItem) {
                                                        setAddItem({
                                                            ...addItem,
                                                            newName: e.target.value,
                                                        })
                                                    } else {
                                                        setEditItem({
                                                            ...editItem,
                                                            newName: e.target.value,
                                                        })
                                                    }
                                                }}
                                                onPressEnter={addItem ? addNewItem : updateItemName}
                                                onBlur={addItem ? addNewItem : updateItemName}
                                                maxLength={500}
                                            />
                                        ) : item?.addItemButton ? (
                                            <Button
                                                type={'link'}
                                                size={'small'}
                                                style={{
                                                    height: 24,
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onAddItemPressed(item)
                                                }}
                                            >
                                                {item.name}
                                            </Button>
                                        ) : (
                                            item.displayText
                                        )}
                                        {(
                                            canEdit && item.level !== 1 && item.level !== 0 && !item?.addItemButton &&
                                            item.key !== addItem?.key && item.key !== editItem?.key
                                        ) ? (
                                            <>
                                                <Button
                                                    className={'businessFunctionsTreeItemActionButton'}
                                                    type={'primary'}
                                                    size={'small'}
                                                    style={{
                                                        backgroundColor: 'transparent',
                                                        height: 12,
                                                        width: 12,
                                                        minWidth: 12,
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setEditItem({
                                                            ...item,
                                                            newName: item.name,
                                                        })
                                                    }}
                                                    icon={(
                                                        <EditOutlined
                                                            style={{
                                                                backgroundColor: 'transparent',
                                                                color: '#0045cd',
                                                                display: 'flex',
                                                                fontSize: 12,
                                                            }}
                                                        />
                                                    )}
                                                />
                                                {canDelete ?    (
                                                    <Button
                                                        className={'businessFunctionsTreeItemActionButton'}
                                                        type={'primary'}
                                                        size={'small'}
                                                        style={{
                                                            backgroundColor: '#d10000',
                                                            height: 12,
                                                            width: 12,
                                                            minWidth: 12,
                                                        }}
                                                        shape={'circle'}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            dispatch(openConfirmationDialogAction({
                                                                title: 'Подтверждение',
                                                                message: `Удалить бизнес-функцию - "${item.name}" ?`,
                                                                applyText: 'Да',
                                                                onApply: () => {
                                                                    setSelectedBusinessFunction(undefined)
                                                                    dispatch(deleteBusinessFunctionAction(item.key))
                                                                },
                                                            }))
                                                        }}
                                                        icon={(
                                                            <MinusOutlined
                                                                style={{
                                                                    display: 'flex',
                                                                    fontSize: 8,
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                ) : null}
                                            </>
                                        ) : null}
                                    </div>
                                )}
                                showLine
                                onSelect={(_, {node}) => {
                                    if (
                                        selectedBusinessFunction?.key === node.key ||
                                        editItem?.key === node.key
                                    ) {
                                        if (editItem?.key !== node.key) {
                                            setEditingDetails(null)
                                            setSelectedBusinessFunction(null)
                                            setEditItem(null)
                                            setAddItem(null)
                                        }
                                        return
                                    }
                                    if (node.addItemButton) {
                                        if (addItem?.key === node.key) return

                                        onAddItemPressed(node)
                                        return
                                    }
                                    if (node.level !== 3 && node.level !== 2) {
                                        if (expandedItems?.some(item => node.key === item)) {
                                            setExpandedItems(expandedItems.filter(item => node.key !== item))
                                        } else {
                                            setExpandedItems([
                                                ...expandedItems,
                                                node.key,
                                            ])
                                        }
                                    } else {
                                        updateBusinessFunctionDetails()
                                        setSelectedBusinessFunction(node)
                                        setEditingDetails(null)
                                    }
                                }}
                                selectedKeys={selectedBusinessFunction ? [selectedBusinessFunction.key] : []}
                            />
                        </div>
                    </Splitter.Panel>
                    {selectedBusinessFunction ? (
                        <Splitter.Panel
                            defaultSize={'50%'}
                            min={250}
                            resizable
                        >
                            <div className={'businessFunctionsDetailsContainer'}>
                                {detailsIsLoading && !details ? (
                                    <div className={'businessFunctionsDetailsSpinnerContainer'}>
                                        <Spin/>
                                    </div>
                                ) : details && editingDetails ? (
                                    <>
                                        <h5>Бизнес-функция: {selectedBusinessFunction.name}</h5>
                                        <div className={'modalInputElement'}>
                                            <p>
                                                Используется ли данная бизнес-функция?
                                                {canEdit ? (
                                                    <HintTooltip hintText={BF_VALUE_HINT_TEXT}/>
                                                ) : null}
                                            </p>
                                            {canEdit ? (
                                                <Select
                                                    value={String(editingDetails.value)}
                                                    options={[
                                                        {
                                                            label: '---',
                                                            value: 'null',
                                                        },
                                                        {
                                                            label: 'Используется',
                                                            value: 'true',
                                                        },
                                                        {
                                                            label: 'Не используется',
                                                            value: 'false',
                                                        },
                                                    ]}
                                                    style={{
                                                        width: 'min(150px, 100%)',
                                                    }}
                                                    onSelect={(value) => {
                                                        setManuallySwitchDetailsValue(true)
                                                        setEditingDetails({
                                                            ...editingDetails,
                                                            value: value === 'null' ? null : value === 'true',
                                                        })
                                                    }}
                                                />
                                            ) : (
                                                <p>{editingDetails.value === null ? '---' : editingDetails.value ? 'Используется' : 'Не используется'}</p>
                                            )}
                                        </div>
                                        <div className={'modalInputElement'}>
                                            <p>
                                                Функционально-технические требования
                                                <BusinessFunctionPopoverExample
                                                    contentText={editingDetails?.examples?.ftr_example}
                                                    onInsertValue={canEdit ? (
                                                        (newValue) => {
                                                            if (editingDetails?.ftr === newValue && editingDetails?.value)
                                                                return
                                                            setEditingDetails({
                                                                ...editingDetails,
                                                                ftr: newValue,
                                                                value: true,
                                                            })
                                                            setForceUpdateDetailsValue(true)
                                                        }
                                                    ) : null}
                                                    onConfirmEditValue={canEditBFInfoExamples ? (
                                                        (newValue: string) => {
                                                            setEditingDetails({
                                                                ...editingDetails,
                                                                examples: {
                                                                    ...editingDetails.examples,
                                                                    ftr_example: newValue,
                                                                }
                                                            })
                                                        }
                                                    ) : null}
                                                />
                                                {canEdit ? (
                                                    <HintTooltip hintText={BF_FTR_HINT_TEXT}/>
                                                ) : null}
                                            </p>
                                            {canEdit && editingDetails.value !== false ? (
                                                <TextArea
                                                    placeholder={'Введите описание функционально-технических требований'}
                                                    autoSize={{minRows: 3, maxRows: 10}}
                                                    value={editingDetails?.ftr}
                                                    onChange={({target}) => setEditingDetails({
                                                        ...editingDetails,
                                                        ftr: target.value,
                                                    })}
                                                    onBlur={() => {
                                                        setManuallyEditDetailsValue(true)
                                                        updateBusinessFunctionDetails()
                                                        setEditingDetails({
                                                            ...editingDetails,
                                                            value: !editingDetails.value && !!editingDetails?.ftr?.trim() ? true : editingDetails.value,
                                                        })
                                                    }}
                                                />
                                            ) : (
                                                <p>{editingDetails?.ftr || '---'}</p>
                                            )}
                                        </div>
                                        <div className={'modalInputElement'}>
                                            <p>
                                                Приоритет
                                                <BusinessFunctionPopoverExample
                                                    contentText={editingDetails?.examples?.priority_example}
                                                    onInsertValue={canEdit ? (
                                                        (newValue) => {
                                                            if (editingDetails?.priority === newValue && editingDetails?.value)
                                                                return
                                                            setManuallyEditDetailsValue(true)
                                                            setEditingDetails({
                                                                ...editingDetails,
                                                                priority: newValue,
                                                                value: true,
                                                            })
                                                            setForceUpdateDetailsValue(true)
                                                        }
                                                    ) : null}
                                                    onConfirmEditValue={canEditBFInfoExamples ? (
                                                        (newValue: string) => {
                                                            setEditingDetails({
                                                                ...editingDetails,
                                                                examples: {
                                                                    ...editingDetails.examples,
                                                                    priority_example: newValue,
                                                                }
                                                            })
                                                        }
                                                    ) : null}
                                                    options={[
                                                        {
                                                            label: '---',
                                                            value: '',
                                                        },
                                                        {
                                                            label: '1',
                                                            value: '1',
                                                        },
                                                        {
                                                            label: '2',
                                                            value: '2',
                                                        },
                                                        {
                                                            label: '3',
                                                            value: '3',
                                                        },
                                                    ]}
                                                    maxWidth={200}
                                                />
                                                {canEdit ? (
                                                    <HintTooltip hintText={BF_PRIORITY_HINT_TEXT}/>
                                                ) : null}
                                            </p>
                                            {canEdit && editingDetails.value !== false ? (
                                                <Select
                                                    value={editingDetails.priority || ''}
                                                    options={[
                                                        {
                                                            label: '---',
                                                            value: '',
                                                        },
                                                        {
                                                            label: '1',
                                                            value: '1',
                                                        },
                                                        {
                                                            label: '2',
                                                            value: '2',
                                                        },
                                                        {
                                                            label: '3',
                                                            value: '3',
                                                        },
                                                    ]}
                                                    style={{
                                                        width: 'min(120px, 100%)',
                                                    }}
                                                    onSelect={(value) => {
                                                        setManuallyEditDetailsValue(true)
                                                        setEditingDetails({
                                                            ...editingDetails,
                                                            priority: value,
                                                            value: !editingDetails.value && value ? true : editingDetails.value,
                                                        })
                                                    }}
                                                />
                                            ) : (
                                                <p>{editingDetails.priority || '---'}</p>
                                            )}
                                        </div>
                                        <p>
                                            Обоснование выбора приоритета
                                            <BusinessFunctionPopoverExample
                                                contentText={editingDetails?.examples?.reason_example}
                                                onInsertValue={canEdit ? (
                                                    (newValue) => {
                                                        if (editingDetails?.reason === newValue && editingDetails?.value)
                                                            return
                                                        setManuallyEditDetailsValue(true)
                                                        setEditingDetails({
                                                            ...editingDetails,
                                                            reason: newValue,
                                                            value: true,
                                                        })
                                                        setForceUpdateDetailsValue(true)
                                                    }
                                                ) : null}
                                                onConfirmEditValue={canEditBFInfoExamples ? (
                                                    (newValue: string) => {
                                                        setEditingDetails({
                                                            ...editingDetails,
                                                            examples: {
                                                                ...editingDetails.examples,
                                                                reason_example: newValue,
                                                            }
                                                        })
                                                    }
                                                ) : null}
                                            />
                                            {canEdit ? (
                                                <HintTooltip hintText={BF_REASON_HINT_TEXT}/>
                                            ) : null}
                                        </p>
                                        {canEdit && editingDetails.value !== false ? (
                                            <TextArea
                                                placeholder={'Введите обоснование выбора приоритета'}
                                                autoSize={{minRows: 3, maxRows: 10}}
                                                value={editingDetails?.reason}
                                                onChange={({target}) => setEditingDetails({
                                                    ...editingDetails,
                                                    reason: target.value,
                                                })}
                                                onBlur={() => {
                                                    setManuallyEditDetailsValue(true)
                                                    updateBusinessFunctionDetails()
                                                    setEditingDetails({
                                                        ...editingDetails,
                                                        value: !editingDetails.value && !!editingDetails?.reason?.trim() ? true : editingDetails.value,
                                                    })
                                                }}
                                            />
                                        ) : (
                                            <p>{editingDetails?.reason || '---'}</p>
                                        )}

                                        <div className={'modalInputElement'}>
                                            <p>
                                                Оценка возможностей использования российских продуктов
                                                {canEdit ? (
                                                    <HintTooltip hintText={BF_RU_SOFT_AVAIL_STATUS_HINT_TEXT}/>
                                                ) : null}
                                            </p>
                                            {canEdit && editingDetails.value !== false ? (
                                                <Select
                                                    value={editingDetails.ru_software_availability_status || ''}
                                                    options={[
                                                        {
                                                            label: '---',
                                                            value: '',
                                                        },
                                                        {
                                                            label: 'Российские решения закрывают критически важный функционал',
                                                            value: '3',
                                                        },
                                                        {
                                                            label: 'Необходима доработка решений',
                                                            value: '2',
                                                        },
                                                        {
                                                            label: 'Необходима серьезная доработка решений',
                                                            value: '1',
                                                        },
                                                        {
                                                            label: 'Нет решений',
                                                            value: '0',
                                                        },
                                                    ]}
                                                    style={{
                                                        width: 'min(360px, 100%)',
                                                    }}
                                                    onSelect={(value) => {
                                                        setManuallyEditDetailsValue(true)
                                                        setEditingDetails({
                                                            ...editingDetails,
                                                            ru_software_availability_status: value,
                                                            value: !editingDetails.value && value ? true : editingDetails.value,
                                                        })
                                                    }}
                                                />
                                            ) : (
                                                <p>{editingDetails.ru_software_availability_status || '---'}</p>
                                            )}
                                        </div>
                                        <div className={'modalInputElement'}>
                                            <p>
                                                Используется ли ПО?
                                                {canEdit ? (
                                                    <HintTooltip hintText={BF_SOFT_USAGE_STATUS_HINT_TEXT}/>
                                                ) : null}
                                            </p>
                                            {canEdit && editingDetails.value !== false ? (
                                                <Select
                                                    value={editingDetails.software_usage_status || ''}
                                                    options={[
                                                        {
                                                            label: '---',
                                                            value: '',
                                                        },
                                                        {
                                                            label: 'Используется без ПО',
                                                            value: 'Используется без ПО',
                                                        },
                                                        {
                                                            label: 'Используется с российским ПО',
                                                            value: 'Используется с российским ПО',
                                                        },
                                                        {
                                                            label: 'Используется с иностранным ПО',
                                                            value: 'Используется с иностранным ПО',
                                                        },
                                                    ]}
                                                    style={{
                                                        width: 'min(260px, 100%)',
                                                    }}
                                                    onSelect={(value) => {
                                                        setManuallyEditDetailsValue(true)
                                                        setEditingDetails({
                                                            ...editingDetails,
                                                            software_usage_status: value,
                                                            value: !editingDetails.value && value ? true : editingDetails.value,
                                                        })
                                                    }}
                                                />
                                            ) : (
                                                <p>{editingDetails.software_usage_status || '---'}</p>
                                            )}
                                        </div>
                                        <Flex vertical>
                                            <Flex vertical={false}>
                                                <p>Используемое ПО</p>
                                                {canEdit ? (
                                                    <HintTooltip hintText={BF_SOFT_HINT_TEXT}/>
                                                ) : null}
                                                {canEdit && editingDetails.value !== false ? (
                                                    <Button
                                                        type={'primary'}
                                                        size={'small'}
                                                        style={{
                                                            marginLeft: 10,
                                                            backgroundColor: '#4cbd41',
                                                            height: 16,
                                                            width: 16,
                                                            minWidth: 16,
                                                        }}
                                                        shape={'circle'}
                                                        onClick={() => {
                                                            setSoftwareModalSource('bfSoftware')
                                                            setIsSoftwareModalOpen(true)
                                                        }}
                                                        icon={<PlusOutlined style={{display: 'flex', fontSize: 10}}/>}
                                                    />
                                                ) : null}
                                            </Flex>
                                            <Select
                                                style={{
                                                    width: '100%',
                                                }}
                                                showSearch
                                                optionFilterProp={'label'}
                                                mode={'multiple'}
                                                value={editingDetails?.company_software?.map((cs) => cs.software.id)}
                                                options={software?.map((s) => ({
                                                    label: s.name,
                                                    value: s.id,
                                                }))}
                                                onDeselect={(value) => {
                                                    const companySoftwareId = editingDetails?.company_software?.filter((cs) => cs.software.id === value)?.[0]?.id
                                                    if (selectedBusinessFunction.key && companySoftwareId) {
                                                        dispatch(detachCompanySoftwareFromBusinessFunctionAction(
                                                            selectedBusinessFunction.key, companySoftwareId,
                                                        ))
                                                    }
                                                }}
                                                onSelect={(value) => {
                                                    const companySoftwareId = companySoftware?.data?.filter((cs) => cs.software.id === value)?.[0]?.id
                                                    if (selectedBusinessFunction?.key) {
                                                        if (companySoftwareId) {
                                                            dispatch(attachCompanySoftwareToBusinessFunctionAction(
                                                                selectedBusinessFunction.key, companySoftwareId,
                                                            ))
                                                        } else {
                                                            dispatch(attachNewCompanySoftwareToBusinessFunctionAction(
                                                                selectedBusinessFunction.key,
                                                                value,
                                                            ))
                                                        }
                                                    }
                                                }}
                                                notFoundContent={(
                                                    <Flex
                                                        justify={'center'}
                                                        style={{
                                                            width: '100%',
                                                        }}
                                                    >
                                                        <Button
                                                            type={'primary'}
                                                            onClick={() => {
                                                                setSoftwareModalSource('bfSoftware')
                                                                setIsSoftwareModalOpen(true)
                                                            }}
                                                        >
                                                            Добавить
                                                        </Button>
                                                    </Flex>
                                                )}
                                                onSearch={(value) => setSearchSoftwareText(value)}
                                                placeholder={'Выберите используемое ПО'}
                                                disabled={!(canEdit && editingDetails.value !== false)}
                                            />
                                        </Flex>
                                        <div className={'modalInputElement'}>
                                            <p>
                                                Целевое ПО
                                                {canEdit ? (
                                                    <HintTooltip hintText={BF_TARGET_SOFTWARE_HINT_TEXT}/>
                                                ) : null}
                                                {canEdit && editingDetails.value !== false ? (
                                                    <Button
                                                        type={'primary'}
                                                        size={'small'}
                                                        style={{
                                                            marginLeft: 10,
                                                            backgroundColor: '#4cbd41',
                                                            height: 16,
                                                            width: 16,
                                                            minWidth: 16,
                                                        }}
                                                        shape={'circle'}
                                                        onClick={() => {
                                                            setSoftwareModalSource('bfTargetSoftware')
                                                            setIsSoftwareModalOpen(true)
                                                        }}
                                                        icon={<PlusOutlined style={{display: 'flex', fontSize: 10}}/>}
                                                    />
                                                ) : null}
                                            </p>
                                            <Select
                                                value={editingDetails.target_software?.id || 0}
                                                options={[
                                                    {
                                                        label: '---',
                                                        value: 0,
                                                    },
                                                    ...software?.filter((s) => s.register_number)?.map((s) => ({
                                                        label: s.name,
                                                        value: s.id,
                                                    }))
                                                ]}
                                                showSearch
                                                optionFilterProp={'label'}
                                                style={{
                                                    width: 'min(360px, 100%)',
                                                }}
                                                onSelect={(value) => {
                                                    if (!value && !editingDetails.target_software?.id) return

                                                    setManuallyEditDetailsValue(true)
                                                    setEditingDetails({
                                                        ...editingDetails,
                                                        target_software: {
                                                            id: value,
                                                        },
                                                        value: !editingDetails.value && value ? true : editingDetails.value,
                                                    })
                                                }}
                                                notFoundContent={(
                                                    <Flex
                                                        justify={'center'}
                                                        style={{
                                                            width: '100%',
                                                        }}
                                                    >
                                                        <Button
                                                            type={'primary'}
                                                            onClick={() => {
                                                                setSoftwareModalSource('bfTargetSoftware')
                                                                setIsSoftwareModalOpen(true)
                                                            }}
                                                        >
                                                            Добавить
                                                        </Button>
                                                    </Flex>
                                                )}
                                                onSearch={(value) => setSearchSoftwareText(value)}
                                                placeholder={'Выберите целевое ПО'}
                                                disabled={!(canEdit && editingDetails.value !== false)}
                                            />
                                        </div>
                                        <p>
                                            Комментарии по использованию ПО
                                            {canEdit ? (
                                                <HintTooltip hintText={BF_COMMENTS_HINT_TEXT}/>
                                            ) : null}
                                        </p>
                                        {canEdit && editingDetails.value !== false ? (
                                            <TextArea
                                                placeholder={'Введите комментарий'}
                                                autoSize={{minRows: 3, maxRows: 10}}
                                                value={editingDetails?.comment}
                                                onChange={({target}) => setEditingDetails({
                                                    ...editingDetails,
                                                    comment: target.value,
                                                })}
                                                onBlur={() => {
                                                    updateBusinessFunctionDetails()
                                                    setManuallyEditDetailsValue(true)
                                                    setEditingDetails({
                                                        ...editingDetails,
                                                        value: !editingDetails.value && !!editingDetails?.comment?.trim() ? true : editingDetails.value,
                                                    })
                                                }}
                                            />
                                        ) : (
                                            <p>{editingDetails?.comment || '---'}</p>
                                        )}
                                    </>
                                ) : null}
                            </div>
                        </Splitter.Panel>
                    ) : null}
                </Splitter>
            )}
            <SoftwareModal
                isOpen={isSoftwareModalOpen}
                onAccept={(
                    name: string,
                    description: string,
                    artNumber: string,
                    registerNumber: string,
                    mainClassId: number,
                    additionalClassIds: number[],
                    tagIds: number[],
                ) => {
                    if (softwareModalSource === 'bfTargetSoftware') {
                        dispatch(createAndAddTargetSoftwareToBusinessFunctionAction(
                            selectedBusinessFunction.key,
                            name,
                            description,
                            artNumber,
                            registerNumber,
                            mainClassId,
                            additionalClassIds,
                            tagIds,
                        ))
                    } else {
                        dispatch(createAndAttachNewCompanySoftwareToBusinessFunctionAction(
                            selectedBusinessFunction.key,
                            name,
                            description,
                            artNumber,
                            registerNumber,
                            mainClassId,
                            additionalClassIds,
                            tagIds,
                        ))
                    }
                    setIsSoftwareModalOpen(false)
                    setSoftwareModalSource('')
                    setSearchSoftwareText('')
                }}
                onClose={() => {
                    setIsSoftwareModalOpen(false)
                    setSoftwareModalSource('')
                    setSearchSoftwareText('')
                }}
                title={softwareModalSource === 'bfTargetSoftware' ? 'Добавление российского ПО' : 'Добавление ПО'}
                softwareClasses={softwareClasses}
                softwareTags={softwareTags}
                validateSoftwareName={(softwareName) => {
                    if (software.some((s) => s?.name?.trim() === softwareName?.trim())) return 'Название ПО уже занято'
                    return ''
                }}
                defaultName={searchSoftwareText}
                mode={MODES.ADD}
                registerNumberRequired={softwareModalSource === 'bfTargetSoftware'}
            />
        </div>
    )
}
