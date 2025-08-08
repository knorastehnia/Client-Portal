'use client'

import Projects from '@/components/dashboard/projects'
import styles from './page.module.css'
import { useState } from 'react'

interface AdminPageProps {
    children: React.ReactNode
}

const AdminPage: React.FC<AdminPageProps> = ({ children }) => {
    const [username, setUsername] = useState<string>('User')

    return (
        <div className={styles['dashboard']}>
            <h1>Welcome back, {username}!</h1>
            <Projects />
        </div>
    )
}

export default AdminPage
