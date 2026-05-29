process.env.NODE_ENV = 'test'

jest.mock('../models/schemas', () => ({
  Contact: class {
    constructor(data) {
      this.data = data
    }

    async save() {
      return this.data
    }
  },
  Users: {}
}))

const request = require('supertest')
const app = require('../index')

describe('backend routes', () => {
  test('GET /users returns the static user list', async () => {
    const response = await request(app).get('/users')

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body).toHaveLength(3)
    expect(response.body[0]).toEqual(expect.objectContaining({
      name: 'Leanne Graham',
      email: 'Sincere@april.biz',
      website: 'hildegard.org'
    }))
  })

  test('POST /contact/send returns success when a message is submitted', async () => {
    const response = await request(app)
      .post('/contact/send')
      .send({
        email: 'test@example.com',
        website: 'example.com',
        message: 'hello'
      })

    expect(response.status).toBe(200)
    expect(response.text).toContain('Message sent. Thank you.')
  })

  test('POST /contact/invalid returns invalid request', async () => {
    const response = await request(app)
      .post('/contact/invalid')
      .send({
        email: 'test@example.com',
        website: 'example.com',
        message: 'hello'
      })

    expect(response.status).toBe(200)
    expect(response.text).toContain('Invalid Request')
  })
})
