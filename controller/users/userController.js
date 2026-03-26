import HTTP_STATUS from "../../constants/statusCode.js"
import * as userServices from "../../services/users/userServices.js"
import { sendResponse, sendConfirmation } from "../../utils/responseHandler.js"
import { City } from "country-state-city"
import * as cityConst from "../../constants/cityConstant.js"
import { profileUpdateValidate, editEmailValidate, passwordUpdateValidate, organizerRegisterValidate } from "../../validation/user/user.js"
import * as organizerQuery from "../../repositories/user/organizerQueries.js"

export const getHome = (req, res) => {
    res.render('public/index')
}

export const getEvent =(req,res) =>{
    res.render('public/events')
}
export const getAbout =(req,res) =>{
    res.render('public/about')
}
export const getContact =(req,res) =>{
    res.render('public/contact')
}

export const getBecomeOrganizer = (req,res) => {
    res.render('public/become-organizer')
}

export const getRegisterOrganizer = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const existingReq = await organizerQuery.getOrganizerByUserId(userId);
        if (existingReq) {
            // Show appropriate status page instead of silent redirect
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

export const postRegisterOrganizer = async (req, res) => {
    const { error, value } = organizerRegisterValidate.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessage = error.details[0].message.replace(/"/g, '');
        return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, errorMessage);
    }
    try {
        const userId = req.session.user._id;
        const { organizationName, industryCategory, operatingRegion } = value;

        // Ensure user hasn't already submitted
        const existingReq = await organizerQuery.getOrganizerByUserId(userId);
        if (existingReq) {
            return sendResponse(res, HTTP_STATUS.CONFLICT, false, 'You have already submitted an application.');
        }

        // Auto-generate a unique Registration Number
        const registrationNumber = `EH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

        // Create the application
        await organizerQuery.createOrganizerProfile(userId, organizationName, registrationNumber, industryCategory, operatingRegion);

        // Flag session so navbar can show pending badge without a DB call
        req.session.user.hasPendingOrganizer = true;

        return sendResponse(res, HTTP_STATUS.CREATED, true, 'Application submitted! Our team will review your details.', { redirect: '/user/organizer/register' });
    } catch (error) {
        console.error("Error creating organizer application:", error);
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, 'Failed to submit application.');
    }
}

export const getProfile = (req,res) =>{
    const cityes = City.getCitiesOfState(cityConst.CITY_COUNTRY,cityConst.CITY_STATE)
    const sortedCity = cityes.sort((a,b)=>a.name.localeCompare(b.name))
    res.render('user/profile',{sortedCity})
}

export const editProfile = async (req,res) =>{
    const {error, value} = profileUpdateValidate.validate(req.body,{abortEarly:false})
    if(error){
        const errorMessage = error.details[0].message.replace(/"/g, '');
        return sendResponse(res,HTTP_STATUS.BAD_REQUEST,false,errorMessage)
    }
    try {
        const {id,name,phone,city,bio,gender,dob,occupation} = value
        const updatedUser = await userServices.profileUpdate(id,name,phone,city,bio,gender,dob,occupation)
        req.session.user = updatedUser
        return sendResponse(res,HTTP_STATUS.ACCEPTED,true,'User Updated Successfully')
    } catch (error) {
        return sendResponse(res,error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,false,error.message)
    }
}

export const updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            console.error("Avatar Upload Error: No file provided in request");
            return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'No image uploaded')
        }
        const avatarUrl = req.file.path // Cloudinary URL
        const userId = req.session.user._id
        const updatedUser = await userServices.updateAvatar(userId, avatarUrl)
        req.session.user = updatedUser
        return sendResponse(res, HTTP_STATUS.ACCEPTED, true, 'Avatar Updated Successfully')
    } catch (error) {
        console.error("Avatar Upload Error Detail:", error);
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message)
    }
}

export const getEditEmail = (req, res) => {
    res.render('user/edit-email')
}

export const editEmail = async (req,res) =>{
    const {error, value} = editEmailValidate.validate(req.body, {abortEarly: false})
    if(error){
        const errorMessage = error.details[0].message.replace(/"/g, '');
        return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, errorMessage)
    }
    try {
        const {id, email} = value
        
        // Generate OTP and store in Redis along with new email request
        await userServices.sendEditEmailOtp(id, email)
        
        // Redirect to OTP verification page
        return sendResponse(res, HTTP_STATUS.ACCEPTED, true, 'OTP Sent to new email. Please verify.', { 
            redirect: `/user/otp-verify?email=${email}&name=User&purpose=edit-email` 
        })
    } catch (error) {
        if(error.code === 11000) {
            return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, 'Email is already taken')
        }
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message)
    }
}

export const getEditPassword = (req, res) => {
    res.render('user/edit-password')
}

export const editPassword = async (req, res) => {
    const { error, value } = passwordUpdateValidate.validate(req.body, { abortEarly: false })
    if (error) {
        const errorMessage = error.details[0].message.replace(/"/g, '');
        return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, errorMessage)
    }
    try {
        const { id, currentPassword, newPassword } = value
        const updatedUser = await userServices.updatePassword(id, currentPassword, newPassword)
        req.session.user = updatedUser
        return sendResponse(res, HTTP_STATUS.ACCEPTED, true, 'Password Updated Successfully', { redirect: '/profile' })
    } catch (error) {
        return sendResponse(res, error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR, false, error.message)
    }
}