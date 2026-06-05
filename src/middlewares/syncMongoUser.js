// src/middlewares/syncMongoUser.js
const User = require("../models/User.model");

const syncMongoUser = async (req, res, next) => {
  try {
    // req.user is populated by verifyToken.js prior to this middleware
    const token = req.user; 
    const sub = token.sub;
    const roles = token.realm_access?.roles || [];
    const email = token.email;

    // --- PHASE 1: PARSE JWT FOR ADMIN ROLE ---
    const isAdmin = roles.includes("admin");
    req.isAdmin = isAdmin; // Attach to request for downstream controllers

    // Determine base role
    let appRole = "student";
    if (isAdmin) appRole = "admin";
    else if (roles.includes("mentor")) appRole = "mentor";
    else if (roles.includes("alumni")) appRole = "alumni";

    // 🟢 FIX: Look up user by keycloakSub OR email to handle identity provider resets/migrations gracefully
    let user = await User.findOne({
      $or: [
        { keycloakSub: sub },
        { email: email }
      ]
    });

    // --- PHASE 1: ADMIN BOOTSTRAP LOGIC ---
    if (isAdmin) {
      if (!user) {
        // Auto-create Admin with all locks bypassed
        user = await User.create({
          keycloakSub: sub,
          username: token.preferred_username || email,
          email: email,
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
        // 🟢 FIX: Sync identity updates if the admin's Keycloak details shifted during migration
        user.keycloakSub = sub;
        user.username = token.preferred_username || email;
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
          username: token.preferred_username || email,
          email: email,
          firstName: token.given_name || "",
          lastName: token.family_name || "",
          role: appRole,
          status: "pending",          // Default state
          isVerified: false,          // Default state
          profileCompleted: false,    // Default state
          lastLoginAt: new Date(),
        });
      } else {
        // 🟢 FIX: Handle user identity migration seamlessly without crashing on duplicate emails
        if (user.keycloakSub !== sub) {
          user.keycloakSub = sub; // Map their existing MongoDB entry to their new Keycloak profile
          user.username = token.preferred_username || email;
        }
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