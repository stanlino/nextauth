import { GetServerSideProps } from 'next'
import { parseCookies } from 'nookies'
import { FormEvent, useState } from 'react'
import { useAuth } from '../contexts/auth'
import styles from '../styles/Home.module.css'

export default function Home() {

  const { signIn } = useAuth()

  const [ email, setEmail ] = useState('diego@rocketseat.team')
  const [ password, setPassword ] = useState('123456')

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


export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookies = parseCookies(ctx)

  if (cookies['nextauth.token']) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false
      }
    }
  }
  
  return {
    props: {}
  }
}