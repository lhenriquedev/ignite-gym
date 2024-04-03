import { UserDTO } from "@dtos/UserDTO";
import { api } from "@services/api";
import { ReactNode, createContext, useEffect, useState } from "react";

import { storageUserGet, storageUserRemove, storageUserSave } from "@storage/storageUser";

export type AuthContextDataProps = {
  user: UserDTO
  isLoadingUserStorageData: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext({} as AuthContextDataProps)

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState({} as UserDTO)
  const [isLoadingUserStorageData, setIsLoadingUserStorageData] = useState(true)

  const signIn = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/sessions', { email, password })
      if (data.user) {
        setUser(data.user)
        storageUserSave(data.user)
      }
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      setIsLoadingUserStorageData(true)
      setUser({} as UserDTO)
      await storageUserRemove()
    } catch (error) {
      throw error
    } finally {
      setIsLoadingUserStorageData(false)
    }
  }

  const loadUserData = async () => {
    try {
      const userLogged = await storageUserGet()

      if (userLogged) {
        setUser(userLogged)
        setIsLoadingUserStorageData(false)
      }
    } catch (error) {
      throw error
    } finally {
      setIsLoadingUserStorageData(false)
    }
  }

  useEffect(() => {
    loadUserData()
  }, [])

  return (
    <AuthContext.Provider value={{ user, signIn, isLoadingUserStorageData, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}