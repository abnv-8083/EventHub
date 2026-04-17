import Review from "../../models/users/review.js";

export const createReview = async (reviewData) => {
    return await Review.create(reviewData);
}

export const fetchReviewsByEventId = async (eventId) => {
    return await Review.find({ event: eventId })
        .populate('user', 'name avatar_url')
        .sort({ createdAt: -1 });
}

export const fetchReviewById = async (id) => {
    return await Review.findById(id);
}

export const deleteReviewById = async (id) => {
    return await Review.findByIdAndDelete(id);
}
