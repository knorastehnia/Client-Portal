import { useState, useEffect, useRef } from "react"
import styles from './projects.module.css'

interface ProjectHeader {
    id: string,
    title: string,
    updated_at: string
}

const Projects = () => {
    const sliderRef = useRef<HTMLDivElement>(null)
    const [projectHeaders, setProjectHeaders] = useState<ProjectHeader[]>([])
    const [showButtons, setShowButtons] = useState<boolean[]>([false, false])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const getProjects = async () => {
        try {
            const response = await fetch('http://org1.localhost:3000/api/admin/project/get-project-headers', {
                method: 'GET',
                credentials: 'include'
            })

            const result = await response.json()

            if (result instanceof Array) {
                result.sort(
                    (a: ProjectHeader, b: ProjectHeader) => 
                    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                )
            }

            if (result.redirect) {
                window.location.href = result.redirect
            } else {
                setProjectHeaders(result)
                setIsLoading(false)
            }
        } catch (err) {
            console.log(err)
        }
    }

    const scrollSlider = (scrollAmount: number) => {
        sliderRef.current?.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        })
    }

    const handleScroll = () => {
        const slider = sliderRef.current
        const maxScroll = slider!.scrollWidth - slider!.getBoundingClientRect().width
        setShowButtons([
            (slider?.scrollLeft || 0) > 5,
            (slider?.scrollLeft || 0) < maxScroll - 5
        ])
    }

    useEffect(() => {
        handleScroll()
    }, [projectHeaders])
    
    useEffect(() => {
        getProjects()

        sliderRef.current?.addEventListener('scroll', handleScroll)
        return () => sliderRef.current?.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className={styles['projects-container']}>
            <h2>Active Projects</h2>

            <div ref={sliderRef} className={styles['projects-slider']}>
                <button
                    style={showButtons[0] ? {opacity: 0.5, pointerEvents: 'all'} : {opacity: 0, pointerEvents: 'none'}}
                    onClick={() => scrollSlider(-300)} className={styles['arrow-left']}
                    tabIndex={showButtons[0] ? 0 : -1}
                >
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

                <button
                    style={showButtons[1] ? {opacity: 0.5, pointerEvents: 'all'} : {opacity: 0, pointerEvents: 'none'}}
                    onClick={() => scrollSlider(300)} className={styles['arrow-right']}
                    tabIndex={showButtons[1] ? 0 : -1}
                >
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

                <div className={styles['projects-content']}>
                    {
                    projectHeaders.length !== 0
                        ? projectHeaders.map((element, index) => (
                            <a
                                href={`/admin/project?project_id=${element.id}`}
                                key={index}
                            >
                                <span>
                                    {element.title}
                                </span>
                            </a>))
                        : isLoading
                            ? [...Array(3).keys()].map((value) =>
                                (<div key={value} className={styles['skeleton']}></div>))
                            : <span className={styles['empty']}>No Active Projects</span>
                    }
                </div>
            </div>
        </div>
    )
}

export default Projects
