if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express')
const { default: mongoose } = require('mongoose')
const app = express()
const path = require('path')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport');
const mongoSanitize = require('express-mongo-sanitize');
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

const ExpressError = require('./utils/ExpressError')


const userRoute = require('./routes/users')
const campgroundsRoute = require('./routes/campgrounds')
const reviewsRoute = require('./routes/reviews');

const mongoDbUrl = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
const port = process.env.PORT || 3000;

mongoose.connect(mongoDbUrl)
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
app.use(mongoSanitize());

const store = MongoStore.create({
    mongoUrl: mongoDbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});
store.on('error', function (e) {
    console.log("Session Store Error", e)
})

const sessionConfig = {
    store,
    name: 'yc_session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}

app.use(session(sessionConfig));
app.use(flash());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];

const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dmfu95na6/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next();
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

app.listen(port, () => {
    console.log(`SERVING ON PORT ${port}`)
})