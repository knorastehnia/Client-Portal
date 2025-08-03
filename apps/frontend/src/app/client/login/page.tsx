'use client'

import { useState } from 'react'
import styles from './page.module.css'
import Image from 'next/image'
import TextInput from '@/components/form/input'

export default function Home() {
    const [failedLogin, setFailedLogin] = useState<Boolean>(false)

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
            if (result.redirect) window.location.href = result.redirect
        } catch (err) {
            setFailedLogin(true)
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
                        <div style={failedLogin ? {display: 'block'} : {display: 'none'}} className={styles['login-fail']}>
                            <p>Incorrect username or password.</p>
                        </div>

                        <TextInput inputType='email'>Email</TextInput>
                        <TextInput inputType='password'>Password</TextInput>

                        <button className={styles['main-button']} type='submit'>Login</button>
                    </form>
                </div>
            </div>
        </div>
    )
}
