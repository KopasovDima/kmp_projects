import {FC, useEffect} from 'react'

export const UpdateTimer: FC<{
    onUpdate: () => void,
    nextUpdateDate: Date,
    // updateIntervalSeconds: number,
}> = (
    {
        onUpdate,
        nextUpdateDate,
        // updateIntervalSeconds,
    }
) => {
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (new Date() >= nextUpdateDate) onUpdate()
        }, 1000)

        return () => clearInterval(intervalId)
    }, [onUpdate, nextUpdateDate])

    return undefined
}
