'use client'

import styles from './page.module.css'
import Clients from "@/components/dashboard/clients"
import TextInput from '@/components/form/input'
import Button from '@/components/form/button'
import Image from 'next/image'
import Modal from '@/components/dashboard/modal'
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

    useEffect(() => {
        setFailedEmptyEmail(false)
        setFailedEmptyName(false)
        setFailedServer(false)
    }, [showModal])

    return (
        <div>
            <div className={styles['new-item']}>
                <button onClick={() => setShowModal(true)}>
                    <Image
                        className={styles['plus-icon']}
                        src={'/icons/Add.svg'}
                        alt='Add'
                        width={24}
                        height={24}
                    />
                    <span>
                        New Client
                    </span>
                </button>
            </div>

            <Modal showModal={showModal} setShowModal={setShowModal}>
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
            </Modal>

            <Clients />
        </div>
    )
}

export default ClientsPage
