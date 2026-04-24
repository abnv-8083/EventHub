import Booking from "../../models/users/bookings.js";
import Event from "../../models/organizer/event.js";
import Cancellation from "../../models/users/cancellation.js";
import { fetchEventById } from "./eventQueries.js";

export const createPendingBooking = async (data) =>{
    return await Booking.create(data)
}

export const findBookingById = async (id) =>{
    return await Booking.findById(id)
}

export const markBookingPaid = async (id, paymentId, signature, qrData)=>{
    return await Booking.findByIdAndUpdate(id, {
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        status: 'paid', 
        qrData
    },{new: true})
}

export const findBookingWithEvent = async (id) =>{
    return await Booking.findById(id).populate('eventId', 'title startDate startTime venueLocation bannerImage')
}

export const findUserBookings = async (userId) =>{
    return await Booking.find({ userId, status: 'paid' })
        .populate('eventId', 'title startDate startTime venueLocation bannerImage')
        .sort({ createdAt: -1 })
}

export const incrementBookedSeatsAndRevenue = async (eventId, tickets, subtotal, userId) =>{
    const event = await Event.findById(eventId)
    for(const item of tickets){
        const tier = event.ticketing.id(item.ticketTypeId)
        if(tier)
            tier.bookedSeats+=item.quantity
    }
    event.totalRevenue = (event.totalRevenue || 0) + subtotal
    if(!event.attendees.includes(userId))
        event.attendees.push(userId)
    return await event.save()
}

export const createCancellationRequest = async (data) => {
    return await Cancellation.create(data);
}

export const findUserCancellations = async (userId) => {
    return await Cancellation.find({ userId })
        .populate('eventId', 'title startDate bannerImage')
        .sort({ createdAt: -1 });
}

export const findOrganizerRefundRequests = async (organizerId) => {
    return await Cancellation.find({ organizerId, status: 'pending' })
        .populate('eventId', 'title bannerImage')
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 });
}

export const findAllOrganizerRefunds = async (organizerId) => {
    return await Cancellation.find({ organizerId })
        .populate('eventId', 'title bannerImage')
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 });
}

export const findCancellationById = async (id) => {
    return await Cancellation.findById(id)
        .populate('eventId', 'title bannerImage')
        .populate('userId', 'name email phone');
}

export const updateCancellationStatus = async (id, status, utrNumber = null, adminNotes = null) => {
    return await Cancellation.findByIdAndUpdate(id, {
        status,
        utrNumber,
        adminNotes
    }, { new: true });
}