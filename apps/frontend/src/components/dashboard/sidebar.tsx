import styles from './sidebar.module.css'
import Image from 'next/image'

interface SidebarProps {
    children: React.ReactNode
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
    return (
        <div className={styles['sidebar']}>
            <div className={styles['logo']}>
                <Image
                    width={180}
                    height={80}
                    src={'/Logo.svg'}
                    alt='Logo'
                />
            </div>

            <div className={styles['links']}>
                {children}
            </div>
        </div>
    )
}

export default Sidebar
