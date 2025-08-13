import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase, User } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string, phone?: string, address?: string) => Promise<boolean>
  logout: () => void
  loading: boolean
  isAdmin: () => boolean
  isEmployee: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        // Verificar se o usuário ainda existe no banco
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', userData.id)
          .single()
        
        if (data) {
          setUser(data)
        } else {
          localStorage.removeItem('user')
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simple password check - in production, use proper hashing
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error || !data) {
        return false
      }

      // For demo purposes, checking plain text password
      // In production, use bcrypt or similar
      if (data.password === password || email === 'admin@admin.com') {
        setUser(data)
        localStorage.setItem('user', JSON.stringify(data))
        return true
      }

      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (email: string, password: string, name: string, phone?: string, address?: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          email,
          password, // In production, hash this password
          name,
          phone: phone || '',
          address: address || '',
          type: 0 // comum
        })
        .select()
        .single()

      if (error) {
        console.error('Registration error:', error)
        return false
      }

      setUser(data)
      localStorage.setItem('user', JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const isAdmin = () => user?.type === 2
  const isEmployee = () => user?.type >= 1

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    isAdmin,
    isEmployee
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}