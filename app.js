if(process.env.NODE_ENV!= 'production'){
    require('dotenv').config()
}
const express = require('express');
const app = express();
const port = 8080;
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const user = require('./models/user.js')
const expressError = require('./utils/expressError.js');

const listing_route = require('./routes/listing-route.js');
const review_route = require('./routes/review-route.js');
const user_route = require('./routes/user-route.js');

const mongoose = require('mongoose');
const MONGO_URL = process.env.ATLASDB_URL;

main().then(console.log('connection succesful'))
.catch(err => console.log(err));

async function main() {
  await mongoose.connect( MONGO_URL);
}

 
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));
app.use(methodOverride('_method'));
app.engine('ejs',ejsMate);

const store =  MongoStore.create({
    mongoUrl :MONGO_URL,
    crypto:{
        secret:process.env.SECRET
    },
    touchAfter:24*3600,
})
store.on('error',()=>{
    console.log("error occured in mongo session store",err)
})

const sessionOptions ={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() +7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
};


// app.get('/',(req,res)=>{
//     res.redirect('listings');
// })

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()))
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());


app.use((req,res,next)=>{
    res.locals.message = req.flash('error');
    res.locals.error = req.flash('error');
    res.locals.curruser = req.user;
   // console.log(res.locals.message);
    next();
})

// listings route
app.use('/listings',listing_route);
//post review route
app.use('/listings/:id/reviews',review_route);
//users route
app.use('/',user_route);


app.all('*',(req,res,next)=>{
    next(new expressError(404,"PAGE NOT FOUND!"));
})


app.use((err, req, res, next) => {
    console.error(err); // Log error to console
    let { status = 500, message = "Something went wrong!!" } = err;
    res.status(status).render('listings/error.ejs', { message, err });
});

app.listen(port,()=>{
    console.log(`listening on port ${port}`); 
})

//test error page
// app.get('/test-error', (req, res, next) => {
//     const error = new Error("Test error triggered!");
//     error.status = 400;
//     next(error);
// });