const User = require("../models/User.model");

const syncMongoUser = async (req, res, next) => {
  try {
    if (!req.user || !req.user.sub) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const token = req.user;
    const sub = token.sub;

    let user = await User.findOne({
      keycloakSub: sub,
    });

    const keycloakRoles = token.realm_access?.roles || [];

    const appRole = keycloakRoles.includes("admin")
      ? "admin"
      : keycloakRoles.includes("alumni")
        ? "alumni"
        : keycloakRoles.includes("mentor")
          ? "mentor"
          : "user";

    if (!user) {
      user = await User.create({
        keycloakSub: sub,
        username: token.preferred_username,
        email: token.email,
        firstName: token.given_name || "",
        lastName: token.family_name || "",
        role: appRole,
        isVerified: false,
        profileCompleted: false,
        companyApproved: false,
        banned: false,
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
        message: "Your account is blocked",
      });
    }

    req.dbUser = user;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = syncMongoUser;
