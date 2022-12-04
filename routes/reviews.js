const express = require('express')
// by default router doesnt pass the params to route handler
// which gives an error while parsing _id in this file as 
// it is prefixed in app.use in app.js main file
// by passing 'mergeParams: true' we can have access to the URL
// params inside our router file
const router = express.Router({ mergeParams: true })

// REVIEWS controller
const reviews = require('../controllers/reviews')
const catchAsync = require('../utils/catchAsync')
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')



// ****************************************************
// ******************** POST REVIEW ROUTE *************
// ****************************************************
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.postReview))

// ****************************************************
// ******************** DELELTE REVIEW ROUTE **********
// ****************************************************
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router