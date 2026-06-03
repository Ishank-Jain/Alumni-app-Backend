const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // 1. Extract roles directly from the Keycloak JWT token! (This grabs 'admin')
      const keycloakRoles = req.user?.realm_access?.roles || [];

      // 2. Extract the role chosen by the user during onboarding from MongoDB
      // (This grabs 'alumni', 'student', or 'mentor')
      const mongoRole = req.dbUser?.role ? [req.dbUser.role] : [];

      // 3. Combine all roles into one array
      const combinedRoles = [...keycloakRoles, ...mongoRole];

      // 4. Check if the user has at least one of the required roles
      const hasRole = allowedRoles.some((role) => combinedRoles.includes(role));

      if (!hasRole) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: requires one of [${allowedRoles.join(", ")}]`,
          userRoles: combinedRoles, // Helpful for debugging
        });
      }

      // 5. Enforce the MongoDB 'approved' status for non-admins, 
      // ensuring normal users can't bypass verification just by having a Keycloak account.
      if (!keycloakRoles.includes("admin") && req.dbUser?.status !== "approved") {
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