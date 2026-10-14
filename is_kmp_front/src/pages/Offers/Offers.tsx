import {FC, useCallback, useEffect, useRef, useState} from 'react'
import './Offers.css'
import {useDispatch, useSelector} from 'react-redux'
import {
    addOfferAttachmentsAction,
    createOfferAction,
    deleteOfferAction,
    downloadFileAction,
    getOfferAttachmentsAction,
    getOfferCommentsAction,
    getOffersAction,
    getUserProfilesAction,
    openConfirmationDialogAction,
    openNotificationAction,
    readCommentAction,
    removeOfferAttachmentsAction,
    sendCommentAction,
    updateOfferAction
} from '@/store/actions'
import {getAuthSelector, getChatsSelector, getOffersSelector} from '@/store/selectors'
import {Button, Divider, Dropdown, Empty, Flex, Spin, Splitter} from 'antd'
import {
    ArrowDownOutlined,
    CloseOutlined,
    DeleteOutlined,
    EditOutlined,
    MoreOutlined,
    PlusOutlined
} from '@ant-design/icons'
import {checkAdmin, getFileIcon} from '@/utils'
import {Badge, Message, MessageInput, Tooltip} from '@/components'
import {InView} from 'react-intersection-observer'
import {createOfferCommentsWS, offerCommentsWS} from '@/services'
import secureLocalStorage from 'react-secure-storage'
import {useNavigate} from 'react-router'
import {OfferModal} from '@/modals'

