const express = require('express')
const router = express.Router();

const catchAsync = require('../utils/catchAsync')
// CAMPGROUNDS controller
const campgrounds = require('../controllers/campgrounds')
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware')


// ****************************************************
// ******************** SHOW ALL CAMPS ROUTE **********
// ****************************************************
router.get('/', catchAsync(campgrounds.index))

// ****************************************************
// ******************** NEW PAGE ROUTE ****************
// ****************************************************
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

// ****************************************************
// ******************** SHOW PAGE ROUTE ***************
// ****************************************************
router.get('/:id', catchAsync(campgrounds.showCampground))


// ****************************************************
// ******************** EDIT ROUTE ********************
// ****************************************************
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.editCampground))

// ****************************************************
// ******************** EDIT PAGE ROUTE ***************
// ****************************************************
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditCampgroundForm))

// ****************************************************
// ******************** NEW CAMP ROUTE ****************
// ****************************************************
router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))

// ****************************************************
// ******************** DELETE ROUTE ******************
// ****************************************************
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

module.exports = router
