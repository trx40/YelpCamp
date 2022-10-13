const { Console } = require('console')
const express = require('express')
const { default: mongoose } = require('mongoose')
const app = express()
const path = require('path')

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

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.listen(3000, () => {
    console.log("SERVING ON PORT 3000")
})

app.get('/', (req, res) => {
    res.render('home.ejs')
})