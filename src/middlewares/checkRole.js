const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // 1. Extract roles directly from the Keycloak JWT token!
      const userRoles = req.user?.realm_access?.roles || [];

      // 2. Check if the user has at least one of the required roles
      const hasRole = allowedRoles.some((role) => userRoles.includes(role));

      if (!hasRole) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: requires one of [${allowedRoles.join(", ")}]`,
          userRoles, // Helpful for debugging what Keycloak actually sent
        });
      }

      // 3. We still enforce the MongoDB 'approved' status for non-admins, 
      // ensuring normal users can't bypass verification just by having a Keycloak account.
      if (!userRoles.includes("admin") && req.dbUser?.status !== "approved") {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Account is pending admin approval.",
        });
      }

      next();
    } catch (error) {
      console.error("Role Check Error:", error);
      next(error);
    }
  };
};

module.exports = checkRole;