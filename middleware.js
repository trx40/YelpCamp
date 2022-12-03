const Campground = require('./models/campground')
const Review = require('./models/review')
const { campgroundSchema, reviewSchema } = require('./validationSchemas')
const ExpressError = require('./utils/ExpressError')

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', "You must be signed in first");
        return res.redirect('/login');
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(element => element.message).join(',')
        throw new ExpressError(400, msg)
    } else {
        next()
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', "Unauthorized user!")
        return res.redirect(`/campgrounds/${id}`)
    }
    else {
        next()
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', "Unauthorized user!")
        return res.redirect(`/campgrounds/${id}`)
    }
    else {
        next()
    }
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(element => element.message).join(',')
        throw new ExpressError(400, msg)
    }
    else {
        next()
    }
}