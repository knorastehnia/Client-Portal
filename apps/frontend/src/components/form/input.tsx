import { useState } from 'react'
import styles from './input.module.css'

interface TextInputProps {
    children: React.ReactNode
    inputType: 'email' | 'password' | 'text'
}

const TextInput: React.FC<TextInputProps> = ({ children, inputType }) => {
    const [inputFocus, setInputFocus] = useState<Boolean>(false)

    return (
        <div className={styles['input-field']}>
            <label
                className={inputFocus ? styles['focused-label'] : ''}
                htmlFor={inputType}
            >
                {children}
            </label>
            <input
                onFocus={() => setInputFocus(true)}
                onBlur={e => e.target.value || setInputFocus(false)}
                type={inputType}
                id={inputType}
                name={inputType}
            />
        </div>
    )
}

export default TextInput
