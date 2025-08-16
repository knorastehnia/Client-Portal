'use client'

import styles from './page.module.css'
import Clients from "@/components/dashboard/clients"
import TextInput from '@/components/form/input'
import Button from '@/components/form/button'
import { useEffect, useState } from 'react'

const ClientsPage = () => {
    const [showModal, setShowModal] = useState<boolean>(false)
    const [failedEmptyName, setFailedEmptyName] = useState<boolean>(false)
    const [failedEmptyEmail, setFailedEmptyEmail] = useState<boolean>(false)
    const [failedServer, setFailedServer] = useState<boolean>(false)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const data = new FormData(event.currentTarget)

        setFailedEmptyName(!Boolean(data.get('name')))
        setFailedEmptyEmail(!Boolean(data.get('email')))

        if (!Boolean(data.get('name')) || !Boolean(data.get('email'))) return

        try {
            const response = await fetch('http://localhost:3000/api/admin/client/create-client', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client_email: data.get('email'),
                    client_name: data.get('name')
                })
            })

            if (!response.ok) throw new Error(`Failed to fetch - status: ${response.status}`)

            window.location.reload()
        } catch (err) {
            console.log(err)
            setFailedServer(true)
        }
    }

    const closeModal = (event: KeyboardEvent | React.MouseEvent) => {
        if (!('key' in event) || 'key' in event && event.key === 'Escape') {
            setShowModal(false)
            setFailedEmptyEmail(false)
            setFailedEmptyName(false)
            setFailedServer(false)
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', closeModal)

        return () => document.removeEventListener('keydown', closeModal)
    }, [])

    return (
        <div>
            <div className={styles['new-item']}>
                <button onClick={() => setShowModal(true)}>
                    New Client
                </button>
            </div>

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
                        : {transform: 'translate(-50%, -50%) scale(0.97)', filter: 'blur(5px)'}}
                    className={styles['box']}
                >
                    <h3>Register New Client</h3>
                    <form autoComplete='off' onSubmit={handleSubmit} className={styles['form']}>
                        <TextInput inputDisabled={!showModal} inputType='text' inputName='name'>Name</TextInput>
                        <TextInput inputDisabled={!showModal} inputType='text' inputName='email'>Email</TextInput>

                        <div style={failedServer ? {display: 'block'} : {display: 'none'}} className={styles['submit-fail']}>
                            <p>Something went wrong.</p>
                        </div>

                        <div style={failedEmptyName ? {display: 'block'} : {display: 'none'}} className={styles['submit-fail']}>
                            <p>Please enter a valid name.</p>
                        </div>

                        <div style={failedEmptyEmail ? {display: 'block'} : {display: 'none'}} className={styles['submit-fail']}>
                            <p>Please enter a valid email.</p>
                        </div>

                        <Button buttonDisabled={!showModal} buttonStyle='main'>Register Client</Button>
                    </form>
                </div>
            </div>

            <Clients />
        </div>
    )
}

export default ClientsPage
