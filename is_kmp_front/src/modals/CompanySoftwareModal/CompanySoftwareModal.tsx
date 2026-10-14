import {Button, Empty, Flex, Input, InputNumber, Modal, Select} from 'antd'
import {FC, useCallback, useEffect, useState} from 'react'
import {MODES} from '@/consts'
import {HintTooltip, RequiredMark} from '@/components'
import {InfoCircleFilled, PlusCircleFilled} from '@ant-design/icons'

interface ICompanySoftwareModalProps {
    title?: string
    isOpen: boolean
    onAccept: (
        softwareId: number,
        comment: string,
        implementationStatusId: number,
        copiesNumber: number,
        additionallyNeededCopiesNumber: number,
        softwareVersionIds: number[],
    ) => void
    onClose: () => void
    defaultComment?: string
    defaultSelectedSoftwareId?: number
    defaultSelectedImplementationStatusId?: number
    defaultCopiesNumber?: number
    defaultAdditionallyNeededCopiesNumber?: number
    defaultSoftwareVersions?: any[]
    availableSoftware?: any[]
    availableSoftwareVersions?: any[]
    mode: string
    onPressCreateSoftware: (defaultName: string) => void
    onPressViewSoftware: (software: any) => void
    onPressAddSoftwareVersion: (software: any, defaultVersion: string) => void
    implementationStatuses: any[]
    addedSoftwareVersion: string
}

