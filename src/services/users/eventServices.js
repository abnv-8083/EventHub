import * as eventRepo from "../../repositories/users/eventQueries.js";
import * as categoryRepo from "../../repositories/users/categoryQueries.js";
import * as reviewRepo from "../../repositories/users/reviewQueries.js";
import AppError from "../../utils/AppError.js";
import HTTP_STATUS from "../../constants/statusCode.js";

export const getHomeData = async () => {
    const featuredEvents = await eventRepo.fetchFeaturedEvents(3);
    return { featuredEvents };
}

export const getEventsData = async (query) => {
    const { category, search, sort, page = 1 } = query;
    const limit = 9;
    const skip = (page - 1) * limit;

    const filters = {};
    if (category && category !== 'All') filters.category = category;
    if (search) filters.title = { $regex: search, $options: 'i' };

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'alphabetical') sortOption = { title: 1 };

    const [events, total, categories] = await Promise.all([
        eventRepo.fetchAllPublicEvents(filters, sortOption, skip, limit),
        eventRepo.countPublicEvents(filters),
        categoryRepo.fetchActiveCategories()
    ]);

    return {
        events,
        categories,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        currentCategory: category || 'All',
        currentSort: sort || 'newest',
        currentSearch: search || ''
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
