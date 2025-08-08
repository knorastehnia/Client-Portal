'use client'

import Projects from '@/components/dashboard/projects'
import styles from './page.module.css'

interface AdminPageProps {
    children: React.ReactNode
}

const AdminPage: React.FC<AdminPageProps> = ({ children }) => {
    return (
        <div className={styles['dashboard']}>
            <h1>Welcome back, John!</h1>
            <Projects />
        </div>
    )
}

export default AdminPage
