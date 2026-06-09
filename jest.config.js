module.exports = {
  testEnvironment: 'node',
  coverageProvider: 'v8',
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js', // We exclude the main server file because starting the server in tests can cause port conflicts
  ],
};