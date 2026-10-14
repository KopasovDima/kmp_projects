export const ENV = {
    IS_PRODUCTION: import.meta.env.VITE_IS_PRODUCTION === 'true',
    AUTH_SERVER_URL: import.meta.env.VITE_AUTH_SERVER_URL,
    SERVER_URL: import.meta.env.VITE_SERVER_URL,
    WS_SERVER_URL: import.meta.env.VITE_WS_SERVER_URL,
}
