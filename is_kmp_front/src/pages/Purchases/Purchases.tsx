import {FC, useCallback, useEffect, useState} from 'react'
import './Purchases.css'
import {
    createPurchaseAction,
    deletePurchaseAction,
    getPurchasesAction,
    getPurchasesYearsAction,
    getPurchaseTypesAction,
    openConfirmationDialogAction,
    updatePurchaseAction
} from '@/store/actions'
import {useDispatch, useSelector} from 'react-redux'
import {getAuthSelector, getPurchasesSelector} from '@/store/selectors'
import {checkEconomistOrAdmin} from '@/utils'
import {Table, Tooltip} from '@/components'
import {EditFilled} from '@ant-design/icons'
import {Button, Flex, Select, Spin, Switch} from 'antd'

export const Purchases: FC = () => {
    const {purchases, purchaseTypes, years, isLoading} = useSelector(getPurchasesSelector)
    const {userInfo, userSelectedChildCompany} = useSelector(getAuthSelector)
    const dispatch = useDispatch()
    const [newRow, setNewRow] = useState<any>(undefined)
    const [editingEnabled, setEditingEnabled] = useState<boolean>(false)
    const [selectedYear, setSelectedYear] = useState<number>(-1)
    const [showFullTable, setShowFullTable] = useState<boolean>(false)

    useEffect(() => {
        window.document.title = 'Закупки'
        dispatch(getPurchasesAction())
        dispatch(getPurchaseTypesAction())
        dispatch(getPurchasesYearsAction())
    }, [])

    useEffect(() => {
        dispatch(getPurchasesAction())
        dispatch(getPurchasesYearsAction())
    }, [userSelectedChildCompany])

    useEffect(() => {
        dispatch(getPurchasesAction(selectedYear === -1 ? undefined : selectedYear))
    }, [selectedYear]);

    const canEdit = checkEconomistOrAdmin(userInfo?.roles)

    const updateData = useCallback((row: any, dataIndex: string, newValue: any, newValueId?: any) => {
        const updatedRow = {...row, [dataIndex]: newValue, ...(newValueId ? {type_id: newValueId} : {})}
        if (row.id === 'new') {
            setNewRow(updatedRow)
            if (updatedRow.name && updatedRow.volume && updatedRow.cost && updatedRow.type_id) {
                dispatch(createPurchaseAction(
                    updatedRow.name.trim(),
                    updatedRow.volume,
                    updatedRow.cost,
                    updatedRow.type_id,
                    updatedRow.start_date,
                    updatedRow.end_date,
                    updatedRow.initiator?.trim(),
                    updatedRow.initiator_department?.trim(),
                    updatedRow.purchase_number?.trim(),
                    updatedRow.protocol_date,
                    updatedRow.protocol_number?.trim(),
                    updatedRow.protocol_date_final,
                    updatedRow.protocol_number_final?.trim(),
                    updatedRow.purchase_method?.trim(),
                    updatedRow.volume_unit?.trim(),
                    updatedRow.requests_number,
                    updatedRow.confirmed_requests_number,
                    updatedRow.supplier_name?.trim(),
                    updatedRow.supplier_inn?.trim(),
                    updatedRow.supplier_cost,
                    updatedRow.product_type?.trim(),
                    updatedRow.supplier_type?.trim(),
                    updatedRow.agreement_number?.trim(),
                    updatedRow.agreement_date,
                    updatedRow.register_month?.trim(),
                    updatedRow.register_number?.trim(),
                    updatedRow.comment?.trim(),
                ))
                setNewRow(undefined)
            }
        } else if (row[dataIndex] !== newValue) {
            dispatch(updatePurchaseAction(
                updatedRow.id,
                updatedRow.name.trim(),
                updatedRow.volume,
                updatedRow.cost,
                updatedRow.type_id,
                updatedRow.start_date,
                updatedRow.end_date,
                updatedRow.initiator?.trim(),
                updatedRow.initiator_department?.trim(),
                updatedRow.purchase_number?.trim(),
                updatedRow.protocol_date,
                updatedRow.protocol_number?.trim(),
                updatedRow.protocol_date_final,
                updatedRow.protocol_number_final?.trim(),
                updatedRow.purchase_method?.trim(),
                updatedRow.volume_unit?.trim(),
                updatedRow.requests_number,
                updatedRow.confirmed_requests_number,
                updatedRow.supplier_name?.trim(),
                updatedRow.supplier_inn?.trim(),
                updatedRow.supplier_cost,
                updatedRow.product_type?.trim(),
                updatedRow.supplier_type?.trim(),
                updatedRow.agreement_number?.trim(),
                updatedRow.agreement_date,
                updatedRow.register_month?.trim(),
                updatedRow.register_number?.trim(),
                updatedRow.comment?.trim(),
            ))
        }
    }, [])

    const deleteData = useCallback((row: any) => {
        dispatch(deletePurchaseAction(row.id))
    }, [])

    return (
        <div className={'purchasesPage'}>
            <Flex vertical={false}>
                Закупки
                {purchases?.length && years?.length ? (
                    <Flex
                        vertical={false}
                        className={'purchasesYearSelectContainer'}
                    >
                        <p>Выбрать год</p>
                        <Select
                            size={'small'}
                            className={'purchasesYearSelect'}
                            value={selectedYear}
                            options={[
                                {
                                    label: 'Любой',
                                    value: -1,
                                },
                                ...years?.map((year) => ({
                                    label: year,
                                    value: year,
                                })),
                            ]}
                            onSelect={(value) => setSelectedYear(value)}
                        />
                    </Flex>
                ) : null}
            </Flex>
            {isLoading ? (
                <div
                    style={{
                        height: 'calc(100vh - 120px)',
                        width: '100%',
                        placeItems: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <Spin/>
                </div>
            ) : (
                <Table
                    data={purchases}
                    newRow={newRow}
                    columns={[
                        ...(showFullTable ? [
                            {
                                title: 'Инициатор',
                                dataIndex: 'initiator',
                                type: 'textarea',
                                width: 150,
                                editable: canEdit && editingEnabled,
                                handleSave: updateData,
                                placeholder: 'Введите инициатора',
                                isOptional: true,
                                enableSorting: true,
                            },
                            {
                                title: 'Подразделение инициатор',
                                dataIndex: 'initiator_department',
                                type: 'textarea',
                                width: 150,
                                editable: canEdit && editingEnabled,
                                handleSave: updateData,
                                placeholder: 'Введите департамент',
                                isOptional: true,
                                enableSorting: true,
                            },
                            {
                                title: 'Номер плана закупки',
                                dataIndex: 'purchase_number',
                                type: 'textarea',
                                width: 150,
                                editable: canEdit && editingEnabled,
                                handleSave: updateData,
                                placeholder: 'Введите номер плана закупки',
                                isOptional: true,
                                enableSorting: true,
                            },
                            {
                                title: 'Дата протокола ЗК',
                                dataIndex: 'protocol_date',
                                type: 'date',
                                width: 150,
                                editable: canEdit && editingEnabled,
                                handleSave: updateData,
                                placeholder: 'Введите дату протокола ЗК',
                                isOptional: true,
                                enableSorting: true,
                            },
                            {
                                title: 'Номер протокола ЗК',
                                dataIndex: 'protocol_number',
                                type: 'textarea',
                                width: 150,
                                editable: canEdit && editingEnabled,
                                handleSave: updateData,
                                placeholder: 'Введите номер протокола ЗК',
                                isOptional: true,
                                enableSorting: true,
                            },
                            {
                                title: 'Дата протокола ЗК (итоговый)',
                                dataIndex: 'protocol_date_final',
                                type: 'date',
                                width: 150,
                                editable: canEdit && editingEnabled,
                                handleSave: updateData,
                                placeholder: 'Введите дату протокола ЗК (итоговый)',
                                isOptional: true,
                                enableSorting: true,
                            },
                            {
                                title: 'Номер протокола ЗК (итоговый)',
                                dataIndex: 'protocol_number_final',
                                type: 'textarea',
                                width: 150,
                                editable: canEdit && editingEnabled,
                                handleSave: updateData,
                                placeholder: 'Введите номер протокола ЗК (итоговый)',
                                isOptional: true,
                                enableSorting: true,
                            },
                            {
                                title: 'Способ закупки',
                                dataIndex: 'purchase_method',
                                type: 'dropdown',
                                width: 150,
                                editable: canEdit && editingEnabled,
                                handleSave: updateData,
                                placeholder: 'Введите способ закупки',
                                options: [
                                    '44-ФЗ',
                                    'Закрытый запрос котировок',
                                    'Закрытый запрос предложений',
                                    'Закупка у ед.поставщика (исполнителя, подрядчика)',
                                ].map((purchase_method) => ({
                                    value: purchase_method,
                                    label: purchase_method,
                                })),
                                isOptional: true,
                                enableSorting: true,
                            },
                        ] : []),
                        {
                            title: 'Предмет закупки',
                            dataIndex: 'name',
                            type: 'textarea',
                            width: showFullTable ? 250 : 0,
                            editable: canEdit && editingEnabled,
                            handleSave: updateData,
                            placeholder: 'Введите предмет закупки',
                            enableSorting: true,
                        },
                        ...(showFullTable ? [
                            {
                                title: 'Ед. изм.',
                                dataIndex: 'volume_unit',
                                type: 'textarea',
                                width: 100,
                                editable: canEdit && editingEnabled,
                                handleSave: updateData,
                                placeholder: 'Введите ед. изм.',
                                isOptional: true,
                                enableSorting: true,
                            },
                        ] : []),
                        {
                            title: 'Количество/объём',
                            dataIndex: 'volume',
                            type: 'number',
                            width: 150,
                            editable: canEdit && editingEnabled,
                            handleSave: updateData,
                            placeholder: 'Введите количество/объём',
                            enableSorting: true,
                        },
                        {
                            title: 'Стоимость закупки с НДС',
                            dataIndex: 'cost',
                            type: 'float',
                            width: 150,
                            editable: canEdit && editingEnabled,
                            handleSave: updateData,
                            placeholder: 'Введите стоимость',
                            enableSorting: true,
                        },
                        {
                            title: 'Тип',
                            dataIndex: 'type_name',
                            type: 'dropdown',
                            width: 150,
                            editable: canEdit && editingEnabled,
                            handleSave: updateData,
                            placeholder: 'Выберите тип',
                            options: purchaseTypes?.map((purchaseType) => ({
                                label: purchaseType.name,
                                value: purchaseType.name,
                                id: purchaseType.id,
                            })),
                            enableSorting: true,
                        },
                        ...(showFullTable ? [
                            {
                                title: 'Кол-во заявок',
                                dataIndex: 'requests_number',
                                type: 'number',
                                width: 150,
                                editable: canEdit && editingEnabled,
                                handleSave: updateData,
                                placeholder: 'Введите кол-во заявок',
                                isOptional: true,
                                enableSorting: true,
                            },
                            {
                                title: 'Кол-во допущенных заявок',
                                dataIndex: 'confirmed_requests_number',
                                type: 'number',
                                width: 150,
                                editable: canEdit && editingEnabled,
                                handleSave: updateData,
                                placeholder: 'Введите кол-во допущенных заявок',
                                isOptional: true,
                                enableSorting: true,
                            },
                            {
                                title: 'Поставщик',
                                dataIndex: 'supplier_name',
                                type: 'textarea',
                                width: 150,
                                editable: canEdit && editingEnabled,
                                handleSave: updateData,
                                placeholder: 'Введите поставщика',
                                isOptional: true,
                                enableSorting: true,
                            },
                            {
                                title: 'ИНН Поставщика',
                                dataIndex: 'supplier_inn',
                                type: 'textarea',
                                width: 150,
                                editable: canEdit && editingEnabled,
                                handleSave: updateData,
                                placeholder: 'Введите ИНН поставщика',
                                isOptional: true,
                                enableSorting: true,
                            },
                            {
                                title: 'Стоимость победителя',
                                dataIndex: 'supplier_cost',
                                type: 'float',
                                width: 150,
                                editable: canEdit && editingEnabled,
                                handleSave: updateData,
                                placeholder: 'Введите стоимость победителя',
                                isOptional: true,
                                enableSorting: true,
                            },
                            {
                                title: 'Тип продукта',
                                dataIndex: 'product_type',
                                type: 'dropdown',
                                width: 150,
                                editable: canEdit && editingEnabled,
                                handleSave: updateData,
                                placeholder: 'Выберите тип продукта',
                                options: ['товар', 'услуги'].map((product_type) => ({
                                    label: product_type,
                                    value: product_type,
                                })),
                                isOptional: true,
                                enableSorting: true,
                            },
                            {
                                title: 'Тип поставщика',
                                dataIndex: 'supplier_type',
                                type: 'dropdown',
                                width: 150,
                                editable: canEdit && editingEnabled,
                                handleSave: updateData,
                                placeholder: 'Введите тип поставщика',
                                options: ['дилер', 'исполнитель'].map((supplier_type) => ({
                                    label: supplier_type,
                                    value: supplier_type,
                                })),
                                isOptional: true,
                                enableSorting: true,
                            },
                            {
                                title: '№ Договора',
                                dataIndex: 'agreement_number',
                                type: 'textarea',
                                width: 150,
                                editable: canEdit && editingEnabled,
                                handleSave: updateData,
                                placeholder: 'Введите № договора',
                                isOptional: true,
                                enableSorting: true,
                            },
                            {
                                title: 'Дата договора',
                                dataIndex: 'agreement_date',
                                type: 'date',
                                width: 150,
                                editable: canEdit && editingEnabled,
                                handleSave: updateData,
                                placeholder: 'Введите дату договора',
                                isOptional: true,
                                enableSorting: true,
                            },
                            {
                                title: 'Месяц внесения в реестр',
                                dataIndex: 'register_month',
                                type: 'dropdown',
                                width: 120,
                                editable: canEdit && editingEnabled,
                                handleSave: updateData,
                                placeholder: 'Выберите месяц',
                                options: [
                                    'январь',
                                    'февраль',
                                    'март',
                                    'апрель',
                                    'май',
                                    'июнь',
                                    'июль',
                                    'август',
                                    'сентябрь',
                                    'октябрь',
                                    'ноябрь',
                                    'декабрь',
                                ].map((registry_month) => ({
                                    value: registry_month,
                                    label: registry_month,
                                })),
                                isOptional: true,
                                enableSorting: true,
                            },
                            {
                                title: 'Номер реестровой записи',
                                dataIndex: 'register_number',
                                type: 'textarea',
                                width: 200,
                                editable: canEdit && editingEnabled,
                                handleSave: updateData,
                                placeholder: 'Введите номер реестровой записи',
                                isOptional: true,
                                enableSorting: true,
                            },
                            {
                                title: 'Примечание',
                                dataIndex: 'comment',
                                type: 'textarea',
                                width: 200,
                                editable: canEdit && editingEnabled,
                                handleSave: updateData,
                                placeholder: 'Введите примечание',
                                isOptional: true,
                                enableSorting: true,
                            },
                        ] : []),
                        {
                            title: 'Дата размещения',
                            dataIndex: 'start_date',
                            type: 'date',
                            width: 130,
                            editable: canEdit && editingEnabled,
                            handleSave: updateData,
                            enableSorting: true,
                        },
                        {
                            title: 'Срок исполнения договора',
                            dataIndex: 'end_date',
                            width: 130,
                            type: 'date',
                            editable: canEdit && editingEnabled,
                            handleSave: updateData,
                            enableSorting: true,
                        },
                    ]}
                    canEdit={canEdit}
                    onDeleteNewRow={() => setNewRow(undefined)}
                    onDeleteRow={(row) => (
                        dispatch(openConfirmationDialogAction({
                            title: 'Подтверждение',
                            message: `Удалить закупку - "${row.name}" ?`,
                            applyText: 'Да',
                            onApply: () => deleteData(row),
                        }))
                    )}
                />
            )}
            <Tooltip
                value={(
                    <Flex
                        vertical={false}
                        justify={'flex-end'}
                        className={'purchasesFullTableSwitchContainer'}
                        style={{
                            right: canEdit ? 156 : 20,
                        }}
                        onClick={() => setShowFullTable(!showFullTable)}
                    >
                        <p className={'purchasesFullTableSwitchTitle'}>
                            Показать всю информацию
                        </p>
                        <Switch
                            className={'purchasesFullTableSwitch'}
                            value={showFullTable}
                            size={'small'}
                        />
                    </Flex>
                )}
                title={'Включить отображение дополнительных столбцов таблицы'}
            />
            {canEdit ? (
                <Tooltip
                    title={editingEnabled ? 'Выключить редактирование' : 'Включить редактирование'}
                    placement={'left'}
                    value={(
                        <EditFilled
                            style={{
                                color: '#000000',
                                fontSize: 16,
                                position: 'absolute',
                                top: 24,
                                right: 300,
                                zIndex: 2000,
                            }}
                            onClick={() => {
                                setEditingEnabled(!editingEnabled)
                                setNewRow(undefined)
                            }}
                        />
                    )}
                />
            ) : null}
            {canEdit ? (
                <Button
                    style={{
                        position: 'absolute',
                        top: 18,
                        right: 20,
                        width: 120,
                        zIndex: 2000,
                    }}
                    type={'dashed'}
                    onClick={() => {
                        setEditingEnabled(true)
                        setNewRow({
                            id: 'new',
                            name: '',
                            volume: 0,
                            cost: 0,
                            start_date: (new Date()).toISOString(),
                            end_date: (new Date()).toISOString(),
                            initiator: null,
                            initiator_department: null,
                            purchase_number: null,
                            protocol_date: null,
                            protocol_number: null,
                            protocol_date_final: null,
                            protocol_number_final: null,
                            purchase_method: null,
                            volume_unit: null,
                            requests_number: null,
                            confirmed_requests_number: null,
                            supplier_name: null,
                            supplier_inn: null,
                            supplier_cost: null,
                            product_type: null,
                            supplier_type: null,
                            agreement_number: null,
                            agreement_date: null,
                            register_month: null,
                            register_number: null,
                            comment: null,
                        })
                    }}
                    disabled={!!newRow}
                >
                    Добавить закупку
                </Button>
            ) : null}
        </div>
    )
}
