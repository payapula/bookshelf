import * as React from 'react'
import {AuthenticatedApp} from './authenticated-app'
import {UnauthenticatedApp} from './unauthenticated-app'
import {useAuth} from 'context/auth-context'

function App() {
  const {user} = useAuth()
  return user ? <AuthenticatedApp /> : <UnauthenticatedApp />
}

export {App}
