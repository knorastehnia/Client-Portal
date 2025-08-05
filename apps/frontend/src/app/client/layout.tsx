import Sidebar from '@/components/dashboard/sidebar'
import Image from 'next/image'

interface AdminPageProps {
    children: React.ReactNode
}

const AdminPage: React.FC<AdminPageProps> = ({ children }) => {
    return (
        <div>
            <Sidebar>
                <a href='#'>
                    <Image
                        width={16}
                        height={16}
                        src='/icons/Dashboard.svg'
                        alt='(i)'
                    />
                    <span>Dashboard</span>
                </a>

                <a href='#'>
                    <Image
                        width={16}
                        height={16}
                        src='/icons/Projects.svg'
                        alt='(i)'
                    />
                    <span>Projects</span>
                </a>

                <a href='#'>
                    <Image
                        width={16}
                        height={16}
                        src='/icons/Clients.svg'
                        alt='(i)'
                    />
                    <span>Clients</span>
                </a>
            </Sidebar>
            {children}
        </div>
    )
}

export default AdminPage
