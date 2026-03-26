import HTTP_STATUS from "../../constants/statusCode.js"
import * as userServices from "../../services/users/userAuthServices.js"
import { sendResponse, sendConfirmation } from "../../utils/responseHandler.js"
import { registerValidate, loginValidate, forgotePasswordValidate } from "../../validation/user/user.js"
import * as userQuery from "../../repositories/users/usersQueries.js"
import { City } from "country-state-city"
import * as cityConst from "../../constants/cityConstant.js"
import * as organizerQuery from "../../repositories/user/organizerQueries.js"

export const getLogin = (req, res) => {
    res.render('auth/login')
}

export const getOrganizerSignup = async (req, res) => {
    try {
        // Gate: already an approved organizer
        if (req.session.user && req.session.user.isOrganizer) {
            return res.redirect('/organizer/dashboard');
        }
        // Gate: already applied (pending or rejected)
        const existingReq = await organizerQuery.getOrganizerByUserId(req.session.user._id);
        if (existingReq) {
            return res.render('user/organizer-status', { organizer: existingReq });
        }
        const cityes = City.getCitiesOfState(cityConst.CITY_COUNTRY, cityConst.CITY_STATE);
        const sortedCity = cityes.sort((a, b) => a.name.localeCompare(b.name));
        res.render('user/register-organizer', { sortedCity });
    } catch (error) {
        console.error(error);
        res.redirect('/profile');
    }
}

export const getOrganizerLogin = (req,res) =>{
    res.render('auth/login-organizer')
}

export const getEmailVerified = (req,res) =>{
    res.render('auth/verify-email-success')
}

export const getRegister = (req, res) => {
    res.render('auth/register')
}

export const postRegister = async (req, res) => {
    const { error, value } = registerValidate.validate(req.body, { abortEarly: false })
    if (error) {
        return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, error.details[0].message)
    }
    try {
        const { name, email, phone, password } = value
        const newUser = await userServices.createUser(name, email, phone, password)
        if (newUser) {
            return sendResponse(res, 201, true, 'User Created Successfully. Please verify your email.', {
                redirect: `/user/otp-verify?email=${newUser.email}&name=${newUser.name}&purpose=signup`
            })
        }
    } catch (error) {
        console.error("Registration Error:", error)
        return sendResponse(res, error.statusCode || 500, false, error.message)
    }
}

export const getOTPVerify = async (req, res) => {
    const { email, name, purpose } = req.query;
    const initialCooldown = await userServices.getOtpLockTime(email);
    res.render('auth/otp-verification', { email, name, purpose, initialCooldown })
}

export const postOTPVerify = async (req, res) => {
    try {
        const { email, otp, purpose} = req.body;
        await userServices.verifyOTP(email, otp);
        
        if(purpose == "signup"){
            return sendResponse(res, 200, true, 'OTP Verified Successfully', { redirect: '/user/email-verify-success' });
        }else if( purpose == "reset-password"){
            return sendResponse(res, 200, true, 'OTP Verified Successfully', { redirect: '/user/reset-password' });
        }else if(purpose == "edit-email"){
            const updatedUser = await userQuery.checkByEmail(email);
            if(req.session && req.session.user) {
                req.session.user = updatedUser;
            }
            return sendResponse(res, 200, true, 'Email Updated Successfully', { redirect: '/profile' });
        }else{
            return sendResponse(res, 200, true, 'OTP Verified Successfully', { redirect: '/' });
        }
        
    } catch (error) {
        return sendResponse(res, error.statusCode || 400, false, error.message);
    }
}

export const getRsetPassword = async (req,res) =>{
    res.render('auth/reset-password')
}

export const postLogin = async (req, res) => {
    const { error, value } = loginValidate.validate(req.body, { abortEarly: false })
    if (error) {
        return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, "Please enter valid email and password")
    }
    try {
        const { email, password } = value
        const userLogin = await userServices.loginUser(email, password)
        req.session.user = userLogin.user;
        return sendResponse(res, HTTP_STATUS.ACCEPTED, true, userLogin.message, { redirect: '/' })
    } catch (error) {
        return sendResponse(res, error.statusCode || 500, false, error.message)
    }
}

export const postresendOtp = async (req, res) => {
    // For resend, we only need email and potentially name from the body
    try {
        const { email, name } = req.body
        if (!email) {
            return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, "Email is required")
        }
        await userServices.resendOtp(email, name)
        return sendResponse(res, HTTP_STATUS.ACCEPTED, true, "Resend OTP Successfully")
    } catch (error) {
        return sendResponse(res, error.statusCode || 500, false, error.message)
    }
}

export const postLogout = async (req, res) => {
    try {
        await userServices.logoutUser(req)
        return sendResponse(res, HTTP_STATUS.ACCEPTED, true, "User Logout Successfully", { redirect: '/' })
    } catch (error) {
        return sendResponse(res, error.statusCode || 500, false, error.message)
    }
}

export const getForgotePassword = (req,res)=>{
    res.render('auth/forgot-password')
}

export const postforgotePassword = async (req,res) =>{
    const {error, value} = forgotePasswordValidate.validate(req.body,{abortEarly:false})
    if(error){
        return sendResponse(res,HTTP_STATUS.BAD_REQUEST,false,'Invalid Email')
    }
    try {
        const {email} = value
        await userServices.forgotePassword(email)
        return sendResponse(res,HTTP_STATUS.ACCEPTED,true,'Otp Send Successfully',{redirect:`/otp-verify?email=${email}&name=User&purpose=reset-password`})
    } catch (error) {
        return sendResponse(res,error.statusCode,false,error.message)
    }
}






















































