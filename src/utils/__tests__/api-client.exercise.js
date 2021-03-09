// 🐨 you'll need the test server
// 💰 the way that our tests are set up, you'll find this in `src/test/server/test-server.js`
import {server, rest} from 'test/server'
// 🐨 grab the client
import {client} from '../api-client'

// Extra Credit - 2
import {queryCache} from 'react-query'
import * as auth from 'auth-provider'

// 🐨 add a beforeAll to start the server with `server.listen()`
// 🐨 add an afterAll to stop the server when `server.close()`
// 🐨 afterEach test, reset the server handlers to their original handlers
// via `server.resetHandlers()`

// 🐨 flesh these out:

// test.todo('calls fetch at the endpoint with the arguments for GET requests')
const apiUrl = process.env.REACT_APP_API_URL
test('first mock on runtime', async () => {
  const endpoint = 'test'
  const mockResult = {data: 'success'}
  server.use(
    rest.get(`${apiUrl}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.json(mockResult))
    }),
  )
  const response = await client(endpoint)
  expect(response).toStrictEqual(mockResult)
})

test('adds auth token when a token is provided', async () => {
  const endpoint = 'testwithtoken'
  const mockResult = {data: 'success'}
  const TOKEN = 'ab0234-a3'
  let request
  server.use(
    rest.get(`${apiUrl}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json(mockResult))
    }),
  )
  await client(endpoint, {token: TOKEN})
  expect(request.headers.get('Authorization')).toBe(`Bearer ${TOKEN}`)
})

test('allows for config overrides', async () => {
  const endpoint = 'testwithtoken'
  const mockResult = {data: 'success'}
  const TOKEN = 'ab0234-a3'
  let request
  server.use(
    rest.put(`${apiUrl}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json(mockResult))
    }),
  )
  await client(endpoint, {
    token: TOKEN,
    method: 'PUT',
    headers: {'Content-Type': 'fake'},
  })
  expect(request.method).toBe(`PUT`)
  expect(request.headers.get('Content-Type')).toBe('fake')
})

test('when data is provided, it is stringified and the method defaults to POST', async () => {
  const endpoint = 'testwithtoken'
  const TOKEN = 'ab0234-a3'
  const data = {name: 'Jane'}
  let request
  server.use(
    rest.post(`${apiUrl}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json(req.body))
    }),
  )
  const result = await client('testwithtoken', {token: TOKEN, data})
  expect(result).toStrictEqual(data)
  expect(request.method).toStrictEqual('POST')
})

test('Failed test cases - 300', async () => {
  const endpoint = 'testwithtoken'
  const TOKEN = 'ab0234-a3'
  server.use(
    rest.post(`${apiUrl}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.status(300), ctx.json({message: 'Failed Badly!'}))
    }),
  )
  try {
    const result = await client('testwithtoken', {
      token: TOKEN,
      data: {sample: 'data'},
    })
  } catch (error) {
    expect(error.message).toBe('Failed Badly!')
  }
})

jest.mock('react-query')
jest.mock('auth-provider')

test('Failed test cases - 401', async () => {
  const endpoint = 'testwithtoken'
  const TOKEN = 'ab0234-a3'
  server.use(
    rest.post(`${apiUrl}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.status(401), ctx.json({message: 'Failed Badly!'}))
    }),
  )

  const resolved = await client('testwithtoken', {
    token: TOKEN,
    data: {sample: 'data'},
  }).catch(e => e)

  expect(resolved.message).toMatchInlineSnapshot(`"Please re-authenticate."`)
  expect(queryCache.clear).toHaveBeenCalledTimes(1)
  expect(auth.logout).toHaveBeenCalledTimes(1)
})
