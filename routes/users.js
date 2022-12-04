const express = require('express');
const passport = require('passport');

const router = express.Router();


// USERS controller
const users = require('../controllers/users')
const catchAsync = require('../utils/catchAsync')

router.route('/login')
    .get(users.renderLoginForm)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), catchAsync(users.logIn))

router.route('/signup')
    .get(users.renderSignupForm)
    .post(catchAsync(users.signUp))

router.get('/logout', users.logOut)

module.exports = router;