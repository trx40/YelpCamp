const express = require('express');
const res = require('express/lib/response');
const passport = require('passport');
const { register } = require('../models/user');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync')

router.get('/register', (req, res) => {
    res.render('users/signup.ejs')
})

router.get('/login', (req, res) => {
    res.render('users/login.ejs')
})

router.post('/signup', catchAsync(async (req, res) => {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    try {
        const registeredUser = await User.register(user, password);

        req.flash('success', "Welcome to Yelp Camp!!");
        res.redirect('/campgrounds');
    }
    catch (e) {
        req.flash('error', e.message);
        res.redirect('/signup');
    }

}))

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), async (req, res) => {
    req.flash('success', "Welcome back!");
    res.redirect('/campgrounds');
})

router.get('/logout', (req, res) => {
    req.logOut((err) => {
        if (err) return next(err);
    });
    req.flash('success', "Logged Out");
    res.redirect('/campgrounds');
})

module.exports = router;