const express = require('express');
const router = express.Router({mergeParams:true});
const wrapAsync = require('../utils/wrapAsync.js')
const {validatereview} =require("../middleware.js");
const {isLoggedIn,isOwned_review} = require('../middleware.js');
const { post_review, destroy_review } = require('../controller/review-controller.js');

//post route
router.post('/',isLoggedIn,validatereview,wrapAsync(post_review));
    
 //delete review route
router.delete('/:reviewId',isLoggedIn,isOwned_review, wrapAsync(destroy_review));
    
module.exports = router; 