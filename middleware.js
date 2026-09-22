const expressError = require('./utils/expressError.js')
const {listingSchema,reviewSchema} = require('./schema.js');
const Listing = require('./models/listing.js');
const review = require('./models/review.js');
const mongoose = require('mongoose');


module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash('error','you must be logged in to do any changed')
       return res.redirect('/login')
    }
    next();
}

module.exports.saveRedirectUrl =(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.validateListingId = (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return next(new expressError(400, 'Invalid listing ID'));
    }
    next();
};

module.exports.validateReviewId = (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.reviewId)) {
        return next(new expressError(400, 'Invalid review ID'));
    }
    next();
};

module.exports.isOwned =async(req,res,next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        return next(new expressError(404, 'Listing not found'));
    }
    if(!listing.owner || !listing.owner.equals(req.user._id)){
        req.flash('error','you are not the owner of this listing');
      return  res.redirect(`/listings/${id}`)
    }
    next();
}
module.exports.isOwned_review =async(req,res,next)=>{
    let{id} = req.params;
    let {reviewId} = req.params;
    let existingReview = await review.findById(reviewId);
    if (!existingReview) {
        return next(new expressError(404, 'Review not found'));
    }
    if(!existingReview.author || !existingReview.author.equals(req.user._id)){
        req.flash('error','you are not the auhtor of this review');
      return  res.redirect(`/listings/${id}`)
    }
    next();
}

module.exports.validatelisting = async (req, res, next) => {
    let{error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el)=>el.message).join(',');
       next(new expressError(400,errMsg)) 
        
    }else{
        next();
    }
};

module.exports.validatereview = async (req, res, next) => {
    let{error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el)=>el.message).join(',');
        next(new expressError(400,errMsg))
    }else{
        next();
    }
};
