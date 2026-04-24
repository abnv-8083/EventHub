import * as eventRepo from "../../repositories/users/eventQueries.js";
import * as categoryRepo from "../../repositories/users/categoryQueries.js";
import * as reviewRepo from "../../repositories/users/reviewQueries.js";
import AppError from "../../utils/AppError.js";
import HTTP_STATUS from "../../constants/statusCode.js";

import { City } from "country-state-city"
import * as cityConst from "../../constants/cityConstant.js"

export const getHomeData = async () => {
    const featuredEvents = await eventRepo.fetchFeaturedEvents(3);
    return { featuredEvents };
}

export const getEventsData = async (query) => {
    const { category, search, sort, page = 1, date, city, minPrice, maxPrice, featured } = query;
    const limit = 9;
    const skip = (page - 1) * limit;

    const filters = {};
    if (category && category !== 'All' && category !== 'All Types') 
        filters.category = category;
    if (search) 
        filters.title = { $regex: search, $options: 'i' };
    if (city) 
        filters['venueLocation.address'] = { $regex: city, $options: 'i' };
    if (featured === 'true') 
        filters.isFeatured = true;

    // Price Filtering
    if (minPrice || maxPrice) {
        filters.ticketing = { $elemMatch: {} };
        if (minPrice) filters.ticketing.$elemMatch.price = { $gte: parseFloat(minPrice) };
        if (maxPrice) {
            filters.ticketing.$elemMatch.price = { 
                ...filters.ticketing.$elemMatch.price, 
                $lte: parseFloat(maxPrice) 
            };
        }
    }

    // Date Filtering
    if (date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (date === 'Today') {
            const endOfDay = new Date(today);
            endOfDay.setHours(23, 59, 59, 999);
            filters.startDate = { $gte: today, $lte: endOfDay };
        } else if (date === 'This Weekend') {
            const friday = new Date(today);
            friday.setDate(today.getDate() + (5 - today.getDay() + 7) % 7);
            const sunday = new Date(friday);
            sunday.setDate(friday.getDate() + 2);
            sunday.setHours(23, 59, 59, 999);
            filters.startDate = { $gte: friday, $lte: sunday };
        } else if (date === 'Next 30 Days') {
            const next30 = new Date(today);
            next30.setDate(today.getDate() + 30);
            filters.startDate = { $gte: today, $lte: next30 };
        }
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'OLDEST') sortOption = { createdAt: 1 };
    if (sort === 'ALPHABETICAL') sortOption = { title: 1 };
    if (sort === 'PRICE_LOW') sortOption = { 'ticketing.price': 1 };
    if (sort === 'PRICE_HIGH') sortOption = { 'ticketing.price': -1 };
    if (sort === 'POPULAR') sortOption = { totalRevenue: -1 }; // Implementation choice

    const [events, total, categories] = await Promise.all([
        eventRepo.fetchAllPublicEvents(filters, sortOption, skip, limit),
        eventRepo.countPublicEvents(filters),
        categoryRepo.fetchActiveCategories()
    ]);

    const cities = City.getCitiesOfState(cityConst.CITY_COUNTRY, cityConst.CITY_STATE);
    const sortedCities = cities.sort((a,b)=>a.name.localeCompare(b.name));

    return {
        events,
        categories,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        currentCategory: category || 'All Types',
        currentSort: sort || 'NEWEST',
        currentSearch: search || '',
        currentDate: date || '',
        currentCity: city || '',
        currentMinPrice: minPrice || '',
        currentMaxPrice: maxPrice || '',
        isFeaturedOnly: featured === 'true',
        sortedCities
    };
}

export const getEventDetails = async (eventId) => {
    const [event, reviews] = await Promise.all([
        eventRepo.fetchEventById(eventId),
        reviewRepo.fetchReviewsByEventId(eventId)
    ]);

    if (!event) {
        throw new AppError("Event not found", HTTP_STATUS.NOT_FOUND);
    }

    return { event, reviews };
}

export const getBookingData = async (eventId) => {
    const event = await eventRepo.fetchEventById(eventId);
    if (!event) {
        throw new AppError("Event not found", HTTP_STATUS.NOT_FOUND);
    }
    return { event };
}

export const postReview = async (reviewData) => {
    return await reviewRepo.createReview(reviewData);
}

export const deleteReview = async (reviewId, userId) => {
    const review = await reviewRepo.fetchReviewById(reviewId);
    
    if (!review) {
        throw new AppError("Review not found", HTTP_STATUS.NOT_FOUND);
    }

    if (review.user.toString() !== userId.toString()) {
        throw new AppError("Unauthorized to delete this review", HTTP_STATUS.UNAUTHORIZED);
    }

    return await reviewRepo.deleteReviewById(reviewId);
}
