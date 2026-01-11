const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        maxLength: [30, "Name cannot exceed 30 characters"],
        // Simplified: no strict minLength, just basic presence
        // minLength: [4, "Name Should have more than 4 character"],
    },
    email: {
        type: String,
        required: [true, "Please Enter your email"],
        unique: true,
        validate: [validator.isEmail, "Please Enter valid email"],
    },
    password: {
        type: String,
        required: [true, "Please Enter your password"],
        // Simplified: allow shorter passwords (you can even remove this)
        minLength: [4, "Password should have at least 4 characters"],
        select: false,
    },
    avatar: {
        public_id: {
            type: String,
            // Not required anymore because we set a default in controller
            default: "default_avatar",
        },
        url: {
            type: String,
            default: "https://icon-library.com/images/default-user-icon/default-user-icon-4.jpg",
        }
    },
    cartData: {
        type: Object,
        default: {},
    },
    role: {
        type: String,
        default: "user"
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

// Pre-save middleware to hash password
UserSchema.pre("save", async function (next) {
    // FIX: only re-hash when password is modified
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// JWT TOKEN
UserSchema.methods.generateToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET || "secretKEY", // FIXED: was JWT_SECERET
        {
            expiresIn: process.env.JWT_EXPIRE || "5d", // match your .env
        }
    );
};

// compare password
UserSchema.methods.comparePassword = async function (enterPassword) {
    return await bcrypt.compare(enterPassword, this.password);
};

// Generating reset password token
UserSchema.methods.getResetPasswordToken = function () {
    // Generating token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hashing and adding to userSchema
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min

    return resetToken;
};

module.exports = mongoose.models.user || mongoose.model("user", UserSchema);
