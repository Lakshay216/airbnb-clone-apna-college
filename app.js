const express = require('express');
const app = express();
const port = 8080;
const path = require('path');
const Listing = require('./models/listing.js');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));
app.use(methodOverride('_method'));
app.engine('ejs',ejsMate);


const mongoose = require('mongoose');
const MONGO_URL ='mongodb://127.0.0.1:27017/airbnb_apnaCollege'

main().then(console.log('connection succesful'))
.catch(err => console.log(err));

async function main() {
  await mongoose.connect( MONGO_URL);
}



app.get('/',(req,res)=>{
    res.send('root is working')
})

//index route
app.get('/listings',async (req,res)=>{
    let allListings = await Listing.find({});
    res.render('listings/index.ejs',{allListings});
})
// new route
app.get('/listings/new',async(req,res)=>{
    res.render('listings/new.ejs');
})
// create route 
app.post('/listings',async(req,res)=>{
const newlisting =new Listing(req.body.listing);
await newlisting.save();

res.redirect('/listings');
});

// edit route
app.get('/listings/:id/edit',async(req,res)=>{
    let {id} = req.params;
    let listing  = await Listing.findById(id);
    res.render('listings/edit.ejs',{listing});
})
//update route 
app.put('/listings/:id',async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`)
})

// delete route
app.delete('/listings/:id',async(req,res)=>{
    let {id} = req.params;
   let deletedListing =  await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect('/listings')
})

//show route
app.get('/listings/:id',async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render('listings/show.ejs',{listing});
})



app.listen(port,()=>{
    console.log(`listening on port ${port}`); 
})



// app.get('/testlist',async(req,res)=>{
//     let List = new Listing({
//         title:'home',
//         description:'cozy',
//         price:1000,
//         location:'beach',
//         country:'india',
//     })

//     let list1 = await List.save();
//     console.log(list1);
//     res.send('listing succesful');
// })