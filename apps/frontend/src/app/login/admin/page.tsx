'use client'

import { useState } from 'react'
import styles from './page.module.css'
import Image from 'next/image'
import TextInput from '@/components/form/input'
import Button from '@/components/form/button'
import GlowBackground from '@/components/design/glowBackground'

const Login = () => {
    const [failedLogin, setFailedLogin] = useState<Boolean>(false)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const data = new FormData(event.currentTarget)

        try {
            const response = await fetch('http://org1.localhost:3000/api/admin/auth/login', {
                method: 'POST',
                credentials: 'include',
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
            <GlowBackground />

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
                    <Button buttonStyle='alt'>
                        <Image
                            src='/Google.svg'
                            alt='(G)'
                            width={20}
                            height={20}
                            priority
                        />
                        <span>Login with Google</span>
                    </Button>
                    <div className={styles['or-separator']}>or</div>
                    <form autoComplete='off' onSubmit={handleSubmit} className={styles['auth-form']}>
                        <div style={failedLogin ? {display: 'block'} : {display: 'none'}} className={styles['login-fail']}>
                            <p>Incorrect username or password.</p>
                        </div>

                        <TextInput inputType='email'>Email</TextInput>
                        <TextInput inputType='password'>Password</TextInput>

                        <Button buttonStyle='main'>Login</Button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login
