import {FC, useCallback, useEffect, useRef, useState} from 'react'
import './Orders.css'
import {useDispatch, useSelector} from 'react-redux'
import {
    addOrderAttachmentsAction,
    createOrderAction,
    deleteOrderAction,
    downloadFileAction,
    getOrderAttachmentsAction,
    getOrdersAction,
    openConfirmationDialogAction,
    openNotificationAction,
    removeOrderAttachmentsAction,
    updateOrderAction
} from '@/store/actions'
import {getAuthSelector, getOrdersSelector} from '@/store/selectors'
import {Button, Dropdown, Empty, Flex, Spin} from 'antd'
import {CloseOutlined, DeleteOutlined, EditOutlined, MoreOutlined, PlusOutlined} from '@ant-design/icons'
import {checkAdmin, getFileIcon} from '@/utils'
import {OrderModal} from '@/modals'
import {Tooltip} from '@/components'

export const Orders: FC = () => {
    const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false)

    const [editingOrder, setEditingOrder] = useState<any>(undefined)

    const [selectedOrder, setSelectedOrder] = useState<any>(undefined)
    const [openOrderAfterCreated, setOpenOrderAfterCreated] = useState<boolean>(false)
    const [lastOrderIdBeforeCreate, setLastOrderIdBeforeCreate] = useState<any>(null)

    const fileInputRef = useRef<any>(null)

    const dispatch = useDispatch()
    const {orders, attachments, isLoading} = useSelector(getOrdersSelector)
    const {userInfo} = useSelector(getAuthSelector)

    useEffect(() => {
        window.document.title = 'Обязательные указания'
        dispatch(getOrdersAction())
    }, [])

    useEffect(() => {
        if (selectedOrder) {
            const element = document.getElementById(selectedOrder.id.toString())

            element?.scrollIntoView({
                behavior: 'instant',
                block: 'center'
            })
            dispatch(getOrderAttachmentsAction(selectedOrder.id, false))
        }
    }, [selectedOrder])

    useEffect(() => {
        if (openOrderAfterCreated && orders?.length && orders[orders.length - 1].id !== lastOrderIdBeforeCreate) {
            setSelectedOrder(orders[orders.length - 1])
            setOpenOrderAfterCreated(false)
            setLastOrderIdBeforeCreate(null)
        }
    }, [openOrderAfterCreated, orders])

    const canEdit = checkAdmin(userInfo?.roles)

    const handleFileChange = useCallback((e) => {
        const files: any[] = Array.from(e.target.files)
        if (files.length === 0) return

        const oneFileMaxSize = 50 * 1024 * 1024
        const maxFilesSize = 100 * 1024 * 1024
        let correctFiles: any[] = []
        let filesSize = 0

        const sendFiles = (_files_, loadAttachments = false) => {
            dispatch(addOrderAttachmentsAction(
                selectedOrder.id,
                _files_.map((f: any) => ({
                    file: f,
                    preview: URL.createObjectURL(f)
                })),
                loadAttachments,
            ))
        }

        for (const file of files) {
            if (file.size > oneFileMaxSize) {
                dispatch(openNotificationAction(
                    'Слишком большой файл',
                    `Размер файла - ${file.name} - превышает ${oneFileMaxSize / 1024 / 1024} МБ`,
                    {nType: 'error'},
                ))
                continue
            }
            if (filesSize + file.size > maxFilesSize && correctFiles.length) {
                sendFiles(correctFiles)
                correctFiles = [file]
                filesSize = file.size
            } else {
                correctFiles.push(file)
                filesSize += file.size
            }
        }
        sendFiles(correctFiles, true)
    }, [selectedOrder])

    const triggerFileInput = () => {
        fileInputRef!.current!.click()
    }

    const editButton = useCallback((order, buttonSize: number, rightOffset: number) => {
        return canEdit ? (
            <Button
                className={'ordersItemEditButton'}
                type={'link'}
                onClick={(e) => e.stopPropagation()}
                style={{
                    height: buttonSize,
                    width: buttonSize,
                    right: rightOffset,
                }}
            >
                <Dropdown
                    trigger={['click']}
                    menu={{
                        items: [
                            {
                                key: 'edit',
                                label: 'Изменить',
                                onClick: () => {
                                    setEditingOrder(order)
                                    setIsOrderModalOpen(true)
                                },
                                icon: <EditOutlined/>,
                            },
                            {
                                key: 'delete',
                                label: 'Удалить',
                                danger: true,
                                onClick: () => {
                                    dispatch(openConfirmationDialogAction({
                                        title: 'Подтверждение',
                                        message: `Удалить обязательное указание - "${order.name}" ?`,
                                        applyText: 'Да',
                                        onApply: () => {
                                            if (order.id === selectedOrder?.id) setSelectedOrder(null)
                                            dispatch(deleteOrderAction(order.id))
                                        },
                                    }))
                                },
                                icon: <DeleteOutlined/>,
                            }
                        ],
                    }}
                    placement={'bottomRight'}
                >
                    <MoreOutlined style={{color: '#6f6f6f', fontSize: buttonSize}}/>
                </Dropdown>
            </Button>
        ) : null
    }, [canEdit, selectedOrder])

    return (
        <div className={'ordersPage'}>
            <Flex
                vertical={false}
                justify={'space-between'}
                style={{
                    marginRight: 20,
                }}
            >
                Обязательные указания
                {canEdit ? (
                    <Button
                        onClick={() => setIsOrderModalOpen(true)}
                        type={'dashed'}
                    >
                        Добавить
                    </Button>
                ) : null}
            </Flex>
            {isLoading ? (
                <div className={'ordersSpinContainer'}>
                    <Spin/>
                </div>
            ) : orders?.length ? (
                <div
                    className={'ordersListContainer'}
                    style={selectedOrder ? {
                        height: 240
                    } : {}}
                >
                    {orders?.map((order) => (
                        <div
                            key={order.id}
                            id={order.id}
                            className={`ordersItemContainer ${selectedOrder?.id === order.id ? 'ordersItemContainerSelected' : ''}`}
                            onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? undefined : order)}
                        >
                            <div className={'ordersItem'}>
                                {editButton(order, 14, 4)}
                                <p
                                    className={'ordersItemName'}
                                    style={{
                                        marginRight: canEdit ? 20 : 5,
                                    }}
                                >
                                    {order.name}
                                </p>
                                <p
                                    className={'ordersItemDescription'}
                                    style={{
                                        WebkitLineClamp: order.attachments_count ? 3 : 4,
                                    }}
                                >
                                    {order.description}
                                </p>
                                {order.attachments_count ? (
                                    <p className={'ordersItemAttachmentsCount'}>
                                        <span>{'Файлы: ' + order.attachments_count}</span>
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={'ordersSpinContainer'}>
                    <Empty description={'Ничего не найдено'}/>
                </div>
            )}
            {selectedOrder ? (
                <Flex className={'ordersSelectedOrderContainer'} vertical={false}>
                    {editButton(selectedOrder, 22, 55)}
                    <Button
                        className={'ordersItemEditButton ordersCloseOrderButton'}
                        type={'link'}
                        onClick={() => setSelectedOrder(null)}
                    >
                        <CloseOutlined className={'ordersCloseOrderButtonIcon'}/>
                    </Button>

                    <div className={'ordersSelectedOrderInfoContainer'}>
                        <br/>
                        <b>Название </b>
                        <p>{selectedOrder.name}</p>
                        <br/>
                        <b>Описание</b>
                        <pre>{selectedOrder.description}</pre>
                        {canEdit || attachments?.length ? (
                            <>
                                <br/>
                                <b>Прикреплённые файлы</b>
                            </>
                        ) : null}
                        <div
                            className={'ordersAttachmentsContainer'}
                        >
                            {attachments?.length ? (
                                attachments?.map((attachment) => (
                                    <Tooltip
                                        key={attachment.id}
                                        value={(
                                            <div className={'ordersAttachmentItem'}>
                                                {attachment.mimetype.indexOf('image') !== -1 ? (
                                                    <img
                                                        className={'ordersAttachmentItemImage'}
                                                        style={{
                                                            opacity: attachment.isLoading ? 0.2 : 1,
                                                            height: 38,
                                                            placeSelf: 'center',
                                                        }}
                                                        src={attachment.url}
                                                    />
                                                ) : (
                                                    <div
                                                        className={'ordersAttachmentItemImage'}
                                                        style={{
                                                            opacity: attachment.isLoading ? 0.2 : 1,
                                                        }}
                                                    >
                                                        {getFileIcon(attachment.mimetype)}
                                                    </div>
                                                )}
                                                {attachment.isLoading ? (
                                                    <div className={'ordersAttachmentsSpinContainer'}>
                                                        <Spin/>
                                                    </div>
                                                ) : null}
                                                {canEdit && !attachment.isLoading ? (
                                                    <button
                                                        className={'ordersAttachmentsRemoveButton'}
                                                        onClick={() => {
                                                            dispatch(openConfirmationDialogAction({
                                                                title: 'Подтверждение',
                                                                message: `Удалить прикреплённый файл "${attachment.filename}" ?`,
                                                                applyText: 'Да',
                                                                onApply: () => dispatch(removeOrderAttachmentsAction(selectedOrder.id, [attachment.id])),
                                                            }))
                                                        }}
                                                    >
                                                        ×
                                                    </button>
                                                ) : null}
                                            </div>
                                        )}
                                        title={(
                                            <div>
                                                <p>{attachment.filename}</p>
                                                {!attachment.isLoading ? (
                                                    <Button
                                                        type={'link'}
                                                        onClick={() => dispatch(
                                                            downloadFileAction(
                                                                attachment.url,
                                                                attachment.filename,
                                                            )
                                                        )}
                                                    >
                                                        Скачать
                                                    </Button>
                                                ) : null}
                                            </div>
                                        )}
                                    />
                                ))
                            ) : null}
                            {canEdit ? (
                                <Button
                                    className={'ordersAttachmentsAddButton'}
                                    size={'small'}
                                    type={'link'}
                                    onClick={triggerFileInput}
                                    disabled={attachments?.some((attachment) => attachment.isLoading)}
                                >
                                    <input
                                        className={'ordersAttachmentsAddButtonFile'}
                                        type={'file'}
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        multiple
                                        accept={'*'}
                                    />
                                    <PlusOutlined/>
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </Flex>
            ) : null}
            <OrderModal
                isOpen={isOrderModalOpen}
                onAccept={(name: string, description: string) => {
                    setIsOrderModalOpen(false)
                    if (editingOrder) {
                        dispatch(updateOrderAction(editingOrder.id, name, description))
                        if (selectedOrder?.id === editingOrder.id)
                            setSelectedOrder({
                                id: selectedOrder.id,
                                name,
                                description,
                            })
                    } else {
                        setOpenOrderAfterCreated(true)
                        if (orders?.length) setLastOrderIdBeforeCreate(orders[orders.length - 1].id)
                        dispatch(createOrderAction(name, description))
                    }
                    setEditingOrder(null)
                }}
                onClose={() => {
                    setIsOrderModalOpen(false)
                    setEditingOrder(null)
                }}
                title={editingOrder ? 'Обновить обязательное указание' : 'Создать обязательное указание'}
                defaultName={editingOrder?.name}
                defaultDescription={editingOrder?.description}
            />
        </div>
    )
}
