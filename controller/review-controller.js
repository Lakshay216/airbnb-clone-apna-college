const review = require('../models/review.js');
const Listing = require('../models/listing.js');

//post route
module.exports.post_review = async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new review(req.body.review);
    newReview.author = req.user._id;

   console.log(req.user);
    listing.review.push(newReview);
    
    await listing.save();
    await newReview.save();
    req.flash('success','Review Added');
    res.redirect(`/listings/${listing._id}`)
    };

//delete route
module.exports.destroy_review =async (req, res) => {
    let { id, reviewId } = req.params; // Extract both id and reviewId from params
    await Listing.findByIdAndUpdate(id, { $pull: { review: reviewId } }); // Pull the review from the listing
    await review.findByIdAndDelete(reviewId); // Delete the review itself
    req.flash('success', 'Review Deleted');
    res.redirect(`/listings/${id}`); // Redirect back to the listing page
}