const request = require('supertest');
const app = require('../../src/app'); // Import the Express app, NOT server.js!

describe('Functional Test: API Health and Routing', () => {
  it('should return a 404 for an unknown API route', async () => {
    // Treat the app as a black box and send a real HTTP GET request
    const response = await request(app).get('/api/v1/route-that-definitely-does-not-exist');
    
    // Assert the HTTP status code directly
    expect(response.statusCode).toBe(404);
  });
});