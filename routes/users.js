const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync')

router.get('/register', (req, res) => {
    res.render('users/signup.ejs')
})

router.get('/login', (req, res) => {
    res.render('users/login.ejs')
})

router.post('/signup', catchAsync(async (req, res, next) => {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    try {
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', "Welcome to Yelp Camp!!");
            res.redirect('/campgrounds');
        })
    }
    catch (e) {
        req.flash('error', e.message);
        res.redirect('/signup');
    }

}))

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), async (req, res) => {
    req.flash('success', "Welcome back!");
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash('success', "Logged Out");
        res.redirect('/campgrounds');
    });
})

module.exports = router;