export const Offers: FC = () => {
    const [isOfferModalOpen, setIsOffsetModalOpen] = useState<boolean>(false)

    const [editingOffer, setEditingOffer] = useState<any>(undefined)

    const [selectedOffer, setSelectedOffer] = useState<any>(undefined)
    const [openOfferAfterCreated, setOpenOfferAfterCreated] = useState<boolean>(false)
    const [lastOfferIdBeforeCreate, setLastOfferIdBeforeCreate] = useState<any>(null)

    const [highlightScrolledComment, setHighlightScrolledComment] = useState<any>(undefined)
    const [highlightScrolledCommentTimeout, setHighlightScrolledCommentTimeout] = useState<any>(undefined)
    const [lastCommentBeforeNewComment, setLastCommentBeforeNewComment] = useState<any>(undefined)
    const [scrollToLastReadComment, setScrollToLastReadComment] = useState<boolean>(false)
    const [isCommentInputBottomVisible, setIsCommentInputBottomVisible] = useState<boolean>(true)

    const [commentInput, setCommentInput] = useState<string>('')
    const [splitterSize, setSplitterSize] = useState<(number | string)[]>([0.5, 0.5])

    const [selectedParentComment, setSelectedParentComment] = useState<any>(undefined)

    const commentsContainerRef = useRef<any>(undefined)
    const fileInputRef = useRef<any>(null)

    const navigate = useNavigate()

    const dispatch = useDispatch()
    const {
        offers,
        comments,
        attachments,
        lastReadCommentId,
        isLoading,
        isLoadingComments
    } = useSelector(getOffersSelector)
    const {userInfo, lastLoggedInUpdate, isOnline} = useSelector(getAuthSelector)

    const {userProfiles} = useSelector(getChatsSelector)

    useEffect(() => {
        window.document.title = 'Предложения'
        dispatch(getOffersAction())
        if (!userProfiles?.length) dispatch(getUserProfilesAction(true))
    }, [])

    useEffect(() => {
        if (selectedOffer) {
            const element = document.getElementById(selectedOffer.id.toString())

            element?.scrollIntoView({
                behavior: 'instant',
                block: 'center'
            })
            setCommentInput('')
            setSelectedParentComment(undefined)
            dispatch(getOfferCommentsAction(selectedOffer.id, false))
            dispatch(getOfferAttachmentsAction(selectedOffer.id, false))
            setScrollToLastReadComment(true)
            setIsCommentInputBottomVisible(true)
        }
    }, [selectedOffer])

    useEffect(() => {
        if (lastCommentBeforeNewComment && !!comments?.[0]?.id && comments?.[0]?.id !== lastCommentBeforeNewComment) {
            scrollToTop()
            setLastCommentBeforeNewComment(undefined)
        }
    }, [comments, lastCommentBeforeNewComment])

    useEffect(() => {
        offerCommentsWS?.close()
        if (selectedOffer) {
            createOfferCommentsWS(selectedOffer.id, dispatch)
        }
    }, [selectedOffer, lastLoggedInUpdate])

    useEffect(() => {
        if (selectedOffer) {
            const selectedOfferInState = offers?.find(offer => offer?.id === selectedOffer?.id)
            if (!selectedOfferInState) setSelectedOffer(null)
        }
    }, [offers, selectedOffer])

    useEffect(() => {
        if (openOfferAfterCreated && offers?.length && offers[offers.length - 1].id !== lastOfferIdBeforeCreate) {
            setSelectedOffer(offers[offers.length - 1])
            setOpenOfferAfterCreated(false)
            setLastOfferIdBeforeCreate(null)
        }
    }, [openOfferAfterCreated, offers])

    const scrollToTop = useCallback(() => {
        if (comments?.[0]?.unread_by_current_user) dispatch(readCommentAction(selectedOffer?.id, comments?.[0]?.id, true))
        commentsContainerRef?.current?.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }, [selectedOffer, commentsContainerRef, comments])

    const canEdit = checkAdmin(userInfo?.roles)

    const handleFileChange = useCallback((e) => {
        const files: any[] = Array.from(e.target.files)
        if (files.length === 0) return

        const oneFileMaxSize = 50 * 1024 * 1024
        const maxFilesSize = 100 * 1024 * 1024
        let correctFiles: any[] = []
        let filesSize = 0

        const sendFiles = (_files_, loadAttachments = false) => {
            dispatch(addOfferAttachmentsAction(
                selectedOffer.id,
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
    }, [selectedOffer])

    const triggerFileInput = () => {
        fileInputRef!.current!.click()
    }

    const scrollToComment = useCallback((commentId: number, highlightComment: boolean = true) => {
        const element = document.getElementById(commentId?.toString())

        let successScroll = false

        if (element && commentsContainerRef?.current) {
            commentsContainerRef?.current?.scrollTo({
                top: element.offsetTop - element.offsetHeight * 0.5 - commentsContainerRef.current.offsetHeight * 0.4,
                behavior: highlightComment ? 'smooth' : 'instant',
            })
            successScroll = true
        }

        clearTimeout(highlightScrolledCommentTimeout)

        if (highlightComment) {
            setHighlightScrolledComment(commentId)
            setHighlightScrolledCommentTimeout(
                setTimeout(
                    () => {
                        setHighlightScrolledComment(undefined)
                        setHighlightScrolledCommentTimeout(undefined)
                    },
                    1000,
                )
            )
        }

        return successScroll
    }, [highlightScrolledCommentTimeout, commentsContainerRef])

    useEffect(() => {
        if (scrollToLastReadComment && comments?.length) {
            if (lastReadCommentId) {
                if (scrollToComment(lastReadCommentId, false)) setScrollToLastReadComment(false)
            } else {
                scrollToTop()
                setScrollToLastReadComment(false)
            }
        }
    }, [scrollToLastReadComment, comments, lastReadCommentId, scrollToComment, scrollToTop])

    const editButton = useCallback((offer, buttonSize: number, rightOffset: number) => {
        return canEdit ? (
            <Button
                className={'offersItemEditButton'}
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
                                    setEditingOffer(offer)
                                    setIsOffsetModalOpen(true)
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
                                        message: `Удалить предложение - "${offer.name}" ?`,
                                        applyText: 'Да',
                                        onApply: () => {
                                            if (offer.id === selectedOffer?.id) setSelectedOffer(null)
                                            dispatch(deleteOfferAction(offer.id))
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
    }, [canEdit, selectedOffer])

    return (
        <div className={'offersPage'}>
            <Flex
                vertical={false}
                justify={'space-between'}
                style={{
                    marginRight: 20,
                }}
            >
                Предложения
                {canEdit ? (
                    <Button
                        onClick={() => setIsOffsetModalOpen(true)}
                        type={'dashed'}
                    >
                        Добавить
                    </Button>
                ) : null}
            </Flex>
            {isLoading ? (
                <div className={'offersSpinContainer'}>
                    <Spin/>
                </div>
            ) : offers?.length ? (
                <div
                    className={'offersListContainer'}
                    style={selectedOffer ? {
                        height: 240
                    } : {}}
                >
                    {offers?.map((offer) => (
                        <div
                            key={offer.id}
                            id={offer.id}
                            className={`offersItemContainer ${selectedOffer?.id === offer.id ? 'offersItemContainerSelected' : ''}`}
                            onClick={() => setSelectedOffer(selectedOffer?.id === offer.id ? undefined : offer)}
                        >
                            <Badge
                                value={offer.unread_comments_count}
                                xOffset={-10}
                                yOffset={-10}
                            >
                                <div
                                    className={'offersItem'}
                                    style={{
                                        paddingTop: offer.comments_count || offer.attachments_count ? 8 : 20,
                                    }}
                                >
                                    {editButton(offer, 14, 4)}
                                    <p
                                        className={'offersItemName'}
                                        style={{
                                            marginRight: canEdit ? 20 : 5,
                                        }}
                                    >
                                        {offer.name + ' (' + offer.offer_company + ')'}
                                    </p>
                                    <p
                                        className={'offersItemDescription'}
                                        style={{
                                            WebkitLineClamp: offer.comments_count || offer.attachments_count ? 3 : 4,
                                        }}
                                    >
                                        {offer.description}
                                    </p>
                                    {offer.attachments_count || offer.comments_count ? (
                                        <p className={'offersItemCommentsCount'}>
                                            {offer.attachments_count ? (
                                                <span>{'Файлы: ' + offer.attachments_count}</span>
                                            ) : null}
                                            {offer.comments_count ? (
                                                <span>{'Комментарии: ' + offer.comments_count}</span>
                                            ) : null}
                                        </p>
                                    ) : null}
                                </div>
                            </Badge>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={'offersSpinContainer'}>
                    <Empty description={'Ничего не найдено'}/>
                </div>
            )}
            {selectedOffer ? (
                <Flex className={'offersSelectedOfferContainer'} vertical={false}>
                    {editButton(selectedOffer, 22, 55)}
                    <Button
                        className={'offersItemEditButton offersCloseOfferButton'}
                        type={'link'}
                        onClick={() => setSelectedOffer(null)}
                    >
                        <CloseOutlined className={'offersCloseOfferButtonIcon'}/>
                    </Button>
                    <div splitter-collapse-visible={!splitterSize[0] || !splitterSize[1] ? 'visible' : ''}
                         style={{width: '100%'}}>
                        <Splitter
                            onResize={setSplitterSize}
                            layout={'vertical'}
                        >
                            <Splitter.Panel
                                size={splitterSize[0]}
                                min={150}
                                resizable
                                collapsible
                            >
                                <div className={'offersSelectedOfferInfoContainer'}>
                                    <b>От компании </b>
                                    <p>{selectedOffer.offer_company}</p>
                                    <br/>
                                    <b>Название </b>
                                    <p>{selectedOffer.name}</p>
                                    <br/>
                                    <b>Описание</b>
                                    <pre>{selectedOffer.description}</pre>
                                    {canEdit || attachments?.length ? (
                                        <>
                                            <br/>
                                            <b>Прикреплённые файлы</b>
                                        </>
                                    ) : null}
                                    <div
                                        className={'offersAttachmentsContainer'}
                                    >
                                        {attachments?.length ? (
                                            attachments?.map((attachment) => (
                                                <Tooltip
                                                    key={attachment.id}
                                                    value={(
                                                        <div className={'offersAttachmentItem'}>
                                                            {attachment.mimetype.indexOf('image') !== -1 ? (
                                                                <img
                                                                    className={'offersAttachmentItemImage'}
                                                                    style={{
                                                                        opacity: attachment.isLoading ? 0.2 : 1,
                                                                        height: 38,
                                                                        placeSelf: 'center',
                                                                    }}
                                                                    src={attachment.url}
                                                                />
                                                            ) : (
                                                                <div
                                                                    className={'offersAttachmentItemImage'}
                                                                    style={{
                                                                        opacity: attachment.isLoading ? 0.2 : 1,
                                                                    }}
                                                                >
                                                                    {getFileIcon(attachment.mimetype)}
                                                                </div>
                                                            )}
                                                            {attachment.isLoading ? (
                                                                <div className={'offersAttachmentsSpinContainer'}>
                                                                    <Spin/>
                                                                </div>
                                                            ) : null}
                                                            {canEdit && !attachment.isLoading ? (
                                                                <button
                                                                    className={'offersAttachmentsRemoveButton'}
                                                                    onClick={() => {
                                                                        dispatch(openConfirmationDialogAction({
                                                                            title: 'Подтверждение',
                                                                            message: `Удалить прикреплённый файл "${attachment.filename}" ?`,
                                                                            applyText: 'Да',
                                                                            onApply: () => dispatch(removeOfferAttachmentsAction(selectedOffer.id, [attachment.id])),
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
                                                className={'offersAttachmentsAddButton'}
                                                size={'small'}
                                                type={'link'}
                                                onClick={triggerFileInput}
                                                disabled={attachments?.some((attachment) => attachment.isLoading)}
                                            >
                                                <input
                                                    className={'offersAttachmentsAddButtonFile'}
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
                            </Splitter.Panel>
                            <Splitter.Panel
                                size={splitterSize[1]}
                                min={150}
                                resizable
                                collapsible
                            >
                                <Flex
                                    vertical
                                    className={'offersSelectedOfferCommentsContainer'}
                                >
                                    <b className={'offersSelectedOfferCommentsTitle'}>Комментарии</b>
                                    <Flex
                                        vertical
                                        className={'offersSelectedOfferComments'}
                                        ref={commentsContainerRef}
                                    >
                                        {isLoadingComments ? (
                                            <div className={'offersSpinContainer'}>
                                                <Spin/>
                                            </div>
                                        ) : comments?.length ? (
                                            comments?.map((comment, index) => (
                                                <div key={comment.id}>
                                                    {index === 0 ? (
                                                        <InView
                                                            as={'div'}
                                                            onChange={(isView) => setIsCommentInputBottomVisible(isView)}
                                                        />
                                                    ) : null}
                                                    <Message
                                                        message={{
                                                            ...comment,
                                                            parent_message_id: comment.parent_comment_id
                                                        }}
                                                        isHighlighting={highlightScrolledComment === comment.id}
                                                        onMessageRead={() => {
                                                            if (!scrollToLastReadComment && isOnline) dispatch(readCommentAction(selectedOffer?.id, comment.id, true))
                                                        }}
                                                        authUserId={userInfo?.user_id}
                                                        onMessageDoubleClick={() => setSelectedParentComment(comment)}
                                                        isGroupChat={true}
                                                        participants={userProfiles.map((userProfile) => ({
                                                            ...userProfile,
                                                            ...userProfile.user,
                                                            company: userProfile.company.short_name,
                                                        }))}
                                                        openPersonalChat={(userId) => {
                                                            secureLocalStorage.setItem('openPersonalChatWithUser', userId)
                                                            navigate('/messages')
                                                        }}
                                                        getParentMessageAndUser={() => {
                                                            const parentComment = comments.find((c) => c.id === comment.parent_comment_id)
                                                            return [parentComment, userProfiles?.find(userProfile => userProfile.user?.id === parentComment.author_id)]
                                                        }}
                                                        scrollToMessage={(commentId) => scrollToComment(commentId)}
                                                    />
                                                    {(
                                                        comment.id === lastReadCommentId &&
                                                        index !== 0
                                                    ) ? <Divider plain>Новые комментарии</Divider> : null}
                                                </div>
                                            ))
                                        ) : (
                                            <div className={'offersSpinContainer'}>
                                                <Empty description={'Комментарии отсутствуют'}/>
                                            </div>
                                        )}
                                    </Flex>
                                    <div style={{position: 'relative'}}>
                                        {!isCommentInputBottomVisible ? (
                                            <div className={'offersScrollToCommentsBottomButtonContainer'}>
                                                <Badge
                                                    value={offers?.find((offer) => selectedOffer.id === offer.id)?.unread_comments_count}
                                                    xOffset={15}
                                                    yOffset={-5}
                                                >
                                                    <Button
                                                        className={'offersScrollToChatBottomButton'}
                                                        shape={'round'}
                                                        onClick={scrollToTop}
                                                        size={'small'}
                                                    >
                                                        <ArrowDownOutlined/>
                                                    </Button>
                                                </Badge>
                                            </div>
                                        ) : null}
                                        <MessageInput
                                            onTextInput={(text) => setCommentInput(text)}
                                            textInput={commentInput}
                                            onSendPress={() => {
                                                dispatch(sendCommentAction(selectedOffer.id, commentInput, selectedParentComment?.id))
                                                setCommentInput('')
                                                setSelectedParentComment(null)
                                                setLastCommentBeforeNewComment(comments?.[0]?.id)
                                            }}
                                            textInputPlaceholder={'Введите комментарий'}
                                            parentMessage={selectedParentComment}
                                            onRemoveParentMessage={() => setSelectedParentComment(null)}
                                        />
                                    </div>
                                </Flex>
                            </Splitter.Panel>
                        </Splitter>
                    </div>
                </Flex>
            ) : null}
            <OfferModal
                isOpen={isOfferModalOpen}
                onAccept={(name: string, description: string, company: string) => {
                    setIsOffsetModalOpen(false)
                    if (editingOffer) {
                        dispatch(updateOfferAction(editingOffer.id, name, description, company))
                        if (selectedOffer?.id === editingOffer.id)
                            setSelectedOffer({
                                id: selectedOffer.id,
                                name,
                                description,
                                offer_company: company,
                            })
                    } else {
                        setOpenOfferAfterCreated(true)
                        if (offers?.length) setLastOfferIdBeforeCreate(offers[offers.length - 1].id)
                        dispatch(createOfferAction(name, description, company))
                    }
                    setEditingOffer(null)
                }}
                onClose={() => {
                    setIsOffsetModalOpen(false)
                    setEditingOffer(null)
                }}
                title={editingOffer ? 'Обновить предложение' : 'Создать предложение'}
                defaultName={editingOffer?.name}
                defaultDescription={editingOffer?.description}
                defaultCompany={editingOffer?.offer_company}
            />
        </div>
    )
}
