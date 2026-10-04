export const generateToken = (user, message, statusCode, res) => {
  const token = user.generateAccessToken();
  const cookieNames = { Admin: "adminToken", Doctor: "doctorToken", Patient: "patientToken" };
  const cookieName = cookieNames[user.role] || "patientToken";

  res
    .status(statusCode)
    .cookie(cookieName, token, {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    })
    .json({
      success: true,
      message,
      user,
      token,
    });
};

