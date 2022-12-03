const express = require('express')
// by default router doesnt pass the params to route handler
// which gives an error while parsing _id in this file as 
// it is prefixed in app.use in app.js main file
// by passing 'mergeParams: true' we can have access to the URL
// params inside our router file
const router = express.Router({ mergeParams: true })

const Campground = require('../models/campground')
const Review = require('../models/review')

const catchAsync = require('../utils/catchAsync')
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')



// ****************************************************
// ******************** POST REVIEW ROUTE *************
// ****************************************************
router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    const review = new Review(req.body.review)
    review.author = req.user._id;
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash('success', 'Successfully posted a new review!')
    res.redirect(`/campgrounds/${id}`)
}))

// ****************************************************
// ******************** DELELTE REVIEW ROUTE **********
// ****************************************************
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router