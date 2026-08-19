const request = require('supertest');
const app = require('../app');

describe('GET /health', () => {
  test('should return 200 and status UP', async () => {
    const response = await request(app).get('/health');

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('UP');
  });
});

describe('GET /', () => {
  test('should return welcome message', async () => {
    const response = await request(app).get('/');

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Hello from Node.js CI/CD Pipeline!');
  });
});
