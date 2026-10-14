import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import './icons.css'
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
        Tabs: {
            cardBg: '#bababa',
        },
        Checkbox: {
            controlInteractiveSize: 16,
        },
        TimePicker: {
            fontSize: 12,
        },
        DatePicker: {
            fontSize: 12,
        },
        Calendar: {
            fontSize: 12,
        },
        Table: {
            borderColor: '#c8c8c8',
            headerBg: '#dfdfdf',
            rowHoverBg: '#efefef',
            cellFontSizeSM: 12,
        },
        Dropdown: {
            fontSize: 12,
        },
        Select: {
            optionFontSize: 12,
            fontSize: 12,
        },
        Button: {
            fontSize: 12,
        },
        Empty: {
            fontSize: 12,
        },
        Tooltip: {
            fontSize: 12,
        },
        Input: {
            fontSize: 12,
        },
        Modal: {
            fontSize: 12,
        },
        InputNumber: {
            fontSize: 12,
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
