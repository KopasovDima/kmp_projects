import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {ConfigProvider} from 'antd'
import {Provider as ReduxProvider} from 'react-redux'
import store from '@/store'
import ruRU from 'antd/lib/locale/ru_RU'

const antdTheme = {
    token: {
        fontFamily: 'KMP_Sirius',
        fontSize: 18,
    },
    components: {
        Checkbox: {
            controlInteractiveSize: 28,
        },
        DatePicker: {
            fontSize: 16,
        }
    },
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ReduxProvider store={store}>
            <ConfigProvider
                theme={antdTheme}
                locale={ruRU}
            >
                <App/>
            </ConfigProvider>
        </ReduxProvider>
    </StrictMode>,
)
