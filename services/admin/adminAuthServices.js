import * as passwordUtil from "../../utils/password.js"
import * as adminQuery from "../../repositories/admin/adminQueries.js"
import AppError from "../../utils/AppError.js"
import HTTP_STATUS from "../../constants/statusCode.js"
import { generateOTP } from "../../utils/generateOtp.js"
import RedisHelper from "../../utils/redisHelper.js"
import * as otpConst from "../../constants/otpConstant.js"
import { sendEmail } from "../../constants/sendEmail.js"

import { sendAdminCredentials } from "../../constants/sendEmail.js"

export const loginAdmin = async (email, password) => {
    const checkAdmin = await adminQuery.checkByEmail(email)

    if (!checkAdmin) {
        throw new AppError("Invalid Email", HTTP_STATUS.UNAUTHORIZED)
    }

    const checkPass = await passwordUtil.verifyPassword(password, checkAdmin.password)
    if (!checkPass) {
        throw new AppError("Invalid password", HTTP_STATUS.UNAUTHORIZED)
    }

    if (checkAdmin.status !== "Active") {
        throw new AppError("Account is not active", HTTP_STATUS.FORBIDDEN)
    }

    return {
        admin: checkAdmin,
        message: `Welcome back, ${checkAdmin.name}`
    }
}

export const createAdmin = async (name, email, password, notes) => {
    const hashPass = await passwordUtil.hashPassword(password)

    const checkAdmin = await adminQuery.checkByEmail(email)
    if (checkAdmin) {
        throw new AppError("Admin Already Exist", HTTP_STATUS.CONFLICT)
    }

    const newAdmin = await adminQuery.createAdminData(name, email, hashPass, notes)
    
    // Dispatch credentials email asynchronously
    sendAdminCredentials({ email, name, password }).catch(err => {
        console.error("Failed to send admin credentials email:", err);
    });

    return newAdmin;
}

export const forgotPassword = async (email) => {
    const validAdmin = await adminQuery.checkByEmail(email);
    if (!validAdmin) {
        throw new AppError('Admin Email Not Found', HTTP_STATUS.NOT_FOUND);
    }

    const otp = generateOTP();
    const expiry = otpConst.OTP_EXPIRY_MINUTES * 60;
    const lockUntil = Date.now() + (otpConst.RESEND_OTP_MINUTES * 60 * 1000);

    const data = {
        otp: otp,
        otpLimit: otpConst.RESEND_OTP_LIMIT,
        resendLock: lockUntil,
        purpose: "Admin Password Reset OTP",
    };

    await RedisHelper.setData(email, data, expiry);

    await sendEmail({ email, name: validAdmin.name, data });

    return true;
}

export const verifyOTP = async (email, otp) => {
    const storedOtp = await RedisHelper.getData(email, true);

    if (!storedOtp) {
        throw new AppError("OTP Expired or Not Found", HTTP_STATUS.GONE);
    }

    if (storedOtp.otp !== otp) {
        throw new AppError("Invalid OTP", HTTP_STATUS.BAD_REQUEST);
    }

    // We don't delete yet, resetPassword will use it or it will expire
    // Actually, following the user flow, deleting it here is fine since we redirect to reset page
    await RedisHelper.deleteData(email);

    return true;
}

export const resetPassword = async (email, newPassword) => {
    const admin = await adminQuery.checkByEmail(email);
    if (!admin) {
        throw new AppError("Admin not found", HTTP_STATUS.NOT_FOUND);
    }

    const hashPass = await passwordUtil.hashPassword(newPassword);
    await adminQuery.updateAdminPassword(admin._id, hashPass);

    return true;
}
