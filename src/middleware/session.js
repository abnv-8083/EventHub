import session from "express-session"
import MongoStore from "connect-mongo"

const createMongoStore = (collection) => MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: collection
});

export const userSession = session({
    name: 'eventhub.user.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: createMongoStore('user_sessions'),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
});

export const adminSession = session({
    name: 'eventhub.admin.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: createMongoStore('admin_sessions'),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
});

// Alias organizerSession to userSession since organizer uses the user session
export const organizerSession = userSession;