const User = require("../models/User.model");

const syncMongoUser = async (req, res, next) => {
  try {
    const token = req.user;

    const sub = token.sub;

    const roles = token.realm_access?.roles || [];

    let appRole = "student";

    if (roles.includes("admin")) appRole = "admin";
    else if (roles.includes("mentor")) appRole = "mentor";
    // else if (roles.includes("recruiter")) appRole = "recruiter";
    else if (roles.includes("alumni")) appRole = "alumni";

    let user = await User.findOne({
      keycloakSub: sub,
    });

    if (!user) {
      user = await User.create({
        keycloakSub: sub,
        username: token.preferred_username,
        email: token.email,
        firstName: token.given_name || "",
        lastName: token.family_name || "",
        role: appRole,
        status: "pending",
        lastLoginAt: new Date(),
      });
    } else {
      user.username = token.preferred_username;

      user.email = token.email;

      user.firstName = token.given_name || "";

      user.lastName = token.family_name || "";

      user.role = appRole;

      user.lastLoginAt = new Date();

      await user.save();
    }

    if (user.banned) {
      return res.status(403).json({
        success: false,
        message: "Account banned",
      });
    }

    req.dbUser = user;

    next();
  } catch (error) {
    console.log("SYNC ERROR:", error);
    next(error);
  }
};

module.exports = syncMongoUser;
