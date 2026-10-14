import {FC, useCallback, useEffect, useRef, useState} from 'react'
import './ITProjects.css'
import {useDispatch, useSelector} from 'react-redux'
import {getAuthSelector, getItProjectsSelector} from '@/store/selectors'
import {Button, Spin} from 'antd'
import {Table, Tooltip} from '@/components'
import {EditFilled} from '@ant-design/icons'
import {
    createITProjectAction,
    deleteITProjectAction,
    getITProjectsAction,
    openConfirmationDialogAction,
    updateITProjectAction
} from '@/store/actions'
import {checkITSpecialistOrAdmin} from '@/utils'


export const ITProjects: FC = () => {
    const {itProjects, isLoading} = useSelector(getItProjectsSelector)
    const {userInfo, userSelectedChildCompany} = useSelector(getAuthSelector)
    const dispatch = useDispatch()
    const tableRef = useRef(null)
    const [newRow, setNewRow] = useState<any>(undefined)
    const [editingEnabled, setEditingEnabled] = useState<boolean>(false)

    useEffect(() => {
        window.document.title = 'ИТ Проекты'
        dispatch(getITProjectsAction())
    }, [])

    useEffect(() => {
        dispatch(getITProjectsAction())
    }, [userSelectedChildCompany])

    useEffect(() => {
        if (newRow && tableRef?.current) {
            (tableRef.current as any).scrollTo({key: 'new'})
        }
    }, [newRow])

    const canEdit = checkITSpecialistOrAdmin(userInfo?.roles)

    const updateData = useCallback((row: any, dataIndex: string, newValue: any) => {
        const updatedRow = {...row, [dataIndex]: newValue}
        if (row.id === 'new') {
            setNewRow(updatedRow)
            if (updatedRow.name && updatedRow.description && updatedRow.purpose && updatedRow.initiator && updatedRow.leader) {
                dispatch(createITProjectAction(
                    updatedRow.name.trim(),
                    updatedRow.description.trim(),
                    updatedRow.purpose.trim(),
                    updatedRow.initiator.trim(),
                    updatedRow.leader.trim(),
                    updatedRow.budget,
                    updatedRow.start_date,
                    updatedRow.end_date,
                ))
                setNewRow(undefined)
            }
        } else if (row[dataIndex] !== newValue) {
            dispatch(updateITProjectAction(
                updatedRow.id,
                updatedRow.name.trim(),
                updatedRow.description.trim(),
                updatedRow.purpose.trim(),
                updatedRow.initiator.trim(),
                updatedRow.leader.trim(),
                updatedRow.budget,
                updatedRow.start_date,
                updatedRow.end_date,
            ))
        }
    }, [])

    const deleteData = useCallback((row: any) => {
        dispatch(deleteITProjectAction(row.id))
    }, [])

    return (
        <div className={'ITProjectsPage'}>
            ИТ Проекты
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
                                top: 90,
                                right: 25,
                            }}
                            onClick={() => {
                                setEditingEnabled(!editingEnabled)
                                setNewRow(undefined)
                            }}
                        />
                    )}
                />
            ) : null}


            {isLoading ? (
                <div
                    style={{
                        height: 'calc(100vh - 235px)',
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
                    data={itProjects}
                    newRow={newRow}
                    columns={[
                        {
                            title: 'Название',
                            // title: (
                            //     <Tooltip
                            //         title={'ADASD asds kdlaskd akdakd ;ka;d s;dk as;dkADASD asds kdlaskd akdakd ;ka;d s;dk as;dkADASD asds kdlaskd akdakd ;ka;d s;dk as;dkADASD asds kdlaskd akdakd ;ka;d s;dk as;dkADASD asds kdlaskd akdakd ;ka;d s;dk as;dk'}
                            //         value={(<p style={{
                            //             transform: [{rotate: 90}]
                            //         }}>Название</p>)}
                            //     />
                            // ),
                            dataIndex: 'name',
                            width: 200,
                            type: 'textarea',
                            editable: canEdit && editingEnabled,
                            handleSave: updateData,
                            placeholder: 'Введите название',
                            enableSorting: true,
                        },
                        {
                            title: 'Описание',
                            dataIndex: 'description',
                            width: '25%',
                            minWidth: 250,
                            type: 'textarea',
                            editable: canEdit && editingEnabled,
                            handleSave: updateData,
                            placeholder: 'Введите описание',
                            enableSorting: true,
                        },
                        {
                            title: 'Цель',
                            dataIndex: 'purpose',
                            width: '30%',
                            minWidth: 250,
                            type: 'textarea',
                            editable: canEdit && editingEnabled,
                            handleSave: updateData,
                            placeholder: 'Введите цель',
                            enableSorting: true,
                        },
                        {
                            title: 'Инициатор',
                            dataIndex: 'initiator',
                            width: 250,
                            type: 'textarea',
                            editable: canEdit && editingEnabled,
                            handleSave: updateData,
                            placeholder: 'Введите инициатора',
                            enableSorting: true,
                        },
                        {
                            title: 'Лидер',
                            dataIndex: 'leader',
                            width: 250,
                            type: 'textarea',
                            editable: canEdit && editingEnabled,
                            handleSave: updateData,
                            placeholder: 'Введите лидера',
                            enableSorting: true,
                        },
                        {
                            title: 'Бюджет',
                            dataIndex: 'budget',
                            type: 'number',
                            width: 200,
                            editable: canEdit && editingEnabled,
                            handleSave: updateData,
                            placeholder: 'Введите бюджет',
                            enableSorting: true,
                        },
                        {
                            title: 'Дата начала',
                            dataIndex: 'start_date',
                            type: 'date',
                            editable: canEdit && editingEnabled,
                            handleSave: updateData,
                            enableSorting: true,
                        },
                        {
                            title: 'Дата окончания',
                            dataIndex: 'end_date',
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
                            message: `Удалить ИТ Проект - "${row.name}" ?`,
                            applyText: 'Да',
                            onApply: () => deleteData(row),
                        }))
                    )}
                />
            )}
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
                    onClick={() => {
                        setEditingEnabled(true)
                        setNewRow({
                            id: 'new',
                            name: '',
                            description: '',
                            purpose: '',
                            initiator: '',
                            leader: '',
                            budget: 0,
                            start_date: (new Date()).toISOString(),
                            end_date: (new Date()).toISOString(),
                        })
                    }}
                    disabled={!!newRow}
                >
                    Добавить проект
                </Button>
            ) : null}
        </div>
    )
}
