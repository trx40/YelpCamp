const express = require('express')
const router = express.Router();
const Campground = require('../models/campground')
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware')


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
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new.ejs')
})

// ****************************************************
// ******************** SHOW PAGE ROUTE ***************
// ****************************************************
router.get('/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) throw new ExpressError(400, 'Campground not found');
    res.render('campgrounds/show.ejs', { campground });
}))


// ****************************************************
// ******************** EDIT ROUTE ********************
// ****************************************************
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campgorund = await Campground.findByIdAndUpdate(id, req.body.campground)
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${id}`)
}))

// ****************************************************
// ******************** EDIT PAGE ROUTE ***************
// ****************************************************
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) throw new ExpressError(400, 'Campground not found')
    res.render('campgrounds/edit.ejs', { campground })
}))

// ****************************************************
// ******************** NEW CAMP ROUTE ****************
// ****************************************************
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const newCamp = new Campground(req.body.campground)
    newCamp.author = req.user._id;
    await newCamp.save()
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${newCamp._id}`)
}))

// ****************************************************
// ******************** DELETE ROUTE ******************
// ****************************************************
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds')
}))

module.exports = router
