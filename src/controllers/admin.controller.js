const User = require("../models/User.model.js");
// const apiResponse = require('../utils/apiResponse');

const health = async (req, res) => {
  res.json({
    success: true,
    message: "Admin API working",
  });
};

const getPendingUsers = async (req, res, next) => {
  try {
    const users = await User.find(
      { status: "pending" },
      {
        password: 0,
        refreshToken: 0,
      },
    ).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const approveUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
        approvedAt: new Date(),
        approvedBy: req.dbUser ? req.dbUser._id : null, // Safe fallback if testing without auth
      },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // PUBLISH NOTIFICATION TO EMAIL AND SLACK
    try {
      await fetch('http://notification-api:3000/api/v1/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channels: ['email', 'slack'], // Tell BOTH workers to fire!
          recipients: [user.email],
          priority: 'high',
          payload: {
            title: 'Alumni Network - Account Verified 🎉',
            body: `Hello ${user.firstName}, your account has been officially verified by the admin team. Welcome to the network!`
          }
        })
      });
      console.log("Approval event published to Notification API");
    } catch (error) {
      console.error("Failed to publish approval event:", error.message);
    }

    res.json({
      success: true,
      message: "User approved",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const rejectUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
      },
      { new: true },
    );

    res.json({
      success: true,
      message: "User rejected",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find(
      {},
      {
        password: 0,
        refreshToken: 0,
      },
    ).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
};


const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 1. Authenticate with Keycloak's Master Realm to get an Admin Token
    try {
      const tokenResponse = await fetch("http://alumni-keycloak:8080/realms/master/protocol/openid-connect/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: "admin-cli",
          grant_type: "password",
          username: "admin",      // Assuming default compose credentials
          password: "admin"
        })
      });

      if (tokenResponse.ok) {
        const { access_token } = await tokenResponse.json();
        
        // 2. Delete the user from your 'application' realm
        await fetch(`http://alumni-keycloak:8080/admin/realms/application/users/${user.keycloakSub}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${access_token}` }
        });
        console.log(`Deleted Keycloak identity for: ${user.email}`);
      } else {
        console.warn("Failed to get Keycloak token. User might need manual deletion in Keycloak.");
      }
    } catch (kcError) {
      console.error("Keycloak deletion failed (maybe already deleted manually):", kcError.message);
    }

    // 3. Delete from MongoDB
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "User permanently deleted from both databases."
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  health,
  me,
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllUsers,
  deleteUser,
};
