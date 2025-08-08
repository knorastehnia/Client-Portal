'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'

interface AdminPageProps {
    children: React.ReactNode
}

const AdminPage: React.FC<AdminPageProps> = ({ children }) => {
    const [projectHeaders, setProjectHeaders] = useState<string[]>([])

    const getProjects = async () => {
        try {
            const response = await fetch('http://org1.localhost:3000/api/admin/project/get-project-headers', {
                method: 'GET',
                credentials: 'include'
            })

            const result = await response.json()
            if (result.redirect) {
                console.log('redirecting...')
                window.location.href = result.redirect
            } else {
                setProjectHeaders(result)
            }
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        getProjects()
    }, [])

    return (
        <div className={styles['dashboard']}>
            <h1>Welcome back, John!</h1>
            <div></div>
        </div>
    )
}

export default AdminPage
