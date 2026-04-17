import User from "../../models/users/user.js";

export const toggleWishlist = async (userId, eventId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const index = user.wishlist.indexOf(eventId);
    let isAdded = false;

    if (index > -1) {
        user.wishlist.splice(index, 1);
        isAdded = false;
    } else {
        user.wishlist.push(eventId);
        isAdded = true;
    }

    await user.save();
    return { wishlist: user.wishlist, isAdded };
}

export const fetchUserWishlist = async (userId) => {
    const user = await User.findById(userId).populate({
        path: 'wishlist',
        populate: { path: 'organizerId' }
    });
    return user ? user.wishlist : [];
}
