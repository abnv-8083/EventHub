import "dotenv/config"
import express from "express"
import morgan from "morgan"
import flash from "connect-flash-plus"
import connectDB from "./config/db.js"
import { fileURLToPath } from 'url'
import path from "path"
import passport from "passport"
import passportConfig from "./config/passport.js"

//Middlewares
import toastMiddleware from "./middleware/toastMiddleware.js"
import sessionMiddleware from "./middleware/session.js"

// User Routes
import userAuthRoute from "./router/user/authRoutes.js"
import userRouter from "./router/user/protectedRoutes.js"
import publicRouter from "./router/user/publicRoutes.js"

// Admin Routes
import adminAuthRoute from "./router/admin/authRoutes.js"

// Organizer Routes
import organizerAuthRoute from "./router/organizer/authRoutes.js"
import organizerRouter from "./router/organizer/organizerRoutes.js"

const app = express()
const PORT = process.env.PORT || 5000
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

passportConfig(passport);

app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(sessionMiddleware);

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())


app.use(toastMiddleware);


app.use('/user', userAuthRoute)
app.use('/admin', adminAuthRoute)
app.use('/organizer', organizerAuthRoute)
app.use('/organizer', organizerRouter)
app.use('/', userRouter)
app.use('/', publicRouter)

connectDB()
app.listen(PORT, () => {
    console.log(`Server is Running http://localhost:${PORT}`)
})


