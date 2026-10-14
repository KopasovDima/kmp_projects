import './App.css'
import {
    CallStatistics,
    DjangoAdmin,
    Home,
    RedmineCommonStatistics,
    RedmineStatistics,
    ServerTempShortcut,
    Statistics1C,
    ZabbixMonitoringStatistics,
    ZabbixStatistics,
} from '@/pages'
import {Header} from '@/components'
import {BrowserRouter, Navigate, Route, Routes} from 'react-router'

function App() {
    return (
        <BrowserRouter>
            <Header/>
            <Routes>
                <Route path={'/'} element={<Home/>}/>
                <Route path={'/1c'} element={<Statistics1C/>}/>
                <Route path={'/calls'} element={<CallStatistics/>}/>
                <Route path={'/redmine'} element={<RedmineStatistics/>}/>
                <Route path={'/redmine_common'} element={<RedmineCommonStatistics/>}/>
                <Route path={'/zabbix'} element={<ZabbixStatistics/>}/>
                <Route path={'/zabbix-monitoring'} element={<ZabbixMonitoringStatistics/>}/>
                <Route path={'/admin'} element={<DjangoAdmin/>}/>
                <Route path={'/serv-t'} element={<ServerTempShortcut/>}/>

                {/* Редирект на главную для неизвестного адреса */}
                <Route path={'*'} element={<Navigate to={'/'}/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App
