import * as passwordUtil from "../../utils/password.js"
import * as adminQuery from "../../repositories/admin/adminQueries.js"
import AppError from "../../utils/AppError.js"
import HTTP_STATUS from "../../constants/statusCode.js"

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
