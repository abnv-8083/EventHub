import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Adjust these import paths to match your actual project structure
import Category from '../models/admin/category.js';
import Organizer from '../models/organizer/organizer.js';
import Event from '../models/organizer/event.js'; // Assuming you have your Event model here

// dotenv.config({path:path.resolve(__dirname, '../../.env')});

const seedDemoEvent = async () => {
    try {
        // 1. Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/eventhub');
        console.log('✅ Connected to Database');

        // 2. Create a Mock Category (if you don't already have one)
        let category = await Category.findOne({ name: 'Technology' });
        if (!category) {
            category = await Category.create({
                name: 'Technology',
                description: 'Tech conferences, hackathons, and workshops.',
                status: 'Active',
                color: '#3498db',
                icon: 'fa-laptop'
            });
            console.log('✅ Created Demo Category');
        }

        // 3. Create a Mock Organizer
        let organizer = await Organizer.findOne({ organizationName: 'Tech Innovators Inc.' });
        if (!organizer) {
            organizer = await Organizer.create({
                organizationName: 'Tech Innovators Inc.',
                industryCategory: 'Technology',
                operatingRegion: 'Global',
                registrationNumber: 'REG-123456789',
                userId: new mongoose.Types.ObjectId()
                // Add required user mapping if your schema demands it:
                // userId: new mongoose.Types.ObjectId() 
            });
            console.log('✅ Created Demo Organizer');
        }

        // 4. Create the Demo Event (matching the structure from our Joi schema)
        // 4. Create the Demo Event
        const demoEvent = new Event({
            organizerId: organizer._id,
            title: 'Future Tech Summit 2026',
            description: 'Join us for a 2-day immersive experience exploring the bleeding edge of web development, AI integration, and scalable architecture. Featuring keynote speakers from top tech giants.',
            category: category.name, 
            
            // FIX 1: Renamed 'location' to 'venueLocation' and flattened the coordinates
            venueLocation: {
                address: '123 Innovation Drive, Silicon Valley, CA',
                latitude: 37.3875,
                longitude: -122.0575
            },

            // Date & Time
            startDate: new Date('2026-08-15'),
            startTime: '09:00',
            endDate: new Date('2026-08-16'),
            endTime: '18:00',

            // FIX 2: Renamed 'tickets' to 'ticketing' and passed a single object.
            // (If you have already updated your Event.js schema to accept an array for the 
            // multiple tickets we built earlier, just wrap this object in array brackets [ { ... } ] )
            ticketing: {
                name: 'General Admission', // Added name since we just built it!
                price: 299.99,
                availableSeats: 500,
                maxPerUser: 5
            },

            // Metadata
            tags: ['technology', 'web-development', 'ai', 'networking'],
            visibility: 'Public',
            status: 'Published' 
        });

        await demoEvent.save();
        console.log('🎉 Successfully created Demo Event: Future Tech Summit 2026');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        // Disconnect from database
        await mongoose.disconnect();
        console.log('🔌 Disconnected from Database');
        process.exit(0);
    }
};

seedDemoEvent();