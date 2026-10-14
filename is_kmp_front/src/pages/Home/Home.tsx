import {FC, useCallback, useEffect, useState} from 'react'
import './Home.css'
import {
    addCompanySoftwareAction,
    addSoftwareVersionAction,
    createSoftwareAction,
    deleteCompanySoftwareAction,
    getCompanySoftwareAction,
    getCompanySoftwareByClassesAction,
    getImplementationStatusesAction,
    getSoftwareAction,
    getSoftwareClassesAction,
    getSoftwareTagsAction,
    openConfirmationDialogAction,
    updateCompanySoftwareAction,
    updateSoftwareAction,
} from '@/store/actions'
import {useDispatch, useSelector} from 'react-redux'
import {Button, Collapse, Divider, Dropdown, Empty, Flex, Select, Spin, Tabs} from 'antd'
import {Tooltip} from '@/components'
import {CompanySoftwareModal, SoftwareModal, SoftwareVersionModal} from '@/modals'
import {getAuthSelector, getCompanySoftwareSelector} from '@/store/selectors'
import {DeleteOutlined, EditOutlined, MoreOutlined} from '@ant-design/icons'
import {MODES} from '@/consts'
import {checkITSpecialistOrAdmin} from '@/utils'

const TABS = {
    COMPANY_SOFTWARE: 'COMPANY_SOFTWARE',
    COMPANY_SOFTWARE_BY_CLASSES: 'COMPANY_SOFTWARE_BY_CLASSES',
}

