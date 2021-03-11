// 🐨 instead of React Testing Library, you'll use React Hooks Testing Library
import {renderHook, act} from '@testing-library/react-hooks'
// 🐨 Here's the thing you'll be testing:
import {useAsync} from '../hooks'

beforeEach(() => {
  jest.spyOn(console, 'error')
})

afterEach(() => {
  console.error.mockRestore()
})

// Helper Function
function getAsyncState(overrides) {
  return {
    status: 'idle',
    isLoading: false,
    isIdle: true,
    isError: false,
    isSuccess: false,
    error: null,
    data: null,

    setData: expect.any(Function),
    setError: expect.any(Function),
    run: expect.any(Function),
    reset: expect.any(Function),
    ...overrides,
  }
}

// 💰 I'm going to give this to you. It's a way for you to create a promise
// which you can imperatively resolve or reject whenever you want.
function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return {promise, resolve, reject}
}

// Use it like this:
// const {promise, resolve} = deferred()
// promise.then(() => console.log('resolved'))
// do stuff/make assertions you want to before calling resolve
// resolve()
// await promise
// do stuff/make assertions you want to after the promise has resolved

// 🐨 get a promise and resolve function from the deferred utility
// 🐨 use renderHook with useAsync to get the result
// 🐨 assert the result.current is the correct default state

// 🐨 call `run`, passing the promise
//    (💰 this updates state so it needs to be done in an `act` callback)
// 🐨 assert that result.current is the correct pending state

// 🐨 call resolve and wait for the promise to be resolved
//    (💰 this updates state too and you'll need it to be an async `act` call so you can await the promise)
// 🐨 assert the resolved state

// 🐨 call `reset` (💰 this will update state, so...)
// 🐨 assert the result.current has actually been reset
test('calling run with a promise which resolves', async () => {
  const {promise, resolve} = deferred()
  const {result} = renderHook(() => useAsync())

  const initialState = getAsyncState()

  expect(result.current).toEqual(initialState)
  let p
  act(() => {
    p = result.current.run(promise)
  })

  expect(result.current).toEqual(
    getAsyncState({
      status: 'pending',
      isLoading: true,
      isIdle: false,
    }),
  )

  const data = {some: 'value'}
  await act(async () => {
    resolve(data)
    await p
  })
  expect(result.current).toEqual(
    getAsyncState({
      status: 'resolved',
      isLoading: false,
      isIdle: false,
      isSuccess: true,
      data,
    }),
  )

  act(() => {
    result.current.reset()
  })

  expect(result.current).toEqual(initialState)
})

// 🐨 this will be very similar to the previous test, except you'll reject the
// promise instead and assert on the error state.
// 💰 to avoid the promise actually failing your test, you can catch
//    the promise returned from `run` with `.catch(() => {})`
test('calling run with a promise which rejects', async () => {
  const {promise, reject} = deferred()
  const {result} = renderHook(() => useAsync())

  let p
  act(() => {
    p = result.current.run(promise)
  })

  expect(result.current).toEqual(
    getAsyncState({
      isIdle: false,
      isLoading: true,
      status: 'pending',
    }),
  )

  const error = {message: 'Failed'}
  await act(async () => {
    reject(error)
    p.catch(() => {
      //ignore
    })
  })

  expect(result.current).toEqual(
    getAsyncState({
      status: 'rejected',
      isLoading: false,
      isIdle: false,
      isError: true,
      error,
    }),
  )
})

// 💰 useAsync(customInitialState)
test('can specify an initial state', async () => {
  const data = {
    name: 'Bharathi',
  }
  const {result} = renderHook(() => useAsync({data}))

  expect(result.current).toEqual(
    getAsyncState({
      data,
    }),
  )
})

// 💰 result.current.setData('whatever you want')
test('can set the data', async () => {
  const {promise} = deferred()
  const {result} = renderHook(() => useAsync())

  act(() => {
    result.current.run(promise)
  })

  expect(result.current).toEqual(
    getAsyncState({
      isIdle: false,
      isLoading: true,
      status: 'pending',
    }),
  )

  act(() => {
    result.current.setData({name: 'Bharathi'})
  })

  expect(result.current).toEqual(
    getAsyncState({
      data: {name: 'Bharathi'},
      isIdle: false,
      isSuccess: true,
      isLoading: false,
      status: 'resolved',
    }),
  )
})

// 💰 result.current.setError('whatever you want')
test('can set the error', async () => {
  const {promise} = deferred()
  const {result} = renderHook(() => useAsync())

  act(() => {
    result.current.run(promise)
  })

  expect(result.current).toEqual(
    getAsyncState({
      isIdle: false,
      isLoading: true,
      status: 'pending',
    }),
  )

  act(() => {
    result.current.setError({message: 'Failed'})
  })

  expect(result.current).toEqual(
    getAsyncState({
      error: {message: 'Failed'},
      isIdle: false,
      isError: true,
      isLoading: false,
      status: 'rejected',
    }),
  )
})

// 💰 const {result, unmount} = renderHook(...)
// 🐨 ensure that console.error is not called (React will call console.error if updates happen when unmounted)
test('No state updates happen if the component is unmounted while pending', async () => {
  const {promise, resolve} = deferred()
  const {result, unmount} = renderHook(() => useAsync())
  let p
  act(() => {
    p = result.current.run(promise)
  })

  expect(result.current).toEqual(
    getAsyncState({
      isIdle: false,
      isLoading: true,
      status: 'pending',
    }),
  )

  unmount()

  const data = {some: 'value'}
  await act(async () => {
    resolve(data)
    await p
  })

  expect(result.current).toEqual(
    getAsyncState({
      isIdle: false,
      isLoading: true,
      status: 'pending',
    }),
  )

  expect(console.error).not.toHaveBeenCalled()
})

test('calling "run" without a promise results in an early error', async () => {
  const notAPromise = {}
  const {result} = renderHook(() => useAsync())
  expect(() =>
    result.current.run(notAPromise),
  ).toThrowErrorMatchingInlineSnapshot(
    `"The argument passed to useAsync().run must be a promise. Maybe a function that's passed isn't returning anything?"`,
  )
})
