import { createContext, ReactNode, useEffect, useState } from 'react'
import Router from 'next/router'
import { parseCookies, setCookie, destroyCookie } from 'nookies'

import * as fromStorageKeys from '../config/storage'
import { api } from '../services/apiClient'
import { User } from '../models/user'

type SignInCredentials = {
  email: string
  password: string
}

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>
  user: User
  isAuthenticated: boolean
}

type AuthProviderProps = {
  children: ReactNode
}

export const AuthContext = createContext({} as AuthContextData)

let authChannel: BroadcastChannel

export function signOut() {
  destroyCookie(undefined, fromStorageKeys.authToken)
  destroyCookie(undefined, fromStorageKeys.authRefreshToken)

  authChannel.postMessage('signOut')

  Router.push('/')
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>(null)
  const isAuthenticated = !!user

  useEffect(() => {
    authChannel = new BroadcastChannel('nextauth')
    authChannel.onmessage = message => {
      switch (message.data) {
        case 'signOut':
          signOut()
          break
        default:
          break
      }
    }
  }, [])

  useEffect(() => {
    async function getUserData() {
      const { [fromStorageKeys.authToken]: token } = parseCookies()

      if (token) {
        try {
          const { data } = await api.get<any>('/me')
          const { email, permissions, roles } = data

          setUser({ email, permissions, roles })
        } catch (err) {
          signOut()
        }
      }
    }

    getUserData()
  }, [])

  async function signIn({ email, password }: SignInCredentials): Promise<void> {
    try {
      const { data } = await api.post<any>('sessions', { email, password })
      const { permissions, roles, token, refreshToken } = data

      setCookie(undefined, fromStorageKeys.authToken, token, {
        maxAge: 60 * 60 * 24 * 15, // 15 days
        path: '/',
      })
      setCookie(undefined, fromStorageKeys.authRefreshToken, refreshToken, {
        maxAge: 60 * 60 * 24 * 15, // 15 days
        path: '/',
      })

      setUser({
        email,
        permissions,
        roles,
      })

      api.defaults.headers['Authorization'] = `Bearer ${token}`

      Router.push('/dashboard')
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  )
}
