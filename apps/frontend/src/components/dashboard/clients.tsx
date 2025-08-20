import { useEffect, useState } from "react"
import styles from './clients.module.css'

interface ClientHeader {
    id: string,
    email: string,
    full_name: string
}

const Clients = () => {
    const [clientHeaders, setClientHeaders] = useState<ClientHeader[]>([])
    const [filteredClients, setFilteredClients] = useState<ClientHeader[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const getClients = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/admin/client/get-client-headers', {
                method: 'GET',
                credentials: 'include'
            })

            const result = await response.json()
            if (result.redirect) {
                window.location.href = result.redirect
            } else {
                setClientHeaders(result)
                setFilteredClients(result)
                setIsLoading(false)
            }
        } catch (err) {
            console.log(err)
        }
    }

    const searchClients = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        let result = []

        for (let item of clientHeaders) {
            const normalizedValue = value.toLocaleLowerCase().trim()
            if (
                item.full_name.toLocaleLowerCase()
                    .includes(normalizedValue)

                ||

                item.email
                    .includes(normalizedValue)
            ) result.push(item)
        }

        setFilteredClients(result)
    }

    useEffect(() => {
        getClients()
    }, [])

    return (
        <div className={styles['client-list']}>
            <div className={styles['header']}>
                <h2>Clients</h2>
                <div className={styles['search-options']}>
                    <input
                        type="search"
                        placeholder={'Search...'}
                        onChange={searchClients}
                    />
                </div>
            </div>

            {filteredClients.length !== 0
                ? filteredClients.map((element, index) => (
                    <a
                        href={`/admin/client?client_id=${element.id}`}
                        key={index}
                    >
                        <div>{element.full_name}</div>
                        <div>{element.email}</div>
                    </a>))
                : isLoading
                    ? [...Array(6).keys()].map((value) => (
                        <div key={value} className={styles['skeleton']}></div>))
                    : <span className={styles['empty']}>You have no clients</span>
            }
        </div>
    )
}

export default Clients
