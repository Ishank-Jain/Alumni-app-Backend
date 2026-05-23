const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRoles =
        req.user?.realm_access?.roles || [];

      const allowed = allowedRoles.some((role) =>
        userRoles.includes(role)
      );

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: insufficient permissions",
          requiredRoles: allowedRoles,
          userRoles,
        });
      }

      next();
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
};

module.exports = checkRole;