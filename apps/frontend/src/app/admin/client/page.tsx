'use client'

import styles from './page.module.css'
import History from '@/components/dashboard/history'
import { useEffect, useState } from 'react'

interface ClientHeader {
    id: string,
    email: string,
    full_name: string,
    created_at: string
}

const Client = () => {
    const [clientHeader, setClientHeader] = useState<ClientHeader>()

    const getClient = async () => {
        const params = new URLSearchParams(window.location.search)
        const paramClientID = params.get('client_id')

        try {
            const response = await fetch(`http://localhost:3000/api/admin/client/get-client?client_id=${paramClientID}`, {
                method: 'GET',
                credentials: 'include'
            })

            const result = await response.json()

            if (result.redirect) {
                window.location.href = result.redirect
            } else {
                setClientHeader(result)
            }
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        getClient()
    }, [])

    return (
        <div>
            <h2>Client Info</h2>

            <div className={styles['details']}>
                {clientHeader?.full_name}
            </div>

            <History>Assigned Projects</History>
        </div>
    )
}

export default Client
