import { useEffect, useState } from "react"
import styles from './clients.module.css'

interface ClientHeader {
    id: string,
    email: string,
    full_name: string
}

const Clients = () => {
    const [clientHeaders, setClientHeaders] = useState<ClientHeader[]>([])
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
                setIsLoading(false)
            }
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        getClients()
    }, [])

    return (
        <div className={styles['client-list']}>
            <h2>Clients</h2>
            {clientHeaders.length !== 0
                ? clientHeaders.map((element, index) => (
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
                    : <span className={styles['empty']}>No Clients</span>
            }
        </div>
    )
}

export default Clients
