'use client'

import Image from 'next/image'
import styles from './page.module.css'
import { useState } from 'react'

export default function Home() {
    const [activeInputs, setActiveInputs] = useState<Array<string>>([])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const data = new FormData(event.currentTarget)
        
        try {
            const response = await fetch('http://org1.localhost:3000/api/client/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: data.get('email'),
                    password: data.get('password')
                })
            })

            if (!response.ok) throw new Error(`Failed to fetch - status: ${response.status}`)
            
            const result = await response.json()
            console.log(result)
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div>
            <div className={styles['glow-bg']}>
                <div className={styles['glow-primary']}></div>
                <div className={styles['glow-primary']}></div>
                <div className={styles['glow-primary']}></div>
                <div className={styles['glow-alt']}></div>
                <div className={styles['glow-alt']}></div>
            </div>

            <div className={styles['auth-sbs']}>
                <div className={styles['logo']}>
                    <Image
                        src='/Logo.svg'
                        alt='Logo'
                        width={300}
                        height={200}
                        priority
                    />
                </div>

                <div className={styles['auth-widget']}>
                    <button className='alt-button'>
                        <Image
                            src='/Google.svg'
                            alt='(G)'
                            width={20}
                            height={20}
                            priority
                        />
                        <span>Login with Google</span>
                    </button>
                    <div className={styles['or-separator']}>or</div>
                    <form autoComplete='off' onSubmit={handleSubmit} className={styles['auth-form']}>
                        <div className={styles['input-field']}>
                            <label className={activeInputs.includes('email') ? styles['focused-label'] : ''} htmlFor='email'>Email</label>
                            <input
                                onFocus={(e) => setActiveInputs([...activeInputs, e.target.id])}
                                onBlur={() => setActiveInputs(activeInputs.filter(item => item !== 'email' || (document.querySelector(`#${item}`) as HTMLInputElement).value !== ''))}
                                type='text' id='email' name='email'
                            />
                        </div>

                        <div className={styles['input-field']}>
                            <label className={activeInputs.includes('password') ? styles['focused-label'] : ''} htmlFor='password'>Password</label>
                            <input
                                onFocus={(e) => setActiveInputs([...activeInputs, e.target.id])}
                                onBlur={() => setActiveInputs(activeInputs.filter(item => item !== 'password' || (document.querySelector(`#${item}`) as HTMLInputElement).value !== ''))}
                                type='password' id='password' name='password'
                            />
                        </div>

                        <button className={styles['main-button']} type='submit'>Login</button>
                    </form>
                </div>
            </div>
        </div>
    )
}
