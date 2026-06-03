// src/middlewares/syncMongoUser.js
const User = require("../models/User.model");

const syncMongoUser = async (req, res, next) => {
  try {
    // req.user is populated by verifyToken.js prior to this middleware
    const token = req.user; 
    const sub = token.sub;
    const roles = token.realm_access?.roles || [];

    // --- PHASE 1: PARSE JWT FOR ADMIN ROLE ---
    const isAdmin = roles.includes("admin");
    req.isAdmin = isAdmin; // Attach to request for downstream controllers

    // Determine base role
    let appRole = "student";
    if (isAdmin) appRole = "admin";
    else if (roles.includes("mentor")) appRole = "mentor";
    else if (roles.includes("alumni")) appRole = "alumni";

    let user = await User.findOne({ keycloakSub: sub });

    // --- PHASE 1: ADMIN BOOTSTRAP LOGIC ---
    if (isAdmin) {
      if (!user) {
        // Auto-create Admin with all locks bypassed
        user = await User.create({
          keycloakSub: sub,
          username: token.preferred_username || token.email,
          email: token.email,
          firstName: token.given_name || "Super",
          lastName: token.family_name || "Admin",
          role: "admin",
          status: "approved",      // Bypasses Phase 3 approval
          isVerified: true,        // Granted full platform access
          profileCompleted: true,  // Bypasses Phase 2 Complete Profile
          lastLoginAt: new Date(),
        });
        console.log("Super Admin bootstrapped successfully in MongoDB.");
      } else {
        // Ensure an existing admin hasn't lost access due to schema changes
        user.role = "admin";
        user.status = "approved";
        user.isVerified = true;
        user.profileCompleted = true;
        user.lastLoginAt = new Date();
        await user.save();
      }
    } 
    // --- STANDARD USER SKELETON LOGIC ---
    else {
      if (!user) {
        user = await User.create({
          keycloakSub: sub,
          username: token.preferred_username || token.email,
          email: token.email,
          firstName: token.given_name || "",
          lastName: token.family_name || "",
          role: appRole,
          status: "pending",          // Default state
          isVerified: false,          // Default state
          profileCompleted: false,    // Default state
          lastLoginAt: new Date(),
        });

/*         // PRESERVED: Your working notification logic for new users
        try {
          const userEmail = user.email; 
          const userName = user.firstName || 'Alumni';
          const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-api:3000';
          
          fetch(`${notificationUrl}/api/v1/notify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channels: ['email'], 
              recipients: [userEmail], 
              priority: 'high',
              payload: {
                title: 'Account Verification Pending ⏳', 
                body: `Hi ${userName},\n\nYour profile has been submitted successfully! It is currently pending verification by our admin team.`
              }
            })
          }).catch(err => console.error("Notification API unreachable:", err.message));
        } catch (error) {
          console.error("Failed to trigger pending verification email:", error.message);
        } */
      } else {
        user.lastLoginAt = new Date();
        await user.save();
      }
    }

    // Safety check
    if (user.banned) {
      return res.status(403).json({ success: false, message: "Account banned" });
    }

    // Attach the DB user object for downstream controllers
    req.dbUser = user;
    next();
  } catch (error) {
    console.error("SYNC ERROR:", error);
    next(error);
  }
};

module.exports = syncMongoUser;