import session from "express-session"
import MongoStore from "connect-mongo"

const createSession = () => session({
    name: process.env.SESSION_NAME || 'eventhub.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: process.env.SESSION_COLLECTION || 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
})

const appSession = createSession();

export const userSession = appSession;
export const adminSession = appSession;
export const organizerSession = appSession;
export default appSession;