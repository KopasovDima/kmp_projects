import {FC, useCallback, useEffect} from 'react'

interface KeyboardKeyTrackerProps {
    onPress: (() => void) | ((key: string) => void)
    keys: string[]
    ctrlKeyPressRequired?: boolean
}

export const KeyboardKeyTracker: FC<KeyboardKeyTrackerProps> = (
    {
        onPress,
        keys,
        ctrlKeyPressRequired = false,
    }
) => {
    const onKeyPressed = useCallback((event: any) => {
        if (ctrlKeyPressRequired && !event.ctrlKey) return
        for (const key of keys) {
            if (event.key === key) onPress(key)
        }
    }, [keys, onPress])

    useEffect(() => {
        document.addEventListener('keydown', onKeyPressed)
        return () => document.removeEventListener('keydown', onKeyPressed)
    }, [onKeyPressed])

    return null
}