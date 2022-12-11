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
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            // YOUR USER ID
            author: '638709cf68ccd27ea4bb0de3',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${rnd(descriptors)} ${rnd(places)}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dmfu95na6/image/upload/v1670503606/YelpCamp/ppselap92cv0nqiyucez.jpg',
                    filename: 'YelpCamp/avla6ps6kvowg4nm9chv',
                },
                {
                    url: 'https://res.cloudinary.com/dmfu95na6/image/upload/v1670607471/YelpCamp/cjzi8yvadcesdfy0dwfi.jpg',
                    filename: 'YelpCamp/wzk8posk0jcvorr9vklk',
                },
                {
                    url: 'https://res.cloudinary.com/dmfu95na6/image/upload/v1670503611/YelpCamp/fkdnsws9o9qiywzbnwy8.jpg',
                    url: 'https://res.cloudinary.com/dmfu95na6/image/upload/v1670517610/YelpCamp/zxajbikrnkohixcuijjc.jpg',
                    filename: 'YelpCamp/fkdnsws9o9qiywzbnwy8',
                }
            ],
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut, totam quis corporis fuga cupiditate quo numquam itaque autem commodi. Veniam aliquam vitae ipsa officia, nostrum sit numquam dolorem ut laudantium?.Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut, totam quis corporis fuga cupiditate quo numquam itaque autem commodi. Veniam aliquam vitae ipsa officia, nostrum sit numquam dolorem ut laudantium? Harum dolorum dolore corrupti ea doloribus quos tempore omnis sit magni asperiores commodi nisi nulla, laboriosam nemo autem odio voluptatum nam. Vero ipsum, quos accusamus dicta at dignissimos veritatis nisi! Doloribus vitae, ut alias error necessitatibus consectetur aliquid ad aliquam iure repudiandae obcaecati dolorem iusto eos quos neque? Nulla ipsa voluptatibus, ipsam odit quasi soluta voluptatem reiciendis atque consectetur nobis.",
            price
        })
        await camp.save()
    }
}

seedDB().then(() => {
    console.log('Seeds added, closing mongoose connection to database')
    mongoose.connection.close()
})