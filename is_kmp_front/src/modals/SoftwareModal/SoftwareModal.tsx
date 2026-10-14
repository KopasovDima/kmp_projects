import {Empty, Input, Modal, Select} from 'antd'
import {FC, useCallback, useEffect, useState} from 'react'
import {RequiredMark} from '@/components'
import {MODES} from '@/consts'

interface ISoftwareModalProps {
    title: string
    isOpen: boolean
    onAccept: (
        name: string,
        description: string,
        artNumber: string,
        registerNumber: string,
        mainClassId: number,
        additionalClassIds: number[],
        tagIds: number[],
    ) => void
    onClose: () => void
    softwareClasses: any[]
    softwareTags: any[]
    validateSoftwareName: (softwareName: string) => string
    defaultName?: string
    mode: string
    viewingSoftware?: any
    editingSoftware?: any
    registerNumberRequired?: boolean
}

export const SoftwareModal: FC<ISoftwareModalProps> = (
    {
        title,
        isOpen,
        onAccept,
        onClose,
        softwareClasses,
        softwareTags,
        validateSoftwareName,
        defaultName = '',
        mode,
        viewingSoftware,
        editingSoftware,
        registerNumberRequired = false,
    }
) => {
    const [name, setName] = useState<string>(defaultName)
    const [nameError, setNameError] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const [artNumber, setArtNumber] = useState<string>('')
    const [registerNumber, setRegisterNumber] = useState<string>('')
    const [selectedMainClass, setSelectedMainClass] = useState<number | undefined>(undefined)
    const [selectedAdditionalClasses, setSelectedAdditionalClasses] = useState<number[]>([])
    const [selectedTags, setSelectedTags] = useState<number[]>([])

    const onOkPressed = useCallback(() => {
        onAccept(
            name,
            description,
            artNumber,
            registerNumber,
            selectedMainClass || 0,
            selectedAdditionalClasses,
            selectedTags,
        )
    }, [name, description, artNumber, registerNumber, selectedMainClass, selectedAdditionalClasses, selectedTags])

    useEffect(() => {
        if (isOpen) {
            if (viewingSoftware) {
                setName(viewingSoftware?.name || ' ')
                setDescription(viewingSoftware?.description || ' ')
                setArtNumber(viewingSoftware?.art_number || ' ')
                setRegisterNumber(viewingSoftware?.register_number || ' ')
                setSelectedMainClass(viewingSoftware?.main_class?.id || ' ')
                setSelectedAdditionalClasses(viewingSoftware?.additional_classes?.map(c => c.id) || [])
                setSelectedTags(viewingSoftware?.tags?.map(c => c.id) || [])
            } else if (editingSoftware) {
                setName(editingSoftware?.name || '')
                setDescription(editingSoftware?.description || '')
                setArtNumber(editingSoftware?.art_number || '')
                setRegisterNumber(editingSoftware?.register_number || '')
                setSelectedMainClass(editingSoftware?.main_class?.id)
                setSelectedAdditionalClasses(editingSoftware?.additional_classes?.map(c => c.id) || [])
                setSelectedTags(editingSoftware?.tags?.map(c => c.id) || [])
            } else {
                setName(defaultName)
                setDescription('')
                setArtNumber('')
                setRegisterNumber('')
                setSelectedMainClass(undefined)
                setSelectedAdditionalClasses([])
                setSelectedTags([])
            }
            setNameError('')
        }
    }, [isOpen, viewingSoftware, editingSoftware])

    return (
        <Modal
            zIndex={2000}
            open={isOpen}
            width={700}
            title={title}
            cancelText={'Отмена'}
            onCancel={mode !== MODES.VIEW ? onClose : undefined}
            okText={mode === MODES.ADD ? 'Создать' : mode === MODES.EDIT ? 'Обновить' : 'Закрыть'}
            onOk={onOkPressed}
            cancelButtonProps={mode === MODES.VIEW ? {style: {display: 'none'}} : {}}
            okButtonProps={mode !== MODES.VIEW ? {
                disabled: (
                    !!nameError || !name || !description || !selectedMainClass ||
                    (!registerNumber && registerNumberRequired)
                ),
            } : {}}
            okType={mode === MODES.VIEW ? 'default' : 'primary'}
            closable={false}
            maskClosable={false}
            centered
        >
            <div>
                <div className={'modalInputElement'}>
                    {mode !== MODES.VIEW ? (
                        <p>Название<RequiredMark/></p>
                    ) : (
                        <p>Название</p>
                    )}
                    <Input
                        placeholder={'Введите название'}
                        type={'text'}
                        onChange={(e) => {
                            setNameError(validateSoftwareName(e.target.value?.trim()))
                            setName(e.target.value)
                        }}
                        value={name}
                        status={nameError ? 'error' : ''}
                        disabled={mode === MODES.VIEW}
                    />
                    {nameError ? (
                        <p style={{color: '#fd4c4e', fontSize: 12}}>{nameError}</p>
                    ) : null}
                </div>

                <div className={'modalInputElement'}>
                    {mode !== MODES.VIEW ? (
                        <p>Описание<RequiredMark/></p>
                    ) : (
                        <p>Описание</p>
                    )}
                    <Input.TextArea
                        placeholder={'Введите описание'}
                        onChange={(e) => setDescription(e.target.value)}
                        value={description}
                        autoSize={{
                            minRows: 4,
                            maxRows: 10,
                        }}
                        disabled={mode === MODES.VIEW}
                    />
                </div>

                <div className={'modalInputElement'}>
                    <p>Артикул</p>
                    <Input
                        placeholder={'Введите артикул'}
                        type={'text'}
                        onChange={(e) => setArtNumber(e.target.value)}
                        value={artNumber}
                        disabled={mode === MODES.VIEW}
                    />
                </div>

                <div className={'modalInputElement'}>
                    {mode !== MODES.VIEW && registerNumberRequired ? (
                        <p>Номер из реестра импортозамещения<RequiredMark/></p>
                    ) : (
                        <p>Номер из реестра импортозамещения</p>
                    )}
                    <Input
                        placeholder={`Введите номер из реестра импортозамещения${registerNumberRequired ? '' : ' (при наличии)'}`}
                        type={'text'}
                        onChange={(e) => setRegisterNumber(e.target.value)}
                        value={registerNumber}
                        disabled={mode === MODES.VIEW}
                    />
                </div>

                <div className={'modalInputElement'}>
                    {mode !== MODES.VIEW ? (
                        <p>Основной класс<RequiredMark/></p>
                    ) : (
                        <p>Основной класс</p>
                    )}
                    <Select
                        showSearch
                        value={selectedMainClass}
                        options={softwareClasses.map((c) => ({
                            label: `${c.number}${c.parent ? (' ' + c.parent?.name + ' / ') : ''}${c.name === c.number ? '' : (' ' + c.name)}`,
                            value: c.id,
                        }))}
                        onSelect={(value) => {
                            setSelectedMainClass(value)
                            setSelectedAdditionalClasses(selectedAdditionalClasses?.filter(
                                (additionalClass) => additionalClass !== value)
                            )
                        }}
                        optionFilterProp={'label'}
                        placeholder={mode === MODES.VIEW ? '' : 'Выберите основной класс ПО'}
                        notFoundContent={<Empty description={'Ничего не найдено'}/>}
                        style={{
                            width: '100%',
                        }}
                        disabled={mode === MODES.VIEW}
                    />
                </div>

                <div className={'modalInputElement'}>
                    {mode !== MODES.VIEW ? (
                        <p>Дополнительные классы</p>
                    ) : (
                        <p>Дополнительные классы</p>
                    )}
                    <Select
                        showSearch
                        mode={'multiple'}
                        value={selectedAdditionalClasses}
                        options={softwareClasses.map((c) => ({
                            label: `${c.number}${c.parent ? (' ' + c.parent?.name + ' / ') : ''}${c.name === c.number ? '' : (' ' + c.name)}`,
                            value: c.id,
                            disabled: c.id === selectedMainClass,
                        }))}
                        onDeselect={(value) => {
                            setSelectedAdditionalClasses(selectedAdditionalClasses.filter(c => c !== value))
                        }}
                        onSelect={(value) => {
                            setSelectedAdditionalClasses([...selectedAdditionalClasses, value])
                        }}
                        optionFilterProp={'label'}
                        placeholder={mode === MODES.VIEW ? '' : 'Выберите дополнительные классы ПО'}
                        notFoundContent={<Empty description={'Ничего не найдено'}/>}
                        style={{
                            width: '100%',
                        }}
                        disabled={mode === MODES.VIEW}
                    />
                </div>

                <div className={'modalInputElement'}>
                    <p>Теги</p>
                    <Select
                        showSearch
                        mode={'multiple'}
                        value={selectedTags}
                        options={softwareTags.map((t) => ({
                            label: t.name,
                            value: t.id,
                        }))}
                        optionFilterProp={'label'}
                        onDeselect={(value) => setSelectedTags(selectedTags.filter(t => t !== value))}
                        onSelect={(value) => setSelectedTags([...selectedTags, value])}
                        placeholder={mode === MODES.VIEW ? '' : 'Выберите теги ПО'}
                        notFoundContent={<Empty description={'Ничего не найдено'}/>}
                        style={{
                            width: '100%',
                        }}
                        disabled={mode === MODES.VIEW}
                    />
                </div>

            </div>
        </Modal>
    )
}