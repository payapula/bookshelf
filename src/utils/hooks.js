import * as React from 'react'
import {useQuery, useMutation, queryCache} from 'react-query'
import {client} from 'utils/api-client'

function useSafeDispatch(dispatch) {
  const mounted = React.useRef(false)
  React.useLayoutEffect(() => {
    mounted.current = true
    return () => (mounted.current = false)
  }, [])
  return React.useCallback(
    (...args) => (mounted.current ? dispatch(...args) : void 0),
    [dispatch],
  )
}

// Example usage:
// const {data, error, status, run} = useAsync()
// React.useEffect(() => {
//   run(fetchPokemon(pokemonName))
// }, [pokemonName, run])
const defaultInitialState = {status: 'idle', data: null, error: null}
function useAsync(initialState) {
  const initialStateRef = React.useRef({
    ...defaultInitialState,
    ...initialState,
  })
  const [{status, data, error}, setState] = React.useReducer(
    (s, a) => ({...s, ...a}),
    initialStateRef.current,
  )

  const safeSetState = useSafeDispatch(setState)

  const setData = React.useCallback(
    data => safeSetState({data, status: 'resolved'}),
    [safeSetState],
  )
  const setError = React.useCallback(
    error => safeSetState({error, status: 'rejected'}),
    [safeSetState],
  )
  const reset = React.useCallback(() => safeSetState(initialStateRef.current), [
    safeSetState,
  ])

  const run = React.useCallback(
    promise => {
      if (!promise || !promise.then) {
        throw new Error(
          `The argument passed to useAsync().run must be a promise. Maybe a function that's passed isn't returning anything?`,
        )
      }
      safeSetState({status: 'pending'})
      return promise.then(
        data => {
          setData(data)
          return data
        },
        error => {
          setError(error)
          return Promise.reject(error)
        },
      )
    },
    [safeSetState, setData, setError],
  )

  return {
    // using the same names that react-query uses for convenience
    isIdle: status === 'idle',
    isLoading: status === 'pending',
    isError: status === 'rejected',
    isSuccess: status === 'resolved',

    setData,
    setError,
    error,
    status,
    data,
    run,
    reset,
  }
}

// PLEASE SEE KENT's SOLUTION FOR EXTRA CREDIT - 1
// I Placed all the hooks in same file
function useBook(bookId, user) {
  const {data} = useQuery({
    queryKey: ['book', {bookId}],
    queryFn: () =>
      client(`books/${bookId}`, {token: user.token}).then(data => data.book),
  })

  return {data}
}

function useBookSearch(query, user) {
  const {data, error, isLoading, isError, isSuccess} = useQuery({
    queryKey: ['bookSearch', {query}],
    queryFn: () =>
      client(`books?query=${encodeURIComponent(query)}`, {
        token: user.token,
      }).then(data => data.books),
  })

  return {data, error, isLoading, isError, isSuccess}
}

function useListItems(user) {
  const {data} = useQuery({
    queryKey: 'list-items',
    queryFn: () =>
      client(`list-items`, {token: user.token}).then(data => {
        return data.listItems
      }),
  })

  return {data}
}

function useCreateListItem(user) {
  const [create] = useMutation(
    ({bookId}) => {
      client('list-items', {data: {bookId}, token: user.token})
    },
    {onSettled: () => queryCache.invalidateQueries('list-items')},
  )

  return [create]
}

function useUpdateListItem(user) {
  const [update] = useMutation(
    updates => {
      client(`list-items/${updates.id}`, {
        data: updates,
        token: user.token,
        method: 'PUT',
      })
    },
    {onSettled: () => queryCache.invalidateQueries('list-items')},
  )
  return [update]
}

function useRemoveListItem(user) {
  const [remove] = useMutation(
    ({id}) => {
      client(`list-items/${id}`, {token: user.token, method: 'DELETE'})
    },
    {onSettled: () => queryCache.invalidateQueries('list-items')},
  )
  return [remove]
}

export {
  useAsync,
  useBook,
  useBookSearch,
  useListItems,
  useCreateListItem,
  useUpdateListItem,
  useRemoveListItem,
}
