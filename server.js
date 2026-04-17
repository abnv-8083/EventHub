import "dotenv/config"
import express from "express"
import morgan from "morgan"
import flash from "connect-flash-plus"
import connectDB from "./src/config/db.js"
import { fileURLToPath } from 'url'
import path from "path"
import passport from "passport"
import passportConfig from "./src/config/passport.js"

//Middlewares
import toastMiddleware from "./src/middleware/toastMiddleware.js"
import appSession from "./src/middleware/session.js"

// User Routes
import userAuthRoute from "./src/router/user/authRoutes.js"
import userRouter from "./src/router/user/protectedRoutes.js"
import publicRouter from "./src/router/user/publicRoutes.js"

// Admin Routes
import adminAuthRoute from "./src/router/admin/authRoutes.js"
import adminViewMiddleware from "./src/middleware/adminViewMiddleware.js"

// Organizer Routes
import organizerRouter from "./src/router/organizer/organizerRoutes.js"

const app = express()
const PORT = process.env.PORT || 5000
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

passportConfig(passport);

app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, 'src', 'public')))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'src', 'views'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Helper for route chains that need session + flash + toast
const withSession = (sessionMw) => [
    sessionMw,
    passport.initialize(),
    passport.session(),
    flash(),
    toastMiddleware
];

import checkBlocked from "./src/middleware/checkBlocked.js"

app.use('/user', ...withSession(appSession), checkBlocked, userAuthRoute)
app.use('/user', ...withSession(appSession), checkBlocked, userRouter)
app.use('/admin', ...withSession(appSession), adminViewMiddleware, adminAuthRoute)
app.use('/organizer', ...withSession(appSession), checkBlocked, organizerRouter)
app.use('/', ...withSession(appSession), checkBlocked, publicRouter)

connectDB()
app.listen(PORT, () => {
    console.log(`Server is Running http://localhost:${PORT}`)
})



// Admin UI Updated
