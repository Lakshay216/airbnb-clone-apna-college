const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js')
const {isLoggedIn,validatelisting, isOwned} = require('../middleware.js');
const { index, createRoute, edit, update, destroy, showOne } = require('../controller/listing-controller.js');
const multer  = require('multer')
const {storage} = require('../cloudConfig.js');
const upload = multer({ storage })



//index route
router.get('/',wrapAsync(index));
// new route
router.get('/new',isLoggedIn,wrapAsync(async(req,res)=>{
    res.render('listings/new.ejs');
}));
// create route 
router.post('/',isLoggedIn,upload.single('listing[image]'),validatelisting,wrapAsync(createRoute));

// edit route
router.get('/:id/edit',isLoggedIn,isOwned,wrapAsync(edit));
//update route 
router.put('/:id', isLoggedIn,isOwned,upload.single('listing[image]'),validatelisting,wrapAsync(update));

// delete route
router.delete('/:id',isLoggedIn,isOwned,wrapAsync(destroy));

//show route
router.get('/:id',wrapAsync(showOne));

module.exports = router;