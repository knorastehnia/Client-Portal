'use client'

import Projects from '@/components/dashboard/projects'
import History from '@/components/dashboard/history'
import TextInput from '@/components/form/input'
import Button from '@/components/form/button'
import Modal from '@/components/dashboard/modal'
import Image from 'next/image'
import styles from './page.module.css'
import { useEffect, useState } from 'react'

const ProjectsPage = () => {
    const [showModal, setShowModal] = useState<boolean>(false)
    const [failedEmptyTitle, setFailedEmptyTitle] = useState<boolean>(false)
    const [failedServer, setFailedServer] = useState<boolean>(false)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const data = new FormData(event.currentTarget)

        if (!data.get('title')) {
            setFailedEmptyTitle(true)
            return
        }

        try {
            const response = await fetch('http://localhost:3000/api/admin/project/create-project', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: data.get('title')
                })
            })

            if (!response.ok) throw new Error(`Failed to fetch - status: ${response.status}`)

            window.location.reload()
        } catch (err) {
            setFailedServer(true)
            console.log(err)
        }
    }

    useEffect(() => {
        setFailedEmptyTitle(false)
        setFailedServer(false)
    }, [showModal])

    return (
        <div className={styles['projects']}>
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
                        New Project
                    </span>
                </button>
            </div>

            <Modal showModal={showModal} setShowModal={setShowModal}>
                <h3>Create New Project</h3>
                <form autoComplete='off' onSubmit={handleSubmit} className={styles['form']}>
                    <TextInput inputDisabled={!showModal} inputType='text' inputName='title'>Title</TextInput>

                    <div style={failedServer ? {display: 'block'} : {display: 'none'}} className={styles['submit-fail']}>
                        <p>Something went wrong.</p>
                    </div>

                    <div style={failedEmptyTitle ? {display: 'block'} : {display: 'none'}} className={styles['submit-fail']}>
                        <p>Please enter a valid title.</p>
                    </div>

                    <Button buttonDisabled={!showModal} buttonStyle='main'>Create Project</Button>
                </form>
            </Modal>

            <Projects>Active Projects</Projects>
            <History>Project History</History>
        </div>
    )
}

export default ProjectsPage
