import {FC, useCallback} from 'react'
import './SelectCompany.css'
import {useSelector} from 'react-redux'
import {getCompaniesSelector} from '@/store/selectors'
import {Empty} from 'antd'


export const SelectCompany: FC<
    {
        userCompanyId: number,
        selectedCompanyId: number,
        onCompanySelect: (company: any) => void,
    }
> = (
    {
        userCompanyId,
        selectedCompanyId,
        onCompanySelect,
    }
) => {
    const {availableCompanies} = useSelector(getCompaniesSelector)

    const renderCompanies = useCallback((company, margin) => {
        const content: any[] = []

        for (const c of availableCompanies)
            if (c.parent_id === company.id)
                content.push(renderCompanies(c, margin + 40))

        const userCompanyTitle = company.id === userCompanyId && selectedCompanyId !== userCompanyId ?
            ' - основная компания' : ''

        return (
            <div key={company.id}>
                <a
                    style={{
                        marginLeft: margin,
                        lineHeight: 2,
                    }}
                    onClick={(e) => {
                        e.preventDefault()
                        onCompanySelect(company)
                    }}
                >
                    {selectedCompanyId === company.id ? (
                        <b>{company.name}</b>
                    ) : (
                        <>
                            {company.name}
                            <b>{userCompanyTitle}</b>
                        </>
                    )}
                </a>
                {content}
            </div>
        )
    }, [userCompanyId, selectedCompanyId, onCompanySelect, availableCompanies])
    
    return (
        <div
            style={{
                overflow: 'auto',
                maxHeight: '50vh',
                scrollbarWidth: 'thin',
            }}
        >
            {availableCompanies ? (
                availableCompanies?.length ? (
                    renderCompanies(
                        availableCompanies[0],
                        10,
                    )
                ) : (
                    <Empty
                        style={{
                            // justifySelf: 'flex-start',
                            padding: 50,
                        }}
                        description={'Нет доступных компаний'}
                    />
                )
            ) : null}
        </div>
    )
}
