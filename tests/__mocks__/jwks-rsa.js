// This mock intercepts the Keycloak client during testing
// It prevents network calls and bypasses the ES Module crash
module.exports = function jwksClient() {
  return {
    getSigningKey: (header, callback) => {
      // Immediately return a fake public key so the test can proceed
      callback(null, { getPublicKey: () => 'mock-public-key' });
    }
  };
};