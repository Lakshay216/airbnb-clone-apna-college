const express = require('express');
const expressError = require('./utils/expressError.js')
const {listingSchema,reviewSchema} = require('./schema.js');
const Listing = require('./models/listing.js');
const review = require('./models/review.js');


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

module.exports.isOwned =async(req,res,next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.curruser._id)){
        req.flash('error','you are not the owner of this listing');
      return  res.redirect(`/listings/${id}`)
    }``
    next();
}
module.exports.isOwned_review =async(req,res,next)=>{
    let{id} = req.params;
    let {reviewId} = req.params;
    let listing = await review.findById(reviewId);
    if(!listing.author.equals(res.locals.curruser._id)){
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
