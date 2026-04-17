import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function listCollections() {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log("Collections in database:");
        collections.forEach(c => console.log(` - ${c.name}`));

        // Try to find ANY document in a few likely collections
        const eventCol = db.collection('events');
        const count = await eventCol.countDocuments();
        console.log(`\nDocuments in 'events' collection: ${count}`);

        if (count > 0) {
            const sample = await eventCol.findOne({});
            console.log("Sample event:", JSON.stringify(sample, null, 2));
        }

    } catch (error) {
        console.error("Error listing collections:", error);
    } finally {
        await mongoose.disconnect();
    }
}

listCollections();
