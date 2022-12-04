const User = require('../models/user')


module.exports.renderSignupForm = (req, res) => {
    res.render('users/signup.ejs')
}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login.ejs')
}

module.exports.signUp = async (req, res, next) => {
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
}

module.exports.logIn = async (req, res) => {
    req.flash('success', "Welcome back!");
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logOut = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash('success', "Logged Out");
        res.redirect('/campgrounds');
    });
}