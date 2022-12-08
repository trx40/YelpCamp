const express = require('express')
const router = express.Router();
const multer = require('multer')
const catchAsync = require('../utils/catchAsync')
const { storage } = require('../cloudinary')
const upload = multer({ storage })
// CAMPGROUNDS controller
const campgrounds = require('../controllers/campgrounds')
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware')

router.route('/')

    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image', 12), validateCampground, catchAsync(campgrounds.createCampground))


router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')

    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image', 12), validateCampground, catchAsync(campgrounds.editCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditCampgroundForm))

module.exports = router
