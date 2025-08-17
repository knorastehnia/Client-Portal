'use client'

import Files from '@/components/dashboard/files'
import Image from 'next/image'
import Modal from '@/components/dashboard/modal'
import styles from './page.module.css'
import { useEffect, useState } from 'react'

interface ProjectHeader {
    id: string,
    full_name: string | null,
    title: string,
    current_status: string,
    updated_at: string,
    created_at: string
}

interface ClientHeader {
    id: string,
    email: string,
    full_name: string
}

const ProjectPage = () => {
    const [showClientModal, setShowClientModal] = useState<boolean>(false)
    const [showStatusModal, setShowStatusModal] = useState<boolean>(false)

    const [fetchedClients, setFetchedClients] = useState<boolean>(false)
    const [clientHeaders, setClientHeaders] = useState<ClientHeader[]>([])

    const [projectHeader, setProjectHeader] = useState<ProjectHeader>({
        id: '',
        full_name: null,
        title: '',
        current_status: '',
        updated_at: '',
        created_at: ''
    })

    const getProject = async (paramProjectID: string) => {
        try {
            const response = await fetch(`http://localhost:3000/api/admin/project/get-project?project_id=${paramProjectID}`, {
                method: 'GET',
                credentials: 'include'
            })

            const result = await response.json()

            if (result.redirect) {
                window.location.href = result.redirect
            } else {
                setProjectHeader(result)
            }
        } catch (err) {
            console.log(err)
        }
    }

    const getClients = async () => {
        try {
            if (fetchedClients) return

            const response = await fetch('http://localhost:3000/api/admin/client/get-client-headers', {
                method: 'GET',
                credentials: 'include'
            })

            if (!response.ok) throw new Error(`Failed to fetch - status: ${response.status}`)

            const result = await response.json()
            setClientHeaders(result)
            setFetchedClients(true)
        } catch (err) {
            console.log(err)
        }
    }

    const assignClient = async (event: React.MouseEvent) => {
        const params = new URLSearchParams(window.location.search)
        const paramsProjectID = params.get('project_id')

        try {
            const response = await fetch(`http://localhost:3000/api/admin/project/assign-client?project_id=${paramsProjectID}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client_id: event.currentTarget.getAttribute('data-id')
                })
            })

            if (!response.ok) throw new Error(`Failed to fetch - status: ${response.status}`)

            window.location.reload()
        } catch (err) {
            console.log(err)
        }
    }

    const getTimeSince = (timeString: string) => {
        const diff = new Date().getTime() - new Date(timeString).getTime()
        const timeScale: any = [
            ['second', 1000],
            ['minute', 60],
            ['hour', 60],
            ['day', 24],
            ['week', 7],
            ['month', 4.34],
            ['year', 12],
            ['inf', Infinity]
        ]

        let current = 1

        for (let scale of timeScale) {
            current *= scale[1]

            try {
                const next = current * timeScale[timeScale.indexOf(scale) + 1][1]
                if (diff >= current && diff < next) {
                    const result = Math.floor(diff / current)
                    return `${result} ${scale[0]}${result !== 1 ? 's' : ''} ago`
                }
            } catch {
                return 'Just now'
            }
        }
    }

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const paramProjectID = params.get('project_id')
        if (paramProjectID) {
            getProject(paramProjectID)
        } else {
            window.location.href = '/admin/projects'
        }
    }, [])

    return (
        <div>
            <h2>Project Info</h2>

            <div className={styles['details']}>
                <div className={styles['detail']}>
                    <span className={styles['label']}>Status:</span>
                    <div className={styles['status']}>
                        In Progress
                    </div>
                    <button onClick={() => setShowStatusModal(true)}>
                        <Image
                            src={'/icons/Edit.svg'}
                            alt='edit'
                            width={24}
                            height={24}
                        />
                    </button>
                </div>

                <Modal showModal={showStatusModal} setShowModal={setShowStatusModal}>
                    <div>Status:</div>
                </Modal>

                <div className={styles['detail']}>
                    <span className={styles['label']}>Client:</span>
                    <div className={styles['name']}>
                        {projectHeader.full_name !== null
                            ? projectHeader.full_name
                            : 'Not Assigned'
                        }
                    </div>
                    {
                        projectHeader.full_name === null
                            ? (
                                <button onClick={() => {
                                    getClients()
                                    setShowClientModal(true)
                                }}>
                                    <Image
                                        src={'/icons/Edit.svg'}
                                        alt='edit'
                                        width={24}
                                        height={24}
                                    />
                                </button>
                            )
                            : null
                    }
                </div>

                <Modal showModal={showClientModal} setShowModal={setShowClientModal}>
                    <div className={styles['clients']}>
                        <h3>Assign Project To:</h3>
                        <div className={styles['list']}>
                            {clientHeaders.map((element, index) => (
                                <button
                                    onClick={assignClient}
                                    className={styles['client']}
                                    key={index}
                                    data-id={element.id}
                                >
                                    <div className={styles['name']}>{element.full_name}</div>
                                    <div>{element.email}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </Modal>

                <div className={styles['detail']}>
                    <span className={styles['label']}>Updated:</span>
                    <div className={styles['date']}>
                        {getTimeSince(projectHeader.updated_at)}
                    </div>
                </div>

                <div className={styles['detail']}>
                    <span className={styles['label']}>Created:</span>
                    <div className={styles['date']}>
                        {new Date(projectHeader.created_at).toLocaleDateString()}
                    </div>
                </div>
            </div>

            <Files />
        </div>
    )
}

export default ProjectPage
