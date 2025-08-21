import { useEffect, useRef } from 'react'
import styles from './dropdown.module.css'

interface DropdownProps {
    children: React.ReactNode,
    showDropdown: boolean,
    setShowDropdown: Function
}

const Dropdown: React.FC<DropdownProps> = ({ children, showDropdown, setShowDropdown }) => {
    const dropdownRef = useRef<HTMLDivElement>(null)

    const closeDropdown = (event: PointerEvent) => {
        if (dropdownRef.current?.parentElement?.contains((event.target as HTMLDivElement))) return

        setShowDropdown(false)
    }

    const escapeDropdown = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') return

        setShowDropdown(false)
    }

    useEffect(() => {
        document.addEventListener('keydown', escapeDropdown)
        window.addEventListener('pointerdown', closeDropdown)

        return () => window.removeEventListener('pointerdown', closeDropdown)
    }, [])

    return (
        <div
            ref={dropdownRef}
            className={styles['dropdown']}
            style={showDropdown
                ? {opacity: 1, pointerEvents: 'all'}
                : {opacity: 0, pointerEvents: 'none'}}
        >
            <div
                className={styles['dropdown-content']}
                style={showDropdown
                    ? {transform: 'scale(1)', filter: 'none'}
                    : {transform: 'scale(0.92)', filter: 'blur(10px)'}}
            >
                {children}
            </div>
        </div>
    )
}

export default Dropdown
