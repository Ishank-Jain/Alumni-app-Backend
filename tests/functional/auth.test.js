const request = require('supertest');
const app = require('../../src/app');
const ApiError = require('../../src/utils/apiError'); // Import your custom error class

// 1. Mock the Service Layer using the EXACT exported function names
jest.mock('../../src/services/auth.service', () => ({
  loginUser: jest.fn(),
  registerUser: jest.fn(),
  logoutUser: jest.fn()
}));

const authService = require('../../src/services/auth.service');

describe('Functional Test: Auth Routes', () => {
  beforeEach(() => {
    // Clear mock data before every test to prevent state leakage
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return a 401 if credentials are invalid or missing', async () => {
      // Arrange: Simulate the service rejecting the empty payload with a 401
      authService.loginUser.mockRejectedValue(new ApiError(401, 'Invalid credentials'));

      // Act: Send a request missing the password
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'alumni@jecrc.edu' });

      // Assert: The global errorHandler should catch the ApiError and return a 401
      expect(response.statusCode).toBe(401);
    });

    it('should return 200 OK and the user object for successful login', async () => {
      // Arrange: Mock the service to simulate a successful DB query
      // Notice we are returning exactly what auth.service.js returns
      authService.loginUser.mockResolvedValue({
        user: { id: '123', email: 'alumni@jecrc.edu', role: 'alumni' }
      });

      // Act: Send a complete payload
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'alumni@jecrc.edu', password: 'SecurePassword123!' });

      // Assert: Verify the HTTP response and payload structure from apiResponse.js
      expect(response.statusCode).toBe(200);
      expect(response.body.data.user).toHaveProperty('email', 'alumni@jecrc.edu');
      expect(response.body.data.user).toHaveProperty('role', 'alumni');
    });
  });
});