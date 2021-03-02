// 🐨 create and export a React context variable for the AuthContext
// 💰 using React.createContext
/** @jsx jsx */
import {jsx} from '@emotion/core'
import React from 'react'
import {useAsync} from 'utils/hooks'
import {FullPageSpinner, FullPageErrorFallback} from 'components/lib'
import {client} from 'utils/api-client'
import * as auth from 'auth-provider'

const AuthContext = React.createContext()
AuthContext.displayName = 'AuthContext'

const useAuth = () => {
  const value = React.useContext(AuthContext)
  if (typeof value === 'undefined') {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return value
}

const useClient = () => {
  const token = useAuth().user.token
  return React.useCallback(
    function authenticatedClient(endpoint, config) {
      return client(endpoint, {...config, token})
    },
    [token],
  )
}

async function getUser() {
  let user = null

  const token = await auth.getToken()
  if (token) {
    const data = await client('me', {token})
    user = data.user
  }

  return user
}

const AuthProvider = props => {
  const {
    data: user,
    error,
    isLoading,
    isIdle,
    isError,
    isSuccess,
    run,
    setData,
  } = useAsync()

  React.useEffect(() => {
    run(getUser())
  }, [run])

  const login = form => auth.login(form).then(user => setData(user))
  const register = form => auth.register(form).then(user => setData(user))
  const logout = () => {
    auth.logout()
    setData(null)
  }

  if (isLoading || isIdle) {
    return <FullPageSpinner />
  }

  if (isError) {
    return <FullPageErrorFallback error={error} />
  }

  if (isSuccess) {
    const authData = {user, login, register, logout}
    return <AuthContext.Provider value={authData} {...props} />
  }
}

export {useAuth, useClient, AuthProvider}
