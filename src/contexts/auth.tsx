import { createContext, ReactNode, useContext } from "react";
import { api } from "../services/api";

type SignInCredentials = {
  email: string
  password: string
}

interface AuthContextData {
  signIn(credentials: SignInCredentials): Promise<void>
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: ReactNode
}

const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: AuthProviderProps) {

  const isAuthenticated = false

  async function signIn({ email, password } : SignInCredentials): Promise<void> {
    try {
      const response = await api.post('sessions', {
        email,
        password
      })

      console.log(response.data)

    } catch (err) {
      console.log(err)
    }
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      signIn
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}