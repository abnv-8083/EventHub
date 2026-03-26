import Organizer from "../../models/organizer/organizer.js";
import User from "../../models/users/user.js";
import { sendResponse } from "../../utils/responseHandler.js";
import HTTP_STATUS from "../../constants/statusCode.js";
import { City } from "country-state-city";
import * as cityConst from "../../constants/cityConstant.js";

export const getDashboard = async (req, res) => {
    try {
        const userId = req.session.organizer._id;
        const organizer = await Organizer.findOne({ userId });

        res.render('organizer/dashboard', { 
            organizer,
            organizerSession: req.session.organizer
        });
    } catch (error) {
        console.error("Organizer Dashboard Error:", error);
        res.redirect('/organizer/login');
    }
}

export const getProfile = async (req, res) => {
    try {
        const userId = req.session.organizer._id;
        const [organizer, user] = await Promise.all([
            Organizer.findOne({ userId }),
            User.findById(userId).select('-password')
        ]);
        const cityes = City.getCitiesOfState(cityConst.CITY_COUNTRY, cityConst.CITY_STATE);
        const sortedCity = cityes.sort((a, b) => a.name.localeCompare(b.name));
        res.render('organizer/profile', { organizer, user, sortedCity, organizerSession: req.session.organizer });
    } catch (error) {
        console.error("Organizer Profile Error:", error);
        res.redirect('/organizer/dashboard');
    }
}

export const postProfile = async (req, res) => {
    try {
        const userId = req.session.organizer._id;
        const { organizationName, industryCategory, operatingRegion } = req.body;

        if (!organizationName || !industryCategory || !operatingRegion) {
            return sendResponse(res, HTTP_STATUS.BAD_REQUEST, false, "All fields are required");
        }

        await Organizer.findOneAndUpdate(
            { userId },
            { organizationName, industryCategory, operatingRegion },
            { new: true }
        );

        return sendResponse(res, HTTP_STATUS.OK, true, "Organization profile updated successfully");
    } catch (error) {
        console.error("Organizer Profile Update Error:", error);
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, "Failed to update profile");
    }
}