export const CompanySoftwareModal: FC<ICompanySoftwareModalProps> = (
    {
        title = 'Добавление ПО Компании',
        isOpen,
        onAccept,
        onClose,
        availableSoftware = [],
        availableSoftwareVersions = [],
        implementationStatuses = [],
        defaultComment = '',
        defaultSelectedSoftwareId = availableSoftware?.[0]?.id,
        defaultSelectedImplementationStatusId = implementationStatuses?.[0]?.id,
        defaultCopiesNumber = 0,
        defaultAdditionallyNeededCopiesNumber = 0,
        defaultSoftwareVersions = [],
        mode,
        onPressCreateSoftware,
        onPressViewSoftware,
        onPressAddSoftwareVersion,
        addedSoftwareVersion,
    }
) => {
    const [comment, setComment] = useState<string>(defaultComment)
    const [selectedSoftware, setSelectedSoftware] = useState<number | undefined>(defaultSelectedSoftwareId)
    const [selectedImplementationStatus, setSelectedImplementationStatus] = useState<number | undefined>(defaultSelectedImplementationStatusId)
    const [selectedImplementationStatusColor, setSelectedImplementationStatusColor] = useState<any>(undefined)
    const [copiesNumber, setCopiesNumber] = useState<number>(defaultCopiesNumber)
    const [additionallyNeededCopiesNumber, setAdditionallyNeededCopiesNumber] = useState<number>(defaultAdditionallyNeededCopiesNumber)
    const [selectedSoftwareVersions, setSelectedSoftwareVersions] = useState<any[]>(defaultSoftwareVersions)
    const [selectableSoftwareVersions, setSelectableSoftwareVersions] = useState<any[]>(defaultSoftwareVersions)

    const [searchSoftwareText, setSearchSoftwareText] = useState<string>('')
    const [searchSoftwareVersionText, setSearchSoftwareVersionText] = useState<string>('')

    const onOkPressed = useCallback(() => {
        onAccept(
            selectedSoftware || 0,
            comment,
            selectedImplementationStatus || 0,
            copiesNumber,
            additionallyNeededCopiesNumber,
            selectedSoftwareVersions?.map(version => version.id) || [],
        )
    }, [
        comment,
        selectedSoftware,
        selectedImplementationStatus,
        copiesNumber,
        additionallyNeededCopiesNumber,
        selectedSoftwareVersions,
    ])

    useEffect(() => {
        if (isOpen) {
            setComment(defaultComment)
            setSelectedSoftware(defaultSelectedSoftwareId)
            setSelectedImplementationStatus(defaultSelectedImplementationStatusId)
            setSelectedImplementationStatusColor(
                implementationStatuses?.find(s => s.id === defaultSelectedImplementationStatusId)?.color
            )
            setCopiesNumber(defaultCopiesNumber)
            setAdditionallyNeededCopiesNumber(defaultAdditionallyNeededCopiesNumber)
            setSelectedSoftwareVersions(defaultSoftwareVersions)
            if (mode === MODES.ADD) {
                setSelectableSoftwareVersions(availableSoftware?.find((s) => s.id === defaultSelectedSoftwareId)?.versions || [])
            } else {
                setSelectableSoftwareVersions(availableSoftwareVersions)
            }
            setSearchSoftwareText('')
            setSearchSoftwareVersionText('')
        }
    }, [isOpen])

    useEffect(() => {
        setSelectedSoftware(defaultSelectedSoftwareId)
    }, [defaultSelectedSoftwareId])

    useEffect(() => {
        let newSelectableSoftwareVersions
        if (mode === MODES.ADD) newSelectableSoftwareVersions = availableSoftware?.find((s) => s.id === selectedSoftware)?.versions || []
        else newSelectableSoftwareVersions = availableSoftwareVersions

        if ((
            addedSoftwareVersion &&
            newSelectableSoftwareVersions?.some(v => v.version === addedSoftwareVersion) &&
            !selectedSoftwareVersions?.some(v => v.version === addedSoftwareVersion)
        ))
            setSelectedSoftwareVersions([
                ...selectedSoftwareVersions,
                newSelectableSoftwareVersions?.find(v => v.version === addedSoftwareVersion),
            ])

        if (
            newSelectableSoftwareVersions?.length !== selectableSoftwareVersions?.length ||
            newSelectableSoftwareVersions?.some((v1) => !selectableSoftwareVersions?.map(v2 => v2.id)?.includes(v1.id))
        )
            setSelectableSoftwareVersions(newSelectableSoftwareVersions)
    }, [selectedSoftware, availableSoftware, availableSoftwareVersions, addedSoftwareVersion])

    const onPressAddSoftwareVersionLocal = useCallback(() => {
        if (!selectedSoftware) return

        onPressAddSoftwareVersion(
            availableSoftware?.find(s => (
                mode === MODES.EDIT ?
                    defaultSelectedSoftwareId === s.id :
                    selectedSoftware === s.id
            )),
            searchSoftwareVersionText,
        )
        setSearchSoftwareVersionText('')
    }, [
        onPressAddSoftwareVersion,
        selectedSoftware,
        defaultSelectedSoftwareId,
        mode,
        searchSoftwareVersionText,
        availableSoftware,
    ])

    return (
        <Modal
            open={isOpen}
            width={500}
            onCancel={onClose}
            title={title}
            cancelText={'Отмена'}
            okText={mode === MODES.EDIT ? 'Обновить' : 'Добавить'}
            closable={false}
            onOk={onOkPressed}
            okButtonProps={{
                disabled: mode === MODES.ADD && !selectedSoftware || !selectedImplementationStatus
            }}
            centered
            maskClosable={false}
        >
            <div>
                {mode === MODES.ADD ? (
                    <div className={'modalInputElement'}>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <p>Программное обеспечение<RequiredMark/></p>
                            <Button
                                type={'text'}
                                style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 15,
                                }}
                                onClick={() => {
                                    onPressCreateSoftware(searchSoftwareText)
                                    setSearchSoftwareText('')
                                }}
                            >
                                <PlusCircleFilled
                                    style={{
                                        fontSize: 16,
                                        color: '#4cbd41',
                                    }}
                                />
                            </Button>
                        </div>
                        <Flex
                            vertical={false}
                            justify={'space-between'}
                            style={{
                                alignItems: 'center',
                            }}
                        >
                            <Select
                                showSearch
                                value={selectedSoftware}
                                options={availableSoftware.map((t) => ({
                                    label: t.name,
                                    value: t.id,
                                }))}
                                style={{
                                    width: '100%',
                                }}
                                optionFilterProp={'label'}
                                onSelect={(value) => {
                                    setSelectedSoftwareVersions([])
                                    setSelectedSoftware(value)
                                }}
                                placeholder={'Выберите ПО'}
                                notFoundContent={(
                                    <Flex
                                        vertical
                                        justify={'center'}
                                        style={{
                                            width: '100%',
                                        }}
                                    >
                                        <Empty description={'Ничего не найдено'}/>
                                        <Button
                                            style={{
                                                marginTop: 5,
                                                height: 24,
                                                width: '50%',
                                                placeSelf: 'center',
                                            }}
                                            type={'primary'}
                                            onClick={() => {
                                                onPressCreateSoftware(searchSoftwareText)
                                                setSearchSoftwareText('')
                                            }}
                                        >
                                            Добавить
                                        </Button>
                                    </Flex>
                                )}
                                onSearch={(value) => value ? setSearchSoftwareText(value) : null}
                            />

                            <Button
                                type={'text'}
                                style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 15,
                                }}
                                onClick={() => {
                                    if (!selectedSoftware) return
                                    onPressViewSoftware(availableSoftware.find((s) => s.id === selectedSoftware))
                                }}
                                disabled={!selectedSoftware}
                            >
                                <InfoCircleFilled
                                    style={{
                                        fontSize: 16,
                                        color: selectedSoftware ? '#417fbd' : '#737373',
                                    }}
                                />
                            </Button>
                        </Flex>
                    </div>
                ) : (
                    <Flex
                        vertical={false}
                        justify={'space-between'}
                        style={{
                            alignItems: 'center',
                        }}
                    >
                        <h4
                            style={{
                                cursor: 'pointer',
                            }}
                            onClick={() => onPressViewSoftware(availableSoftware.find((s) => s.id === selectedSoftware))}
                        >
                            {availableSoftware.find((s) => s.id === selectedSoftware)?.name}
                        </h4>
                        {selectedSoftware ? (
                            <Button
                                type={'text'}
                                style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 15,
                                }}
                                onClick={() => {
                                    onPressViewSoftware(availableSoftware.find((s) => s.id === selectedSoftware))
                                }}
                            >
                                <InfoCircleFilled
                                    style={{
                                        fontSize: 16,
                                        color: '#417fbd',
                                    }}
                                />
                            </Button>
                        ) : null}
                    </Flex>
                )}
                <div className={'modalInputElement'}>
                    <p>Комментарий</p>
                    <Input
                        placeholder={'Введите комментарий (необязательно)'}
                        type={'text'}
                        onChange={(e) => setComment(e.target.value)}
                        value={comment}
                    />
                </div>
                <div
                    className={'modalInputElement'}
                    style={{
                        flexDirection: 'row',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <p style={{marginRight: 20}}>Число лицензий</p>
                    <InputNumber
                        style={{
                            height: 30,
                            width: 150,
                        }}
                        min={0}
                        max={1_000_000_000}
                        onChange={(value) => setCopiesNumber(value || 0)}
                        value={copiesNumber}
                    />
                </div>
                <div
                    className={'modalInputElement'}
                    style={{
                        flexDirection: 'row',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <p style={{marginRight: 20}}>
                        Текущая потребность в ПО
                        <HintTooltip hintText={'Планируемая закупка в текущем и следующем году'}/>
                    </p>
                    <InputNumber
                        style={{
                            height: 30,
                            width: 150,
                        }}
                        min={0}
                        max={1_000_000_000}
                        onChange={(value) => setAdditionallyNeededCopiesNumber(value || 0)}
                        value={additionallyNeededCopiesNumber}
                    />
                </div>
                <div className={'modalInputElement'}>
                    <p>Статус внедрения</p>
                    <Select
                        showSearch
                        value={selectedImplementationStatus}
                        options={implementationStatuses.map((s) => ({
                            color: s.color,
                            label: s.name,
                            value: s.id,
                        }))}
                        style={{
                            width: '100%',
                        }}
                        optionFilterProp={'label'}
                        onSelect={(value, item) => {
                            setSelectedImplementationStatus(value)
                            setSelectedImplementationStatusColor(item.color)
                        }}
                        placeholder={'Выберите статус внедрения'}
                        notFoundContent={<Empty description={'Ничего не найдено'}/>}
                        optionRender={(option) => (
                            <Flex justify={'space-between'}>
                                <span>{option.data.label}</span>
                                <div
                                    className={'homeImplementationStatusSelectOptionColorContainer'}
                                    style={{
                                        backgroundColor: option.data.color,
                                    }}
                                />
                            </Flex>
                        )}
                        labelRender={(selected) => (
                            <Flex
                                justify={'space-between'}
                                style={{
                                    alignItems: 'center',
                                    marginRight: 5,
                                }}
                            >
                                <span>{selected.label}</span>
                                <div
                                    className={'homeImplementationStatusSelectOptionColorContainer'}
                                    style={{
                                        backgroundColor: selectedImplementationStatusColor,
                                    }}
                                />
                            </Flex>
                        )}
                    />
                </div>
                <div className={'modalInputElement'}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <p>Используемая версия ПО</p>
                        <Button
                            type={'text'}
                            style={{
                                width: 30,
                                height: 30,
                                borderRadius: 15,
                            }}
                            onClick={onPressAddSoftwareVersionLocal}
                            disabled={!selectedSoftware}
                        >
                            <PlusCircleFilled
                                style={{
                                    fontSize: 16,
                                    color: '#4cbd41',
                                }}
                            />
                        </Button>
                    </div>
                    <Select
                        disabled={!selectedSoftware}
                        showSearch
                        value={selectedSoftwareVersions?.map(version => version.id)}
                        options={selectableSoftwareVersions.map((version) => ({
                            label: version.version,
                            value: version.id,
                            item: version,
                        }))}
                        style={{
                            width: '100%',
                        }}
                        mode={'multiple'}
                        optionFilterProp={'label'}
                        onDeselect={(value) => {
                            let newSelected = selectedSoftwareVersions.filter(v => v.id !== value)
                            setSelectedSoftwareVersions(newSelected)
                        }}
                        onSelect={(_, item) => {
                            let newSelected = [...selectedSoftwareVersions, item.item]
                            setSelectedSoftwareVersions(newSelected)
                        }}
                        onSearch={(value) => value ? setSearchSoftwareVersionText(value) : null}
                        placeholder={'Укажите версию ПО (необязательно)'}
                        notFoundContent={(
                            <Flex
                                vertical
                                justify={'center'}
                                style={{
                                    width: '100%',
                                }}
                            >
                                <Empty description={'Ничего не найдено'}/>
                                <Button
                                    style={{
                                        marginTop: 5,
                                        height: 24,
                                        width: '50%',
                                        placeSelf: 'center',
                                    }}
                                    type={'primary'}
                                    onClick={onPressAddSoftwareVersionLocal}
                                >
                                    Добавить
                                </Button>
                            </Flex>
                        )}
                    />
                </div>
            </div>
        </Modal>
    )
}