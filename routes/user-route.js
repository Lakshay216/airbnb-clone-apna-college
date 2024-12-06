const express = require('express');
const router = express.Router();
const user = require('../models/user.js');
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const{saveRedirectUrl} = require('../middleware.js');
const { signUp, login, logOut } = require('../controller/user-controller.js');


router.get('/signup',(req,res)=>{
    res.render('users/signup.ejs');
})
//signup route
router.post('/signup',wrapAsync(signUp));

router.get('/login',(req,res)=>{
    res.render('users/login.ejs')
})
//login route
router.post('/login',saveRedirectUrl,passport.authenticate
    ('local',{failureRedirect:'/login',
        failureFlash:true}),
       login)

//logOut route
router.get('/logout',logOut);

module.exports = router;