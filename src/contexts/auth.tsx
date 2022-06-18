import { useRouter } from "next/router";
import { createContext, ReactNode, useContext, useState } from "react";
import { api } from "../services/api";

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

      setUser({
        email,
        permissions,
        roles
      })

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