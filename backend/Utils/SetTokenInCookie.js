const sendTokenInCookie = (user, statusCode, res, message) => {
  // generate JWT from method on schema
  const token = user.generateToken();

  // Set a simple session cookie (no expires, no complex options)
  res
    .status(statusCode)
    .cookie("token", token, {
      httpOnly: true,
      // Uncomment these if you deploy later:
      // secure: process.env.NODE_ENV === "production",
      // sameSite: "lax",
    })
    .json({
      success: true,
      message,
      token,
      user,
    });
};

module.exports = sendTokenInCookie;
