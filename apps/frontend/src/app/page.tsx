import Image from 'next/image'
import styles from './page.module.css'

export default function Home() {
    return (
        <div>
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
                <form className={styles['auth-form']} action='submit'>
                    <label htmlFor='email'>Email</label>
                    <input type='email' id='email' />

                    <label htmlFor='password'>Password</label>
                    <input type='password' id='password' />
                    <button className={styles['main-button']} type='submit'>Login</button>
                </form>
            </div>
        </div>
    )
}
