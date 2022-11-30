const express = require('express')
const { default: mongoose } = require('mongoose')
const app = express()
const path = require('path')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')

const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')


const userRoute = require('./routes/users')
const campgroundsRoute = require('./routes/campgrounds')
const reviewsRoute = require('./routes/reviews')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => {
        console.log("MONGO CONNECTION OPEN")
    })
    .catch((err) => {
        console.log(err)
        console.log("MONGO CONNECTION ERROR")
    })

const db = mongoose.connection
db.on('error', console.error.bind(console, "connection error: "))
db.once('open', () => {
    console.log("Database connected")
})

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next();
})

app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'example@mail.com', username: 'abc' });
    const newUser = await User.register(user, 'chicken');
    res.send(newUser);
})

// ****************************************************
// ******************** USER ROUTER *******************
// ****************************************************
app.use('/', userRoute)

// ****************************************************
// ******************** CAMPGROUNDS ROUTER ************
// ****************************************************
app.use('/campgrounds', campgroundsRoute)

// ****************************************************
// ******************** REVIEWS ROUTER ****************
// ****************************************************
app.use('/campgrounds/:id/reviews', reviewsRoute)


app.get('/', (req, res) => {
    res.render('home.ejs')
})

// app.get('/makecampground', async (req, res) => {
//     const camp = new Campground({ title: 'Ny Backyard', description: 'Cheap camping' })
//     await camp.save()
//     res.send(camp)
// })

// ****************************************************
// ******************** DEFAULT ERROR ROUTE ***********
// ****************************************************
app.all('*', (req, res, next) => {
    next(new ExpressError(404, 'Page not found'))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = "Oh No, Something went wrong!"
    res.status(statusCode).render('error.ejs', { err })
})

app.listen(3000, () => {
    console.log("SERVING ON PORT 3000")
})