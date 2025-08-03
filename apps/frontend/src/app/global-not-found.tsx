import { Hedvig_Letters_Sans } from 'next/font/google'
import './globals.css'
import GlowBackground from "@/components/design/glowBackground"

const Custom404 = () => {
    return (
        <html>
            <body>
                <GlowBackground />
                <h1
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',

                        position: 'absolute',
                        top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 'fit-content',

                        fontWeight: '300',
                        fontSize: '1.5rem',
                    }}
                >
                    <b
                        style={{
                            fontSize: '7rem',
                            textAlign: 'center'
                        }}
                    >404</b>

                    <span style={{textAlign: 'center'}}>Page Not Found</span>
                </h1>
            </body>
        </html>
    )
}

export default Custom404
