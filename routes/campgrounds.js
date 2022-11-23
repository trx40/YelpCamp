const express = require('express')
const router = express.Router();
const Campground = require('../models/campground')
const { campgroundSchema } = require('../validationSchemas')
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')

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
router.get('/', catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

// ****************************************************
// ******************** NEW PAGE ROUTE ****************
// ****************************************************
router.get('/new', (req, res) => {
    res.render('campgrounds/new.ejs')
})

// ****************************************************
// ******************** SHOW PAGE ROUTE ***************
// ****************************************************
router.get('/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate('reviews')
    if (!campground) throw new ExpressError(400, 'Campground not found')
    res.render('campgrounds/show.ejs', { campground })
}))


// ****************************************************
// ******************** EDIT ROUTE ********************
// ****************************************************
router.put('/:id', validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, req.body.campground)
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${id}`)
}))

// ****************************************************
// ******************** EDIT PAGE ROUTE ***************
// ****************************************************
router.get('/:id/edit', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) throw new ExpressError(400, 'Campground not found')
    res.render('campgrounds/edit.ejs', { campground })
}))

// ****************************************************
// ******************** NEW CAMP ROUTE ****************
// ****************************************************
router.post('/', validateCampground, catchAsync(async (req, res) => {
    // if (!req.body.campground) throw new ExpressError(400, 'Invalid Campground Data')

    const newCamp = new Campground(req.body.campground)
    await newCamp.save()
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${newCamp._id}`)
}))

// ****************************************************
// ******************** DELETE ROUTE ******************
// ****************************************************
router.delete('/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds')
}))

module.exports = router
