import * as otpConst from "../constants/otpConstant.js"

export const generateOTP = () => {
    let otp = '';
    for (let i = 0; i < otpConst.OTP_LENGTH; i++) {
        otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
};
