const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const { descriptors, places } = require('./seedHelpers')

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

// Randomizer for *title* of the campground

const rnd = array => array[Math.floor(Math.random() * array.length)]

// Seed function
// Deletes all entries in the database 
// replaces with fresh random values from our 
// collections in cities.js & seedHelpers.js

const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${rnd(descriptors)} ${rnd(places)}`
        })
        await camp.save()
    }
}

seedDB().then(() => {
    console.log('Seeds added, closing mongoose connection to database')
    mongoose.connection.close()
})