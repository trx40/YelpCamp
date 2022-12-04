const Campground = require('../models/campground')
const ExpressError = require('../utils/ExpressError')

module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new.ejs')
}

module.exports.showCampground = async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) throw new ExpressError(400, 'Campground not found');
    res.render('campgrounds/show.ejs', { campground });
}

module.exports.editCampground = async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, req.body.campground)
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.renderEditCampgroundForm = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) throw new ExpressError(400, 'Campground not found')
    res.render('campgrounds/edit.ejs', { campground })
}

module.exports.createCampground = async (req, res) => {
    const newCamp = new Campground(req.body.campground)
    newCamp.author = req.user._id;
    await newCamp.save()
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${newCamp._id}`)
}

module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds')
}