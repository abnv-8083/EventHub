import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Events from '../src/models/organizer/event.js';

dotenv.config();

async function checkEventSchema() {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        
        const event = await Events.findOne({});
        if (event) {
            console.log("Full Event Document:");
            console.log(JSON.stringify(event, null, 2));
            console.log("\nOrganizerId type:", typeof event.organizerId);
            console.log("Is organizerId a Mongoose ObjectId?", event.organizerId instanceof mongoose.Types.ObjectId);
        } else {
            console.log("No events found in collection 'events'");
        }
    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

checkEventSchema();
