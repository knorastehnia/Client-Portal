import { useState, useEffect, useRef } from "react"
import styles from './projects.module.css'

interface ProjectHeader {
    id: string,
    title: string
}

const Projects = () => {
    const sliderRef = useRef<HTMLDivElement>(null)
    const [projectHeaders, setProjectHeaders] = useState<ProjectHeader[]>([])
    const [showButtons, setShowButtons] = useState<boolean>(false)

    const getProjects = async () => {
        try {
            const response = await fetch('http://org1.localhost:3000/api/admin/project/get-project-headers', {
                method: 'GET',
                credentials: 'include'
            })

            const result = await response.json()
            if (result.redirect) {
                window.location.href = result.redirect
            } else {
                setProjectHeaders(result)
            }
        } catch (err) {
            console.log(err)
        }
    }

    const scrollLeft = () => {
        let lastHidden: HTMLDivElement | null = null

        for (let item of sliderRef.current!.childNodes) {
            if (item instanceof HTMLDivElement) {
                const parentRect = item.parentElement?.parentElement?.getBoundingClientRect()
                const rect = item.getBoundingClientRect()
                const visible = rect.left + 10 >= (parentRect?.left || 0)

                if (!visible) {
                    lastHidden = item
                }
            }
        }

        lastHidden?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    const scrollRight = () => {
        let firstHidden: HTMLDivElement | null = null

        for (let item of sliderRef.current!.childNodes) {
            if (item instanceof HTMLDivElement) {
                const parentRect = item.parentElement?.parentElement?.getBoundingClientRect()
                const rect = item.getBoundingClientRect()
                const visible = rect.right - 10 <= (parentRect?.right || 0)


                if (!visible) {
                    firstHidden = item
                    break
                }
            }
        }

        firstHidden?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    useEffect(() => {
        const contentRect = sliderRef.current?.getBoundingClientRect()
        const sliderRect = sliderRef.current?.parentElement?.getBoundingClientRect()

        setShowButtons((contentRect?.width || 0) > (sliderRect?.width || 0))
    }, [projectHeaders])

    useEffect(() => {
        getProjects()
    }, [])

    return (
        <div className={styles['projects-container']}>
            <h2>Active Projects</h2>

            <div className={styles['projects-slider']}>
                <button style={showButtons ? {display: 'block'} : {display: 'none'}} onClick={scrollLeft} className={styles['arrow-left']}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="36px" viewBox="0 -960 960 960" width="36px"
                    >
                        <path 
                            d="M560-267.69 347.69-480 
                            560-692.31 588.31-664l-184 
                            184 184 184L560-267.69Z"
                        />
                    </svg>
                </button>

                <button style={showButtons ? {display: 'block'} : {display: 'none'}} onClick={scrollRight} className={styles['arrow-right']}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="36px" viewBox="0 -960 960 960" width="36px"
                    >
                        <path 
                            d="m531.69-480-184-184L376-692.31 
                            588.31-480 376-267.69 347.69-296l184-184Z"
                        />
                    </svg>
                </button>

                <div ref={sliderRef} className={styles['projects-content']}>
                    <div className={styles['first']}></div>
                    {projectHeaders.map((element, index) => (
                        <div key={index}>{element.title}</div>
                    ))}
                    <div className={styles['last']}></div>
                </div>
            </div>
        </div>
    )
}

export default Projects
