import { describe, it, before, after } from 'node:test';
import { app, handler } from '../../api.js';
import assert from 'node:assert';
import EventEmitter from 'node:events';

const mockRequest = ({ url, method, headers, body }) => {
  const options = {
    url: url ?? '/',
    method: method ?? 'GET',
    headers: headers ?? {},
  }

  const request = new EventEmitter()

  request.url = options.url
  request.method = options.method
  request.headers = options.headers

  setInterval(() => request.emit('data', JSON.stringify(body)))

  return request
}

const mockResponse = ({ mockContext }) => {
  const response = {
    writeHead: mockContext.fn(),
    end: mockContext.fn(),
  }

  return response
}

const getFirstCallArg = (mock) => mock.calls[0].arguments[0]


describe('API Unit Test Suite', () => {
  describe('/login', () => {
    it('should receive not authorized when user or password is invalid', async (context) => {
      const inputRequest = mockRequest({
        url: '/login',
        method: 'POST',
        body: {
          user: '',
          password: '123'
        }
      })
      const outputResponse = mockResponse({
        mockContext: context.mock,
      })

      await handler(inputRequest, outputResponse)

      assert.strictEqual(
        getFirstCallArg(outputResponse.writeHead.mock),
        401,
        `Should receive 401 status code, actual: ${getFirstCallArg(outputResponse.writeHead.mock)}`
      )

      const expectedResponse = JSON.stringify({ error: 'user invalid!' })
      assert.strictEqual(outputResponse.end.mock.callCount(), 1, 'Should call response.end once')
      assert.strictEqual(
        getFirstCallArg(outputResponse.end.mock),
        expectedResponse,
        `Should receive ${expectedResponse}, received: ${getFirstCallArg(outputResponse.end.mock)}`
      )
    })
  })
})