export const Home: FC = () => {
    const dispatch = useDispatch()
    const {
        companySoftware,
        companySoftwareByClasses,
        software,
        softwareClasses,
        softwareTags,
        implementationStatuses,
    } = useSelector(getCompanySoftwareSelector)
    const {userInfo, userSelectedChildCompany} = useSelector(getAuthSelector)

    const [currentTab, setCurrentTab] = useState<string>(TABS.COMPANY_SOFTWARE)

    const [isCompanySoftwareModalOpen, setIsCompanySoftwareModalOpen] = useState<boolean>(false)
    const [editingCompanySoftware, setEditingCompanySoftware] = useState<any>(undefined)
    const [createdSoftwareName, setCreatedSoftwareName] = useState<string>('')
    const [defaultSelectedSoftwareId, setDefaultSelectedSoftwareId] = useState<number | undefined>(undefined)
    const [isSoftwareModalOpen, setIsSoftwareModalOpen] = useState<boolean>(false)
    const [addedSoftwareVersion, setAddedSoftwareVersion] = useState<string>('')
    const [softwareAddVersionTo, setSoftwareAddVersionTo] = useState<any>(undefined)
    const [isSoftwareVersionModalOpen, setIsSoftwareVersionModalOpen] = useState<boolean>(false)
    const [softwareVersionModalDefaultVersion, setSoftwareVersionModalDefaultVersion] = useState<string>('')
    const [softwareModalDefaultName, setSoftwareModalDefaultName] = useState<string>('')

    const [selectedImplementationStatuses, setSelectedImplementationStatuses] = useState<number[]>([-1])
    const [selectedSoftwareClasses, setSelectedSoftwareClasses] = useState<number[]>([-1])
    const [selectedSoftwareTags, setSelectedSoftwareTags] = useState<number[]>([-1])
    const [filteredCompanySoftware, setFilteredCompanySoftware] = useState<any[]>([])

    const [viewingSoftware, setViewingSoftware] = useState<any>(undefined)
    const [editingSoftware, setEditingSoftware] = useState<any>(undefined)
    const [waitingSoftwareUpdate, setWaitingSoftwareUpdate] = useState<boolean>(false)

    const getData = useCallback(() => {
        if (currentTab === TABS.COMPANY_SOFTWARE) dispatch(getCompanySoftwareAction())
        else dispatch(getCompanySoftwareByClassesAction())
    }, [currentTab])

    useEffect(() => {
        window.document.title = 'Личный кабинет'
        getData()
        dispatch(getImplementationStatusesAction())
        dispatch(getSoftwareClassesAction())
        dispatch(getSoftwareTagsAction())
    }, [])

    useEffect(() => {
        getData()
    }, [userSelectedChildCompany])

    useEffect(() => {
        if (!userInfo?.roles?.length && !softwareTags?.length) return

        if (checkITSpecialistOrAdmin(userInfo?.roles)) {
            dispatch(getSoftwareAction(true))
        }
    }, [userInfo])

    useEffect(() => {
        getData()
    }, [currentTab])

    useEffect(() => {
        let filteredData = companySoftware.data

        if (selectedImplementationStatuses[0] !== -1)
            filteredData = filteredData.filter(
                (cs) => selectedImplementationStatuses.some(
                    (s) => s === cs.implementation_status.id
                )
            )

        if (selectedSoftwareClasses[0] !== -1)
            filteredData = filteredData.filter(
                (cs) => selectedSoftwareClasses.some(
                    (c) => (
                        cs.software?.main_class?.id === c ||
                        cs.software?.additional_classes?.some(
                            (sc) => sc.id === c
                        )
                    )
                )
            )

        if (selectedSoftwareTags[0] !== -1)
            filteredData = filteredData.filter(
                (cs) => selectedSoftwareTags.some(
                    (t) => cs.software?.tags?.some(
                        (st) => st.id === t
                    )
                )
            )

        setFilteredCompanySoftware(filteredData)
    }, [companySoftware, selectedImplementationStatuses, selectedSoftwareClasses, selectedSoftwareTags])

    useEffect(() => {
        if (
            waitingSoftwareUpdate &&
            editingCompanySoftware &&
            !companySoftware?.isLoading &&
            companySoftware?.data?.length
        ) {
            const updatedCompanySoftware = companySoftware.data.find(cs => cs.id === editingCompanySoftware.id)
            if (!updatedCompanySoftware) {
                setWaitingSoftwareUpdate(false)
            }

            if (
                editingCompanySoftware.software?.name !== updatedCompanySoftware?.software?.name ||
                editingCompanySoftware.software?.description !== updatedCompanySoftware?.software?.description ||
                editingCompanySoftware.software?.art_number !== updatedCompanySoftware?.software?.art_number ||
                editingCompanySoftware.software?.register_number !== updatedCompanySoftware?.software?.register_number ||
                updatedCompanySoftware.software?.main_class?.id !== editingCompanySoftware?.software?.main_class?.id ||
                updatedCompanySoftware.software?.additional_classes?.length !== editingCompanySoftware?.software?.additional_classes?.length ||
                updatedCompanySoftware.software?.additional_classes?.some((newClassId) => !editingCompanySoftware?.software?.additional_classes?.includes(newClassId)) ||
                updatedCompanySoftware.software?.tags?.length !== editingCompanySoftware?.software?.tags?.length ||
                updatedCompanySoftware.software?.tags?.some((newTagId) => !editingCompanySoftware?.software?.tags?.includes(newTagId))
            ) {
                setWaitingSoftwareUpdate(false)
                setEditingCompanySoftware(updatedCompanySoftware)
            }
        }
    }, [waitingSoftwareUpdate, editingCompanySoftware, companySoftware])

    useEffect(() => {
        if (createdSoftwareName) {
            const createdSoftware = software.find((s) => s.name === createdSoftwareName)
            if (createdSoftware) {
                setDefaultSelectedSoftwareId(createdSoftware.id)
            }
        }
    }, [software])

    const canEdit = checkITSpecialistOrAdmin(userInfo?.roles)

    const getCompanySoftwareContent = useCallback(() => {
        if (companySoftware.isLoading)
            return (
                <div className={'homePageSpinContainer'}>
                    <Spin/>
                </div>
            )

        return (
            <>
                <Flex
                    vertical={false}
                    style={{
                        overflowY: 'auto',
                        marginRight: canEdit ? 130 : 0,
                    }}
                >
                    <Flex vertical className={'homePageSelectContainer'}>
                        <p>Фильтр по статусу эксплуатации</p>
                        <Select
                            className={'homePageSelect'}
                            showSearch={false}
                            mode={'multiple'}
                            value={selectedImplementationStatuses}
                            options={[
                                {
                                    label: 'Любой',
                                    value: -1,
                                },
                                ...implementationStatuses.map((s) => ({
                                    color: s.color,
                                    label: s.name,
                                    value: s.id,
                                })),
                            ]}
                            onDeselect={(value) => {
                                if (value === -1) return
                                let newSelectedStatuses = selectedImplementationStatuses.filter(t => t !== value)
                                if (!newSelectedStatuses.length) newSelectedStatuses = [-1]
                                setSelectedImplementationStatuses(newSelectedStatuses)
                            }}
                            onSelect={(value) => {
                                if (value === -1) setSelectedImplementationStatuses([-1])
                                else {
                                    let newSelectedStatuses = [...selectedImplementationStatuses, value]
                                    if (newSelectedStatuses[0] === -1) newSelectedStatuses = [value]
                                    setSelectedImplementationStatuses(newSelectedStatuses)
                                }
                            }}
                            optionRender={(option) => (
                                <Flex
                                    className={'homeImplementationStatusSelectOption'}
                                    justify={'space-between'}
                                >
                                    <span>{option.data.label}</span>
                                    {option.data.value !== -1 ? (
                                        <div
                                            className={'homeImplementationStatusSelectOptionColorContainer'}
                                            style={{
                                                backgroundColor: option.data.color,
                                            }}
                                        />
                                    ) : null}
                                </Flex>
                            )}
                        />
                    </Flex>
                    <Flex vertical className={'homePageSelectContainer'}>
                        <p>Фильтр по классам ПО</p>
                        <Select
                            className={'homePageSelectLarge'}
                            showSearch
                            optionFilterProp={'label'}
                            mode={'multiple'}
                            value={selectedSoftwareClasses}
                            options={[
                                {
                                    label: 'Любой',
                                    value: -1,
                                },
                                ...softwareClasses.map((c) => ({
                                    label: `${c.number}${c.parent ? (' ' + c.parent?.name + ' / ') : ''}${c.name === c.number ? '' : (' ' + c.name)}`,
                                    value: c.id,
                                })),
                            ]}
                            onDeselect={(value) => {
                                if (value === -1) return
                                let newSelectedClasses = selectedSoftwareClasses.filter(c => c !== value)
                                if (!newSelectedClasses.length) newSelectedClasses = [-1]
                                setSelectedSoftwareClasses(newSelectedClasses)
                            }}
                            onSelect={(value) => {
                                if (value === -1) setSelectedSoftwareClasses([-1])
                                else {
                                    let newSelectedClasses = [...selectedSoftwareClasses, value]
                                    if (newSelectedClasses[0] === -1) newSelectedClasses = [value]
                                    setSelectedSoftwareClasses(newSelectedClasses)
                                }
                            }}
                        />
                    </Flex>
                    <Flex vertical className={'homePageSelectContainer'}>
                        <p>Фильтр по тегам ПО</p>
                        <Select
                            className={'homePageSelect'}
                            showSearch
                            optionFilterProp={'label'}
                            mode={'multiple'}
                            value={selectedSoftwareTags}
                            options={[
                                {
                                    label: 'Любой',
                                    value: -1,
                                },
                                ...softwareTags.map((t) => ({
                                    label: t.name,
                                    value: t.id,
                                })),
                            ]}
                            onDeselect={(value) => {
                                if (value === -1) return
                                let newSelectedTags = selectedSoftwareTags.filter(t => t !== value)
                                if (!newSelectedTags.length) newSelectedTags = [-1]
                                setSelectedSoftwareTags(newSelectedTags)
                            }}
                            onSelect={(value) => {
                                if (value === -1) setSelectedSoftwareTags([-1])
                                else {
                                    let newSelectedTags = [...selectedSoftwareTags, value]
                                    if (newSelectedTags[0] === -1) newSelectedTags = [value]
                                    setSelectedSoftwareTags(newSelectedTags)
                                }
                            }}
                        />
                    </Flex>
                    {canEdit ? (
                        <div className={'homePageAddSoftwareButtonContainer'}>
                            <Button
                                onClick={() => setIsCompanySoftwareModalOpen(true)}
                                type={'dashed'}
                            >
                                Добавить ПО
                            </Button>
                        </div>
                    ) : null}
                </Flex>
                {!filteredCompanySoftware?.length ? (
                    <div className={'homePageSpinContainer'}>
                        <Empty description={'Ничего не найдено'}/>
                    </div>
                ) : null}
                <div className={'homePageSoftwareListContainer'}>
                    {filteredCompanySoftware?.map((cs) => (
                        <div
                            key={cs.id}
                            className={'homePageSoftwareContainer'}
                            style={{
                                border: cs.implementation_status?.border || '2px solid #a8a8a8',
                                backgroundColor: cs.implementation_status?.color || '#f4f8ff',
                            }}
                        >
                            {canEdit ? (
                                <div className={'homePageSoftwareActionButtonsContainer'}>
                                    <Dropdown
                                        trigger={['click']}
                                        menu={{
                                            items: [
                                                {
                                                    key: 'edit',
                                                    label: 'Изменить',
                                                    onClick: () => {
                                                        setEditingCompanySoftware(cs)
                                                        setIsCompanySoftwareModalOpen(true)
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
                                                            message: `Удалить ПО Компании - "${cs.software?.name}" ?`,
                                                            applyText: 'Да',
                                                            onApply: () => dispatch(deleteCompanySoftwareAction(cs.id)),
                                                        }))
                                                    },
                                                    icon: <DeleteOutlined/>,
                                                }
                                            ],
                                        }}
                                        placement={'bottomRight'}
                                    >
                                        <MoreOutlined/>
                                    </Dropdown>
                                </div>
                            ) : null}
                            <p>
                                <b
                                    className={'homePageSoftwareName'}
                                    onClick={() => {
                                        setIsSoftwareModalOpen(true)
                                        if (checkITSpecialistOrAdmin(userInfo?.roles)) {
                                            setEditingSoftware(cs.software)
                                        } else {
                                            setViewingSoftware(cs.software)
                                        }
                                    }}
                                >
                                    {cs.software?.name}
                                </b>
                                <span className={'homePageSoftwareVersions'}>
                                    {cs.versions?.map((sv => sv.version))?.join(', ')}
                                </span>
                                {' - '}
                                <Tooltip
                                    title={'Число лицензий в наличии'}
                                    value={`${cs.copies_number}`}
                                />
                                {';'}
                                <Tooltip
                                    title={'Планируемая закупка в текущем и следующем году'}
                                    value={`потребность ${cs.additionally_needed_copies_number}`}
                                />
                            </p>
                            <p className={'homePageSoftwareComment'}>{cs.comment}</p>
                            <div
                                className={'homePageSoftwareClasses'}
                                onClick={() => setSelectedSoftwareClasses([cs.software?.main_class?.id])}
                            >
                                <Tooltip
                                    value={cs.software?.main_class?.name}
                                    maxLength={58}
                                    showOnlyOnLargeText
                                    textFontSize={13}
                                />
                            </div>
                            <div
                                className={'homePageSoftwareTags'}
                                onClick={() => setSelectedSoftwareTags(cs.software?.tags?.map((t) => t.id))}
                            >
                                <Tooltip
                                    value={cs.software?.tags?.map((st => st.name))?.join(', ')}
                                    maxLength={64}
                                    showOnlyOnLargeText
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )
    }, [companySoftware, filteredCompanySoftware, selectedImplementationStatuses, userInfo])

    const getCompanySoftwareByClassesContent = useCallback(() => {
        if (companySoftwareByClasses.isLoading)
            return (
                <div className={'homePageSpinContainer'}>
                    <Spin/>
                </div>
            )

        if (!companySoftwareByClasses?.data?.length)
            return (
                <div className={'homePageSpinContainer'}>
                    <Empty description={'Ничего не найдено'}/>
                </div>
            )

        return (
            <Collapse
                size={'small'}
                className={'homePageSoftwareByClassesContainer'}
                items={companySoftwareByClasses.data?.map((c) => ({
                    key: c.id.toString(),
                    label: c.number !== c.name ? `${c.number} ${c.name}` : c.name,
                    children: (
                        <div>
                            {c.software?.map((s, index, items) => (
                                <div key={s.id}>
                                    <p>{s?.software?.name}</p>
                                    {index < items.length - 1 ? (
                                        <Divider className={'homePageSoftwareByClassesDivider'}/>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    )
                }))}
                defaultActiveKey={companySoftwareByClasses.data?.map((c) => c.id.toString())}
            />
        )
    }, [companySoftwareByClasses])

    const onPressAddCompanySoftware = useCallback((
        softwareId: number,
        comment: string,
        implementationStatusId: number,
        copiesNumber: number,
        additionallyNeededCopiesNumber: number,
        softwareVersionIds: number[],
    ) => {
        dispatch(addCompanySoftwareAction(
            softwareId,
            comment,
            implementationStatusId,
            copiesNumber,
            additionallyNeededCopiesNumber,
            softwareVersionIds,
        ))
        setIsCompanySoftwareModalOpen(false)
        setEditingCompanySoftware(undefined)
        setDefaultSelectedSoftwareId(undefined)
        setAddedSoftwareVersion('')
    }, [])

    const onPressUpdateCompanySoftware = useCallback((
        _: number,
        comment: string,
        implementationStatusId: number,
        copiesNumber: number,
        additionallyNeededCopiesNumber: number,
        softwareVersionIds: number[],
    ) => {
        if (
            editingCompanySoftware.comment !== comment ||
            editingCompanySoftware.implementation_status?.id !== implementationStatusId ||
            editingCompanySoftware.copies_number !== copiesNumber ||
            editingCompanySoftware.additionally_needed_copies_number !== additionallyNeededCopiesNumber ||
            softwareVersionIds?.length !== editingCompanySoftware?.versions?.length ||
            softwareVersionIds?.some((newVersionId) => !editingCompanySoftware?.versions?.includes(newVersionId))
        ) {
            dispatch(updateCompanySoftwareAction(
                editingCompanySoftware.id,
                comment,
                implementationStatusId,
                copiesNumber,
                additionallyNeededCopiesNumber,
                softwareVersionIds,
            ))
        }
        setIsCompanySoftwareModalOpen(false)
        setEditingCompanySoftware(undefined)
        setDefaultSelectedSoftwareId(undefined)
        setAddedSoftwareVersion('')
    }, [editingCompanySoftware])

    return (
        <div className={'homePage'}>
            Ландшафт информационных систем
            <Tabs
                size={'small'}
                onChange={(newTab) => setCurrentTab(newTab)}
                type={'card'}
                items={[
                    {
                        label: 'Список ПО',
                        key: TABS.COMPANY_SOFTWARE,
                        children: getCompanySoftwareContent(),
                    },
                    {
                        label: 'Классы ПО',
                        key: TABS.COMPANY_SOFTWARE_BY_CLASSES,
                        children: getCompanySoftwareByClassesContent(),
                    },
                ]}
            />
            <CompanySoftwareModal
                isOpen={isCompanySoftwareModalOpen}
                onAccept={editingCompanySoftware ? onPressUpdateCompanySoftware : onPressAddCompanySoftware}
                onClose={() => {
                    setIsCompanySoftwareModalOpen(false)
                    setEditingCompanySoftware(undefined)
                    setDefaultSelectedSoftwareId(undefined)
                    setAddedSoftwareVersion('')
                }}
                mode={editingCompanySoftware ? MODES.EDIT : MODES.ADD}
                title={editingCompanySoftware ? 'Обновить ПО Компании' : 'Добавить ПО Компании'}
                availableSoftware={[
                    ...(
                        editingCompanySoftware ? [editingCompanySoftware.software] : []
                    ),
                    ...software.filter((s) => !companySoftware?.data?.some((cs) => cs.software?.id === s.id)),
                ]}
                availableSoftwareVersions={(
                    editingCompanySoftware ?
                        software.find((s) => editingCompanySoftware?.software?.id === s.id)?.versions : []
                )}
                defaultComment={editingCompanySoftware?.comment}
                defaultSelectedSoftwareId={defaultSelectedSoftwareId || editingCompanySoftware?.software?.id}
                defaultSelectedImplementationStatusId={editingCompanySoftware?.implementation_status?.id}
                defaultCopiesNumber={editingCompanySoftware?.copies_number}
                defaultAdditionallyNeededCopiesNumber={editingCompanySoftware?.additionally_needed_copies_number}
                defaultSoftwareVersions={editingCompanySoftware?.versions}
                onPressCreateSoftware={(defaultName: string) => {
                    setSoftwareModalDefaultName(defaultName)
                    setIsSoftwareModalOpen(true)
                }}
                onPressViewSoftware={(software: any) => {
                    setIsSoftwareModalOpen(true)
                    if (checkITSpecialistOrAdmin(userInfo?.roles)) {
                        setEditingSoftware(software)
                    } else {
                        setViewingSoftware(software)
                    }
                }}
                onPressAddSoftwareVersion={(software: any, defaultVersion: string) => {
                    setSoftwareVersionModalDefaultVersion(defaultVersion)
                    setSoftwareAddVersionTo(software)
                    setIsSoftwareVersionModalOpen(true)
                }}
                implementationStatuses={implementationStatuses}
                addedSoftwareVersion={addedSoftwareVersion}
            />
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
                    setIsSoftwareModalOpen(false)
                    if (viewingSoftware) {
                        setViewingSoftware(undefined)
                    } else if (editingSoftware) {
                        if (
                            editingSoftware.name !== name ||
                            editingSoftware.description !== description ||
                            editingSoftware.art_number !== artNumber ||
                            editingSoftware.register_number !== registerNumber ||
                            editingSoftware.main_class?.id !== mainClassId ||
                            additionalClassIds?.length !== editingSoftware?.additional_classes?.length ||
                            additionalClassIds?.some((newClassId) => !editingSoftware?.additional_classes?.includes(newClassId)) ||
                            tagIds?.length !== editingSoftware?.tags?.length ||
                            tagIds?.some((newTagId) => !editingSoftware?.tags?.includes(newTagId))
                        ) {
                            setWaitingSoftwareUpdate(true)
                            dispatch(updateSoftwareAction(
                                editingSoftware.id,
                                name,
                                description,
                                artNumber,
                                registerNumber,
                                mainClassId,
                                additionalClassIds,
                                tagIds,
                            ))
                        }
                        setEditingSoftware(undefined)
                    } else {
                        setSoftwareModalDefaultName('')
                        setCreatedSoftwareName(name)
                        dispatch(createSoftwareAction(
                            name,
                            description,
                            artNumber,
                            registerNumber,
                            mainClassId,
                            additionalClassIds,
                            tagIds,
                        ))
                    }
                }}
                onClose={() => {
                    setIsSoftwareModalOpen(false)
                    setSoftwareModalDefaultName('')
                    setViewingSoftware(undefined)
                    setEditingSoftware(undefined)
                }}
                title={viewingSoftware ? 'Информация о ПО' : editingSoftware ? 'Обновить ПО' : 'Создать ПО'}
                softwareClasses={softwareClasses}
                softwareTags={softwareTags}
                validateSoftwareName={(softwareName) => {
                    if (editingCompanySoftware?.software?.name === softwareName) return ''
                    if (software.some((s) => s.name === softwareName)) return 'Название ПО уже занято'
                    return ''
                }}
                defaultName={softwareModalDefaultName}
                mode={viewingSoftware ? MODES.VIEW : editingSoftware ? MODES.EDIT : MODES.ADD}
                viewingSoftware={viewingSoftware}
                editingSoftware={editingSoftware}
            />
            <SoftwareVersionModal
                title={`Добавить новую версию ПО для "${softwareAddVersionTo?.name}"`}
                isOpen={isSoftwareVersionModalOpen}
                onAccept={(version) => {
                    setAddedSoftwareVersion(version)
                    setIsSoftwareVersionModalOpen(false)
                    dispatch(addSoftwareVersionAction(softwareAddVersionTo?.id, version))
                }}
                onClose={() => {
                    setIsSoftwareVersionModalOpen(false)
                    setSoftwareVersionModalDefaultVersion('')
                    setSoftwareAddVersionTo(undefined)
                }}
                defaultVersion={softwareVersionModalDefaultVersion}
                validateSoftwareVersion={(version) => {
                    if (editingCompanySoftware) {
                        if (
                            software
                                .find((s) => editingCompanySoftware?.software?.id === s.id)?.versions
                                ?.some((v) => v.version === version)
                        ) return 'Версия ПО уже добавлена'
                    } else if (softwareAddVersionTo) {
                        if (
                            software
                                .find((s) => softwareAddVersionTo?.id === s.id)?.versions
                                ?.some((v) => v.version === version)
                        ) return 'Версия ПО уже добавлена'
                    }
                    return ''
                }}
            />
        </div>
    )
}
