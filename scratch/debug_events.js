import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Events from '../src/models/organizer/event.js';
import Organizer from '../src/models/organizer/organizer.js';
import User from '../src/models/users/user.js';

dotenv.config();

async function checkEvents() {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error("MONGO_URI not found in environment");
        
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");

        const allEvents = await Events.find({});
        console.log(`\nTotal events in DB: ${allEvents.length}`);
        
        if (allEvents.length > 0) {
            console.log("\n--- Sample Events ---");
            allEvents.slice(0, 5).forEach(e => {
                console.log(`- Event: ${e.title}, Status: ${e.status}, OrganizerId: ${e.organizerId}`);
            });
        }

        const allOrganizers = await Organizer.find({});
        console.log(`\nTotal organizers in DB: ${allOrganizers.length}`);
        if (allOrganizers.length > 0) {
            console.log("\n--- Sample Organizers ---");
            allOrganizers.slice(0, 5).forEach(o => {
                console.log(`- ID: ${o._id}, Name: ${o.organizationName}, UserId: ${o.userId}`);
            });
        }

        const allUsers = await User.find({});
        console.log(`\nTotal users in DB: ${allUsers.length}`);
        if (allUsers.length > 0) {
            console.log("\n--- Sample Organizer Users ---");
            const orgUsers = allUsers.filter(u => u.isOrganizer);
            console.log(`Found ${orgUsers.length} users with isOrganizer: true`);
            orgUsers.forEach(u => {
                console.log(`- User: ${u.name}, email: ${u.email}, organizerId Field: ${u.organizerId}`);
            });
        }

    } catch (error) {
        console.error("Error checking events:", error);
    } finally {
        await mongoose.disconnect();
    }
}

checkEvents();
