
const express = require('express')
const { default: mongoose } = require('mongoose')
const app = express()
const path = require('path')
const Campground = require('./models/campground')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')

const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')

const { campgroundSchema } = require('./validationSchemas')
const Review = require('./models/review')

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


app.get('/', (req, res) => {
    res.render('home.ejs')
})

// app.get('/makecampground', async (req, res) => {
//     const camp = new Campground({ title: 'Ny Backyard', description: 'Cheap camping' })
//     await camp.save()
//     res.send(camp)
// })

const validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(element => element.message).join(',')
        throw new ExpressError(400, msg)
    } else {
        next()
    }
}


// ****************************************************
// ******************** SHOW ALL CAMPS ROUTE **********
// ****************************************************
app.get('/campgrounds', catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

// ****************************************************
// ******************** NEW PAGE ROUTE ****************
// ****************************************************
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new.ejs')
})

// ****************************************************
// ******************** SHOW PAGE ROUTE ***************
// ****************************************************
app.get('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground) throw new ExpressError(400, 'Campground not found')
    res.render('campgrounds/show.ejs', { campground })
}))


// ****************************************************
// ******************** EDIT ROUTE ********************
// ****************************************************
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, req.body.campground)
    res.redirect(`/campgrounds/${id}`)
}))

// ****************************************************
// ******************** EDIT PAGE ROUTE ***************
// ****************************************************
app.get('/campgrounds/:id/edit', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) throw new ExpressError(400, 'Campground not found')
    res.render('campgrounds/edit.ejs', { campground })
}))

// ****************************************************
// ******************** NEW CAMP ROUTE ****************
// ****************************************************
app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
    // if (!req.body.campground) throw new ExpressError(400, 'Invalid Campground Data')

    const newCamp = new Campground(req.body.campground)
    await newCamp.save()
    res.redirect(`/campgrounds/${newCamp._id}`)
}))

// ****************************************************
// ******************** DELETE ROUTE ******************
// ****************************************************
app.delete('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))

app.post('/campgrounds/:id/reviews', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${id}`)
}))

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