const UserSchema = require('../modals/UserSchema');
const bcrypt = require('bcryptjs');
const sendTokenInCookie = require('../Utils/SetTokenInCookie');
const sendEmail = require('../Utils/sendEmail');
const cloudinary = require('cloudinary'); // kept for future use if you re-enable
const crypto = require('crypto');

const Register = async (req, res) => {
    const { name, email, password, avatar } = req.body;

    // 🔴 Avatar is NO LONGER required (we'll use a default image)
    // if (!avatar) {
    //     return res.status(400).json({
    //         success: false,
    //         message: "Avatar is required",
    //     });
    // }

    try {
        let myCloud = {
            public_id: "default_avatar",
            secure_url: "https://icon-library.com/images/default-user-icon/default-user-icon-4.jpg",
        };

        if (avatar && process.env.CLOUDINARY_NAME) {
            try {
                const result = await cloudinary.v2.uploader.upload(avatar, {
                    folder: "avatars",
                    width: 150,
                    crop: "scale",
                });
                myCloud = {
                    public_id: result.public_id,
                    secure_url: result.secure_url,
                };
            } catch (cloudError) {
                console.log("Cloudinary upload failed, using default avatar:", cloudError.message);
            }
        }

        const userExsist = await UserSchema.findOne({ email });

        if (userExsist) {
            return res.json({ success: false, message: "User Already exsist!" });
        }

        const user = await UserSchema.create({
            name,
            email,
            password,
            avatar: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            }
        });

        sendTokenInCookie(user, 201, res, "User Succesfully registered!");

    } catch (error) {
        console.log("Error in Register function: ", error.message);
        let errorMessage = "Validation failed";
        if (error.name === 'ValidationError') {
            errorMessage = Object.values(error.errors).map(val => val.message).join(', ');
        }
        res.status(500).json({
            success: false,
            message: "Something went wrong, User not registered!",
            error: errorMessage
        });
    }
};


const Login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please enter all the details!" });
        }
        const user = await UserSchema.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials!" });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials!" });
        }

        sendTokenInCookie(user, 201, res, "User successfully logged in!");

    } catch (error) {
        console.error("Error in Login function: ", error.message);
        res.status(500).json({
            success: false,
            message: "Something went wrong, user not logged in!",
            error: error.message
        });
    }
};


// LOGOUT FUNCTION
const Logout = async (req, res) => {
    try {
        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true
        });
        res.status(200).json({
            success: true,
            message: "User Succesfully logged out",
        });
    } catch (error) {
        console.error("Error in Logout function: ", error.message);
        res.status(500).json({
            success: false,
            message: "Something went wrong, user not logged out",
            error: error.message
        });
    }
};



const forgetPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required"
        });
    }

    try {
        const user = await UserSchema.findOne({ email: req.body.email });

        if (!user) {
            return res.json({ success: true, message: "User doesn't exist!" });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        try {
            await user.save({ validateBeforeSave: false })

            res.json({ sucess: true });
        } catch (error) {
            console.log("Error here:", error.message);
            res.json({ sucess: false });
        }

        const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

        const message = `Your password reset token is:\n\n${resetPasswordUrl}\n\nIf you have not requested this email then, please ignore it.`;

        try {
            const options = {
                email: user.email,
                subject: `E-Commerce password recovery link.`,
                message,
            };

            await sendEmail(options);

            res.status(200).json({
                success: true,
                message: `Email sent to ${user.email} successfully!`
            });
        } catch (error) {
            console.error("Error sending email: ", error.message);

            // Reset the token and expiration fields if there is an error
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            res.status(500).json({
                success: false,
                message: "Something went wrong while sending the email, try again later!",
                error: error.message
            });
        }
    } catch (error) {
        console.error("Error in forgetPassword function: ", error.message);

        res.status(500).json({
            success: false,
            message: "Something went wrong, try again later!",
            error: error.message
        });
    }
}; // not working


const resetPassword = async (req, res) => {
    try {
        // NOTE: there is a bug here in original code: resetToken is not defined.
        const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        const user = await UserSchema.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });
        if (!user) {
            return res.json({ success: true, message: "Reset token has been expired" });
        }
        if (req.body.password != req.body.confirmPassword) {
            return res.json({ success: true, message: "Password doesn't match" });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();
        sendTokenInCookie(user, 200, res, "Password succesfully reset");

    } catch (error) {
        console.error("Error in reset function: ", error.message);
        res.status(500).json({
            success: false,
            message: "Something went wrong, user not logged in!",
            error: error.message
        });
    }
};


// getUserOwnDetails - Get user own profile
const getUserOwnDetails = async (req, res) => {
    try {
        const { id } = req.user;
        const userMe = await UserSchema.findById(id);
        res.json({ success: true, user: userMe });
    } catch (error) {
        console.error("Error in getUserOwnDetails function: ", error.message);
        res.status(500).json({
            success: false,
            message: "Something went wrong!!",
            error: error.message
        });
    }
};


