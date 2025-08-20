'use client'

import Files from '@/components/dashboard/files'
import Modal from '@/components/dashboard/modal'
import Image from 'next/image'
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
    const [filteredClients, setFilteredClients] = useState<ClientHeader[]>([])

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
            setFilteredClients(result)
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

    const setStatus = async (event: React.MouseEvent) => {
        const params = new URLSearchParams(window.location.search)
        const paramsProjectID = params.get('project_id')

        try {
            const response = await fetch(`http://localhost:3000/api/admin/project/set-project-status?project_id=${paramsProjectID}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: event.currentTarget.getAttribute('data-status')
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

    const searchClients = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        let result = []

        for (let item of clientHeaders) {
            const normalizedValue = value.toLocaleLowerCase().trim()
            if (
                item.full_name.toLocaleLowerCase()
                    .includes(normalizedValue)

                ||

                item.email
                    .includes(normalizedValue)
            ) result.push(item)
        }

        setFilteredClients(result)
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
                    <button
                        className={styles['status']}
                        onClick={() => setShowStatusModal(true)}
                    >
                        <span
                            className={styles['status-edit']}
                            style={
                                projectHeader.current_status === 'Cancelled' ?
                                    {backgroundColor: '#262626'} :
                                projectHeader.current_status === 'Paused' ?
                                    {backgroundColor: '#e69a3d'} :
                                projectHeader.current_status === 'In Progress' ?
                                    {backgroundColor: '#667aff'} :
                                projectHeader.current_status === 'Completed' ?
                                    {backgroundColor: '#3da45a'} : {}
                            }
                        >
                            {
                                projectHeader.current_status
                            }
                        </span>
                        <Image
                            src={'/icons/Edit.svg'}
                            alt='change status'
                            width={20}
                            height={20}
                        />
                    </button>
                </div>

                <Modal showModal={showStatusModal} setShowModal={setShowStatusModal}>
                    <div className={styles['items']}>
                        <h3>Set Project Status</h3>
                        <div className={styles['item-list']}>
                            <button
                                className={styles['item']}
                                onClick={setStatus}
                                data-status='Cancelled'
                            >
                                Cancelled</button>

                            <button
                                className={styles['item']}
                                onClick={setStatus}
                                data-status='Paused'
                            >
                                Paused</button>

                            <button
                                className={styles['item']}
                                onClick={setStatus}
                                data-status='In Progress'
                            >
                                In Progress</button>

                            <button
                                className={styles['item']}
                                onClick={setStatus}
                                data-status='Completed'
                            >
                                Completed</button>
                        </div>
                    </div>
                </Modal>

                <div className={styles['detail']}>
                    <span className={styles['label']}>Client:</span>
                    <div className={styles['name']}>
                        {projectHeader.full_name !== null
                            ? projectHeader.full_name
                            :
                                <button className={styles['assign']} onClick={() => {
                                    getClients()
                                    setShowClientModal(true)
                                }}>
                                    Assign a Client
                                </button>
                        }
                    </div>
                </div>

                <Modal showModal={showClientModal} setShowModal={setShowClientModal}>
                    <div className={styles['items']}>
                        <div className={styles['header']}>
                            <h3>Assign a Client to This Project</h3>
                            <div className={styles['search-options']}>
                                <input
                                    type="search"
                                    placeholder={'Search...'}
                                    onChange={searchClients}
                                />
                            </div>
                        </div>

                        <div className={styles['item-list']}>
                            {filteredClients.map((element, index) => (
                                <button
                                    onClick={assignClient}
                                    className={styles['item']}
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
