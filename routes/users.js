const express = require('express');
const res = require('express/lib/response');
const { register } = require('../models/user');
const router = express.Router();
const User = require('../models/user');

router.get('/register', (req, res) => {
    res.render('users/register.ejs')
})

router.get('/login', (req, res) => {
    res.render('users/login.ejs')
})

router.post('/register', async (req, res) => {
    res.send(req.body);
})

router.post('/login', async (req, res) => {
    res.redirect();
})

module.exports = router;