import { useRouter } from "next/router";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { setCookie, parseCookies, destroyCookie } from 'nookies'

import { api } from "../services/apiClient";

type SignInCredentials = {
  email: string
  password: string
}

type User = {
  email: string
  permissions: string[]
  roles: string[]
}

interface AuthContextData {
  signIn(credentials: SignInCredentials): Promise<void>
  isAuthenticated: boolean;
  user: User
}

interface AuthProviderProps {
  children: ReactNode
}

const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: AuthProviderProps) {

  const router = useRouter()

  const [ user, setUser ] = useState<User>()

  const isAuthenticated = !!user

  useEffect(() => {
    const { 'nextauth.token' : token } = parseCookies()

    if (token) {
      api.get('me').then(response => {
        const { email, permissions, roles } = response.data

        setUser({ email, permissions, roles })
      }).catch(error => {
        destroyCookie(undefined, 'nextauth.token')
        destroyCookie(undefined, 'nextauth.refreshToken')

        router.push('/')
      })
    }

  },[router])

  async function signIn({ email, password } : SignInCredentials): Promise<void> {
    try {
      const response = await api.post('sessions', {
        email,
        password
      })

      const { 
        permissions, 
        roles,
        token,
        refreshToken
      } = response.data

      setCookie(undefined, 'nextauth.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })
      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })

      setUser({
        email,
        permissions,
        roles
      })

      api.defaults.headers['Authorization'] = `Bearer ${token}`

      router.push('dashboard')
      
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      signIn,
      user
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}