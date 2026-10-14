import {useCallback, useEffect, useRef, useState} from 'react'

export const useUserActivity = (offlineTimeout = 60 * 1000) => {
    const [isOnline, setIsOnline] = useState(true)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleActivity = useCallback(() => {
        setIsOnline(true)

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => setIsOnline(false), offlineTimeout)
    }, [offlineTimeout])

    useEffect(() => {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll']

        events.forEach(event => {
            window.addEventListener(event, handleActivity)
        })

        handleActivity()

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity)
            })

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    return {isOnline}
}
