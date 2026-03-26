import { generateOTP } from "../../utils/generateOtp.js"
import RedisHelper from "../../utils/redisHelper.js"
import { sendEmail } from "../../constants/sendEmail.js"
import * as otpConst from "../../constants/otpConstant.js"
import * as passwordUtil from "../../utils/password.js"
import * as user from "../../repositories/users/usersQueries.js"
import AppError from "../../utils/AppError.js"
import HTTP_STATUS from "../../constants/statusCode.js"

export const createUser = async (name, email, phone, password) => {
    const hashPass = await passwordUtil.hashPassword(password)

    const checkUser = await user.checkByEmail(email)
    if (checkUser) {
        throw new AppError("User Already Exist", HTTP_STATUS.CONFLICT)
    }

    const otp = generateOTP();
    const expiry = otpConst.OTP_EXPIRY_MINUTES * 60;
    const lockUntil = Date.now() + (otpConst.RESEND_OTP_MINUTES * 60 * 1000);

    const data = {
        otp: otp,
        otpLimit: otpConst.RESEND_OTP_LIMIT,
        resendLock: lockUntil,
        purpose: "New User Otp",
        userData: { name, phone, hashPass }
    }
    await RedisHelper.setData(email, data, expiry)

    await sendEmail({ email, name, data });

    return { name, email };
}

export const loginUser = async (email, password) => {
    const checkUser = await user.checkByEmail(email)

    if (!checkUser) {
        throw new AppError("Invalid Email", HTTP_STATUS.UNAUTHORIZED)
    }

    const checkPass = await passwordUtil.verifyPassword(password, checkUser.password)
    if (!checkPass) {
        throw new AppError("Invalid password", HTTP_STATUS.UNAUTHORIZED)
    }

    if (checkUser.status !== "Active") {
        throw new AppError("Account is not active", HTTP_STATUS.FORBIDDEN)
    }

    return {
        user: checkUser,
        message: `Hi ${checkUser.name}`
    }
}

export const verifyOTP = async (email, otp) => {
    const storedOtp = await RedisHelper.getData(email, true)

    if (!storedOtp) {
        throw new AppError("OTP Expired or Not Found", HTTP_STATUS.GONE);
    }

    if (storedOtp.otp !== otp) {
        throw new AppError("Invalid OTP", HTTP_STATUS.BAD_REQUEST);
    }

    if (storedOtp.purpose === "New User Otp") {
        const { name, phone, hashPass } = storedOtp.userData;
        await user.createUserByData(name, email, phone, hashPass);
    } else if (storedOtp.purpose === "Edit Email Otp") {
        const { id, newEmail } = storedOtp.userData;
        await user.editEmail(id, newEmail);
    } else {
        await user.updateStatusByEmail(email, "Active");
    }

    await RedisHelper.deleteData(email)

    return true;
}

export const resendOtp = async (email, name) => {
    const data = await RedisHelper.getData(email, true);

    if (!data) {
        throw new AppError("Verification session expired. Please sign up again.", HTTP_STATUS.GONE);
    }

    if (data.resendLock && Date.now() < data.resendLock) {
        const remainingSeconds = Math.ceil((data.resendLock - Date.now()) / 1000);
        throw new AppError(`Please wait ${remainingSeconds} seconds before resending.`, HTTP_STATUS.TOO_MANY_REQUESTS);
    }

    if (data.otpLimit <= 0) {
        throw new AppError('Maximum resend attempts reached. Please contact support.', HTTP_STATUS.TOO_MANY_REQUESTS);
    }

    const newOtp = generateOTP();
    const lockUntil = Date.now() + (otpConst.RESEND_OTP_MINUTES * 60 * 1000);
    const expiry = otpConst.OTP_EXPIRY_MINUTES * 60;

    const updatedData = {
        ...data,
        otp: newOtp,
        otpLimit: data.otpLimit - 1,
        resendLock: lockUntil
    };

    await RedisHelper.setData(email, updatedData, expiry);

    await sendEmail({ email, name, data: updatedData });

    return true;
}

export const forgotePassword = async (email) => {
    const validUser = await user.checkByEmail(email);
    if (!validUser) {
        throw new AppError('Email Not Found', HTTP_STATUS.NOT_FOUND);
    }

    const otp = generateOTP();
    const expiry = otpConst.OTP_EXPIRY_MINUTES * 60;
    const lockUntil = Date.now() + (otpConst.RESEND_OTP_MINUTES * 60 * 1000);

    const data = {
        otp: otp,
        otpLimit: otpConst.RESEND_OTP_LIMIT,
        resendLock: lockUntil,
        purpose: "Password Reset OTP",
    };

    await RedisHelper.setData(email, data, expiry);

    await sendEmail({ email, name: validUser.name, data });

    return true;
}

export const logoutUser = (req) => {
    return new Promise((resolve, reject) => {
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    console.error("Session destruction error:", err);
                    return reject(new AppError("Failed to destroy session", HTTP_STATUS.INTERNAL_SERVER_ERROR));
                }
                resolve(true);
            });
        } else {
            resolve(true);
        }
    });
}

export const getOtpLockTime = async (email) => {
    const data = await RedisHelper.getData(email, true);
    if (!data || !data.resendLock) return 0;

    const remainingSeconds = Math.ceil((data.resendLock - Date.now()) / 1000);
    return remainingSeconds > 0 ? remainingSeconds : 0;
}
