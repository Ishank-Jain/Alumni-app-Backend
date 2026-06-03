const authService = require('../services/auth.service');
const apiResponse = require('../utils/apiResponse');

// Register
const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);

    res.status(201).json(
      apiResponse('Account created', {
        user: result.user
      })
    );
  } catch (err) {
    next(err);
  }
};

// Complete Profile (Phase 2 State Machine)
const completeProfile = async (req, res, next) => {
  try {
    const user = req.dbUser;

    if (!user) {
      return res.status(404).json({ success: false, message: "User identity not found" });
    }

    if (user.profileCompleted) {
      return res.status(400).json({ success: false, message: "Profile already completed" });
    }

    // 1. Update with the data sent from the React form
    user.batch = req.body.batch || user.batch;
    user.company = req.body.company || user.company;
    user.bio = req.body.bio || user.bio;
    
    // NEW: Assign the role chosen by the user (Security check to prevent admin escalation)
    if (req.body.role === 'alumni' || req.body.role === 'student') {
      user.role = req.body.role;
    }
    
    // 2. Flip the State Machine flags
    user.profileCompleted = true;
    user.status = "pending"; 
    
    await user.save();

    // 3. --- TRIGGER THE PENDING VERIFICATION EMAIL ---
    try {
      const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-api:3000';
      const targetEmail = process.env.NODE_ENV === 'development' ? 'avimaheshwari04@gmail.com' : user.email;

      fetch(`${notificationUrl}/api/v1/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channels: ['email'], 
          recipients: [targetEmail], 
          priority: 'high',
          payload: {
            title: 'Account Verification Pending ⏳', 
            body: `Hi ${user.firstName || 'Alumni'},\n\nYour profile has been submitted successfully! It is currently pending verification by our admin team. \n\nYou will receive another email as soon as your account is reviewed and approved.`
          }
        })
      }).catch(err => console.error("Notification API unreachable:", err.message));
      console.log("Verification pending email trigger sent successfully");
    } catch (error) {
      console.error("Failed to trigger pending verification email:", error.message);
    }
    // ------------------------------------------------

    res.status(200).json({
      success: true,
      message: "Profile completed successfully. Pending admin approval.",
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Login
const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);

    res.status(200).json(
      apiResponse('Login successful', {
        user: result.user
      })
    );
  } catch (err) {
    next(err);
  }
};

// Logout
const logout = async (req, res, next) => {
  try {
    await authService.logoutUser(req.user._id);

    res.status(200).json(
      apiResponse('Logged out successfully')
    );
  } catch (err) {
    next(err);
  }
};

// Refresh (optional if not using)
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    const result = await authService.refreshAccessToken(token);

    res.status(200).json(
      apiResponse('Token refreshed', result)
    );
  } catch (err) {
    next(err);
  }
};

const me = async (req, res) => {
  res.json({
    success: true,
    data: req.dbUser,
  });
};

module.exports = { register, login, logout, refreshToken, me, completeProfile };