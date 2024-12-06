const express = require('express');
const Listing = require('../models/listing.js');
const mbxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN
const geoCodingClient = mbxGeoCoding({accessToken:mapToken})

// index route
module.exports.index= async (req,res)=>{
    let allListings = await Listing.find({});
    res.render('listings/index.ejs',{allListings});
};

//create route
module.exports.createRoute =async(req,res,next)=>{

   let response = await geoCodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 2
      })
        .send()
    let url = req.file.path;
    let filename = req.file.filename;
    const newlisting =new Listing(req.body.listing);
    newlisting.owner = req.user._id;
    newlisting.image ={url,filename};
    newlisting.geometry =response.body.features[0].geometry;

   let saveList = await newlisting.save();
   console.log(saveList)
    req.flash('success','New Listing Created');
    res.redirect('/listings');
}

//edit route 
module.exports.edit =async(req,res)=>{
    let {id} = req.params;
    let listing  = await Listing.findById(id);
    if(!listing){
        req.flash('error','Listing you requested for does not exist');
        res.redirect('/listings')
    }
    res.render('listings/edit.ejs',{listing});
}

// update route
module.exports.update = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing) {
        req.flash('error', 'Listing you requested for does not exist');
        return res.redirect('/listings');
    }

    // Update the listing with the new data
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // Check if a new file is uploaded
    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash('success', 'Listing Updated');
    res.redirect(`/listings/${id}`);
};

//delete route
module.exports.destroy = async(req,res)=>{
    let {id} = req.params;
    let deletedListing =  await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash('success','Listing Deleted');
    res.redirect('/listings')
}

//show route
module.exports.showOne =async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id).populate({path: 'review', populate:{path:'author'}}).populate('owner');
    if(!listing){
        req.flash('error','Listing you requested for does not exist');
        res.redirect('/listings')
    }
    //console.log(listing.owner)
    res.render('listings/show.ejs',{listing});
}