const User = require('../models/User.model.js');
const ApiError = require('../utils/apiError');

// Register
const registerUser = async ({ firstName, lastName, username, email, keycloakSub, role, batch, company }) => {
  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, 'Email already exists');

  // Create the user matching the actual Mongoose Schema
  const user = await User.create({
    firstName,
    lastName,
    username: username || email.split('@')[0], // Fallback if username isn't provided
    email,
    keycloakSub: keycloakSub || `mock-sub-${Date.now()}`, // Mock Keycloak ID for local testing
    role: role || 'student',
    batch,
    company,
  });

  // PUBLISH TO NOTIFICATION SHIM LAYER (Which forwards to Kafka)
// PUBLISH TO NOTIFICATION SHIM LAYER (Which forwards to Kafka)
try {
  // Use the environment variable, fallback to localhost for local dev
  const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3000'; 
  //if using docker network can use:  http://notification-api:3000/api/v1/notify

  await fetch(`${notificationUrl}/api/v1/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channels: ['email'], 
      recipients: [user.email], 
      priority: 'normal',
      payload: {
        title: 'Account Verification Pending',
        body: `Hello ${user.firstName}, your registration has been received. Your ID is currently being verified by the admin team. You will receive another notification once you are approved.`
      }
    })
  });
  console.log("Pending verification event published to Notification API");
} catch (error) {
  console.error("Failed to publish event:", error.message);
}

  return { user: user.toPublicJSON() };
};

// Login
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) throw new ApiError(401, 'Invalid credentials');

  // ⚠️ password check skipped (as per your current setup)

  return { user: user.toPublicJSON() };
};

// Logout (simple)
const logoutUser = async (userId) => {
  return true;
};

module.exports = { registerUser, loginUser, logoutUser };