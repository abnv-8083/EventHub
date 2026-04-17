import { generateOTP } from "../../utils/generateOtp.js"
import RedisHelper from "../../utils/redisHelper.js"
import { sendEmail } from "../../constants/sendEmail.js"
import * as otpConst from "../../constants/otpConstant.js"
import * as passwordUtil from "../../utils/password.js"
import * as userQuery from "../../repositories/users/usersQueries.js"
import * as wishlistRepo from "../../repositories/users/wishlistQueries.js"
import AppError from "../../utils/AppError.js"
import HTTP_STATUS from "../../constants/statusCode.js"

export const toggleWishlist = async (userId, eventId) => {
    return await wishlistRepo.toggleWishlist(userId, eventId);
}

export const getWishlist = async (userId) => {
    return await wishlistRepo.fetchUserWishlist(userId);
}


export const getUserProfile = async (userId) => {
    return await userQuery.fetchUserById(userId);
}

export const profileUpdate = async (id, name, phone, city, bio, gender, dob, occupation) =>{
    const editedUser = await userQuery.editUser(id, name, phone, city, bio, gender, dob, occupation)
    if(!editedUser){
        throw new AppError('Failed to Edit User Detail', HTTP_STATUS.BAD_REQUEST)
    }
    return editedUser
}

export const updateAvatar = async (id, avatarUrl) => {
    const updatedUser = await userQuery.editUserAvatar(id, avatarUrl)
    if (!updatedUser) {
        throw new AppError('Failed to Update Avatar', HTTP_STATUS.BAD_REQUEST)
    }
    return updatedUser
}

export const sendEditEmailOtp = async (id, newEmail) => {
    const checkEmail = await userQuery.checkByEmail(newEmail);
    if (checkEmail) {
        throw new AppError("Email is already taken", HTTP_STATUS.BAD_REQUEST);
    }

    const otp = generateOTP();
    const expiry = otpConst.OTP_EXPIRY_MINUTES * 60;
    const lockUntil = Date.now() + (otpConst.RESEND_OTP_MINUTES * 60 * 1000);

    const data = {
        otp: otp,
        otpLimit: otpConst.RESEND_OTP_LIMIT,
        resendLock: lockUntil,
        purpose: "Edit Email Otp",
        userData: { id, newEmail }
    };

    await RedisHelper.setData(newEmail, data, expiry);
    
    const userDb = await userQuery.fetchUserById(id);
    const name = userDb ? userDb.name : "User";

    await sendEmail({ email: newEmail, name, data });

    return true;
}

export const updatePassword = async (id, currentPassword, newPassword) => {
    const userDb = await userQuery.fetchUserById(id);
    if (!userDb) {
        throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    }
    
    // Check old password if user already has one
    if (userDb.password) {
        if (!currentPassword) {
            throw new AppError("Current password is required", HTTP_STATUS.BAD_REQUEST);
        }
        const isMatch = await passwordUtil.verifyPassword(currentPassword, userDb.password);
        if (!isMatch) {
            throw new AppError("Incorrect current password", HTTP_STATUS.UNAUTHORIZED);
        }
    }
    
    const hashPass = await passwordUtil.hashPassword(newPassword);
    const updatedUser = await userQuery.updatePassword(id, hashPass);
    return updatedUser;
}


