const jwt = require('jsonwebtoken');
const UserSchema = require('../modals/UserSchema')

const protecteRoute = async (req, res, next) => {
    const { token } = req.cookies;
    try {
        if (!token) {
            return res.status(401).json({ success: false, message: "Please login to access this resource" });
        }
        const decode_token = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await UserSchema.findById(decode_token.id);
        next();
    } catch (error) {
        console.log("Error in protecteRoute function: ", error.message);
        res.status(500).json({
            success: false,
            message: "Something went wrong, try again",
            error: error.message
        });
    }
}

const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                res.status(403).json({
                    success: true,
                    message: `Role ${req.user.role} is not allowed to access this resource`
                })
            )
        }
        next();
    }
}

module.exports = {
    protecteRoute,
    authorizeRole
};