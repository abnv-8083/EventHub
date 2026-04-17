import mongoose from 'mongoose';
import Event from './src/models/organizer/event.js';
import Organizer from './src/models/organizer/organizer.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Event.countDocuments({ status: 'Pending' });
        const events = await Event.find({ status: 'Pending' });
        
        console.log('--- DB CHECK ---');
        console.log('Events with status: Pending');
        console.log('countDocuments result:', count);
        console.log('find().length result:', events.length);
        
        if (events.length > 0) {
            events.forEach((ev, i) => {
                console.log(`Event ${i + 1}:`, {
                    id: ev._id,
                    title: ev.title,
                    status: ev.status,
                    organizerId: ev.organizerId
                });
            });
        }
        
        const orgCount = await Organizer.countDocuments({ status: 'Pending' });
        console.log('Organizer countPending:', orgCount);
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
