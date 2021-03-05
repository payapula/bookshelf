import * as React from 'react'
import {useAuth} from './context/auth-context'
// 🐨 you'll want to render the FullPageSpinner as the fallback
import {FullPageSpinner} from './components/lib'

// 🐨 exchange these for React.lazy calls
// import {AuthenticatedApp} from './authenticated-app'
// import {UnauthenticatedApp} from './unauthenticated-app'

const AuthenticatedApp = React.lazy(() =>
  import(
    /* webpackChunkName: "Authenticated" */ /* webpackPrefetch: true */ './authenticated-app'
  ),
)
const UnauthenticatedApp = React.lazy(() =>
  import(/* webpackChunkName: "UNAuthenticated" */ './unauthenticated-app'),
)

function App() {
  const {user} = useAuth()
  return (
    <React.Suspense fallback={<FullPageSpinner />}>
      {user ? <AuthenticatedApp /> : <UnauthenticatedApp />}
    </React.Suspense>
  )
}

export {App}
