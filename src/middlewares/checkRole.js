const checkRole = (...allowedRoles) => {
  return async (req, res, next) => {
    const roles = req.user.realm_access?.roles || [];

    const allowed = allowedRoles.some(role =>
      roles.includes(role)
    );

    if (!allowed) {
      return res.status(403).json({
        message: "Forbidden: insufficient permissions",
        userRoles,
        requiredRoles: allowedRoles
      });
    }

    next();
  };
};

module.exports = checkRole;