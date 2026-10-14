import {Button, Flex, Modal, Select} from 'antd'
import {FC, useEffect, useState} from 'react'
import {MessageOutlined, MinusOutlined} from '@ant-design/icons'
import {Tooltip} from '@/components'

export const GroupChatParticipantsModal: FC<
    {
        title: string
        isOpen: boolean
        onClose: () => void
        participants: any[]
        possibleParticipants: any[]
        onAddParticipant?: (userId: number) => void
        onDeleteParticipant?: (userId: number) => void
        authUserId: number
        onOpenPersonalChat: (userId: number) => void
    }
> = (
    {
        title,
        isOpen,
        onClose,
        participants,
        possibleParticipants,
        onAddParticipant = undefined,
        onDeleteParticipant = undefined,
        authUserId,
        onOpenPersonalChat,
    }
) => {
    const [selectedParticipant, setSelectedParticipant] = useState<any>(undefined)

    useEffect(() => {
        setSelectedParticipant(undefined)
    }, [isOpen])

    return (
        <Modal
            open={isOpen}
            width={550}
            onCancel={onClose}
            title={title}
            cancelText={undefined}
            okText={undefined}
            closable={true}
            maskClosable={true}
            centered
            footer={null}
        >
            <div
                style={{
                    maxHeight: 450,
                    overflowY: 'auto',
                }}
            >
                {participants?.map((participant) => (
                    <div key={participant.id} className={'participantContainer'}>
                        <span>
                            {participant.first_name} {participant.last_name} ({participant.post} / {participant.company})
                            {participant.role ? ' - ' + participant.role : ''}
                        </span>
                        {participant.id !== authUserId ? (
                            <Tooltip
                                value={(
                                    <Button
                                        className={'participantButton'}
                                        style={{
                                            marginLeft: 4,
                                            width: 12,
                                            height: 12,
                                            padding: 8,
                                        }}
                                        type={'text'}
                                        onClick={() => onOpenPersonalChat(participant.id)}
                                    >
                                        <MessageOutlined
                                            style={{
                                                fontSize: 12,
                                                color: '#0f1b99',
                                            }}
                                        />
                                    </Button>
                                )}
                                title={'Написать личное сообщение'}
                            />
                        ) : null}
                        {onDeleteParticipant && participant.role !== 'Автор' ? (
                            <Button
                                onClick={() => onDeleteParticipant(participant.id)}
                                className={'participantButton'}
                                style={{
                                    marginLeft: 10,
                                    backgroundColor: '#bd4141',
                                    height: 16,
                                    width: 16,
                                    minWidth: 16,
                                }}
                                type={'primary'}
                                size={'small'}
                                shape={'circle'}
                                icon={(
                                    <MinusOutlined style={{display: 'flex', fontSize: 6}}/>
                                )}
                            />
                        ) : null}
                    </div>
                ))}
                {onAddParticipant ? (
                    <Flex vertical align={'flex-end'}>
                        <Select
                            style={{
                                marginTop: 10,
                                width: 502,
                            }}
                            showSearch
                            placeholder={'Добавить участника'}
                            value={selectedParticipant}
                            options={possibleParticipants?.map((pp) => ({
                                label: `${pp.user.last_name} ${pp.user.first_name} (${pp.post} / ${pp.company?.short_name})`,
                                value: pp.user.id,
                                id: pp.user.id,
                            }))}
                            optionFilterProp={'label'}
                            onSelect={(_, selected) => setSelectedParticipant(selected)}
                        />
                        <Button
                            type={'primary'}
                            size={'small'}
                            style={{
                                marginTop: 10,
                                width: 80,
                            }}
                            onClick={() => {
                                onAddParticipant(selectedParticipant?.id)
                                setSelectedParticipant(undefined)
                            }}
                            disabled={!selectedParticipant}
                        >
                            Добавить
                        </Button>
                    </Flex>
                ) : null}
            </div>
        </Modal>
    )
}