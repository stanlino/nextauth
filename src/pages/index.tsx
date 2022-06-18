import { FormEvent, useState } from 'react'
import { useAuth } from '../contexts/auth'
import styles from '../styles/Home.module.css'

export default function Home() {

  const { signIn } = useAuth()

  const [ email, setEmail ] = useState('')
  const [ password, setPassword ] = useState('')

  async function handleSubmit(event: FormEvent) {
    
    event.preventDefault()

    const credentials = {
      email,
      password
    }

    await signIn(credentials)

  }

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Entrar</button>
    </form>
  )
}
