import Booking from "../../models/users/bookings.js";
import Event from "../../models/organizer/event.js";
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