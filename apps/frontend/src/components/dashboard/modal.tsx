import styles from './modal.module.css'
import { useEffect } from 'react'

interface ModalProps {
    children: React.ReactNode,
    showModal: boolean,
    setShowModal: Function
}

const Modal: React.FC<ModalProps> = ({ children, showModal, setShowModal }) => {
    const closeModal = (event: KeyboardEvent | React.MouseEvent) => {
        if (!('key' in event) || 'key' in event && event.key === 'Escape') {
            setShowModal(false)
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', closeModal)

        return () => document.removeEventListener('keydown', closeModal)
    }, [])

    return (
        <div
            style={showModal
                ? {opacity: 1, pointerEvents: 'all'}
                : {opacity: 0, pointerEvents: 'none'}}
            className={styles['modal']}
        >
            <div onClick={closeModal} className={styles['background']}></div>

            <div
                style={showModal
                    ? {transform: 'translate(-50%, -50%) scale(1)', filter: 'none'}
                    : {transform: 'translate(-50%, -50%) scale(0.97)', filter: 'blur(10px)'}}
                className={styles['box']}
            >
                {children}
            </div>
        </div>
    )
}

export default Modal
