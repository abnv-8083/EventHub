import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Events from '../src/models/organizer/event.js';
import Organizer from '../src/models/organizer/organizer.js';
import User from '../src/models/users/user.js';

dotenv.config();

async function migrateEventIds() {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");

        const events = await Events.find({});
        console.log(`Found ${events.length} events to check.`);

        let updatedCount = 0;
        for (const event of events) {
            // Check if the current organizerId is actually a UserId
            const userAsOrganizer = await User.findById(event.organizerId);
            
            if (userAsOrganizer) {
                console.log(`\nEvent "${event.title}" has a UserId (${event.organizerId}) as organizerId.`);
                
                // Find the Organizer record for this user
                const organizer = await Organizer.findOne({ userId: event.organizerId });
                
                if (organizer) {
                    console.log(`Found Organizer record: ${organizer._id}`);
                    event.organizerId = organizer._id;
                    await event.save();
                    console.log(`Updated event "${event.title}" with correct OrganizerId.`);
                    updatedCount++;
                } else {
                    console.warn(`No Organizer record found for UserId ${event.organizerId}. Skipping.`);
                }
            } else {
                // It's likely already an OrganizerId, or something else.
                // We'll verify if it's a valid OrganizerId just in case.
                const validOrganizer = await Organizer.findById(event.organizerId);
                if (validOrganizer) {
                    console.log(`Event "${event.title}" already has a correct OrganizerId.`);
                } else {
                    console.warn(`Event "${event.title}" has an invalid organizerId: ${event.organizerId}.`);
                }
            }
        }

        console.log(`\nMigration complete. Updated ${updatedCount} events.`);

    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await mongoose.disconnect();
    }
}

migrateEventIds();
