import { useEffect, useState } from "react"
import styles from './clients.module.css'

interface ClientHeader {
    id: string,
    email: string
}

const Clients = () => {
    const [clientHeaders, setClientHeaders] = useState<ClientHeader[]>([])

    const getClients = async () => {
        try {
            const response = await fetch('http://org1.localhost:3000/api/admin/client/get-client-headers', {
                method: 'GET',
                credentials: 'include'
            })

            const result = await response.json()
            if (result.redirect) {
                window.location.href = result.redirect
            } else {
                console.log(result)
                setClientHeaders(result)
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
            {clientHeaders.map((element, index) => (
                <button key={index}>{element.email}</button>
            ))}
        </div>
    )
}

export default Clients