const updatePassword = async (req, res) => {
    try {
        const userMe = await UserSchema.findById(req.user.id).select("+password");
        if (!userMe) {
            return res.json({ success: false, messgae: "User not found!" });
        }

        const isMatch = await userMe.comparePassword(req.body.oldPassword);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Old password is incorrect!" });
        }

        if (req.body.newPassword != req.body.confirmPassword) {
            return res.status(401).json({ success: false, message: "password doesn't match" });
        }

        userMe.password = req.body.newPassword;
        await userMe.save();
        sendTokenInCookie(userMe, 200, res, "Password successfully updated!");

    } catch (error) {
        console.error("Error in updatePassword function: ", error.message);
        res.status(500).json({
            success: false,
            message: "Something went wrong!!",
            error: error.message
        });
    }
};


const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const newData = {
            name,
            email,
        };

        // If avatar is provided and Cloudinary is configured
        if (req.body.avatar && req.body.avatar !== "" && process.env.CLOUDINARY_NAME) {
            try {
                const user = await UserSchema.findById(req.user.id);
                const imageId = user.avatar.public_id;

                if (imageId && imageId !== "default_avatar") {
                    await cloudinary.v2.uploader.destroy(imageId);
                }

                const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
                    folder: "avatars",
                    width: 150,
                    crop: "scale",
                });

                newData.avatar = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                };
            } catch (cloudError) {
                console.log("Cloudinary update failed:", cloudError.message);
            }
        }

        const user = await UserSchema.findByIdAndUpdate(req.user.id, newData, {
            runValidators: true,
            new: true,
        });

        res.json({ success: true, message: "Profile succesfully updated!" });
    } catch (error) {
        console.error("Error in updateProfile function: ", error.message);
        res.status(500).json({
            success: false,
            message: "Something went wrong!!",
            error: error.message
        });
    }
};


// Fetch all user for admin panel --- ADMIN rights
const fetchAllUser = async (req, res) => {
    try {
        const users = await UserSchema.find({});
        res.json({ success: true, data: users });
    } catch (error) {
        console.error("Error in fetchAllUser function: ", error.message);
        res.status(500).json({
            success: false,
            message: "Something went wrong!!",
            error: error.message
        });
    }
};


// Get single user --- ADMIN rights
const getSingleUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserSchema.findById(id);
        if (!user) {
            return res.json({ success: false, message: `User not found with this ${id}` });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        console.error("Error in GetSingleUser function: ", error.message);
        res.status(500).json({
            success: false,
            message: "Something went wrong!!",
            error: error.message
        });
    }
};


// Update user role --- ADMIN rights
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;
        const newData = {
            name, email, role
        };
        const user = await UserSchema.findByIdAndUpdate(id, newData, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });
        res.status(200).json({ success: true, message: "Role successfully updated!" });

    } catch (error) {
        console.error("Error in updateUserRole function: ", error.message);
        res.status(500).json({
            success: false,
            message: "Something went wrong!!",
            error: error.message
        });
    }
};


// Delete user --- ADMIN rights
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        let user = await UserSchema.findById(id);

        // remove cloudnary later (currently no Cloudinary call here)

        if (!user) {
            return res.json({ success: false, message: `User doesn't exists with this id:${id}` });
        }

        user = await UserSchema.findByIdAndDelete(id);
        res.json({ success: true, message: "User successfully removed!" });
    } catch (error) {
        console.error("Error in deleteUser function: ", error.message);
        res.status(500).json({
            success: false,
            message: "Something went wrong!!",
            error: error.message
        });
    }
};


// CART MANAGEMENT FUNCTIONS

// Update user's cart
const updateCart = async (req, res) => {
    try {
        const { cartItems } = req.body;
        const totalBill = cartItems.reduce((acc, item) =>
            acc + (item.price * item.quantity), 0
        );

        const user = await UserSchema.findByIdAndUpdate(
            req.user.id,
            {
                cartData: {
                    items: cartItems,
                    totalBill: totalBill
                }
            },
            { new: true }
        );

        res.json({
            success: true,
            cart: user.cartData,
            message: "Cart updated successfully"
        });
    } catch (error) {
        console.error("Error in updateCart function: ", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get user's cart
const getCart = async (req, res) => {
    try {
        const user = await UserSchema.findById(req.user.id);
        res.json({
            success: true,
            cart: user.cartData || { items: [], totalBill: 0 }
        });
    } catch (error) {
        console.error("Error in getCart function: ", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Clear cart after order
const clearCart = async (req, res) => {
    try {
        await UserSchema.findByIdAndUpdate(
            req.user.id,
            { cartData: { items: [], totalBill: 0 } }
        );
        res.json({ success: true, message: "Cart cleared" });
    } catch (error) {
        console.error("Error in clearCart function: ", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};


module.exports = {
    Register,
    Login,
    Logout,
    forgetPassword,
    resetPassword,
    getUserOwnDetails,
    updatePassword,
    updateProfile,
    fetchAllUser,
    getSingleUser,
    updateUserRole,
    deleteUser,
    updateCart,
    getCart,
    clearCart,
};
