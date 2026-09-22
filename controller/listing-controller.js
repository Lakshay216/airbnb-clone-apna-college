const Listing = require('../models/listing.js');
const expressError = require('../utils/expressError.js');
const { uploadImage } = require('../cloudConfig.js');
const mbxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding');

function getGeocodingClient() {
    if (!process.env.MAP_TOKEN) {
        throw new expressError(500, 'MAP_TOKEN is not configured');
    }
    return mbxGeoCoding({ accessToken: process.env.MAP_TOKEN });
}

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render('listings/index.ejs', { allListings });
};

module.exports.createRoute = async (req, res) => {
    if (!req.file) {
        throw new expressError(400, 'Please upload a JPG or PNG image');
    }

    const response = await getGeocodingClient().forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    }).send();

    if (!response.body.features.length) {
        throw new expressError(400, 'The listing location could not be found');
    }

    const uploadedImage = await uploadImage(req.file.buffer);
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {
        url: uploadedImage.secure_url,
        filename: uploadedImage.public_id,
    };
    newListing.geometry = response.body.features[0].geometry;

    await newListing.save();
    req.flash('success', 'New Listing Created');
    res.redirect('/listings');
};

module.exports.edit = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash('error', 'Listing you requested for does not exist');
        return res.redirect('/listings');
    }

    res.render('listings/edit.ejs', { listing });
};

module.exports.update = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash('error', 'Listing you requested for does not exist');
        return res.redirect('/listings');
    }

    Object.assign(listing, req.body.listing);

    if (req.file) {
        const uploadedImage = await uploadImage(req.file.buffer);
        listing.image = {
            url: uploadedImage.secure_url,
            filename: uploadedImage.public_id,
        };
    }

    await listing.save();
    req.flash('success', 'Listing Updated');
    res.redirect(`/listings/${id}`);
};

module.exports.destroy = async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) {
        req.flash('error', 'Listing you requested for does not exist');
        return res.redirect('/listings');
    }

    req.flash('success', 'Listing Deleted');
    res.redirect('/listings');
};

module.exports.showOne = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: 'review', populate: { path: 'author' } })
        .populate('owner');

    if (!listing) {
        req.flash('error', 'Listing you requested for does not exist');
        return res.redirect('/listings');
    }

    res.render('listings/show.ejs', { listing });
};
