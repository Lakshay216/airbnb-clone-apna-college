const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js')
const {isLoggedIn, validatelisting, isOwned, validateListingId} = require('../middleware.js');
const { index, createRoute, edit, update, destroy, showOne } = require('../controller/listing-controller.js');
const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        const allowedTypes = ['image/jpeg', 'image/png'];
        callback(null, allowedTypes.includes(file.mimetype));
    },
});



//index route
router.get('/',wrapAsync(index));
// new route
router.get('/new',isLoggedIn,wrapAsync(async(req,res)=>{
    res.render('listings/new.ejs');
}));
// create route 
router.post('/',isLoggedIn,upload.single('listing[image]'),validatelisting,wrapAsync(createRoute));

// edit route
router.get('/:id/edit',validateListingId,isLoggedIn,isOwned,wrapAsync(edit));
//update route 
router.put('/:id', validateListingId,isLoggedIn,isOwned,upload.single('listing[image]'),validatelisting,wrapAsync(update));

// delete route
router.delete('/:id',validateListingId,isLoggedIn,isOwned,wrapAsync(destroy));

//show route
router.get('/:id',validateListingId,wrapAsync(showOne));

module.exports = router;
