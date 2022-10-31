const { Console } = require('console')
const express = require('express')
const { default: mongoose } = require('mongoose')
const app = express()
const path = require('path')
const Campground = require('./models/campground')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const { nextTick } = require('process')
const catchAsync = require('./utils/catchAsync')

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
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show.ejs', { campground })
}))


// ****************************************************
// ******************** EDIT ROUTE ********************
// ****************************************************
app.put('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    // const { title, location } = req.body.campground
    await Campground.findByIdAndUpdate(id, req.body.campground)
    res.redirect(`/campgrounds/${id}`)
}))

// ****************************************************
// ******************** EDIT PAGE ROUTE ***************
// ****************************************************
app.get('/campgrounds/:id/edit', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    res.render('campgrounds/edit.ejs', { campground })
}))

// ****************************************************
// ******************** NEW CAMP ROUTE ****************
// ****************************************************
app.post('/campgrounds', catchAsync(async (req, res, next) => {
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

// ****************************************************
// ******************** DEFAULT ERROR ROUTE ***********
// ****************************************************
app.use((err, req, res, next) => {
    res.send("Something went wrong!")
})

app.listen(3000, () => {
    console.log("SERVING ON PORT 3000")
})