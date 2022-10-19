const { Console } = require('console')
const express = require('express')
const { default: mongoose } = require('mongoose')
const app = express()
const path = require('path')
const Campground = require('./models/campground')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')

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

app.listen(3000, () => {
    console.log("SERVING ON PORT 3000")
})

app.get('/', (req, res) => {
    res.render('home.ejs')
})

app.get('/makecampground', async (req, res) => {
    const camp = new Campground({ title: 'Ny Backyard', description: 'Cheap camping' })
    await camp.save()
    res.send(camp)
})



app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
})

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new.ejs')
})

app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show.ejs', { campground })
})

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const { title, location } = req.body.campground
    await Campground.findByIdAndUpdate(id, { title, location })
    res.redirect(`/campgrounds/${id}`)
})

app.get('/campgrounds/:id/edit', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    res.render('campgrounds/edit.ejs', { campground })
})

app.post('/campgrounds', async (req, res) => {
    const newCamp = new Campground(req.body.campground)
    await newCamp.save()
    res.redirect(`/campgrounds/${newCamp._id}`)
})

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
})
