const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const review = require('./review.js');

const listingSchema = new Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image:{
        url:String,
        filename : String,
    },
    price: Number,
    location: String,
    country: String,
    review :[
        {
            type: Schema.Types.ObjectId,
            ref: 'review'
        }
    ],
    owner:
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
    geometry: 
    {
            type: {
              type: String, // Don't do `{ location: { type: String } }`
              enum: ['Point'], // 'location.type' must be 'Point'
             
            },
            coordinates: {
              type: [Number],
              
            }
     }
    
})

listingSchema.post('findOneAndDelete',async(listing)=>{
    if(listing){
        await review.deleteMany({_id:{$in:listing.review}})
    }
})
const Listing = mongoose.model('listing',listingSchema); 
module.exports = Listing;
