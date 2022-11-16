const express = require('express')
// by default router doesnt pass the params to route handler
// which gives an error while parsing _id in this file as 
// it is prefixed in app.use in app.js main file
// by passing 'mergeParams: true' we can have access to the URL
// params inside our router file
const router = express.Router({ mergeParams: true })

const Campground = require('../models/campground')
const Review = require('../models/review')

const { reviewSchema } = require('../validationSchemas')
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(element => element.message).join(',')
        throw new ExpressError(400, msg)
    }
    else {
        next()
    }
}

// ****************************************************
// ******************** POST REVIEW ROUTE *************
// ****************************************************
router.post('/', validateReview, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${id}`)
}))

// ****************************************************
// ******************** DELELTE REVIEW ROUTE **********
// ****************************************************
router.delete('/:review_id', catchAsync(async (req, res) => {
    const { id, review_id } = req.params
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: review_id } })
    await Review.findByIdAndDelete(review_id)
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router