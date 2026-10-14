import {FC} from 'react'
import './UserPhoto.css'
import {UserOutlined} from '@ant-design/icons'

interface UserProfilePhotoProps {
    url?: string;
    onClick?: () => void;
}

export const UserPhoto: FC<UserProfilePhotoProps> = (
    {
        url,
        onClick,
    }
) => {
    return (
        <div
            className={`userPhotoContainer ${onClick ? ' userPhotoContainerHoverable' : ''}`}
            onClick={onClick}
            style={{
                cursor: onClick ? 'pointer' : 'inherit',
            }}
        >
            {url ? (
                <img className={'userPhoto'} src={url}/>
            ) : (
                <UserOutlined
                    className={'iconMedium'}
                />
            )}
        </div>
    )
}
